import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export const metadata = {
  title: 'Thank You! - CineCause',
  description: 'Thank you for your donation.',
};

export default async function DonationSuccessPage() {
  let isSignedIn = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isSignedIn = Boolean(user);
  } catch {
    isSignedIn = false;
  }

  return (
    <div className="page-container">
      <div className="section-block mx-auto max-w-2xl px-6 py-20 text-center fade-up">
        <div className="mb-6 text-6xl" aria-hidden>
          🎉
        </div>
        <h1 className="mb-4 text-4xl font-semibold text-[var(--text-strong)]">
          Thank you for creating real-world impact!
        </h1>
        <p className="mb-2 text-lg text-[var(--text-muted)]">
          Your donation was securely processed by Every.org and added to this title&apos;s impact on
          CineCause.
        </p>
        <p className="mb-8 text-base text-[var(--text-muted)]">
          You turned what you watched into support for a cause doing meaningful work.
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          {isSignedIn && (
            <Link
              href="/profile"
              className="btn-primary inline-flex items-center justify-center px-6 py-3"
            >
              See Your Impact
            </Link>
          )}
          <Link
            href="/"
            className={`${isSignedIn ? 'btn-secondary' : 'btn-primary'} inline-flex items-center justify-center px-6 py-3`}
          >
            Explore More Movies
          </Link>
          <Link
            href="/leaderboard"
            className="btn-secondary inline-flex items-center justify-center px-6 py-3"
          >
            View Leaderboard
          </Link>
        </div>
      </div>
    </div>
  );
}
