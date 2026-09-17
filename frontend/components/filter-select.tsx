'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function FilterSelect() {
  const searchParams = useSearchParams();
  const { replace } = useRouter();

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // Reset ke halaman pertama saat filter diubah
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    replace(`?${params.toString()}`);
  };

  return (
    <select
      defaultValue={searchParams.get('status')?.toString() || ''}
      onChange={(e) => handleFilter(e.target.value)}
      className="bg-gray-900 border border-gray-700 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-green-500"
    >
      <option value="">SEMUA STATUS</option>
      <option value="DRAFT">DRAFT</option>
      <option value="SUBMITTED">SUBMITTED</option>
      <option value="APPROVED">APPROVED</option>
      <option value="REJECTED">REJECTED</option>
    </select>
  );
}