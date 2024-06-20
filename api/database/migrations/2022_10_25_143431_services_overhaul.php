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
            $table->dropColumn('is_rescheduling_interval_enabled');

            $table->boolean('is_private')->default(false);
        });

        // Convert hours to minutes and self_book to !is_private
        DB::statement('update services set rescheduling_interval = rescheduling_interval * 60, is_private =  NOT self_book');

        //
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('self_book');
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
            $table->boolean('is_rescheduling_interval_enabled')->default(false);
            $table->boolean('self_book')->default(true);
        });

        // Convert minutes to hours and is_private to !self_book
        DB::statement('update services set rescheduling_interval = rescheduling_interval / 60, self_book = NOT is_private');

        //
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('is_private');
        });
    }
};
