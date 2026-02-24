import { Bitcoin } from 'lucide-react';

export const metadata = {
  title: 'About - CineCause',
  description: 'Why CineCause exists and how to support the project.',
};

function EthIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2L3 12l9 10 9-10L12 2zm0 3.2l5.5 6.8L12 19.5l-5.5-7.5L12 5.2z" />
    </svg>
  );
}

export default function AboutPage() {
  return (
    <div className="page-container max-w-4xl">
      <h1 className="text-4xl font-semibold text-[var(--text-strong)]">About CineCause</h1>
      <p className="mt-3 text-sm text-[var(--text-muted)]">Why this project exists and how you can support it</p>

      <div className="section-block mt-6 p-5">
        <p className="text-[var(--text-strong)]">
          In plain language: CineCause exists to turn the emotional energy of films and shows into real-world giving.
        </p>
      </div>

      <div className="legal-prose mt-8 text-[var(--text-muted)]">
        <section>
          <h2>Motivation</h2>
          <p>
            Movies and TV shows can change how people think and feel. CineCause was built to capture that moment of
            inspiration and make it easier to act on it through charity.
          </p>
          <p>
            The goal is simple: if a story moves you, helps you reflect, or makes you want to do some good, you should
            have a direct path to support a cause while that motivation is still fresh.
          </p>
        </section>

        <section>
          <h2>Open Source Project</h2>
          <p>
            CineCause was created by{' '}
            <a
              className="text-[var(--accent-2)] hover:text-[var(--text-strong)]"
              href="https://github.com/lukasugar"
              target="_blank"
              rel="noopener noreferrer"
            >
              Luka Secerovic
            </a>{' '}
            (and hopefully some contributors in the future 🙂).
          </p>
          <p>
            CineCause is an open-source project. You can browse the repository {' '}
            <a
              className="text-[var(--accent-2)] hover:text-[var(--text-strong)]"
              href="https://github.com/lukasugar/cinecause"
              target="_blank"
              rel="noopener noreferrer"
            >
              here
            </a>
            .
          </p>
        </section>

        <section>
          <h2>How to Support the Project</h2>
          <ul>
            <li>
              <strong>⭐ Star </strong>{' '}
              <a
                className="text-[var(--accent-2)] hover:text-[var(--text-strong)]"
                href="https://github.com/lukasugar/cinecause"
                target="_blank"
                rel="noopener noreferrer"
              >
                the repository on GitHub
              </a>
            </li>
            <li>
              <strong>Contribute to the codebase:</strong> open issues, submit pull requests, or improve docs/tests.
            </li>
            <li>
              <strong>Follow on Twitter/X:</strong>{' '}
              <a
                className="text-[var(--accent-2)] hover:text-[var(--text-strong)]"
                href="https://x.com/luka_secerovic"
                target="_blank"
                rel="noopener noreferrer"
              >
                @luka_secerovic
              </a>
            </li>
            <li>
              <strong>Follow on LinkedIn:</strong>{' '}
              <a
                className="text-[var(--accent-2)] hover:text-[var(--text-strong)]"
                href="https://www.linkedin.com/in/luka-secerovic/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Luka Secerovic
              </a>
            </li>
          </ul>
        </section>

        <section id="donations">
          <h2>Crypto Support</h2>
          <p>
            If you want to support the work directly, crypto donations are also welcome, but fully optional.
          </p>
          <ul>
            <li className="flex items-center gap-2">
              <Bitcoin className="size-5 shrink-0 text-[#f7931a]" aria-hidden />
              <span>
                <strong>BTC wallet:</strong> <code>3PQuhWT4KM5q4YNp6Scs34P8nAKGxfbWn1</code>
              </span>
            </li>
            <li className="flex items-center gap-2">
              <EthIcon className="size-5 shrink-0 text-[#627eea]" aria-hidden />
              <span>
                <strong>ETH wallet:</strong> <code>0xc7aa7cb587bc3d6410ad4d6c6f3d4c435ef3090a</code>
              </span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
