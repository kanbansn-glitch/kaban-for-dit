<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('product_code')->nullable()->after('id');
        });

        $products = DB::table('products')->select('id', 'user_id')->get();

        foreach ($products as $product) {
            $code = 'PRD-' . str_pad((string) $product->id, 6, '0', STR_PAD_LEFT);

            DB::table('products')
                ->where('id', $product->id)
                ->update(['product_code' => $code]);
        }

        if (Schema::getConnection()->getDriverName() !== 'sqlite') {
            DB::statement('ALTER TABLE products MODIFY product_code VARCHAR(255) NOT NULL');
        }

        Schema::table('products', function (Blueprint $table) {
            $table->unique(['user_id', 'product_code']);
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique('products_user_id_product_code_unique');
            $table->dropColumn('product_code');
        });
    }
};
