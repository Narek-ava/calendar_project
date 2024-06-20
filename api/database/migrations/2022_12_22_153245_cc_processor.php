<?php

use App\Models\Appointment;
use App\Models\Company;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Company::withTrashed()->each(function (Company $company) {
            $company->settings()->set('integrations.cc_processor', Appointment::AUTHORIZE_NET_PAYMENT_METHOD);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Company::withTrashed()->each(function (Company $company) {
            $company->settings()->delete('integrations.cc_processor');
        });
    }
};
