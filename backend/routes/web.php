<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/api/health', function () {
    try {
        $dbVersion = DB::selectOne("SELECT version()")->version ?? 'Unknown';
        $enrollmentsCount = DB::table('enrollments')->count();

        return response()->json([
            'status' => 'ok',
            'postgres_version' => $dbVersion,
            'enrollments_count' => $enrollmentsCount,
        ]);
    } catch (\Throwable $e) {
        return response()->json([
            'status' => 'error',
            'message' => $e->getMessage(),
        ], 500);
    }
});