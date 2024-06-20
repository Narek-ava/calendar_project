<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->longText('waiver_data')->nullable();
        });
        Schema::table('services', function (Blueprint $table) {
            $table->boolean('is_waiver_enabled')->default(false);
        });
        Schema::table('appointments', function (Blueprint $table) {
            $table->longText('waiver_answers')->nullable();
            $table->string('waiver_pdf')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('waiver_data');
        });
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('is_waiver_enabled');
        });
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn(['waiver_answers', 'waiver_pdf']);
        });
    }
};
