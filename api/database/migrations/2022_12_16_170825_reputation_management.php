<?php

use App\Models\Company;
use App\Services\ReputationManagementService;
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
            $company->settings()->set('integrations.reputation_management', ReputationManagementService::GRADEUS_INTEGRATION);
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
            $company->settings()->delete('integrations.reputation_management');
        });
    }
};
