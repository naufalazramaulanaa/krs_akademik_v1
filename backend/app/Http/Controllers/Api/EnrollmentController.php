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
    public function store(StoreEnrollmentRequest $request): JsonResponse
    {
        $enrollment = DB::transaction(function () use ($request) {
            // Membuka transaksi database agar tersimpan di PostgreSQL
            // Laravel Scout akan otomatis mengindeks record baru ini ke Meilisearch
            return Enrollment::create($request->validated());
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Enrollment berhasil dibuat.',
            'data' => $enrollment,
        ], 201);
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