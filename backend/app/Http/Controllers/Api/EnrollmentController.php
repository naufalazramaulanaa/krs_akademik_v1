<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Models\Enrollment;
use App\Services\Enrollment\FilterCompiler;
use App\Services\Enrollment\SortCompiler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EnrollmentController extends Controller
{
    /**
     * GET /api/enrollments
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->query('per_page', 25), 100);
        $search = $request->query('search');

        if (!empty($search)) {
            $scout = Enrollment::search($search);
            $scout = FilterCompiler::applyScoutFilters($scout, $request);
            $scout = SortCompiler::applyScoutSort($scout, $request);

            $results = $scout->paginate($perPage);
        } else {
            $query = Enrollment::query();
            $query = FilterCompiler::applyDatabaseFilters($query, $request);
            $query = SortCompiler::applyDatabaseSort($query, $request);

            $results = $query->paginate($perPage);
        }

        return response()->json([
            'status' => 'success',
            'data' => $results->items(),
            'meta' => [
                'current_page' => $results->currentPage(),
                'per_page' => $results->perPage(),
                'total' => $results->total(),
                'last_page' => $results->lastPage(),
            ],
        ]);
    }

    /**
     * POST /api/enrollments
     */
    public function store(Request $request)
    {
        // 1. Cari data mahasiswa berdasarkan NIM yang diinput dari form
        $student = \App\Models\Student::where('nim', $request->student_nim)->first();

        // 2. Cari data mata kuliah berdasarkan Kode Mata Kuliah yang diinput dari form
        $course = \App\Models\Course::where('code', $request->course_code)->first();

        // Validasi jika mahasiswa atau mata kuliah tidak ditemukan
        if (!$student || !$course) {
            return back()->withErrors('Mahasiswa atau Mata Kuliah tidak ditemukan!');
        }

        // 3. Simpan ke tabel enrollments menggunakan ID yang valid dan dinamis
        \App\Models\Enrollment::create([
            'student_id'    => $student->id,     // Mengambil ID asli dari database
            'course_id'     => $course->id,      // Mengambil ID asli dari database
            'academic_year' => $request->academic_year,
            'semester'      => $request->semester,
            'status'        => $request->status,
            'student_nim'   => $request->student_nim,
            'student_name'  => $student->name,   // Otomatis pakai nama asli dari relasi
            'course_code'   => $request->course_code,
            'course_name'   => $course->name,    // Otomatis pakai nama matkul asli dari relasi
        ]);

        return redirect()->back()->with('success', 'Data KRS berhasil ditambahkan!');
    }

    /**
     * GET /api/enrollments/{id}
     */
    public function show(int $id): JsonResponse
    {
        $enrollment = Enrollment::findOrFail($id);

        return response()->json([
            'status' => 'success',
            'data' => $enrollment,
        ]);
    }

    /**
     * PUT/PATCH /api/enrollments/{id}
     */
    public function update(UpdateEnrollmentRequest $request, int $id): JsonResponse
    {
        $enrollment = Enrollment::findOrFail($id);

        DB::transaction(function () use ($enrollment, $request) {
            $enrollment->update($request->validated());
            // Scout otomatis memperbarui data di index Meilisearch
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Enrollment berhasil diperbarui.',
            'data' => $enrollment->fresh(),
        ]);
    }

    /**
     * DELETE /api/enrollments/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $enrollment = Enrollment::findOrFail($id);

        DB::transaction(function () use ($enrollment) {
            $enrollment->delete(); // Soft Delete
            // Scout otomatis menghapus dokumen terkait dari Meilisearch
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Enrollment berhasil dihapus.',
        ]);
    }
}
