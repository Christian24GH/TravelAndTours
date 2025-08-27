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
            Schema::create('employees', function (Blueprint $table) {
                $table->id();
                $table->string('employee_code')->unique();
                $table->string('first_name');
                $table->string('last_name');
                $table->string('email')->unique();
                $table->string('phone')->nullable();
                $table->date('date_of_birth');
                $table->date('hire_date'); // Data comes from HR1 (new hire)
                $table->foreignId('job_id')->constrained('jobs')->onDelete('cascade');
                $table->decimal('salary', 12, 2);
                $table->enum('employment_type', ['Trainee', 'Contract', 'Regular']);
                $table->enum('status', ['active', 'inactive', 'terminated']);
                $table->text('address')->nullable();
                $table->string('emergency_contact')->nullable();
                $table->string('emergency_phone')->nullable();
                $table->timestamps();
            });
        }

        /**
         * Reverse the migrations.
         */
        public function down(): void
        {
            Schema::dropIfExists('employees');
        }
    };
