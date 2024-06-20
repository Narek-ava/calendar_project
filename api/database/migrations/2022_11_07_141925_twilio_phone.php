<?php

use App\Models\Company;
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
        Schema::table('locations', function (Blueprint $table) {
            $table->string('twilio_phone')->nullable();
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->boolean('is_twilio_enabled')->default(false);
        });

        Company::withTrashed()->each(function ($company) {
            if (!$company->settings()->has('integrations.twilio')) {
                $company->settings()->setMultiple([
                    'integrations.twilio.auth_token'  => null,
                    'integrations.twilio.account_sid' => null,
                ]);
            }
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('twilio_phone');
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('is_twilio_enabled');
        });

        Company::withTrashed()->each(function ($company) {
            $company->settings()->delete('integrations.twilio');
        });
    }
};
