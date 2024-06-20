<?php

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
        Company::each(function (Company $company) {
            $company->settings()->set('appointments.no_show_deposit', [
                'enabled' => false,
                'percent' => 20
            ]);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Company::each(function (Company $company) {
            $company->settings()->delete('appointments.no_show_deposit');
        });
    }
};
