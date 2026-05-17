import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How HowLongDay collects and uses data.',
  alternates: { canonical: 'https://howlongday.com/privacy' },
  robots: { index: true, follow: true },
}

const LAST_UPDATED = 'May 16, 2026'
// Split to make trivial regex scraping (\w+@\w+\.\w+) miss the address.
// Rendered with the literal "@" replaced by " [at] " for humans.
const CONTACT_USER = 'heikki'
const CONTACT_DOMAIN = 'stanssi.fi'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bg-deepest">
      <header className="border-b border-white/5">
        <nav className="mx-auto flex max-w-3xl items-center justify-between px-6 py-7">
          <Link href="/" aria-label="HowLongDay home">
            <Logo variant="compact" />
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-neutral-3 hover:text-white"
          >
            ← Home
          </Link>
        </nav>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16 text-base leading-relaxed text-neutral-2">
        <p className="text-[0.7rem] font-medium uppercase tracking-widecaps text-neutral-3">
          Last updated · {LAST_UPDATED}
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Privacy Policy</h1>
        <p className="mt-6">
          HowLongDay is a free site that shows sunrise, sunset and daylight
          information for cities worldwide. We try to collect as little data
          as possible. This page explains what is collected, why, and what
          is not collected.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-white">What we collect</h2>
        <p className="mt-4">
          <strong>Anonymous usage analytics.</strong> We use{' '}
          <a
            href="https://vercel.com/docs/analytics/privacy-policy"
            className="text-daylight underline decoration-daylight/30 underline-offset-4 hover:decoration-daylight"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vercel Web Analytics
          </a>
          , which is cookieless and does not track individual users. Vercel
          counts page views per day by hashing your IP address and user
          agent into a non-reversible identifier that is discarded at the
          end of the day. We see aggregated traffic numbers; we do not see
          who visited.
        </p>
        <p className="mt-4">
          <strong>Standard server logs.</strong> Our hosting provider (Vercel)
          temporarily records request data such as IP address, requested URL
          and user agent for operational purposes — diagnosing errors,
          preventing abuse and serving content from the nearest region. These
          logs are retained briefly and are not used for advertising or
          profiling.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-white">
          What we don&apos;t collect
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-6">
          <li>No tracking cookies.</li>
          <li>No advertising or remarketing pixels.</li>
          <li>No user accounts, no logins, no email collection.</li>
          <li>No third-party social media tracking.</li>
          <li>No location requests — we do not ask for your geolocation.</li>
        </ul>

        <h2 className="mt-12 text-2xl font-semibold text-white">
          Third-party content
        </h2>
        <p className="mt-4">
          We load the Inter typeface from Google Fonts (
          <code className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[0.85em]">
            fonts.googleapis.com
          </code>
          ). When your browser requests the font file, your IP address is
          visible to Google. Google states this is used only to serve the
          font efficiently and is not associated with a Google account. If
          you would prefer that we self-host the font, contact us — we can
          change this on request.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-white">
          Advertising (future)
        </h2>
        <p className="mt-4">
          We may add Google AdSense once the site has been live long enough
          to apply. When that happens this policy will be updated and a
          cookie consent banner will appear before any advertising cookies
          are set. At time of writing, no ads are served.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-white">Your rights</h2>
        <p className="mt-4">
          Under the EU General Data Protection Regulation (GDPR) you have
          the right to ask what personal data we hold about you, request
          correction or deletion, and complain to your national data
          protection authority. Because we do not associate site visits with
          individual identities, in practice we have no personal data file
          to look up — but you can still contact us with any question.
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-white">Contact</h2>
        <p className="mt-4">
          For any privacy question, write to{' '}
          <span className="font-mono text-white">
            {CONTACT_USER}
            <span aria-hidden> [at] </span>
            <span className="sr-only">@</span>
            {CONTACT_DOMAIN}
          </span>
          . (Replace <span className="font-mono">[at]</span> with{' '}
          <span className="font-mono">@</span> to send mail.)
        </p>

        <h2 className="mt-12 text-2xl font-semibold text-white">Changes</h2>
        <p className="mt-4">
          We may update this policy as the site evolves. The &ldquo;Last
          updated&rdquo; date at the top reflects the most recent change.
          Material changes will be noted in a brief notice on the homepage.
        </p>
      </article>

      <footer className="border-t border-white/5 bg-bg-deepest">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-neutral-4 md:flex-row">
          <Logo variant="icon" />
          <p>© {new Date().getFullYear()} HowLongDay.</p>
        </div>
      </footer>
    </main>
  )
}
