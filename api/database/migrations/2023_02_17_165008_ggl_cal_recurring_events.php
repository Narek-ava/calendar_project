<?php

use App\Models\Google\GoogleSync;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        $syncs = GoogleSync::whereNotNull('resource_id')
            ->where('syncble_type', 'App\Models\Google\GoogleCalendar')
            ->get();

        foreach ($syncs as $gSync) {
            $gSync->update(['token' => null]);
            $gSync->refresh();
            $gSync->ping();
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {

    }
};
