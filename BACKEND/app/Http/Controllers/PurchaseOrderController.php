<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\Store;
use App\Models\Supplier;
use Illuminate\Database\DatabaseManager;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PurchaseOrderController extends Controller
{
    public function __construct(
        protected DatabaseManager $db
    ) {
    }

    public function index(Request $request)
    {
        $status = $request->query('status');

        $orders = PurchaseOrder::query()
            ->with(['product:id,name,product_code,category_id', 'product.category:id,name', 'supplier:id,name', 'store:id,name'])
            ->forUser($request->user()->id)
            ->when($status, fn ($query) => $query->where('status', $status))
            ->orderByDesc('order_date')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $orders,
        ]);
    }

    public function show(PurchaseOrder $order)
    {
        $order->load(['product', 'supplier', 'store']);

        return response()->json([
            'success' => true,
            'data' => $order,
        ]);
    }

    public function store(Request $request)
    {
        $userId = $request->user()->id;
        $validated = $this->validatedData($request);

        $product = Product::forUser($userId)->findOrFail($validated['product_id']);
        $supplier = Supplier::forUser($userId)->findOrFail($validated['supplier_id']);
        $store = null;

        if (! empty($validated['store_id'])) {
            $store = Store::forUser($userId)->findOrFail($validated['store_id']);
        }

        $orderValue = $product->buying_price * $validated['quantity'];

        $order = PurchaseOrder::create([
            'user_id' => $userId,
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
            'store_id' => $store?->id,
            'order_number' => $this->generateOrderNumber($userId),
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'] ?? null,
            'order_value' => $orderValue,
            'order_date' => $validated['order_date'] ?? now()->toDateString(),
            'expected_date' => $validated['expected_date'] ?? null,
            'status' => $validated['status'] ?? 'Confirmed',
            'notify_on_delivery' => $request->boolean('notify_on_delivery'),
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order created successfully.',
            'data' => [
                'order' => $order->load(['product', 'supplier', 'store']),
            ],
        ], Response::HTTP_CREATED);
    }

    public function update(Request $request, PurchaseOrder $order)
    {
        $validated = $this->validatedData($request, $order->id);

        $product = Product::forUser($request->user()->id)
            ->findOrFail($validated['product_id']);

        $supplier = Supplier::forUser($request->user()->id)
            ->findOrFail($validated['supplier_id']);

        $store = null;
        if (! empty($validated['store_id'])) {
            $store = Store::forUser($request->user()->id)
                ->findOrFail($validated['store_id']);
        }

        $previousStatus = $order->status;
        $previousQuantity = $order->quantity;
        $previousStoreId = $order->store_id;

        $order->fill([
            'product_id' => $product->id,
            'supplier_id' => $supplier->id,
            'store_id' => $store?->id,
            'quantity' => $validated['quantity'],
            'unit' => $validated['unit'] ?? $order->unit,
            'order_date' => $validated['order_date'] ?? $order->order_date,
            'expected_date' => $validated['expected_date'] ?? $order->expected_date,
            'status' => $validated['status'] ?? $order->status,
            'notify_on_delivery' => $request->boolean('notify_on_delivery', $order->notify_on_delivery),
            'notes' => $validated['notes'] ?? $order->notes,
        ]);

        $order->order_value = $product->buying_price * $order->quantity;

        $this->db->transaction(function () use ($order, $previousStatus, $previousQuantity, $previousStoreId) {
            $order->save();

            if ($order->status === 'Delivered' && $previousStatus !== 'Delivered') {
                $this->applyDeliveryAdjustments($order);
            }

            if ($previousStatus === 'Delivered' && $order->status !== 'Delivered') {
                $this->rollbackDeliveryAdjustments($order, $previousQuantity);
            }

            if ($order->status === 'Delivered' && $previousStatus === 'Delivered') {
                $difference = $order->quantity - $previousQuantity;

                if ($difference !== 0) {
                    $this->adjustDeliveredQuantities($order, $difference);
                }

                if ($order->store_id !== $previousStoreId) {
                    $this->reassignDeliveredStock($order, $previousStoreId);
                }
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Order updated successfully.',
            'data' => [
                'order' => $order->fresh()->load(['product', 'supplier', 'store']),
            ],
        ]);
    }

    public function destroy(PurchaseOrder $order)
    {
        if ($order->status === 'Delivered') {
            return response()->json([
                'success' => false,
                'message' => 'Delivered orders cannot be deleted.',
            ], Response::HTTP_CONFLICT);
        }

        $order->delete();

        return response()->noContent();
    }

    protected function validatedData(Request $request, ?int $orderId = null): array
    {
        return $request->validate([
            'product_id' => ['required', 'integer'],
            'supplier_id' => ['required', 'integer'],
            'store_id' => ['nullable', 'integer'],
            'quantity' => ['required', 'integer', 'min:1'],
            'unit' => ['nullable', 'string', 'max:50'],
            'order_date' => ['nullable', 'date'],
            'expected_date' => ['nullable', 'date'],
            'status' => ['nullable', 'in:Confirmed,Out for delivery,Delayed,Delivered,Returned,Cancelled'],
            'notes' => ['nullable', 'string'],
        ]);
    }

    protected function generateOrderNumber(int $userId): string
    {
        $count = PurchaseOrder::forUser($userId)->count() + 1;

        return 'PO-' . str_pad((string) $count, 6, '0', STR_PAD_LEFT);
    }

    protected function applyDeliveryAdjustments(PurchaseOrder $order): void
    {
        $product = $order->product()->lockForUpdate()->first();

        $product->increment('quantity', $order->quantity);

        if ($order->store_id) {
            $store = $order->store;

            $existing = $product->stores()
                ->where('store_id', $store->id)
                ->first();

            if ($existing) {
                $newQuantity = $existing->pivot->quantity + $order->quantity;
                $product->stores()->updateExistingPivot($store->id, ['quantity' => $newQuantity]);
            } else {
                $product->stores()->attach($store->id, ['quantity' => $order->quantity, 'threshold' => $product->threshold]);
            }
        }

        $order->status = 'Delivered';
        $order->delivered_at = now();
        $order->save();
    }

    protected function rollbackDeliveryAdjustments(PurchaseOrder $order, int $previousQuantity): void
    {
        $product = $order->product()->lockForUpdate()->first();

        $product->decrement('quantity', min($previousQuantity, $product->quantity));

        if ($order->store_id) {
            $existing = $product->stores()
                ->where('store_id', $order->store_id)
                ->first();

            if ($existing) {
                $newQuantity = max(0, $existing->pivot->quantity - $previousQuantity);
                $product->stores()->updateExistingPivot($order->store_id, ['quantity' => $newQuantity]);
            }
        }

        $order->delivered_at = null;
        $order->save();
    }

    protected function adjustDeliveredQuantities(PurchaseOrder $order, int $difference): void
    {
        $product = $order->product()->lockForUpdate()->first();

        if ($difference > 0) {
            $product->increment('quantity', $difference);
        } else {
            $product->decrement('quantity', min(abs($difference), $product->quantity));
        }

        if ($order->store_id) {
            $existing = $product->stores()->where('store_id', $order->store_id)->first();

            if ($existing) {
                $newQuantity = max(0, $existing->pivot->quantity + $difference);
                $product->stores()->updateExistingPivot($order->store_id, ['quantity' => $newQuantity]);
            }
        }
    }

    protected function reassignDeliveredStock(PurchaseOrder $order, ?int $previousStoreId): void
    {
        if (! $previousStoreId || ! $order->store_id) {
            return;
        }

        $product = $order->product()->lockForUpdate()->first();
        $quantity = $order->quantity;

        $previousPivot = $product->stores()->where('store_id', $previousStoreId)->first();
        if ($previousPivot) {
            $product->stores()->updateExistingPivot($previousStoreId, [
                'quantity' => max(0, $previousPivot->pivot->quantity - $quantity),
            ]);
        }

        $newPivot = $product->stores()->where('store_id', $order->store_id)->first();
        if ($newPivot) {
            $product->stores()->updateExistingPivot($order->store_id, [
                'quantity' => $newPivot->pivot->quantity + $quantity,
            ]);
        } else {
            $product->stores()->attach($order->store_id, [
                'quantity' => $quantity,
                'threshold' => $product->threshold,
            ]);
        }
    }
}
