<?php

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
        Schema::create('notification_stats', function (Blueprint $table) {
            $table->id();

            $table->unsignedBigInteger('company_id');

            $table->string('notification_type');
            $table->morphs('notifiable');

            $table->string('channel');
            $table->string('recipient');

            $table->string('type');
            $table->unsignedBigInteger('value');

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
        Schema::dropIfExists('notification_stats');
    }
};
