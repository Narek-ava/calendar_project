<?php

use App\Models\Appointment;
use App\Models\Service;
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
            $table->jsonb('payments')->nullable();
        });

        // Fill payments for old completed payments
        DB::statement("
            update appointments
            set payments = jsonb_build_array(json_build_object(
                    'amount', appointments.price,
                    'method', coalesce(appointments.payment_method, '" . Appointment::CASH_PAYMENT_METHOD . "'),
                    'reason', '" . Appointment::SERVICE_PAYMENT_REASON . "',
                    'datetime', appointments.updated_at))
            where status = '" . Appointment::COMPLETED_STATUS . "'
              and payment_type != '" . Service::FREE_PAYMENT_TYPE . "'
              and payments is null;
        ");
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropColumn('payments');
        });
    }
};
