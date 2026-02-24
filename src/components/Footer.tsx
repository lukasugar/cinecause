import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-soft)] bg-[#111d34]/90">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex flex-col items-center gap-3 text-sm text-[var(--text-muted)]">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-2)]">CineCause</p>
          <div className="flex gap-5">
            <Link href="/about" className="hover:text-[var(--text-strong)]">
              About
            </Link>
            <Link href="/privacy" className="hover:text-[var(--text-strong)]">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[var(--text-strong)]">
              Terms of Service
            </Link>
          </div>
          <p className="text-center">Powered by TMDB. Donations are securely processed by Every.org.</p>
        </div>
      </div>
    </footer>
  );
}
