'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function EnrollmentModal({ isOpen, onClose, initialData }: ModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const payload = {
      nim: formData.get('nim'),
      student_name: formData.get('student_name'),
      course_code: formData.get('course_code'),
      course_name: formData.get('course_name'),
      academic_year: formData.get('academic_year'),
      semester: formData.get('semester'),
      status: formData.get('status'),
    };

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
    const url = initialData ? `${baseUrl}/enrollments/${initialData.id}` : `${baseUrl}/enrollments`;
    const method = initialData ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Gagal menyimpan data.');
      }

      startTransition(() => {
        router.refresh();
        onClose();
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-lg p-6 space-y-4 text-white">
        <h2 className="text-xl font-bold">
          {initialData ? 'Edit KRS' : 'Tambah KRS Baru'}
        </h2>

        {error && <div className="bg-red-900/50 border border-red-700 text-red-300 p-3 rounded text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400">NIM Mahasiswa</label>
            <input name="nim" defaultValue={initialData?.student_nim || ''} required className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-gray-400">Nama Mahasiswa</label>
            <input name="student_name" defaultValue={initialData?.student_name || ''} required className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Kode MK</label>
              <input name="course_code" defaultValue={initialData?.course_code || ''} required className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Nama Mata Kuliah</label>
              <input name="course_name" defaultValue={initialData?.course_name || ''} required className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400">Tahun Ajaran</label>
              <input name="academic_year" defaultValue={initialData?.academic_year || '2025/2026'} required className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-400">Semester</label>
              <select name="semester" defaultValue={initialData?.semester || 'GANJIL'} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm">
                <option value="GANJIL">GANJIL</option>
                <option value="GENAP">GENAP</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400">Status</label>
            <select name="status" defaultValue={initialData?.status || 'DRAFT'} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm">
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm">Batal</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-semibold">
              {isPending ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}