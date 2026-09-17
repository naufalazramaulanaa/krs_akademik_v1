<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SeedMassiveCommand extends Command
{
    protected $signature = 'seed:massive 
                            {--students=200000 : Jumlah mahasiswa} 
                            {--courses=2000 : Jumlah mata kuliah} 
                            {--enrollments=5000000 : Jumlah total KRS} 
                            {--batch=10000 : Jumlah mahasiswa per batch}';

    protected $description = 'Seed 5 juta data enrollments menggunakan SQL generate_series secara efisien';

    public function handle(): void
    {
        $studentsCount = (int) $this->option('students');
        $coursesCount = (int) $this->option('courses');
        $enrollmentsCount = (int) $this->option('enrollments');
        $batchSize = (int) $this->option('batch');

        // Setiap mahasiswa akan mendapatkan ~25 enrollment
        $enrollmentsPerStudent = (int) ceil($enrollmentsCount / $studentsCount);

        $this->info("=== MEMULAI MASSIVE SEEDING ===");
        $startTime = microtime(true);

        // 1. Seed Courses (2.000 baris)
        $this->info("1. Generating {$coursesCount} Courses...");
        DB::statement("
            INSERT INTO courses (code, name, credits, created_at, updated_at)
            SELECT 
                'MK' || LPAD(i::text, 4, '0') AS code,
                'Mata Kuliah ' || i AS name,
                (i % 4) + 1 AS credits,
                NOW(), NOW()
            FROM generate_series(1, {$coursesCount}) i
            ON CONFLICT (code) DO NOTHING;
        ");

        // 2. Seed Students (200.000 baris)
        $this->info("2. Generating {$studentsCount} Students...");
        DB::statement("
            INSERT INTO students (nim, name, email, created_at, updated_at)
            SELECT 
                (2200000000 + i)::text AS nim,
                'Mahasiswa ' || i AS name,
                'student' || i || '@akademik.ac.id' AS email,
                NOW(), NOW()
            FROM generate_series(1, {$studentsCount}) i
            ON CONFLICT (nim) DO NOTHING;
        ");

        // 3. Batch Seeding Enrollments (5.000.000 baris)
        $this->info("3. Generating {$enrollmentsCount} Enrollments in Batches...");
        $totalBatches = (int) ceil($studentsCount / $batchSize);
        $bar = $this->output->createProgressBar($totalBatches);
        $bar->start();

        for ($start = 1; $start <= $studentsCount; $start += $batchSize) {
            $end = min($start + $batchSize - 1, $studentsCount);

            // Formula deterministik pada JOIN course_id menjamin tidak terjadi duplikasi unik (student, course, year, semester)
            DB::statement("
                INSERT INTO enrollments (
                    student_id, course_id, academic_year, semester, status,
                    student_nim, student_name, course_code, course_name,
                    created_at, updated_at
                )
                SELECT 
                    s.id AS student_id,
                    c.id AS course_id,
                    (2023 + (k % 3))::text || '/' || (2024 + (k % 3))::text AS academic_year,
                    (CASE WHEN k % 2 = 0 THEN 'GANJIL' ELSE 'GENAP' END)::semester_enum AS semester,
                    (ARRAY['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'])[((s.id + k) % 4) + 1]::status_enum AS status,
                    s.nim AS student_nim,
                    s.name AS student_name,
                    c.code AS course_code,
                    c.name AS course_name,
                    NOW(), NOW()
                FROM generate_series({$start}, {$end}) s_id
                JOIN students s ON s.id = s_id
                CROSS JOIN generate_series(0, {$enrollmentsPerStudent} - 1) k
                JOIN courses c ON c.id = (((s.id * 7 + k * 13) % {$coursesCount}) + 1)
                ON CONFLICT DO NOTHING;
            ");

            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);

        // 4. Jalankan ANALYZE agar query planner PostgreSQL mengenali statistik data baru
        $this->info("4. Running ANALYZE on enrollments table...");
        DB::statement("ANALYZE enrollments;");

        $duration = round(microtime(true) - $startTime, 2);
        $totalRows = DB::table('enrollments')->count();

        $this->info(" SUCCESS! Inserted {$totalRows} enrollments in {$duration} seconds.");
    }
}