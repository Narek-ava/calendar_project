<?php

use App\Models\Company;
use App\Models\Employee;
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
        Schema::table('employees', function (Blueprint $table) {
            $table->string('slug')->nullable();
        });
        Employee::each(function (Employee $employee) {
            $employee->generateSlug();
            $employee->save();
        });

        Schema::table('services', function (Blueprint $table) {
            $table->string('slug')->nullable();
        });
        Service::each(function (Service $service) {
            $service->generateSlug();
            $service->save();
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->string('slug')->nullable();
        });
        Location::each(function (Location $location) {
            $location->generateSlug();
            $location->save();
        });

    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn('slug');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
