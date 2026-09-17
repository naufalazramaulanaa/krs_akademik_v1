<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 0. Aktifkan Ekstensi Trigram PostgreSQL (WAJIB)
        DB::statement("CREATE EXTENSION IF NOT EXISTS pg_trgm;");

        // 1. Index Keyset & Default Sorting
        DB::statement("CREATE INDEX idx_enr_id ON enrollments (id) WHERE deleted_at IS NULL;");

        // 2. Index Quick Filter Status + Semester + Academic Year
        DB::statement("CREATE INDEX idx_enr_status_sem_year ON enrollments (status, semester, academic_year, id) WHERE deleted_at IS NULL;");

        // 3. Index Multi-Column Order (Tahun, Semester, NIM)
        DB::statement("CREATE INDEX idx_enr_year_sem_nim ON enrollments (academic_year DESC, semester ASC, student_nim ASC) WHERE deleted_at IS NULL;");

        // 4. Index Pattern Match untuk Pencarian Prefix (startsWith)
        DB::statement("CREATE INDEX idx_enr_nim_pattern ON enrollments (student_nim varchar_pattern_ops);");
        DB::statement("CREATE INDEX idx_enr_code_pattern ON enrollments (course_code varchar_pattern_ops);");

        // 5. Index GIN Trigram untuk Pencarian Teks Bebas (ILIKE %keyword%)
        DB::statement("CREATE INDEX idx_enr_name_trgm ON enrollments USING GIN (student_name gin_trgm_ops);");
        DB::statement("CREATE INDEX idx_enr_nim_trgm ON enrollments USING GIN (student_nim gin_trgm_ops);");
        DB::statement("CREATE INDEX idx_enr_code_trgm ON enrollments USING GIN (course_code gin_trgm_ops);");

        // 6. Foreign Key Index
        DB::statement("CREATE INDEX idx_enr_student ON enrollments (student_id);");
        DB::statement("CREATE INDEX idx_enr_course ON enrollments (course_id);");
    }

    public function down(): void
    {
        DB::statement("DROP INDEX IF EXISTS idx_enr_id;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_status_sem_year;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_year_sem_nim;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_nim_pattern;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_code_pattern;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_name_trgm;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_nim_trgm;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_code_trgm;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_student;");
        DB::statement("DROP INDEX IF EXISTS idx_enr_course;");
    }
};
