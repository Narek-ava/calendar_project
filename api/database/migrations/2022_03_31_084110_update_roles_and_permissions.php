<?php

use App\Models\Role;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        $roles = collect(Role::$defaultRoles);
        Role::all()->each(function (Role $role) use ($roles) {
            $permissions = $roles->where('name', $role->name)->first()['permissions'];
            $role->syncPermissions($permissions);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        //
    }
};
