<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $roles = collect(Role::$defaultRoles);

        Role::all()->each(function (Role $role) use ($roles) {
            $permissions = $roles->where('name', $role->name)->first()['permissions'];
            $role->syncPermissions($permissions);
        });
    }
}
