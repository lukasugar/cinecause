'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MediaItem } from '@/types/media';

interface NowTrendingCarouselProps {
  items: MediaItem[];
}

function NowTrendingTile({
  item,
  nonInteractive = false,
}: {
  item: MediaItem;
  nonInteractive?: boolean;
}) {
  return (
    <Link
      href={`/${item.mediaType}/${item.id}`}
      tabIndex={nonInteractive ? -1 : undefined}
      aria-hidden={nonInteractive ? true : undefined}
      className="group relative block overflow-hidden rounded-xl border border-[var(--border-soft)] bg-[var(--surface-2)] shadow-[0_10px_22px_rgba(8,15,30,0.36)]"
    >
      <div className="relative aspect-[2/3]">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 40vw, 160px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-[var(--text-muted)]">
            No Image
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-[rgba(4,12,26,0.82)] to-transparent" />
        {item.year && (
          <span className="absolute left-2 top-2 rounded-full border border-[var(--border-soft)] bg-[rgba(5,10,22,0.72)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-strong)]">
            {item.year}
          </span>
        )}
        {typeof item.rating === 'number' && (
          <span className="absolute right-2 top-2 rounded-full border border-[var(--border-soft)] bg-[rgba(5,10,22,0.72)] px-2 py-0.5 text-[10px] font-semibold text-[var(--text-strong)]">
            ★ {item.rating.toFixed(1)}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(4,12,26,0.94)] via-[rgba(4,12,26,0.74)] to-transparent px-2.5 pb-2 pt-8">
          <p className="line-clamp-1 text-xs font-semibold text-[var(--text-strong)]">{item.title}</p>
        </div>
      </div>
    </Link>
  );
}

export function NowTrendingCarousel({ items }: NowTrendingCarouselProps) {
  const mobileViewportRef = useRef<HTMLDivElement | null>(null);
  const lastMobileInteractionAtRef = useRef(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const mobileAutoAdvanceMs = 4000;
  const desktopMarqueeDurationSeconds = Math.max(28, items.length * 4.5);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mobileQuery = window.matchMedia('(max-width: 639px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const updatePreferences = () => {
      setIsMobileViewport(mobileQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    updatePreferences();
    mobileQuery.addEventListener('change', updatePreferences);
    reducedMotionQuery.addEventListener('change', updatePreferences);

    return () => {
      mobileQuery.removeEventListener('change', updatePreferences);
      reducedMotionQuery.removeEventListener('change', updatePreferences);
    };
  }, []);

  useEffect(() => {
    if (!isMobileViewport || prefersReducedMotion || items.length < 2) return;

    const viewportElement = mobileViewportRef.current;
    if (!viewportElement) return;

    const intervalId = window.setInterval(() => {
      if (Date.now() - lastMobileInteractionAtRef.current < mobileAutoAdvanceMs) return;

      const firstCard = viewportElement.querySelector<HTMLElement>('[data-mobile-card]');
      if (!firstCard) return;

      const cardSpacing = 12;
      const stepPx = firstCard.offsetWidth + cardSpacing;
      const maxScrollLeft = Math.max(0, viewportElement.scrollWidth - viewportElement.clientWidth);
      const nextScrollLeft = viewportElement.scrollLeft + stepPx;

      if (nextScrollLeft >= maxScrollLeft - 2) {
        viewportElement.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        viewportElement.scrollTo({ left: nextScrollLeft, behavior: 'smooth' });
      }
    }, mobileAutoAdvanceMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isMobileViewport, items.length, prefersReducedMotion]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 text-left">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
          Now trending
        </p>
      </div>

      <div
        ref={mobileViewportRef}
        className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory sm:hidden"
        onPointerDown={() => {
          lastMobileInteractionAtRef.current = Date.now();
        }}
        onTouchStart={() => {
          lastMobileInteractionAtRef.current = Date.now();
        }}
      >
        {items.map((item) => (
          <div
            key={`mobile-${item.mediaType}-${item.id}`}
            className="w-32 flex-none snap-start"
            data-mobile-card
          >
            <NowTrendingTile item={item} />
          </div>
        ))}
      </div>

      <div
        className="relative hidden sm:block"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onFocusCapture={() => setIsPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setIsPaused(false);
          }
        }}
      >
        <div className="overflow-x-hidden pb-1">
          <div
            className="flex w-max"
            style={!prefersReducedMotion
              ? {
                animation: `now-trending-marquee ${desktopMarqueeDurationSeconds}s linear infinite`,
                animationPlayState: isPaused ? 'paused' : 'running',
              }
              : undefined}
          >
            <div className="flex shrink-0">
              {items.map((item) => (
                <div key={`desktop-a-${item.mediaType}-${item.id}`} className="w-36 flex-none pr-3">
                  <NowTrendingTile item={item} />
                </div>
              ))}
            </div>
            <div className="flex shrink-0" aria-hidden="true">
              {items.map((item) => (
                <div key={`desktop-b-${item.mediaType}-${item.id}`} className="w-36 flex-none pr-3">
                  <NowTrendingTile item={item} nonInteractive />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
