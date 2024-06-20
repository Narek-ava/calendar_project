<?php

use App\Models\Employee;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;

return new class extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('google_accounts', function (Blueprint $table) {
            $table->increments('id');

            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->index(['user_id']);

            $table->string('google_id');
            $table->string('name');
            $table->json('token');

            $table->timestamps();
        });

        Schema::create('google_calendars', function (Blueprint $table) {
            $table->increments('id');

            $table->foreignId('google_account_id')->constrained()->cascadeOnDelete();
            $table->index(['google_account_id']);

            $table->boolean('accounting_events')->default(false);
            $table->string('google_id');
            $table->string('name');
            $table->string('color');
            $table->string('timezone');

            $table->timestamps();
        });

        Schema::create('google_events', function (Blueprint $table) {
            $table->increments('id');

            $table->foreignId('google_calendar_id')->constrained()->cascadeOnDelete();
            $table->index(['google_calendar_id']);

            $table->foreignId('appointment_id')->nullable()->constrained()->nullOnDelete();
            $table->index(['appointment_id']);

            $table->string('google_id');
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('allday')->default(false);

            $table->datetime('started_at');
            $table->datetime('ended_at');
            $table->index(['ended_at', 'started_at']); // in this order!

            $table->timestamps();
        });

        Schema::create('google_syncs', function (Blueprint $table) {
            $table->string('id');

            $table->morphs('syncble');

            $table->string('token')->nullable();
            $table->string('resource_id')->nullable();

            $table->datetime('expired_at')->nullable();
            $table->datetime('last_synced_at');
            $table->timestamps();
        });

        Employee::withTrashed()->each(function (Employee $employee) {
            $employee->settings()->set('widget.accounting_google_events', true);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('google_syncs');
        Schema::dropIfExists('google_events');
        Schema::dropIfExists('google_calendars');
        Schema::dropIfExists('google_accounts');

        Employee::withTrashed()->each(function (Employee $employee) {
            $employee->settings()->delete('widget.accounting_google_events');
        });
    }
};
