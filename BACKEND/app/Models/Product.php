<?php

namespace App\Models;

use App\Models\Concerns\BelongsToUser;
use App\Support\Money;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\PurchaseOrder;
use App\Models\Sale;
use App\Models\Store;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;
    use BelongsToUser;

    protected $fillable = [
        'product_code',
        'name',
        'category_id',
        'user_id',
        'buying_price',
        'selling_price',
        'quantity',
        'threshold',
        'expiry_date',
        'supplier_id',
        'status',
    ];

    protected $appends = [
        'stock_value',
    ];

    protected $casts = [
        'buying_price' => 'float',
        'selling_price' => 'float',
        'quantity' => 'integer',
        'threshold' => 'integer',
        'category_id' => 'integer',
        'user_id' => 'integer',
        'supplier_id' => 'integer',
        'expiry_date' => 'date',
    ];

    /**
     * @return BelongsTo<Category, Product>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * @return BelongsTo<User, Product>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Supplier, Product>
     */
    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    /**
     * @return BelongsToMany<Store>
     */
    public function stores(): BelongsToMany
    {
        return $this->belongsToMany(Store::class)
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

    public function getStockValueAttribute(): float
    {
        $sellingPrice = (float) ($this->selling_price ?? 0);
        $buyingPrice = (float) ($this->buying_price ?? 0);

        $unitPrice = $sellingPrice > 0 ? $sellingPrice : $buyingPrice;

        return Money::round(((int) $this->quantity) * $unitPrice);
    }
}
