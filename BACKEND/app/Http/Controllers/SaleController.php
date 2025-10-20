<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\Store;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class SaleController extends Controller
{
    public function __construct(private DatabaseManager $db)
    {
    }

    public function index(Request $request)
    {
        $sales = Sale::with(['product:id,name,product_code', 'store:id,name'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('sale_date')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $sales,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer'],
            'store_id' => ['nullable', 'integer'],
            'quantity' => ['required', 'integer', 'min:1'],
            'sale_date' => ['nullable', 'date'],
            'selling_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        $userId = $request->user()->id;
        $product = Product::where('user_id', $userId)->findOrFail($validated['product_id']);
        $store = null;

        if (! empty($validated['store_id'])) {
            $store = Store::where('user_id', $userId)->findOrFail($validated['store_id']);
        }

        $sellingPrice = $validated['selling_price'] ?? $product->selling_price;
        $buyingPrice = $product->buying_price;

        $sale = null;

        $this->db->transaction(function () use (&$sale, $product, $store, $userId, $validated, $sellingPrice, $buyingPrice) {
            if ($product->quantity < $validated['quantity']) {
                abort(Response::HTTP_BAD_REQUEST, 'Not enough stock to register this sale.');
            }

            $product->decrement('quantity', $validated['quantity']);

            if ($store) {
                $pivot = $product->stores()->where('store_id', $store->id)->first();

                if ($pivot) {
                    $newQuantity = max(0, $pivot->pivot->quantity - $validated['quantity']);
                    $product->stores()->updateExistingPivot($store->id, ['quantity' => $newQuantity]);
                }
            }

            $sale = Sale::create([
                'user_id' => $userId,
                'product_id' => $product->id,
                'store_id' => $store?->id,
                'quantity' => $validated['quantity'],
                'sale_date' => $validated['sale_date'] ?? now()->toDateString(),
                'selling_price' => $sellingPrice,
                'buying_price' => $buyingPrice,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'Sale recorded successfully.',
            'data' => [
                'sale' => $sale->load(['product', 'store']),
            ],
        ], Response::HTTP_CREATED);
    }

    public function destroy(Request $request, Sale $sale)
    {
        if ($sale->user_id !== $request->user()->id) {
            abort(Response::HTTP_FORBIDDEN);
        }

        $this->db->transaction(function () use ($sale) {
            $product = $sale->product()->lockForUpdate()->first();

            $product->increment('quantity', $sale->quantity);

            if ($sale->store_id) {
                $pivot = $product->stores()->where('store_id', $sale->store_id)->first();

                if ($pivot) {
                    $product->stores()->updateExistingPivot($sale->store_id, [
                        'quantity' => $pivot->pivot->quantity + $sale->quantity,
                    ]);
                }
            }

            $sale->delete();
        });

        return response()->noContent();
    }
}
