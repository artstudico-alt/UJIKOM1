<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Payment settings columns
            $table->json('payment_methods')->nullable()->after('price')->comment('JSON array of payment methods: bank_transfer, e_wallet, credit_card');
            $table->json('bank_account_info')->nullable()->after('payment_methods')->comment('JSON object with bank_name, account_number, account_holder');
            $table->text('payment_instructions')->nullable()->after('bank_account_info')->comment('Payment instructions for participants');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['payment_methods', 'bank_account_info', 'payment_instructions']);
        });
    }
};
