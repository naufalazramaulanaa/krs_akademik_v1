<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEnrollmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'academic_year' => 'sometimes|string|max:9',
            'semester' => ['sometimes', Rule::in(['GANJIL', 'GENAP', 'PENDEK'])],
            'status' => ['sometimes', Rule::in(['APPROVED', 'PENDING', 'REJECTED'])],
            'student_name' => 'sometimes|string|max:255',
            'course_name' => 'sometimes|string|max:255',
        ];
    }
}