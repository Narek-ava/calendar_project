<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddOrganizationColumnToMailboxesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('mailboxes', function (Blueprint $table) {
            $table->unsignedTinyInteger('organization')->nullable();
            $table->boolean('strip_subdomain')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('mailboxes', function (Blueprint $table) {
            $table->dropColumn('organization');
            $table->dropColumn('strip_subdomain');
        });
    }
}
