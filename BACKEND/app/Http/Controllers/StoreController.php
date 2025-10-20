<?php

namespace App\Http\Controllers;

use App\Models\Store;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class StoreController extends Controller
{
    public function index(Request $request)
    {
        $stores = Store::withCount(['products as product_count' => function ($query) {
            $query->where('product_store.quantity', '>', 0);
        }])
            ->where('user_id', $request->user()->id)
            ->orderBy('branch_name')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $stores,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validatedData($request);

        $store = Store::create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Store created successfully.',
            'data' => [
                'store' => $store,
            ],
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Store $store)
    {
        $this->authorizeStore($request, $store);

        $store->load(['products' => function ($query) {
            $query->select('products.id', 'products.name')
                ->withPivot(['quantity', 'threshold']);
        }]);

        return response()->json([
            'success' => true,
            'data' => $store,
        ]);
    }

    public function update(Request $request, Store $store)
    {
        $this->authorizeStore($request, $store);

        $store->update($this->validatedData($request, $store->id));

        return response()->json([
            'success' => true,
            'message' => 'Store updated successfully.',
            'data' => [
                'store' => $store->fresh(),
            ],
        ]);
    }

    public function destroy(Request $request, Store $store)
    {
        $this->authorizeStore($request, $store);

        if ($store->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete a store that still has products attached.',
            ], Response::HTTP_CONFLICT);
        }

        $store->delete();

        return response()->noContent();
    }

    protected function validatedData(Request $request, ?int $storeId = null): array
    {
        return $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('stores', 'name')
                    ->where(fn ($query) => $query->where('user_id', $request->user()->id))
                    ->ignore($storeId),
            ],
            'branch_name' => ['nullable', 'string', 'max:255'],
            'address_line' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:255'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'phone' => ['nullable', 'string', 'max:50'],
        ]);
    }

    protected function authorizeStore(Request $request, Store $store): void
    {
        if ($store->user_id !== $request->user()->id) {
            abort(Response::HTTP_FORBIDDEN, 'You are not allowed to access this store.');
        }
    }
}
