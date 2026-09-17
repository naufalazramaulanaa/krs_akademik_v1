import { Enrollment } from '@/lib/api';

export function DataTable({ data }: { data: Enrollment[] }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg bg-gray-50 text-gray-500">
        Data KRS tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full text-left text-sm text-gray-700">
        <thead className="bg-gray-100 text-xs uppercase text-gray-600 border-b">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">NIM</th>
            <th className="px-4 py-3">Nama Mahasiswa</th>
            <th className="px-4 py-3">Kode MK</th>
            <th className="px-4 py-3">Nama Matakuliah</th>
            <th className="px-4 py-3">Thn Ajaran</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.id}</td>
              <td className="px-4 py-3 font-medium">{item.student_nim}</td>
              <td className="px-4 py-3">{item.student_name}</td>
              <td className="px-4 py-3 font-mono text-xs">{item.course_code}</td>
              <td className="px-4 py-3">{item.course_name}</td>
              <td className="px-4 py-3 text-xs">{item.academic_year}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    item.status === 'APPROVED'
                      ? 'bg-green-100 text-green-700'
                      : item.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}