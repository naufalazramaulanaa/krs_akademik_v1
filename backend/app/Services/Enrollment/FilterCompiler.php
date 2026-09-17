<?php

namespace App\Services\Enrollment;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Laravel\Scout\Builder as ScoutBuilder;

class FilterCompiler
{
    /**
     * Terapkan filter ke Query Builder PostgreSQL
     */
    public static function applyDatabaseFilters(Builder $query, Request $request): Builder
    {
        if ($request->filled('academic_year')) {
            $query->where('academic_year', $request->query('academic_year'));
        }

        if ($request->filled('semester')) {
            $query->where('semester', $request->query('semester'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->query('status'));
        }

        if ($request->filled('student_nim')) {
            $query->where('student_nim', $request->query('student_nim'));
        }

        if ($request->filled('course_code')) {
            $query->where('course_code', $request->query('course_code'));
        }

        return $query;
    }

    /**
     * Terapkan filter ke Scout / Meilisearch Builder
     */
    public static function applyScoutFilters(ScoutBuilder $scout, Request $request): ScoutBuilder
    {
        $filters = [];

        if ($request->filled('academic_year')) {
            $filters[] = "academic_year = '{$request->query('academic_year')}'";
        }

        if ($request->filled('semester')) {
            $filters[] = "semester = '{$request->query('semester')}'";
        }

        if ($request->filled('status')) {
            $filters[] = "status = '{$request->query('status')}'";
        }

        if ($request->filled('student_nim')) {
            $filters[] = "student_nim = '{$request->query('student_nim')}'";
        }

        if ($request->filled('course_code')) {
            $filters[] = "course_code = '{$request->query('course_code')}'";
        }

        if (!empty($filters)) {
            $scout->whereRaw(implode(' AND ', $filters));
        }

        return $scout;
    }
}