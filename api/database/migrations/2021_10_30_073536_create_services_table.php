<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateServicesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_category_id')->constrained('service_categories')->onDelete('cascade');
            $table->string('name');
            $table->unsignedSmallInteger('duration')->nullable();
            $table->unsignedSmallInteger('interval')->nullable();
            $table->string('payment_type');
            $table->decimal('price')->nullable();
            $table->decimal('prepay')->nullable();
            $table->boolean('fixed_price');
            $table->boolean('self_book');
            $table->unsignedSmallInteger('self_book_days');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('service_location', function (Blueprint $table) {
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('location_id')->constrained('locations')->onDelete('cascade');
        });

        Schema::create('service_employee', function (Blueprint $table) {
            $table->foreignId('service_id')->constrained('services')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('cascade');
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
        Schema::dropIfExists('service_location');
        Schema::dropIfExists('services');
        Schema::enableForeignKeyConstraints();
    }
}
