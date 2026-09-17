<?php

namespace App\Services\Enrollment;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Laravel\Scout\Builder as ScoutBuilder;

class SortCompiler
{
    private static array $allowedSorts = [
        'id',
        'academic_year',
        'student_nim',
        'course_code',
        'created_at',
    ];

    /**
     * Terapkan sorting ke Query Builder PostgreSQL
     */
    public static function applyDatabaseSort(Builder $query, Request $request): Builder
    {
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = strtolower($request->query('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        if (in_array($sortBy, self::$allowedSorts, true)) {
            $query->orderBy($sortBy, $sortOrder);
        } else {
            $query->orderBy('id', 'desc');
        }

        return $query;
    }

    /**
     * Terapkan sorting ke Scout / Meilisearch Builder
     */
    public static function applyScoutSort(ScoutBuilder $scout, Request $request): ScoutBuilder
    {
        $sortBy = $request->query('sort_by', 'id');
        $sortOrder = strtolower($request->query('sort_order', 'desc')) === 'asc' ? 'asc' : 'desc';

        if (in_array($sortBy, self::$allowedSorts, true)) {
            $scout->orderBy($sortBy, $sortOrder);
        }

        return $scout;
    }
}