<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class EndToEndSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * @return void
     */
    public function run(): void
    {
        $this->call([
            PermissionsSeeder::class,
            EndToEnd\UserSeeder::class,
        ]);
    }
}
