<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->index(['start_at', 'location_id', 'customer_id', 'employee_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['start_at', 'location_id', 'customer_id', 'employee_id']);
        });
    }
};
