<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('product_store', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('quantity')->default(0);
            $table->unsignedInteger('threshold')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'store_id']);
        });

        if (Schema::hasTable('products') && Schema::hasTable('stores')) {
            $products = DB::table('products')->select('id', 'user_id', 'quantity', 'threshold')->get();

            foreach ($products as $product) {
                $storeId = DB::table('stores')
                    ->where('user_id', $product->user_id)
                    ->value('id');

                if ($storeId) {
                    DB::table('product_store')->insert([
                        'product_id' => $product->id,
                        'store_id' => $storeId,
                        'quantity' => max(0, $product->quantity),
                        'threshold' => max(0, $product->threshold),
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_store');
    }
};
