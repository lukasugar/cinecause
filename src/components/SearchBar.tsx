'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Search } from 'lucide-react';
import type { MediaItem } from '@/types/media';

type MediaType = 'all' | 'movie' | 'tv';
type SearchBarMode = 'hero' | 'page';

interface SearchBarProps {
  mode?: SearchBarMode;
}

export function SearchBar({ mode = 'hero' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&type=${mediaType}`);
        const data = await response.json();
        setResults(data.results);
        setIsOpen(true);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, mediaType]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  function handleResultClick(item: MediaItem) {
    setIsOpen(false);
    setQuery('');
    router.push(`/${item.mediaType}/${item.id}`);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && query.length >= 2) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query)}&filter=${mediaType}`);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${mode === 'hero' ? 'mx-auto max-w-xl' : ''}`}
    >
      <div className={`mb-3 flex gap-2 ${mode === 'hero' ? 'justify-center' : ''}`}>
        {(['all', 'movie', 'tv'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setMediaType(type)}
            className={`chip px-4 py-1.5 text-sm font-medium ${
              mediaType === type
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--text-strong)]'
                : 'hover:border-[var(--accent-2)] hover:text-[var(--text-strong)]'
            }`}
          >
            {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Search ${mediaType === 'all' ? 'movies and TV shows' : mediaType === 'movie' ? 'movies' : 'TV shows'}...`}
          className="input-modern w-full rounded-full py-3 pl-12 pr-4"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="surface-card absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden">
          {results.map((item) => (
            <button
              key={`${item.mediaType}-${item.id}`}
              onClick={() => handleResultClick(item)}
              className="flex w-full items-center gap-3 p-3 text-left text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
            >
              <div className="h-15 w-10 flex-shrink-0 overflow-hidden rounded bg-[var(--surface-1)]">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    width={40}
                    height={60}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-[var(--text-muted)]">
                    N/A
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-[var(--text-strong)]">{item.title}</p>
                <p className="text-sm text-[var(--text-muted)]">
                  {item.year && <span>{item.year}</span>}
                  {item.year && ' • '}
                  <span className="capitalize">{item.mediaType === 'tv' ? 'TV Show' : 'Movie'}</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="surface-card absolute left-0 right-0 top-full z-50 mt-2 p-4 text-center text-[var(--text-muted)]">
          No matches for &quot;{query}&quot;. Try a broader search.
        </div>
      )}
    </div>
  );
}
