'use client';

import { useRouter } from 'next/navigation';
import { SearchFilter, type MediaFilter } from './SearchFilter';

interface SearchFilterClientProps {
  currentFilter: MediaFilter;
  query: string;
}

export function SearchFilterClient({ currentFilter, query }: SearchFilterClientProps) {
  const router = useRouter();

  const handleFilterChange = (filter: MediaFilter) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    params.set('filter', filter);
    router.push(`/search?${params.toString()}`);
  };

  return <SearchFilter value={currentFilter} onChange={handleFilterChange} />;
}
