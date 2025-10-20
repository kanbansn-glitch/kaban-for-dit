<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Sale;
use App\Models\Supplier;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function summary(Request $request)
    {
        $userId = $request->user()->id;
        $now = Carbon::now();
        $last7 = $now->copy()->subDays(7);

        $totalProducts = Product::where('user_id', $userId)->count();
        $totalSuppliers = Supplier::where('user_id', $userId)->count();
        $quantityInHand = (int) Product::where('user_id', $userId)->sum('quantity');
        $toBeReceived = (int) PurchaseOrder::where('user_id', $userId)
            ->whereNotIn('status', ['Delivered', 'Returned', 'Cancelled'])
            ->sum('quantity');

        $categoriesCount = Category::whereHas('products', function ($query) use ($userId) {
            $query->where('user_id', $userId);
        })->count();

        $salesAggregate = Sale::where('user_id', $userId)
            ->whereDate('sale_date', '>=', $last7)
            ->selectRaw('COALESCE(SUM(quantity),0) as units, COALESCE(SUM(selling_price * quantity),0) as revenue, COALESCE(SUM(buying_price * quantity),0) as cost')
            ->first();

        $salesUnits = (int) ($salesAggregate->units ?? 0);
        $salesRevenue = (float) ($salesAggregate->revenue ?? 0);
        $salesCost = (float) ($salesAggregate->cost ?? 0);
        $salesProfit = $salesRevenue - $salesCost;

        $purchaseQuery = PurchaseOrder::where('user_id', $userId)
            ->whereDate('order_date', '>=', $last7);

        $purchaseCount = (int) $purchaseQuery->count();
        $purchaseCost = (float) $purchaseQuery->sum('order_value');
        $purchaseCancelled = (int) $purchaseQuery->where('status', 'Cancelled')->count();
        $purchaseReturnedValue = (float) PurchaseOrder::where('user_id', $userId)
            ->where('status', 'Returned')
            ->whereDate('order_date', '>=', $last7)
            ->sum('order_value');

        $salesPurchaseChart = $this->buildSalesPurchaseChart($userId, $now);
        $orderSummaryChart = $this->buildOrderSummaryChart($userId, $now);
        $topSelling = $this->topSellingProducts($userId, $now);
        $lowStock = $this->lowStockProducts($userId);

        return response()->json([
            'success' => true,
            'data' => [
                'sales_overview' => [
                    'sales' => $salesUnits,
                    'revenue' => $salesRevenue,
                    'profit' => $salesProfit,
                    'cost' => $salesCost,
                ],
                'purchase_overview' => [
                    'count' => $purchaseCount,
                    'cost' => $purchaseCost,
                    'cancelled' => $purchaseCancelled,
                    'returned_cost' => $purchaseReturnedValue,
                ],
                'inventory_summary' => [
                    'quantity_in_hand' => $quantityInHand,
                    'to_be_received' => $toBeReceived,
                ],
                'product_summary' => [
                    'suppliers' => $totalSuppliers,
                    'categories' => $categoriesCount,
                    'products' => $totalProducts,
                ],
                'sales_purchase_chart' => $salesPurchaseChart,
                'order_summary_chart' => $orderSummaryChart,
                'top_selling_products' => $topSelling,
                'low_quantity_products' => $lowStock,
            ],
        ]);
    }

    protected function buildSalesPurchaseChart(int $userId, Carbon $now): array
    {
        $period = CarbonPeriod::create($now->copy()->subMonths(5)->startOfMonth(), '1 month', $now->copy()->endOfMonth());

        $data = [];

        foreach ($period as $month) {
            $sales = Sale::where('user_id', $userId)
                ->whereYear('sale_date', $month->year)
                ->whereMonth('sale_date', $month->month)
                ->selectRaw('SUM(selling_price * quantity) as revenue, SUM(buying_price * quantity) as cost')
                ->first();

            $purchases = PurchaseOrder::where('user_id', $userId)
                ->whereYear('order_date', $month->year)
                ->whereMonth('order_date', $month->month)
                ->selectRaw('SUM(order_value) as cost')
                ->first();

            $data[] = [
                'month' => $month->format('M'),
                'revenue' => (float) ($sales->revenue ?? 0),
                'cost' => (float) ($purchases->cost ?? 0),
                'profit' => (float) (($sales->revenue ?? 0) - ($sales->cost ?? 0)),
            ];
        }

        return $data;
    }

    protected function buildOrderSummaryChart(int $userId, Carbon $now): array
    {
        $period = CarbonPeriod::create($now->copy()->subMonths(5)->startOfMonth(), '1 month', $now->copy()->endOfMonth());

        $data = [];

        foreach ($period as $month) {
            $ordered = PurchaseOrder::where('user_id', $userId)
                ->whereYear('order_date', $month->year)
                ->whereMonth('order_date', $month->month)
                ->count();

            $delivered = PurchaseOrder::where('user_id', $userId)
                ->whereYear('delivered_at', $month->year)
                ->whereMonth('delivered_at', $month->month)
                ->count();

            $data[] = [
                'month' => $month->format('M'),
                'ordered' => $ordered,
                'delivered' => $delivered,
            ];
        }

        return $data;
    }

    protected function topSellingProducts(int $userId, Carbon $now): array
    {
        $limit = 3;
        $lastMonth = $now->copy()->subMonth();

        $sales = Sale::where('user_id', $userId)
            ->whereDate('sale_date', '>=', $lastMonth->startOfMonth())
            ->selectRaw('product_id, SUM(quantity) as sold_quantity, SUM(selling_price * quantity) as revenue')
            ->groupBy('product_id')
            ->orderByDesc('sold_quantity')
            ->limit($limit)
            ->get();

        $products = Product::with('category')
            ->whereIn('id', $sales->pluck('product_id'))
            ->get()
            ->keyBy('id');

        return $sales->map(function ($item) use ($products) {
            $product = $products->get($item->product_id);

            if (! $product) {
                return null;
            }

            return [
                'product_id' => $product->product_code,
                'name' => $product->name,
                'category' => $product->category?->name,
                'sold_quantity' => (int) $item->sold_quantity,
                'remaining_quantity' => (int) $product->quantity,
                'price' => (float) $product->selling_price,
            ];
        })->filter()->values()->all();
    }

    protected function lowStockProducts(int $userId): array
    {
        return Product::where('user_id', $userId)
            ->whereColumn('quantity', '<=', 'threshold')
            ->orderBy('quantity')
            ->limit(5)
            ->get()
            ->map(function (Product $product) {
                return [
                    'name' => $product->name,
                    'remaining_quantity' => (int) $product->quantity,
                    'status' => $product->quantity <= 0 ? 'Out of stock' : 'Low',
                ];
            })->all();
    }
}
