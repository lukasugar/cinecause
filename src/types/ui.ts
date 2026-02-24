export type UiVariant = 'editorial' | 'cinematic' | 'minimal';

export type CardDensity = 'standard' | 'compact';

export const cardDensityClassMap: Record<CardDensity, string> = {
  standard: 'mt-2 flex items-center gap-2 text-sm text-[var(--text-muted)]',
  compact: 'mt-1 flex items-center text-xs text-[var(--text-muted)]',
};
