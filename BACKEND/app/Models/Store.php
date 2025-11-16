<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    use HasFactory;
    use BelongsToUser;

    protected $fillable = [
        'user_id',
        'name',
        'branch_name',
        'address_line',
        'city',
        'postal_code',
        'phone',
    ];

    protected $casts = [
        'stock_quantity' => 'integer',
    ];

    /**
     * @return BelongsTo<User, Store>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsToMany<Product>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot(['quantity', 'threshold'])
            ->withTimestamps();
    }

    /**
     * @return HasMany<PurchaseOrder>
     */
    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    /**
     * @return HasMany<Sale>
     */
    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }

    public function getStockQuantityAttribute($value): int
    {
        if ($value !== null) {
            return (int) $value;
        }

        if ($this->relationLoaded('products')) {
            return (int) $this->products->sum(function ($product) {
                return (int) ($product->pivot->quantity ?? 0);
            });
        }

        return 0;
    }
}
