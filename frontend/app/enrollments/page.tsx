'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce'; // atau buat hook debounce sederhana

export default function EnrollmentPage() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // State Modal CRUD
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nim: '',
    nama_mahasiswa: '',
    kode_mk: '',
    nama_matakuliah: '',
    thn_ajaran: '',
    status: 'DRAFT',
  });

  const debouncedSearch = useDebounce(search, 300);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/enrollments?search=${encodeURIComponent(
          debouncedSearch
        )}&status=${status}&page=${page}&per_page=25`
      );
      const json = await res.json();
      setData(json.data || []);
      setLastPage(json.last_page || 1);
      setTotal(json.total || 0);
    } catch (err) {
      console.error('Gagal memuat data:', err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, status, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url =
      modalMode === 'create'
        ? 'http://127.0.0.1:8000/api/enrollments'
        : `http://127.0.0.1:8000/api/enrollments/${selectedId}`;
    const method = modalMode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        fetchData();
      }
    } catch (err) {
      console.error('Gagal menyimpan data:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await fetch(`http://127.0.0.1:8000/api/enrollments/${id}`, {
        method: 'DELETE',
      });
      fetchData();
    } catch (err) {
      console.error('Gagal menghapus data:', err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Manajemen KRS Akademik</h1>
            <p className="text-sm text-gray-400">Sistem monitoring KRS performa tinggi (Skala 5+ Juta Data).</p>
          </div>
          <button
            onClick={() => {
              setModalMode('create');
              setForm({ nim: '', nama_mahasiswa: '', kode_mk: '', nama_matakuliah: '', thn_ajaran: '', status: 'DRAFT' });
              setShowModal(true);
            }}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm font-semibold"
          >
            + Tambah KRS
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex gap-4 mb-6">
          <input
            type="text"
            placeholder="Cari Mahasiswa, NIM, atau Matakuliah..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-4 py-2 w-full text-sm focus:outline-none focus:border-green-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-sm focus:outline-none focus:border-green-500"
          >
            <option value="">SEMUA STATUS</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SUBMITTED">SUBMITTED</option>
            <option value="DRAFT">DRAFT</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-xs text-gray-400 bg-gray-950">
                <th className="p-3">ID</th>
                <th className="p-3">NIM</th>
                <th className="p-3">NAMA MAHASISWA</th>
                <th className="p-3">KODE MK</th>
                <th className="p-3">NAMA MATAKULIAH</th>
                <th className="p-3">THN AJARAN</th>
                <th className="p-3">STATUS</th>
                <th className="p-3 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">Memuat data...</td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-6 text-gray-500">Tidak ada data ditemukan.</td>
                </tr>
              ) : (
                data.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-850">
                    <td className="p-3 font-mono">{item.id}</td>
                    <td className="p-3">{item.nim}</td>
                    <td className="p-3">{item.nama_mahasiswa}</td>
                    <td className="p-3 font-mono">{item.kode_mk}</td>
                    <td className="p-3">{item.nama_matakuliah}</td>
                    <td className="p-3">{item.thn_ajaran}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        item.status === 'APPROVED' ? 'bg-green-900 text-green-300' :
                        item.status === 'REJECTED' ? 'bg-red-900 text-red-300' :
                        item.status === 'SUBMITTED' ? 'bg-yellow-900 text-yellow-300' : 'bg-gray-700 text-gray-300'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3 text-center space-x-2">
                      <button
                        onClick={() => {
                          setModalMode('edit');
                          setSelectedId(item.id);
                          setForm(item);
                          setShowModal(true);
                        }}
                        className="text-blue-400 hover:underline text-xs"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:underline text-xs"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Total Info */}
        <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
          <div>Total: {total.toLocaleString()} data</div>
          <div className="flex gap-2 items-center">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span>{page} / {lastPage}</span>
            <button
              disabled={page >= lastPage}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form CRUD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">{modalMode === 'create' ? 'Tambah Data KRS' : 'Edit Data KRS'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">NIM</label>
                <input
                  type="text"
                  value={form.nim}
                  onChange={e => setForm({ ...form, nim: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nama Mahasiswa</label>
                <input
                  type="text"
                  value={form.nama_mahasiswa}
                  onChange={e => setForm({ ...form, nama_mahasiswa: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Kode MK</label>
                <input
                  type="text"
                  value={form.kode_mk}
                  onChange={e => setForm({ ...form, kode_mk: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Nama Matakuliah</label>
                <input
                  type="text"
                  value={form.nama_matakuliah}
                  onChange={e => setForm({ ...form, nama_matakuliah: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  value={form.thn_ajaran}
                  onChange={e => setForm({ ...form, thn_ajaran: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="SUBMITTED">SUBMITTED</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-800 rounded text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-semibold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}