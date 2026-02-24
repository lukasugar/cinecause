import Link from 'next/link';

export default function CheckEmailPage() {
  return (
    <div className="page-container">
      <div className="section-block mx-auto max-w-md p-6 fade-up">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Check your email</h1>
        <p className="mt-2 text-[var(--text-muted)]">We sent a verification link to your email address.</p>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          Confirm your email to activate your profile and donation history.
        </p>

        <div className="mt-6 flex gap-3">
          <Link href="/" className="btn-primary px-4 py-2">
            Explore movies and shows
          </Link>
          <Link
            href="/auth/sign-in"
            className="btn-secondary px-4 py-2"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
