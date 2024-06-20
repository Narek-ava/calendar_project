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
        Schema::table('company_owners', function (Blueprint $table) {
            $table->string('subscription_type')->nullable();
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->string('subscription_type')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('subscription_type');
        });

        Schema::table('company_owners', function (Blueprint $table) {
            $table->dropColumn('subscription_type');
        });
    }
};