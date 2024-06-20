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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('can_impersonate')->default(false);
        });

        Schema::table('audits', function (Blueprint $table) {
            $table->unsignedBigInteger('impersonator_id')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('can_impersonate');
        });

        Schema::table('audits', function (Blueprint $table) {
            $table->dropColumn('impersonator_id');
        });
    }
};
