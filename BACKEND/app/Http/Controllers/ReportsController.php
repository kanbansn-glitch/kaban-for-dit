<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Sale;
use App\Models\Supplier;
use App\Support\Money;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportsController extends Controller
{
    public function overview(Request $request)
    {
        $userId = $request->user()->id;
        $referenceDate = $this->resolveReferenceDate($request, $userId);

        $totalRevenue = Money::round(
            Sale::forUser($userId)->sum(DB::raw('selling_price * quantity'))
        );

        $totalCostOfGoods = Money::round(
            Sale::forUser($userId)->sum(DB::raw('buying_price * quantity'))
        );

        $totalProfit = Money::round($totalRevenue - $totalCostOfGoods);

        $netPurchaseValue = Money::round(
            PurchaseOrder::forUser($userId)
                ->where('status', 'Delivered')
                ->sum('order_value')
        );

        $netSalesValue = $totalRevenue;

        $currentMonthProfit = $this->profitForMonth($userId, $referenceDate);
        $previousMonthProfit = $this->profitForMonth($userId, $referenceDate->copy()->subMonth());
        $currentYearProfit = $this->profitForYear($userId, $referenceDate);
        $previousYearProfit = $this->profitForYear($userId, $referenceDate->copy()->subYear());

        return response()->json([
            'success' => true,
            'data' => [
                'total_profit' => $totalProfit,
                'revenue' => $totalRevenue,
                'sales_cost' => $totalCostOfGoods,
                'net_purchase_value' => $netPurchaseValue,
                'net_sales_value' => $netSalesValue,
                'mom_profit' => $currentMonthProfit,
                'mom_change_percentage' => $previousMonthProfit > 0
                    ? Money::round((($currentMonthProfit - $previousMonthProfit) / $previousMonthProfit) * 100)
                    : null,
                'yoy_profit' => $currentYearProfit,
                'yoy_change_percentage' => $previousYearProfit > 0
                    ? Money::round((($currentYearProfit - $previousYearProfit) / $previousYearProfit) * 100)
                    : null,
                'reference_period' => [
                    'month' => $referenceDate->format('Y-m'),
                ],
            ],
        ]);
    }

    public function bestCategories(Request $request)
    {
        $userId = $request->user()->id;
        $referenceDate = $this->resolveReferenceDate($request, $userId);
        $currentRange = [$referenceDate->copy()->startOfMonth(), $referenceDate->copy()->endOfMonth()];
        $previousRange = [$referenceDate->copy()->subMonth()->startOfMonth(), $referenceDate->copy()->subMonth()->endOfMonth()];

        $current = $this->categoryTurnover($userId, $currentRange);
        $previous = $this->categoryTurnover($userId, $previousRange);

        $data = $current->map(function ($item) use ($previous) {
            $prevValue = $previous->firstWhere('category_id', $item->category_id)->turnover ?? 0;
            $increase = $prevValue > 0 ? (($item->turnover - $prevValue) / $prevValue) * 100 : null;

            return [
                'category' => $item->category_name,
                'turnover' => Money::round($item->turnover),
                'increase_percentage' => $increase !== null ? Money::round($increase) : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'reference_month' => $referenceDate->format('Y-m'),
            ],
        ]);
    }

    public function profitVsRevenue(Request $request)
    {
        $userId = $request->user()->id;
        $referenceDate = $this->resolveReferenceDate($request, $userId);
        $period = CarbonPeriod::create($referenceDate->copy()->subMonths(11)->startOfMonth(), '1 month', $referenceDate->copy()->endOfMonth());

        $data = [];

        foreach ($period as $month) {
            $revenue = (float) Sale::forUser($userId)
                ->whereYear('sale_date', $month->year)
                ->whereMonth('sale_date', $month->month)
                ->sum(DB::raw('selling_price * quantity'));

            $cost = (float) Sale::forUser($userId)
                ->whereYear('sale_date', $month->year)
                ->whereMonth('sale_date', $month->month)
                ->sum(DB::raw('buying_price * quantity'));

            $data[] = [
                'month' => $month->translatedFormat('M'),
                'revenue' => Money::round($revenue),
                'profit' => Money::round($revenue - $cost),
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'reference_month' => $referenceDate->format('Y-m'),
            ],
        ]);
    }

    public function bestProducts(Request $request)
    {
        $userId = $request->user()->id;
        $referenceDate = $this->resolveReferenceDate($request, $userId);
        $currentRange = [$referenceDate->copy()->startOfMonth(), $referenceDate->copy()->endOfMonth()];
        $previousRange = [$referenceDate->copy()->subMonth()->startOfMonth(), $referenceDate->copy()->subMonth()->endOfMonth()];

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
                'turnover' => Money::round($item->turnover),
                'increase_percentage' => $increase !== null ? Money::round($increase) : null,
            ];
        })->filter()->values();

        return response()->json([
            'success' => true,
            'data' => $data,
            'meta' => [
                'reference_month' => $referenceDate->format('Y-m'),
            ],
        ]);
    }

    protected function profitForMonth(int $userId, Carbon $date): float
    {
        $revenue = (float) Sale::forUser($userId)
            ->whereYear('sale_date', $date->year)
            ->whereMonth('sale_date', $date->month)
            ->sum(DB::raw('selling_price * quantity'));

        $cost = (float) Sale::forUser($userId)
            ->whereYear('sale_date', $date->year)
            ->whereMonth('sale_date', $date->month)
            ->sum(DB::raw('buying_price * quantity'));

        return Money::round($revenue - $cost);
    }

    protected function profitForYear(int $userId, Carbon $date): float
    {
        $revenue = (float) Sale::forUser($userId)
            ->whereYear('sale_date', $date->year)
            ->sum(DB::raw('selling_price * quantity'));

        $cost = (float) Sale::forUser($userId)
            ->whereYear('sale_date', $date->year)
            ->sum(DB::raw('buying_price * quantity'));

        return Money::round($revenue - $cost);
    }

    protected function categoryTurnover(int $userId, array $range)
    {
        return Sale::forUser($userId)
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
        return Sale::forUser($userId)
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

    protected function resolveReferenceDate(Request $request, int $userId): Carbon
    {
        if ($reference = $request->query('reference_date')) {
            try {
                return Carbon::parse($reference);
            } catch (\Throwable $e) {
                // fallthrough to data-derived date
            }
        }

        $latestSale = Sale::forUser($userId)->max('sale_date');

        if ($latestSale) {
            return Carbon::parse($latestSale);
        }

        $latestOrder = PurchaseOrder::forUser($userId)->max('order_date');

        if ($latestOrder) {
            return Carbon::parse($latestOrder);
        }

        return Carbon::now();
    }
}
