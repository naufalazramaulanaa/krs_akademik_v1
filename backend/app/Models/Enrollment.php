<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Scout\Searchable; // <-- DITAMBAHKAN

class Enrollment extends Model
{
    use HasFactory, SoftDeletes, Searchable; // <-- DITAMBAHKAN

    protected $fillable = [
        'student_id',
        'course_id',
        'academic_year',
        'semester',
        'status',
        'student_nim',
        'student_name',
        'course_code',
        'course_name',
    ];

    // <-- DITAMBAHKAN: Membatasi kolom yang dikirim ke Meilisearch agar efisien
    public function toSearchableArray(): array
    {
        return [
            'id' => (int) $this->id,
            'student_nim' => $this->student_nim,
            'student_name' => $this->student_name,
            'course_code' => $this->course_code,
            'course_name' => $this->course_name,
            'academic_year' => $this->academic_year,
            'semester' => $this->semester,
            'status' => $this->status,
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class);
    }
}