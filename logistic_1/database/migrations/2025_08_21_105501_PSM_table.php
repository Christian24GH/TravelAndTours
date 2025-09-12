<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ================================
        // Core Supplier Tables (External Integration with CORE 2)
        // ================================
        Schema::create('core2_supplier', function (Blueprint $table) {
            $table->id('core2_supplier_id');
            $table->string('supplier_name', 100);
            $table->string('contact_info', 255)->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();
        });

        Schema::create('supplier', function (Blueprint $table) {
            $table->id('supplier_id');
            $table->unsignedBigInteger('core2_supplier_id');
            $table->tinyInteger('rating')->nullable()->comment('1 to 5 performance rating');
            $table->timestamp('last_synced_at')->nullable(); // Sync timestamp for CORE 2
            $table->enum('sync_status', ['synchronized', 'pending', 'failed'])->default('pending'); // Sync status
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();

            $table->foreign('core2_supplier_id')
                  ->references('core2_supplier_id')
                  ->on('core2_supplier')
                  ->onDelete('cascade');
        });

        // ================================
        // Procurement Tables
        // ================================
        Schema::create('purchase_request', function (Blueprint $table) {
            $table->id('request_id');
            $table->unsignedBigInteger('equipment_id');
            $table->unsignedInteger('quantity');
            $table->string('requested_by', 100)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->string('sws_request_id')->nullable(); // External request ID from SWS
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();

            $table->foreign('equipment_id')
                  ->references('equipment_id')
                  ->on('equipment')
                  ->onDelete('cascade');
        });

        Schema::create('purchase_order', function (Blueprint $table) {
            $table->id('order_id');
            $table->unsignedBigInteger('request_id');
            $table->unsignedBigInteger('supplier_id');
            $table->decimal('total_amount', 10, 2);
            $table->enum('status', ['issued', 'completed', 'cancelled'])->default('issued');
            $table->date('order_date')->nullable();
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();
            $table->string('core2_order_id')->nullable(); // External order ID from CORE 2

            $table->foreign('request_id')
                  ->references('request_id')
                  ->on('purchase_request')
                  ->onDelete('cascade');

            $table->foreign('supplier_id')
                  ->references('supplier_id')
                  ->on('supplier')
                  ->onDelete('cascade');
        });

        // ================================
        // Expense & Financial Tables
        // ================================
        Schema::create('expense_record', function (Blueprint $table) {
            $table->id('expense_id');
            $table->unsignedBigInteger('order_id');
            $table->decimal('amount', 10, 2);
            $table->enum('payment_status', ['unpaid', 'paid', 'partial'])->default('unpaid');
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();

            $table->foreign('order_id')
                  ->references('order_id')
                  ->on('purchase_order')
                  ->onDelete('cascade');
        });

        Schema::create('financial_budget', function (Blueprint $table) {
            $table->id('budget_id');
            $table->unsignedBigInteger('request_id');
            $table->unsignedBigInteger('expense_id')->nullable();
            $table->decimal('allocated_amount', 12, 2);
            $table->decimal('approved_amount', 12, 2)->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();
            $table->string('external_budget_id')->nullable(); // External reference ID for budget tracking (financial system)

            $table->foreign('request_id')
                  ->references('request_id')
                  ->on('purchase_request')
                  ->onDelete('cascade');

            $table->foreign('expense_id')
                  ->references('expense_id')
                  ->on('expense_record')
                  ->onDelete('set null');
        });

        // ================================
        // Document Tracking (DTRS Integration)
        // ================================
        Schema::create('procurement_delivery_records', function (Blueprint $table) {
            $table->id('record_id');
            $table->unsignedBigInteger('purchase_order_id');
            $table->string('record_type'); // Type of record (e.g., 'invoice', 'delivery')
            $table->text('record_details'); // Details of the record (e.g., metadata or URLs)
            $table->enum('status', ['pending', 'sent', 'failed'])->default('pending'); // Status of sending to DTRS
            $table->timestamps();

            $table->foreign('purchase_order_id')
                  ->references('order_id')
                  ->on('purchase_order')
                  ->onDelete('cascade');
        });

        Schema::create('procurement_documents', function (Blueprint $table) {
            $table->id('document_id');
            $table->unsignedBigInteger('purchase_order_id');
            $table->string('document_type'); // Type of document (e.g., 'invoice', 'receipt')
            $table->string('document_url'); // URL or path to the document stored in DTRS
            $table->timestamps();

            $table->foreign('purchase_order_id')
                  ->references('order_id')
                  ->on('purchase_order')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_documents');
        Schema::dropIfExists('procurement_delivery_records');
        Schema::dropIfExists('financial_budget');
        Schema::dropIfExists('expense_record');
        Schema::dropIfExists('purchase_order');
        Schema::dropIfExists('purchase_request');
        Schema::dropIfExists('supplier');
        Schema::dropIfExists('core2_supplier');
    }
};
