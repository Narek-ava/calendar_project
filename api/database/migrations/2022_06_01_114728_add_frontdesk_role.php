<?php

use App\Models\Company;
use App\Models\Role;
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
        $defaultFrontdeskRole = collect(Role::$defaultRoles)->firstWhere('name', Role::FRONTDESK_ROLE);

        Company::all()->each(function (Company $company) use ($defaultFrontdeskRole) {
            Role::query()
                ->firstOrCreate([
                    'company_id' => $company->id,
                    'name'       => $defaultFrontdeskRole['name']
                ], $defaultFrontdeskRole)
                ->syncPermissions($defaultFrontdeskRole['permissions']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Role::where('name', Role::FRONTDESK_ROLE)->each(function (Role $role) {
            $role->permissions()->detach();
            $role->delete();
        });
    }
};
