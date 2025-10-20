<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('suppliers', 'takes_back_returns')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->boolean('takes_back_returns')
                    ->after('address')
                    ->default(false);
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('suppliers', 'takes_back_returns')) {
            Schema::table('suppliers', function (Blueprint $table) {
                $table->dropColumn('takes_back_returns');
            });
        }
    }
};
