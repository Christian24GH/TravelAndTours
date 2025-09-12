<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ================================
        // 1) Delivery Receipts (DTRS Integration)
        // ================================
        Schema::create('delivery_receipt', function (Blueprint $table) {
            $table->id('receipt_id');
            $table->unsignedBigInteger('delivery_id');
            $table->string('document_path', 255);
            $table->string('reference_code', 100);
            $table->unsignedBigInteger('tour_project_id');  // Added for search by project
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();
            $table->timestamp('archived_at')->nullable();  // For archiving old receipts

            // Foreign Key: Linking to delivery records
            $table->foreign('delivery_id')
                  ->references('delivery_id')->on('delivery')
                  ->onDelete('cascade');

            $table->foreign('tour_project_id')
                  ->references('project_id')->on('tour_project')
                  ->onDelete('cascade');
        });

        // ================================
        // 2) Equipment Logs (DTRS + PSM Integration)
        // ================================
        Schema::create('equipment_log', function (Blueprint $table) {
            $table->id('log_id');
            $table->unsignedBigInteger('equipment_id');
            $table->unsignedBigInteger('project_id');
            $table->enum('action', ['borrowed', 'returned', 'lost', 'damaged']);
            $table->timestamp('action_date')->useCurrent();
            $table->text('remarks')->nullable();
            $table->timestamps();

            // Foreign Keys: Linking to equipment and projects
            $table->foreign('equipment_id')
                  ->references('equipment_id')->on('equipment')
                  ->onDelete('cascade');

            $table->foreign('project_id')
                  ->references('project_id')->on('tour_project')
                  ->onDelete('cascade');
        });

        // ================================
        // 3) Logistics Reports (DTRS Reports)
        // ================================
        Schema::create('logistics_report', function (Blueprint $table) {
            $table->id('report_id');
            $table->enum('report_type', ['monthly', 'custom']);
            $table->date('report_date');
            $table->string('file_path', 255);  // Store file path for exported reports
            $table->enum('archived', ['yes', 'no'])->default('no');
            $table->timestamps();

            // Additional field to link back to delivery/logistics records if necessary
            $table->string('reference_code')->nullable();  // Unique reference for logistics report
        });

        // ================================
        // 4) Fleet Documents (LOGISTIC 2 → DTRS Integration)
        // ================================
        Schema::create('fleet_document', function (Blueprint $table) {
            $table->id('fleet_doc_id');
            $table->unsignedBigInteger('vehicle_id');
            $table->string('document_name', 100);
            $table->string('document_path', 255);
            $table->date('issued_date');
            $table->date('expiry_date')->nullable();
            $table->timestamps();

            // Foreign Key: Linking to fleet vehicle records (corrected table reference to alms_vehicles)
            $table->foreign('vehicle_id')
                  ->references('id')->on('alms_vehicles') // Updated to match alms_vehicles table
                  ->onDelete('cascade');
        });

        // ================================
        // 5) Procurement Documents (PSM → DTRS Integration)
        // ================================
        Schema::create('procurement_document', function (Blueprint $table) {
            $table->id('procurement_doc_id');
            $table->unsignedBigInteger('purchase_order_id');
            $table->string('document_name', 100);
            $table->string('document_path', 255);
            $table->timestamp('uploaded_at')->useCurrent();
            $table->timestamps();

            // Foreign Key: Linking to purchase order records
            $table->foreign('purchase_order_id')
                  ->references('order_id')->on('purchase_order')
                  ->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('procurement_document');
        Schema::dropIfExists('fleet_document');
        Schema::dropIfExists('logistics_report');
        Schema::dropIfExists('equipment_log');
        Schema::dropIfExists('delivery_receipt');
    }
};
