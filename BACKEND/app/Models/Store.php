<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Store extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'branch_name',
        'address_line',
        'city',
        'postal_code',
        'phone',
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
}
