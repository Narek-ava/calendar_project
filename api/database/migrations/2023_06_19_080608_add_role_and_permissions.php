<?php

use App\Models\Company;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Company::all()->each(function (Company $company) {
            Role::create([
                'company_id' => $company->id,
                'name'       => Role::READ_ONLY_LIMITED_ROLE,
                'level'      => 6,
                'label'      => 'Read-Only (Limited)',
                'guard_name' => 'web',
            ])->givePermissionTo('appointment.list');
        });
    }
};
