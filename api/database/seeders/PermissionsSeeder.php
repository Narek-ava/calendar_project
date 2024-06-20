<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;
use Spatie\Permission\PermissionRegistrar;

class PermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $groupPermissions = Permission::$defaultPermissions;

        foreach ($groupPermissions as $group => $permissions) {
            foreach ($permissions as $permission) {
                Permission::create([
                    'name'  => $group . '.' . $permission['name'],
                    'label' => $permission['label'],
                ]);
            }
        }
    }
}
