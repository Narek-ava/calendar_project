<?php

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\PermissionRegistrar;

return new class extends Migration {

    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        foreach (Permission::$defaultPermissions as $group => $permissions) {
            Permission::create([
                'name'  => "$group.audit",
                'label' => "Audit $group",
            ]);
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
    }
};
