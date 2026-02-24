'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { useState } from 'react';

type MobileMenuProps = {
  isSignedIn: boolean;
  signOutAction: () => Promise<void>;
};

export function MobileMenu({ isSignedIn, signOutAction }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <details
      className="relative md:hidden"
      open={isOpen}
      onToggle={(event) => {
        setIsOpen(event.currentTarget.open);
      }}
    >
      <summary className="btn-secondary flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm marker:content-['']">
        <Menu className="h-4 w-4" />
        Menu
      </summary>
      <div className="surface-card absolute right-0 mt-2 w-56 p-2">
        <div className="flex flex-col gap-1">
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="rounded-md px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)]"
          >
            About
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setIsOpen(false)}
            className="rounded-md px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)]"
          >
            How It Works
          </Link>
          <Link
            href="/leaderboard"
            onClick={() => setIsOpen(false)}
            className="rounded-md px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)]"
          >
            Leaderboard
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="rounded-md px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-strong)]"
              >
                Profile
              </Link>
              <form action={signOutAction} className="px-1 pt-1">
                <button
                  type="submit"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary w-full px-3 py-2 text-sm"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/auth/sign-in"
              onClick={() => setIsOpen(false)}
              className="btn-primary mx-1 mt-1 px-3 py-2 text-center text-sm"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </details>
  );
}
