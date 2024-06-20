<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerContactsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('customer_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->onDelete('cascade');
            $table->string('type');
            $table->string('value');
            $table->timestamps();

            $table->unique(['customer_id', 'type', 'value']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('customers_contacts', function (Blueprint $table) {
            $table->dropForeign(['customer_id']);
        });

        Schema::dropIfExists('customer_contacts');
    }
}
