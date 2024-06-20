<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration {
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        // https://postgresql.verite.pro/blog/2019/10/14/nondeterministic-collations.html

//        DB::statement("
//            CREATE COLLATION IF NOT EXISTS ignorecase (
//                provider = 'icu',
//                locale = '@colStrength=secondary',
//                deterministic = false
//            );
//        ");
//
//        DB::statement('
//            ALTER TABLE users ALTER COLUMN email SET DATA TYPE character varying(255) COLLATE "ignorecase";
//        ');
//        DB::statement('
//            ALTER TABLE customers ALTER COLUMN email SET DATA TYPE character varying(255) COLLATE "ignorecase";
//        ');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
//        DB::statement('
//            ALTER TABLE users ALTER COLUMN email SET DATA TYPE character varying(255) COLLATE "C";
//        ');
//        DB::statement('
//            ALTER TABLE customers ALTER COLUMN email SET DATA TYPE character varying(255) COLLATE "C";
//        ');
//
//        DB::statement('
//            DROP COLLATION ignorecase;
//        ');
    }
};
