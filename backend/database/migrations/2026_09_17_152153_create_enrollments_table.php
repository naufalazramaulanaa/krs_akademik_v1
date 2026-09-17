<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Buat ENUM type native PostgreSQL
        DB::statement("CREATE TYPE semester_enum AS ENUM ('GANJIL', 'GENAP')");
        DB::statement("CREATE TYPE status_enum AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED')");

        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('restrict');
            $table->foreignId('course_id')->constrained('courses')->onDelete('restrict');
            $table->string('academic_year', 9); // Format: YYYY/YYYY

            // Kolom Snapshot Denormalisasi (Sangat Penting untuk Performa 5M Data)
            $table->string('student_nim', 12);
            $table->string('student_name', 100);
            $table->string('course_code', 7);
            $table->string('course_name', 120);

            $table->softDeletesTz();
            $table->timestampsTz();
        });

        // Tambahkan kolom enum dan partial unique index
        DB::statement("ALTER TABLE enrollments ADD COLUMN semester semester_enum NOT NULL");
        DB::statement("ALTER TABLE enrollments ADD COLUMN status status_enum NOT NULL");
        DB::statement("CREATE UNIQUE INDEX unique_enrollment_per_period ON enrollments (student_id, course_id, academic_year, semester) WHERE deleted_at IS NULL");
    }

    public function down(): void
    {
        Schema::dropIfExists('enrollments');
        DB::statement("DROP TYPE IF EXISTS status_enum");
        DB::statement("DROP TYPE IF EXISTS semester_enum");
    }
};
