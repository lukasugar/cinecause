export const metadata = {
  title: 'Privacy Policy - CineCause',
  description: 'Privacy policy for CineCause.',
};

export default function PrivacyPage() {
  return (
    <div className="page-container max-w-4xl">
      <h1 className="text-4xl font-semibold text-[var(--text-strong)]">Privacy Policy</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">Last updated: January 2026</p>

      <div className="section-block mt-6 p-5">
        <p className="text-[var(--text-strong)]">
          In plain language: we only keep the data needed to show donation impact and run the site.
          We do not sell your data.
        </p>
      </div>

      <div className="legal-prose mt-8 text-[var(--text-muted)]">
        <section>
          <h2>What We Collect</h2>
          <ul>
            <li><strong>Donation records:</strong> donation amount, charity name, first name (if shared), and public testimony you provide via Every.org.</li>
            <li><strong>Server logs:</strong> IP addresses and request metadata used for operations and security.</li>
          </ul>
        </section>

        <section>
          <h2>Why We Collect It</h2>
          <ul>
            <li>To display public leaderboard impact from movie- and show-inspired donations.</li>
            <li>To show donation statistics on title pages.</li>
            <li>To keep the service reliable and improve the product experience.</li>
          </ul>
        </section>

        <section>
          <h2>What We Share</h2>
          <ul>
            <li><strong>Public leaderboard:</strong> movie title, donation amount, and charity name may be displayed publicly.</li>
            <li><strong>No data sales:</strong> we do not sell personal data.</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <ul>
            <li><strong>Every.org:</strong> handles donation processing. See their <a className="text-[var(--accent-2)] hover:text-[var(--text-strong)]" href="https://www.every.org/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
            <li><strong>TMDB:</strong> provides movie and TV metadata. See their <a className="text-[var(--accent-2)] hover:text-[var(--text-strong)]" href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
            <li><strong>Vercel:</strong> hosts this site. See their <a className="text-[var(--accent-2)] hover:text-[var(--text-strong)]" href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>.</li>
          </ul>
        </section>

        <section>
          <h2>Your Rights (GDPR)</h2>
          <p>If you are in the EU, you can request access, deletion, or objection to processing where applicable.</p>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>We do not run ad or tracking cookies. We only use essential cookies for core site functionality.</p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>For privacy concerns, contact the site administrator.</p>
        </section>
      </div>
    </div>
  );
}
