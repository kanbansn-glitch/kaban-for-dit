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
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function overview(Request $request)
    {
        $userId = $request->user()->id;

        $totalRevenue = (float) Sale::where('user_id', $userId)
            ->sum(DB::raw('selling_price * quantity'));

        $totalCostOfGoods = (float) Sale::where('user_id', $userId)
            ->sum(DB::raw('buying_price * quantity'));

        $totalProfit = $totalRevenue - $totalCostOfGoods;

        $netPurchaseValue = (float) PurchaseOrder::where('user_id', $userId)
            ->where('status', 'Delivered')
            ->sum('order_value');

        $netSalesValue = $totalRevenue;

        $now = Carbon::now();
        $currentMonthProfit = $this->profitForMonth($userId, $now);
        $previousMonthProfit = $this->profitForMonth($userId, $now->copy()->subMonth());
        $currentYearProfit = $this->profitForYear($userId, $now);
        $previousYearProfit = $this->profitForYear($userId, $now->copy()->subYear());

        return response()->json([
            'success' => true,
            'data' => [
                'total_profit' => $totalProfit,
                'revenue' => $totalRevenue,
                'sales_cost' => $totalCostOfGoods,
                'net_purchase_value' => $netPurchaseValue,
                'net_sales_value' => $netSalesValue,
                'mom_profit' => $currentMonthProfit,
                'mom_change_percentage' => $previousMonthProfit > 0 ? (($currentMonthProfit - $previousMonthProfit) / $previousMonthProfit) * 100 : null,
                'yoy_profit' => $currentYearProfit,
                'yoy_change_percentage' => $previousYearProfit > 0 ? (($currentYearProfit - $previousYearProfit) / $previousYearProfit) * 100 : null,
            ],
        ]);
    }

    public function bestCategories(Request $request)
    {
        $userId = $request->user()->id;
        $now = Carbon::now();
        $currentRange = [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
        $previousRange = [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()];

        $current = $this->categoryTurnover($userId, $currentRange);
        $previous = $this->categoryTurnover($userId, $previousRange);

        $data = $current->map(function ($item) use ($previous) {
            $prevValue = $previous->firstWhere('category_id', $item->category_id)->turnover ?? 0;
            $increase = $prevValue > 0 ? (($item->turnover - $prevValue) / $prevValue) * 100 : null;

            return [
                'category' => $item->category_name,
                'turnover' => (float) $item->turnover,
                'increase_percentage' => $increase,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function profitVsRevenue(Request $request)
    {
        $userId = $request->user()->id;
        $now = Carbon::now();
        $period = CarbonPeriod::create($now->copy()->subMonths(11)->startOfMonth(), '1 month', $now->copy()->endOfMonth());

        $data = [];

        foreach ($period as $month) {
            $revenue = (float) Sale::where('user_id', $userId)
                ->whereYear('sale_date', $month->year)
                ->whereMonth('sale_date', $month->month)
                ->sum(DB::raw('selling_price * quantity'));

            $cost = (float) Sale::where('user_id', $userId)
                ->whereYear('sale_date', $month->year)
                ->whereMonth('sale_date', $month->month)
                ->sum(DB::raw('buying_price * quantity'));

            $data[] = [
                'month' => $month->translatedFormat('M'),
                'revenue' => $revenue,
                'profit' => $revenue - $cost,
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    public function bestProducts(Request $request)
    {
        $userId = $request->user()->id;
        $now = Carbon::now();
        $currentRange = [$now->copy()->startOfMonth(), $now->copy()->endOfMonth()];
        $previousRange = [$now->copy()->subMonth()->startOfMonth(), $now->copy()->subMonth()->endOfMonth()];

        $current = $this->productTurnover($userId, $currentRange);
        $previous = $this->productTurnover($userId, $previousRange);

        $products = Product::with('category')
            ->where('user_id', $userId)
            ->whereIn('id', $current->pluck('product_id'))
            ->get()
            ->keyBy('id');

        $data = $current->map(function ($item) use ($previous, $products) {
            $product = $products->get($item->product_id);

            if (! $product) {
                return null;
            }

            $prevValue = $previous->firstWhere('product_id', $item->product_id)->turnover ?? 0;
            $increase = $prevValue > 0 ? (($item->turnover - $prevValue) / $prevValue) * 100 : null;

            return [
                'product' => $product->name,
                'product_id' => $product->product_code,
                'category' => $product->category?->name,
                'remaining_quantity' => (int) $product->quantity,
                'turnover' => (float) $item->turnover,
                'increase_percentage' => $increase,
            ];
        })->filter()->values();

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    protected function profitForMonth(int $userId, Carbon $date): float
    {
        $revenue = (float) Sale::where('user_id', $userId)
            ->whereYear('sale_date', $date->year)
            ->whereMonth('sale_date', $date->month)
            ->sum(DB::raw('selling_price * quantity'));

        $cost = (float) Sale::where('user_id', $userId)
            ->whereYear('sale_date', $date->year)
            ->whereMonth('sale_date', $date->month)
            ->sum(DB::raw('buying_price * quantity'));

        return $revenue - $cost;
    }

    protected function profitForYear(int $userId, Carbon $date): float
    {
        $revenue = (float) Sale::where('user_id', $userId)
            ->whereYear('sale_date', $date->year)
            ->sum(DB::raw('selling_price * quantity'));

        $cost = (float) Sale::where('user_id', $userId)
            ->whereYear('sale_date', $date->year)
            ->sum(DB::raw('buying_price * quantity'));

        return $revenue - $cost;
    }

    protected function categoryTurnover(int $userId, array $range)
    {
        return Sale::where('user_id', $userId)
            ->whereBetween('sale_date', $range)
            ->join('products', 'sales.product_id', '=', 'products.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->select(
                'categories.id as category_id',
                'categories.name as category_name',
                DB::raw('SUM(sales.selling_price * sales.quantity) as turnover')
            )
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('turnover')
            ->limit(3)
            ->get();
    }

    protected function productTurnover(int $userId, array $range)
    {
        return Sale::where('sales.user_id', $userId)
            ->whereBetween('sale_date', $range)
            ->select(
                'sales.product_id',
                DB::raw('SUM(sales.selling_price * sales.quantity) as turnover')
            )
            ->groupBy('sales.product_id')
            ->orderByDesc('turnover')
            ->limit(5)
            ->get();
    }
}
