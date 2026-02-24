'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaCard } from './MediaCard';
import type { MediaItem } from '@/types/media';

interface MediaCarouselProps {
  items: MediaItem[];
  title: string;
  emptyMessage?: string;
  showBadges?: boolean;
  autoplayIntervalMs?: number;
  autoplayDirection?: 'forward' | 'backward';
}

export function MediaCarousel({
  items,
  title,
  emptyMessage = 'No results found.',
  showBadges = false,
  autoplayIntervalMs = 7000,
  autoplayDirection = 'forward',
}: MediaCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTouchInteracting, setIsTouchInteracting] = useState(false);
  const [isDesktopViewport, setIsDesktopViewport] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const scrollPrev = useCallback(() => {
    if (!emblaApi) return;

    if (!isDesktopViewport) {
      emblaApi.scrollPrev();
      return;
    }

    const stepSize = Math.max(1, emblaApi.slidesInView().length);
    const targetSnap = Math.max(0, emblaApi.selectedScrollSnap() - stepSize);
    emblaApi.scrollTo(targetSnap);
  }, [emblaApi, isDesktopViewport]);

  const scrollNext = useCallback(() => {
    if (!emblaApi) return;

    if (!isDesktopViewport) {
      emblaApi.scrollNext();
      return;
    }

    const stepSize = Math.max(1, emblaApi.slidesInView().length);
    const maxSnap = Math.max(0, emblaApi.scrollSnapList().length - 1);
    const targetSnap = Math.min(maxSnap, emblaApi.selectedScrollSnap() + stepSize);
    emblaApi.scrollTo(targetSnap);
  }, [emblaApi, isDesktopViewport]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    // Defer initial state read to avoid setState directly in effect body.
    queueMicrotask(onSelect);
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const desktopQuery = window.matchMedia('(min-width: 640px)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onPreferenceChange = () => {
      setIsDesktopViewport(desktopQuery.matches);
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    onPreferenceChange();
    desktopQuery.addEventListener('change', onPreferenceChange);
    reducedMotionQuery.addEventListener('change', onPreferenceChange);
    return () => {
      desktopQuery.removeEventListener('change', onPreferenceChange);
      reducedMotionQuery.removeEventListener('change', onPreferenceChange);
    };
  }, []);

  useEffect(() => {
    if (!emblaApi || isPaused || isTouchInteracting || prefersReducedMotion || items.length < 2) return;

    const intervalId = window.setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;

      if (autoplayDirection === 'forward') {
        if (emblaApi.canScrollNext()) {
          emblaApi.scrollNext();
        } else {
          emblaApi.scrollTo(0);
        }
      } else {
        if (emblaApi.canScrollPrev()) {
          emblaApi.scrollPrev();
        } else {
          const snapCount = emblaApi.scrollSnapList().length;
          emblaApi.scrollTo(Math.max(0, snapCount - 1));
        }
      }
    }, autoplayIntervalMs);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [autoplayDirection, autoplayIntervalMs, emblaApi, isPaused, isTouchInteracting, items.length, prefersReducedMotion]);

  if (items.length === 0) {
    return (
      <section className="mb-12 fade-up">
        <h2 className="mb-5 text-2xl font-semibold text-[var(--text-strong)]">{title}</h2>
        <div className="section-block py-12 text-center text-[var(--text-muted)]">{emptyMessage}</div>
      </section>
    );
  }

  return (
    <section
      className="group/carousel mb-12 fade-up"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      onTouchStart={() => setIsTouchInteracting(true)}
      onTouchEnd={() => setIsTouchInteracting(false)}
      onTouchCancel={() => setIsTouchInteracting(false)}
    >
      <h2 className="mb-5 text-2xl font-semibold text-[var(--text-strong)]">{title}</h2>
      <div className="relative">
        {/* Previous Button */}
        <button
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label="Previous"
          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(4,12,26,0.82)] p-2 text-[var(--text-strong)] opacity-0 transition-opacity disabled:opacity-0 group-hover/carousel:opacity-100 sm:flex"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Carousel */}
        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex gap-4">
            {items.map((item) => (
              <div
                key={`${item.mediaType}-${item.id}`}
                className="flex-none w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-12px)] lg:w-[calc(20%-13px)]"
              >
                <MediaCard item={item} showBadge={showBadges} density="compact" />
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label="Next"
          className="absolute right-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-full border border-[var(--border-soft)] bg-[rgba(4,12,26,0.82)] p-2 text-[var(--text-strong)] opacity-0 transition-opacity disabled:opacity-0 group-hover/carousel:opacity-100 sm:flex"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </section>
  );
}
