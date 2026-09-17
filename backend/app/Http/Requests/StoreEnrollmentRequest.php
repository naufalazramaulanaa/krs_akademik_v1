<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
{
    return [
        'student_id' => 'required|exists:students,id',
        'course_id' => 'required|exists:courses,id',
        'academic_year' => 'required|string|max:9', 
        'semester' => ['required', Rule::in(['GANJIL', 'GENAP', 'PENDEK'])],
        // PERBARUI DI SINI: tambahkan DRAFT dan SUBMITTED
        'status' => ['required', Rule::in(['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'])],
        'student_nim' => 'required|string|max:20',
        'student_name' => 'required|string|max:255',
        'course_code' => 'required|string|max:20',
        'course_name' => 'required|string|max:255',
    ];
}
}