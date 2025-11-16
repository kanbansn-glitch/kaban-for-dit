<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrder extends Model
{
    use HasFactory;
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'product_id',
        'supplier_id',
        'store_id',
        'order_number',
        'quantity',
        'unit',
        'order_value',
        'order_date',
        'expected_date',
        'status',
        'notify_on_delivery',
        'delivered_at',
        'notes',
    ];

    protected $casts = [
        'order_date' => 'date',
        'expected_date' => 'date',
        'delivered_at' => 'datetime',
        'notify_on_delivery' => 'boolean',
    ];

    /**
     * @return BelongsTo<User, PurchaseOrder>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Product, PurchaseOrder>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<Supplier, PurchaseOrder>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * @return BelongsTo<Store, PurchaseOrder>
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
