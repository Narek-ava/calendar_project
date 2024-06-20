<?php

use App\Models\Employee;
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
            $table->boolean('is_invite_accepted')->default(false);
        });

        Employee::withTrashed()->withoutGlobalScopes()->get()->each(function (Employee $employee) {
            $employee->update(['is_invite_accepted' => !is_null($employee->verified_at)]);
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
            $table->dropColumn('is_invite_accepted');
        });
    }
};
