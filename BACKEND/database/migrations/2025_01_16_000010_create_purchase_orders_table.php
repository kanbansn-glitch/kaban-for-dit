<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('supplier_id')->constrained()->cascadeOnDelete();
            $table->foreignId('store_id')->nullable()->constrained()->nullOnDelete();
            $table->string('order_number');
            $table->unsignedInteger('quantity');
            $table->string('unit')->nullable();
            $table->decimal('order_value', 12, 2)->default(0);
            $table->date('order_date')->nullable();
            $table->date('expected_date')->nullable();
            $table->enum('status', ['Confirmed', 'Out for delivery', 'Delayed', 'Delivered', 'Returned', 'Cancelled'])->default('Confirmed');
            $table->boolean('notify_on_delivery')->default(false);
            $table->timestamp('delivered_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'order_number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchase_orders');
    }
};
