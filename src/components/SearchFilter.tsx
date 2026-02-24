export type MediaFilter = 'all' | 'movie' | 'tv';

interface SearchFilterProps {
  value: MediaFilter;
  onChange: (filter: MediaFilter) => void;
}

const filters: { value: MediaFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'tv', label: 'TV Shows' },
];

export function SearchFilter({ value, onChange }: SearchFilterProps) {
  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={`chip px-4 py-2 text-sm font-medium ${
            value === filter.value
              ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--text-strong)]'
              : 'hover:border-[var(--accent-2)] hover:text-[var(--text-strong)]'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
