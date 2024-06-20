<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMailgunIncomingEmailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('mailgun_incoming_emails', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->json('payload');
            $table->boolean('is_processed')->default(false);
            $table->boolean('is_unknown_mailbox')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('mailgun_incoming_emails');
    }
}
