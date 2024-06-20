<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAppointmentsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('appointments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->foreignId('employee_id')->constrained('employees')->onDelete('set null');
            $table->foreignId('location_id')->constrained('locations')->onDelete('set null');
            $table->foreignId('service_id')->constrained('services')->onDelete('set null');
            $table->foreignId('customer_id')->constrained('customers')->onDelete('set null');
            $table->string('status');
            $table->timestamp('start_at');
            $table->timestamp('end_at');
            $table->string('payment_type');
            $table->string('payment_method')->nullable();
            $table->boolean('fixed_price')->default(false);
            $table->decimal('price')->nullable();
            $table->decimal('prepay')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('appointments');
    }
}
