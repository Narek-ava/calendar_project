<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompaniesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('company_owners', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid');
            $table->string('slug');
            $table->foreignId('company_owner_id')->constrained('company_owners')->onDelete('cascade');
            $table->string('name');
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('site')->nullable();
            $table->string('time_zone');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('company_id')->constrained('companies')->onDelete('cascade');
            $table->string('verify_token')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->string('profession_title')->nullable();
            $table->char('background_color', 6)->nullable();
            $table->char('text_color', 6)->nullable();
            $table->jsonb('schedule')->nullable();
            $table->boolean('self_book');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'company_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('employees');
        Schema::dropIfExists('companies');
        Schema::dropIfExists('company_owners');
        Schema::enableForeignKeyConstraints();
    }
}
