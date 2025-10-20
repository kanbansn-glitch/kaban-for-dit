<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\Rule;

class SupplierController extends Controller
{
    public function index(Request $request)
    {
        $suppliers = Supplier::withCount(['purchaseOrders as on_the_way' => function ($query) {
            $query->whereNotIn('status', ['Delivered', 'Returned', 'Cancelled']);
        }])
            ->with(['products:id,name,supplier_id'])
            ->where('user_id', $request->user()->id)
            ->orderBy('name')
            ->get()
            ->map(function (Supplier $supplier) {
                $firstProduct = $supplier->products->first();

                return [
                    'id' => $supplier->id,
                    'name' => $supplier->name,
                    'contact_number' => $supplier->contact_number,
                    'email' => $supplier->email,
                    'address' => $supplier->address,
                    'takes_back_returns' => $supplier->takes_back_returns,
                    'logo_path' => $supplier->logo_path,
                    'product_name' => $firstProduct?->name,
                    'on_the_way' => $supplier->on_the_way,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $suppliers,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('suppliers', 'name')->where(fn ($query) => $query->where('user_id', $request->user()->id)),
            ],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'takes_back_returns' => ['nullable', 'boolean'],
            'logo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $supplier = Supplier::create([
            ...$validated,
            'takes_back_returns' => $request->boolean('takes_back_returns'),
            'user_id' => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Supplier created successfully.',
            'data' => [
                'supplier' => $supplier->fresh(),
            ],
        ], Response::HTTP_CREATED);
    }

    public function show(Request $request, Supplier $supplier)
    {
        $this->authorizeSupplier($request, $supplier);

        $supplier->load(['products:id,name,supplier_id', 'purchaseOrders' => function ($query) {
            $query->select('id', 'supplier_id', 'product_id', 'quantity', 'status', 'expected_date');
        }]);

        return response()->json([
            'success' => true,
            'data' => $supplier,
        ]);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $this->authorizeSupplier($request, $supplier);

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('suppliers', 'name')
                    ->where(fn ($query) => $query->where('user_id', $request->user()->id))
                    ->ignore($supplier->id),
            ],
            'contact_number' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'takes_back_returns' => ['nullable', 'boolean'],
            'logo_path' => ['nullable', 'string', 'max:255'],
        ]);

        $supplier->update([
            ...$validated,
            'takes_back_returns' => $request->boolean('takes_back_returns'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Supplier updated successfully.',
            'data' => [
                'supplier' => $supplier->fresh(),
            ],
        ]);
    }

    public function destroy(Request $request, Supplier $supplier)
    {
        $this->authorizeSupplier($request, $supplier);

        if ($supplier->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot delete supplier with linked products.',
            ], Response::HTTP_CONFLICT);
        }

        $supplier->delete();

        return response()->noContent();
    }

    protected function authorizeSupplier(Request $request, Supplier $supplier): void
    {
        if ($supplier->user_id !== $request->user()->id) {
            abort(Response::HTTP_FORBIDDEN, 'You are not allowed to access this supplier.');
        }
    }
}
