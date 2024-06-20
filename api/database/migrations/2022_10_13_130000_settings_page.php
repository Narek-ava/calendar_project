<?php

use App\Models\Location;
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
        Location::with(['company' => fn($q) => $q->withTrashed()])->withTrashed()->each(function (Location $location) {
            $location->company->settings()->set('notifications.immediately_sms_notify', $location->immediately_sms_notify);
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('immediately_sms_notify');
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
            $table->boolean('immediately_sms_notify')->default(false);
        });

        Location::with(['company' => fn($q) => $q->withTrashed()])->withTrashed()->each(function (Location $location) {
            $location->update([
                'immediately_sms_notify' => $location->company->settings()->get('notifications.immediately_sms_notify')
            ]);
            $location->company->settings()->delete('notifications.immediately_sms_notify');
        });

    }
};
