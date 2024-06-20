<?php

use App\Models\Location;
use App\Models\Service;
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
        Schema::table('customers', function (Blueprint $table) {
            $table->unique(['company_id', 'phone']);
            $table->unique(['company_id', 'email']);

            $table->dropUnique(['company_owner_id', 'phone']);
            $table->dropUnique(['company_owner_id', 'email']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->unique(['company_owner_id', 'phone']);
            $table->unique(['company_owner_id', 'email']);

            $table->dropUnique(['company_id', 'phone']);
            $table->dropUnique(['company_id', 'email']);
        });
    }
};
