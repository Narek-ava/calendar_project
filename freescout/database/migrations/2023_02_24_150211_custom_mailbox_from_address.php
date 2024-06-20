<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CustomMailboxFromAddress extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::table('mailboxes', function (Blueprint $table) {
            $table->text('from_address_prefix')->nullable();
            $table->text('from_address_suffix')->nullable();
        });

        Schema::create('mailgun_domains', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->text('domain')->unique();
            $table->text('secret');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::table('mailboxes', function (Blueprint $table) {
            $table->dropColumn('from_address_prefix', 'from_address_suffix');
        });

        Schema::dropIfExists('mailgun_domains');
    }
}
