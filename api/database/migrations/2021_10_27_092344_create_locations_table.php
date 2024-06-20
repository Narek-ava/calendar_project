<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateLocationsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('name');
            $table->string('time_zone');
            $table->boolean('is_primary')->default('false');
            $table->unsignedSmallInteger('in_advance')->nullable();
            $table->string('phone')->nullable();
            $table->jsonb('schedule')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('location_employee', function (Blueprint $table) {
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
            $table->foreignId('location_id')->constrained('locations')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('location_employee');
        Schema::dropIfExists('locations');
        Schema::enableForeignKeyConstraints();
    }
}
