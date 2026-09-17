'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

export function SearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [text, setText] = useState(searchParams.get('search') ?? '');
  const debouncedText = useDebounce(text, 400);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (debouncedText) {
      params.set('search', debouncedText);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset ke halaman 1 setiap kali query berubah

    router.push(`${pathname}?${params.toString()}`);
  }, [debouncedText, pathname, router]);

  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Cari Mahasiswa, NIM, atau Matakuliah..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </div>
  );
}