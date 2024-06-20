<?php

namespace Database\Seeders;

use App;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run()
    {
        $seeders = [
            PermissionsSeeder::class,
        ];

        if (App::environment('local', 'staging')) {
            $seeders[] = \Database\Seeders\EndToEnd\UserSeeder::class;
        }

        $this->call($seeders);
    }
}
