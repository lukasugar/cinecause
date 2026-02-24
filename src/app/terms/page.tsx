export const metadata = {
  title: 'Terms of Service - CineCause',
  description: 'Terms of service for CineCause.',
};

export default function TermsPage() {
  return (
    <div className="page-container max-w-4xl">
      <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Terms of Service</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">Last updated: January 2026</p>

      <div className="section-block mt-6 p-5">
        <p className="text-[var(--text-strong)]">
          In plain language: CineCause helps you connect film inspiration to charitable donations, but payment
          processing is fully handled by Every.org.
        </p>
      </div>

      <div className="legal-prose mt-8 text-[var(--text-muted)]">
        <section>
          <h2>Overview</h2>
          <p>
            CineCause is a non-commercial project connecting movies and TV shows to charitable donations.
            We do not process payments or store payment details.
          </p>
        </section>

        <section>
          <h2>Donations</h2>
          <ul>
            <li>All donations are processed by Every.org, a registered 501(c)(3) nonprofit.</li>
            <li>We are not responsible for donation processing, fees, or refunds.</li>
            <li>For payment issues, contact Every.org directly.</li>
          </ul>
        </section>

        <section>
          <h2>Payment Disclaimer</h2>
          <p>
            This website does not process or store payment information. Clicking Donate redirects you to Every.org&apos;s secure checkout.
            By donating, you agree to Every.org&apos;s{' '}
            <a className="text-[var(--accent-2)] hover:text-[var(--text-strong)]" href="https://www.every.org/terms" target="_blank" rel="noopener noreferrer">
              Terms of Service
            </a>{' '}
            and{' '}
            <a className="text-[var(--accent-2)] hover:text-[var(--text-strong)]" href="https://www.every.org/privacy" target="_blank" rel="noopener noreferrer">
              Privacy Policy
            </a>.
          </p>
        </section>

        <section>
          <h2>User Content</h2>
          <p>
            Public testimonies submitted through Every.org may appear on our leaderboard. By sharing one publicly,
            you consent to publication on this site.
          </p>
        </section>

        <section>
          <h2>Leaderboard and Metrics Disclaimer</h2>
          <p>
            Leaderboards, donation totals, counts, rankings, and other numbers shown on CineCause are provided for
            informational purposes only and may be delayed, incomplete, or inaccurate. We do not guarantee the
            correctness, completeness, or currentness of any leaderboard or impact metric displayed on the site.
          </p>
        </section>

        <section>
          <h2>Limitation of Liability</h2>
          <p>This website is provided as-is. We are not liable for donation tracking errors, Every.org payment issues, or TMDB data inaccuracies.</p>
        </section>

        <section>
          <h2>Movie Data</h2>
          <p>Movie and TV data is provided by TMDB. We are not affiliated with TMDB or any studio.</p>
        </section>

        <section>
          <h2>Changes</h2>
          <p>We may update these terms at any time. Continued site use means you accept updated terms.</p>
        </section>
      </div>
    </div>
  );
}
