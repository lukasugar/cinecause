import { Film, Heart, Sparkles, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'How It Works - CineCause',
  description: 'Learn how CineCause connects movies and charitable giving.',
};

export default function HowItWorksPage() {
  return (
    <div className="page-container max-w-5xl">
      <div className="mb-12 text-center fade-up">
        <h1 className="text-4xl font-semibold text-[var(--text-strong)] md:text-5xl">From credits to contribution.</h1>
        <p className="mt-3 text-xl text-[var(--text-muted)]">
          A simple flow that turns emotion into action.
        </p>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="section-block fade-up flex items-start gap-6 p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
            <Film className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-strong)]">1. Find a film that moved you</h2>
            <p className="text-[var(--text-muted)]">
              Browse our trending movies and TV shows, or search for something you&apos;ve recently watched.
              Maybe it was a documentary that opened your eyes, or a drama that touched your heart.
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="section-block fade-up flex items-start gap-6 p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-strong)]">2. Choose a charity</h2>
            <p className="text-[var(--text-muted)]">
              Pick from thousands of verified nonprofits on Every.org. Search for a cause that resonates
              with the film&apos;s themes, or choose any charity you care about. If you&apos;re not sure,
              we&apos;ll suggest one for you.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="section-block fade-up flex items-start gap-6 p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
            <ExternalLink className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-strong)]">3. Donate securely</h2>
            <p className="text-[var(--text-muted)]">
              Complete your donation on Every.org, a trusted nonprofit platform. Your payment is secure,
              and 100% of your donation goes to the charity you chose. You&apos;ll receive a tax receipt
              via email.
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="section-block fade-up flex items-start gap-6 p-5">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--accent)]">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="mb-2 text-xl font-semibold text-[var(--text-strong)]">4. See your impact</h2>
            <p className="text-[var(--text-muted)]">
              Your donation is linked to the film that inspired it. Check out our leaderboard to see
              which movies and shows have inspired the most generosity. Every donation counts toward
              the film&apos;s impact score.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="section-block mt-16 p-6 fade-up">
        <h2 className="mb-6 text-2xl font-semibold text-[var(--text-strong)]">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-strong)]">Where does my money go?</h3>
            <p className="text-[var(--text-muted)]">
              100% of your donation goes to the charity you select. Every.org is a 501(c)(3) nonprofit
              that processes donations at no cost to donors.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-strong)]">Is my payment secure?</h3>
            <p className="text-[var(--text-muted)]">
              Yes. All payments are processed by Every.org using industry-standard encryption.
              CineCause never sees your payment information.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-strong)]">Do I need an account to donate?</h3>
            <p className="text-[var(--text-muted)]">
              No. You can donate without an account. If you do that, you won&apos;t be able to track those donations in the app.
              If you do donate with an account, your personal info is not publicly exposed.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-strong)]">Do I get a tax receipt?</h3>
            <p className="text-[var(--text-muted)]">
              Yes. Every.org will email you a tax receipt for your donation. Donations to 501(c)(3)
              organizations are tax-deductible in the US.
            </p>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold text-[var(--text-strong)]">How can I contribute to the project?</h3>
            <p className="text-[var(--text-muted)]">
              You can support CineCause by following the project and contributing on{' '}
              <a
                className="text-[var(--accent-2)] hover:text-[var(--text-strong)]"
                href="https://github.com/placeholder/cinecause"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>{' '}
              (star the repo, open issues, or submit pull requests), or by donating via the options listed in the{' '}
              <Link href="/about#donations" className="text-[var(--accent-2)] hover:text-[var(--text-strong)]">
               donations section
              </Link>
              . Learn more{' '}
              <Link href="/about" className="text-[var(--accent-2)] hover:text-[var(--text-strong)]">
                here
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 text-center fade-up">
        <p className="mb-6 text-lg text-[var(--text-muted)]">Ready to turn inspiration into action?</p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center rounded-lg px-6 py-3"
        >
          Browse trending films →
        </Link>
      </div>
    </div>
  );
}
