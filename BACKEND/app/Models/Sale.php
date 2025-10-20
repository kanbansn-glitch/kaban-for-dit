<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sale extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'store_id',
        'quantity',
        'selling_price',
        'buying_price',
        'sale_date',
    ];

    protected $casts = [
        'sale_date' => 'date',
    ];

    /**
     * @return BelongsTo<User, Sale>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<Product, Sale>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<Store, Sale>
     */
    public function store(): BelongsTo
    {
        return $this->belongsTo(Store::class);
    }
}
