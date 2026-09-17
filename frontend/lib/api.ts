export interface Enrollment {
  id: number;
  student_id: number;
  course_id: number;
  academic_year: string;
  semester: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  student_nim: string;
  student_name: string;
  course_code: string;
  course_name: string;
  created_at?: string;
}

export interface ApiResponse {
  status: string;
  data: Enrollment[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export async function getEnrollments(params: {
  search?: string;
  status?: string;
  academic_year?: string;
  page?: number;
  per_page?: number;
}): Promise<ApiResponse> {
  const query = new URLSearchParams();

  if (params.search) query.append('search', params.search);
  if (params.status) query.append('status', params.status);
  if (params.academic_year) query.append('academic_year', params.academic_year);
  if (params.page) query.append('page', params.page.toString());
  if (params.per_page) query.append('per_page', params.per_page.toString());

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  
  const res = await fetch(`${baseUrl}/enrollments?${query.toString()}`, {
    cache: 'no-store', // Selalu revalidate data terbaru
  });

  if (!res.ok) {
    throw new Error('Gagal mengambil data dari server');
  }

  return res.json();
}