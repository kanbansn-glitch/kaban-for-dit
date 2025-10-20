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
        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->nullable()->after('category_id');
        });

        // Drop existing supplier_id column if present and recreate with FK
        if (Schema::hasColumn('products', 'supplier_id')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropColumn('supplier_id');
            });
        }

        $firstUserId = DB::table('users')->orderBy('id')->value('id');

        if ($firstUserId) {
            DB::table('products')->update(['user_id' => $firstUserId]);
        }

        Schema::table('products', function (Blueprint $table) {
            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->cascadeOnDelete();
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('supplier_id')
                ->nullable()
                ->after('user_id')
                ->constrained()
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropConstrainedForeignId('supplier_id');
            $table->dropForeign(['user_id']);
            $table->dropColumn('user_id');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->unsignedBigInteger('supplier_id')->nullable()->index();
        });
    }
};
