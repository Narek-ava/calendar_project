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
        Schema::table('services', function (Blueprint $table) {
            $table->boolean('is_rescheduling_interval_enabled')->default(false);
            $table->integer('rescheduling_interval')->default(2);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn(['is_rescheduling_interval_enabled', 'rescheduling_interval']);
        });
    }
};
