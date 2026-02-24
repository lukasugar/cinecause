'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Search } from 'lucide-react';
import type { Charity } from './CharitySelector';

interface CharitySearchModalProps {
  onSelect: (charity: Charity) => void;
  onClose: () => void;
}

interface NonprofitResult {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
}

export function CharitySearchModal({ onSelect, onClose }: CharitySearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NonprofitResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/nonprofits/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.nonprofits || []);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const handleSelect = (nonprofit: NonprofitResult) => {
    onSelect({
      name: nonprofit.name,
      slug: nonprofit.slug,
      logoUrl: nonprofit.logoUrl,
      description: nonprofit.description,
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(2,6,15,0.78)] p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="surface-card flex max-h-[80vh] w-full max-w-lg flex-col rounded-xl">
        <div className="flex items-center justify-between border-b border-[var(--border-soft)] p-4">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">Choose a charity</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--text-strong)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-[var(--border-soft)] p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 w-5 h-5 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search charities..."
              className="input-modern w-full py-2 pl-10 pr-4"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="py-8 text-center text-[var(--text-muted)]">Searching...</div>
          ) : results.length > 0 ? (
            <ul className="space-y-1">
              {results.map((nonprofit, index) => (
                <li key={`${nonprofit.slug}-${index}`}>
                  <button
                    onClick={() => handleSelect(nonprofit)}
                    className="flex w-full items-center gap-3 rounded-lg p-3 text-left hover:bg-[var(--surface-2)]"
                  >
                    {nonprofit.logoUrl ? (
                      <img
                        src={nonprofit.logoUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-[var(--surface-2)] text-[var(--text-muted)]">
                        ?
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate font-medium text-[var(--text-strong)]">{nonprofit.name}</p>
                      {nonprofit.description && (
                        <p className="truncate text-sm text-[var(--text-muted)]">{nonprofit.description}</p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : query.length >= 2 ? (
            <div className="py-8 text-center text-[var(--text-muted)]">No charities found</div>
          ) : (
            <div className="py-8 text-center text-[var(--text-muted)]">
              Type to search for a charity
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
