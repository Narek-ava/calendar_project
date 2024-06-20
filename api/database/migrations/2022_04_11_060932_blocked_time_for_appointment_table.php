<?php

use App\Models\Appointment;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->string('type')->nullable();
            $table->string('payment_type')->nullable()->change();
            $table->unsignedBigInteger('employee_id')->nullable()->change();
            $table->unsignedBigInteger('service_id')->nullable()->change();
            $table->unsignedBigInteger('customer_id')->nullable()->change();
        });

        Appointment::query()->update(['type' => Appointment::APPOINTMENT_TYPE]);
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('type');
            $table->string('payment_type')->change();
            $table->unsignedBigInteger('employee_id')->change();
            $table->unsignedBigInteger('service_id')->change();
            $table->unsignedBigInteger('customer_id')->change();
        });
    }
};
