'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Enrollment } from '@/lib/api';

interface EnrollmentTableClientProps {
  data: Enrollment[];
}

export function EnrollmentTableClient({ data }: EnrollmentTableClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedItem, setSelectedItem] = useState<Enrollment | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data KRS ini?")) return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    
    try {
      const res = await fetch(`${baseUrl}/enrollments/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus data dari server.");

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan saat menghapus");
    }
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setSelectedItem(null);
    setError(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (item: Enrollment) => {
    setModalMode('edit');
    setSelectedItem(item);
    setError(null);
    setIsOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    const payload = {
      student_id: Number(formData.get('student_id')) || 1,
      course_id: Number(formData.get('course_id')) || 1,
      academic_year: formData.get('academic_year'),
      semester: formData.get('semester'),
      status: formData.get('status'), // Sesuai ENUM DB: DRAFT, SUBMITTED, APPROVED, REJECTED
      student_nim: formData.get('nim'),
      student_name: formData.get('student_name'),
      course_code: formData.get('course_code'),
      course_name: formData.get('course_name'),
    };

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
    const url = modalMode === 'edit' && selectedItem ? `${baseUrl}/enrollments/${selectedItem.id}` : `${baseUrl}/enrollments`;
    const method = modalMode === 'edit' ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        let errorMsg = resData.message || 'Gagal menyimpan data ke server.';
        if (resData.errors) {
          const details = Object.entries(resData.errors)
            .map(([field, msgs]: [string, any]) => `- ${field}: ${msgs.join(', ')}`)
            .join('\n');
          errorMsg = `${resData.message}\n${details}`;
        }
        throw new Error(errorMsg);
      }

      startTransition(() => {
        router.refresh();
        setIsOpen(false);
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Daftar Rencana Studi (KRS)</h2>
        <button
          type="button"
          onClick={handleOpenCreate}
          className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition shadow-sm cursor-pointer"
        >
          + Tambah KRS Baru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-blue-50 text-blue-900 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">NIM</th>
                <th className="p-4 font-semibold">Nama Mahasiswa</th>
                <th className="p-4 font-semibold">Kode MK</th>
                <th className="p-4 font-semibold">Nama Mata Kuliah</th>
                <th className="p-4 font-semibold">Semester</th>
                <th className="p-4 font-semibold">Tahun Ajaran</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.length > 0 ? (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-blue-50/40 transition">
                    <td className="p-4 font-mono font-medium text-gray-700">{item.student_nim}</td>
                    <td className="p-4 font-medium text-gray-900">{item.student_name}</td>
                    <td className="p-4 font-mono text-gray-700">{item.course_code}</td>
                    <td className="p-4 text-gray-700">{item.course_name}</td>
                    <td className="p-4 text-gray-600">{item.semester}</td>
                    <td className="p-4 text-gray-600">{item.academic_year}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          item.status === "APPROVED"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : item.status === "REJECTED"
                            ? "bg-red-100 text-red-700 border border-red-200"
                            : "bg-amber-100 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center gap-2 justify-center">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md text-xs font-medium transition cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md text-xs font-medium transition cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400">
                    Tidak ada data KRS yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-200 w-full max-w-lg p-6 space-y-4 text-gray-900">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="text-lg font-bold text-blue-900">
                {modalMode === 'edit' ? 'Edit Data KRS' : 'Tambah Data KRS Baru'}
              </h3>
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm whitespace-pre-line overflow-x-auto">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Student ID (DB PK)</label>
                  <input 
                    type="number"
                    name="student_id" 
                    defaultValue="1" 
                    required 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Course ID (DB PK)</label>
                  <input 
                    type="number"
                    name="course_id" 
                    defaultValue="1" 
                    required 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600">NIM Mahasiswa</label>
                <input 
                  name="nim" 
                  defaultValue={selectedItem?.student_nim || ''} 
                  required 
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none" 
                  placeholder="Contoh: 2255301137"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Nama Mahasiswa</label>
                <input 
                  name="student_name" 
                  defaultValue={selectedItem?.student_name || ''} 
                  required 
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none" 
                  placeholder="Nama Lengkap"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Kode Mata Kuliah</label>
                  <input 
                    name="course_code" 
                    defaultValue={selectedItem?.course_code || ''} 
                    required 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none" 
                    placeholder="rt567"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Nama Mata Kuliah</label>
                  <input 
                    name="course_name" 
                    defaultValue={selectedItem?.course_name || ''} 
                    required 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none" 
                    placeholder="AI"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Tahun Ajaran</label>
                  <input 
                    name="academic_year" 
                    defaultValue={selectedItem?.academic_year || '2025/2026'} 
                    required 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Semester</label>
                  <select 
                    name="semester" 
                    defaultValue={selectedItem?.semester || 'GENAP'} 
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="GANJIL">GANJIL</option>
                    <option value="GENAP">GENAP</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Status</label>
                <select 
                  name="status" 
                  defaultValue={selectedItem?.status || 'SUBMITTED'} 
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:bg-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition cursor-pointer"
                >
                  Batal
                </button>
                <button 
                  type="submit" 
                  disabled={isPending} 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm cursor-pointer"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}