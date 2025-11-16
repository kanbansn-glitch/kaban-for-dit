<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::query()
            ->with(['category', 'supplier', 'stores' => function ($query) {
                $query->select('stores.id', 'stores.name')
                    ->withPivot(['quantity', 'threshold']);
            }])
            ->forUser($request->user()->id)
            ->latest('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $products,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatedData($request);
        $storesData = $validated['stores'] ?? null;
        unset($validated['stores']);

        $validated['user_id'] = $request->user()->id;

        $validated['status'] = $this->determineStatus(
            (int) $validated['quantity'],
            (int) $validated['threshold']
        );

        $product = Product::create($validated);

        $this->syncProductStores($product, $storesData);

        return response()->json([
            'success' => true,
            'message' => 'Product created successfully.',
            'data' => [
                'product' => $product->load('category', 'supplier', 'stores'),
            ],
        ], Response::HTTP_CREATED);
    }

    public function show(Product $product)
    {
        return response()->json([
            'success' => true,
            'data' => $product->load('category', 'supplier', 'stores'),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $this->validatedData($request, $product->id);
        $storesData = $validated['stores'] ?? null;
        unset($validated['stores']);

        $validated['status'] = $this->determineStatus(
            (int) $validated['quantity'],
            (int) $validated['threshold']
        );

        $validated['user_id'] = $request->user()->id;

        $product->update($validated);

        $this->syncProductStores($product, $storesData);

        return response()->json([
            'success' => true,
            'message' => 'Product updated successfully.',
            'data' => [
                'product' => $product->load('category', 'supplier', 'stores'),
            ],
        ]);
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return response()->noContent();
    }

    protected function validatedData(Request $request, ?int $productId = null): array
    {
        $uniqueNameRule = [
            'required',
            'string',
            'max:255',
            Rule::unique('products', 'name')
                ->where(fn ($query) => $query->where('user_id', $request->user()->id))
                ->ignore($productId),
        ];

        $uniqueCodeRule = [
            'required',
            'string',
            'max:100',
            Rule::unique('products', 'product_code')
                ->where(fn ($query) => $query->where('user_id', $request->user()->id))
                ->ignore($productId),
        ];

        return $request->validate([
            'product_code' => $uniqueCodeRule,
            'name' => $uniqueNameRule,
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'buying_price' => ['required', 'numeric', 'min:0'],
            'selling_price' => ['required', 'numeric', 'min:0'],
            'quantity' => ['required', 'integer', 'min:0'],
            'threshold' => ['required', 'integer', 'min:0'],
            'expiry_date' => ['nullable', 'date'],
            'supplier_id' => [
                'nullable',
                'integer',
                Rule::exists('suppliers', 'id')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
            'stores' => ['nullable', 'array'],
            'stores.*.store_id' => [
                'required_with:stores',
                'integer',
                Rule::exists('stores', 'id')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
            'stores.*.quantity' => ['nullable', 'integer', 'min:0'],
            'stores.*.threshold' => ['nullable', 'integer', 'min:0'],
        ]);
    }

    protected function determineStatus(int $quantity, int $threshold): string
    {
        if ($quantity <= 0) {
            return 'out_of_stock';
        }

        if ($quantity <= $threshold) {
            return 'low_stock';
        }

        return 'in_stock';
    }

    protected function syncProductStores(Product $product, ?array $storesData): void
    {
        if (! is_array($storesData) || empty($storesData)) {
            return;
        }

        $sync = [];
        $totalQuantity = 0;

        foreach ($storesData as $store) {
            $quantity = (int) ($store['quantity'] ?? 0);
            $threshold = (int) ($store['threshold'] ?? $product->threshold);
            $sync[$store['store_id']] = [
                'quantity' => $quantity,
                'threshold' => $threshold,
            ];
            $totalQuantity += $quantity;
        }

        $product->stores()->sync($sync);

        if ($totalQuantity >= 0) {
            $product->quantity = $totalQuantity;
            $product->save();
        }
    }
}
