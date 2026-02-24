import Link from 'next/link';
import { signOut } from '@/app/auth/actions';
import { createClient } from '@/lib/supabase/server';
import { MobileMenu } from '@/components/MobileMenu';

export async function Header() {
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
    <header className="sticky top-0 z-40 border-b border-[var(--border-soft)]/70 bg-[#081127]/85 backdrop-blur-xl">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-xl font-semibold text-[var(--text-strong)]">
          CineCause
        </Link>
        <div className="hidden items-center gap-2 md:flex">
          <Link href="/how-it-works" className="chip px-3 py-1.5 text-sm hover:text-[var(--text-strong)]">
            How It Works
          </Link>
          <Link href="/leaderboard" className="chip px-3 py-1.5 text-sm hover:text-[var(--text-strong)]">
            Leaderboard
          </Link>
          {isSignedIn ? (
            <>
              <Link href="/profile" className="chip px-3 py-1.5 text-sm hover:text-[var(--text-strong)]">
                Profile
              </Link>
              <form action={signOut}>
                <button type="submit" className="btn-secondary px-3 py-1.5 text-sm">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/auth/sign-in" className="btn-primary px-3 py-1.5 text-sm">
              Sign in
            </Link>
          )}
        </div>

        <MobileMenu isSignedIn={isSignedIn} signOutAction={signOut} />
      </nav>
    </header>
  );
}
