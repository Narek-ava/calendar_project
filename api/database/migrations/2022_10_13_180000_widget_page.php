<?php

use App\Models\Location;
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
        Service::with(['company' => fn($q) => $q->withTrashed()])->withTrashed()->each(function (Service $service) {
            $service->company->settings()->set('widget.is_attachments_enabled', true);
            $service->company->settings()->set('widget.max_advance_booking', $service->self_book_days);
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('is_attachments_enabled');
            $table->dropColumn('self_book_days');

            $table->unsignedSmallInteger('advance_booking_buffer')->default(0);
        });

        Service::with(['locations' => fn($q) => $q->withTrashed()])->withTrashed()->each(function (Service $service) {
            $service->locations->each(function (Location $location) use ($service) {
                $service->update(['advance_booking_buffer' => $location->in_advance ?? 0]);
            });
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('in_advance');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('services', function (Blueprint $table) {
            $table->boolean('is_attachments_enabled')->default(false);
            $table->unsignedSmallInteger('self_book_days')->default(14);
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->unsignedSmallInteger('in_advance')->nullable();
        });

        Service::with(['company' => fn($q) => $q->withTrashed(), 'locations' => fn($q) => $q->withTrashed()])->withTrashed()->each(function (Service $service) {
            $service->update([
                'is_attachments_enabled' => $service->company->settings()->get('widget.is_attachments_enabled'),
                'self_book_days'         => $service->company->settings()->get('widget.max_advance_booking')
            ]);
            $service->company->settings()->delete('widget.is_attachments_enabled');
            $service->company->settings()->delete('widget.max_advance_booking');

            $service->locations->each(function (Location $location) use ($service) {
                $location->update(['in_advance' => $service->advance_booking_buffer]);
            });
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('advance_booking_buffer');
        });
    }
};
