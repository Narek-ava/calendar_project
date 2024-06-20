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
        Schema::table('companies', function (Blueprint $table) {
            $table->json('settings')->nullable();
        });

        Company::withTrashed()->each(function ($company) {
            $company->settings()->set('notifications.enabled', $company->is_notifications_enabled);

            $company->settings()->set('appointments.autocomplete.enabled', false);
            $company->settings()->set('appointments.autocomplete.interval', null);

            $company->settings()->set('appointments.completed_notify_customers', false);
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('is_notifications_enabled');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->boolean('is_notifications_enabled')->default(true);
        });

        Company::withTrashed()->each(function ($company) {
            $company->update(['is_notifications_enabled' => $company->settings()->get('notifications.enabled')]);
        });

        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('settings');
        });
    }
};
