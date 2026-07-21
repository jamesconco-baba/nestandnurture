import Link from 'next/link';
import NestMark from '../../components/NestMark';
import { MYSTERY_SCOOPS } from '../../lib/scoops';
import { formatNaira } from '../../lib/format';

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-nest-radial">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-20 text-center">
          <NestMark className="w-16 h-16 mx-auto mb-6" />
          <p className="uppercase tracking-[0.3em] text-xs text-lavender font-body mb-4">
            Mystery Scoop Baby Gifts
          </p>
          <h1 className="font-display text-4xl sm:text-6xl leading-tight text-charcoal max-w-3xl mx-auto">
            Gifts for new mums, curated with a little bit of wonder.
          </h1>
          <p className="mt-6 text-charcoal/70 font-body max-w-xl mx-auto text-lg">
            Send a single thoughtful item, build a custom pack, or let us
            surprise them with a signature Mystery Scoop — every order ends
            with a personal greeting card and delivery details done right.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/mystery-scoop"
              className="focus-ring rounded-full bg-lavender text-white px-7 py-3 font-body text-sm uppercase tracking-wide hover:bg-lavender-600 transition-colors"
            >
              Explore Mystery Scoops
            </Link>
            <Link
              href="/shop"
              className="focus-ring rounded-full border border-charcoal/20 px-7 py-3 font-body text-sm uppercase tracking-wide hover:border-lavender hover:text-lavender transition-colors"
            >
              Browse Unit Shop
            </Link>
          </div>
        </div>
      </section>

      {/* Three purchase paths */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <h2 className="font-display text-3xl text-center mb-3">Three ways to gift</h2>
        <p className="text-center text-charcoal/60 font-body mb-12 max-w-lg mx-auto">
          Every path — precise or surprise — is built for how you actually want
          to give.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          <PathCard
            eyebrow="Precise"
            title="Unit Price Shop"
            body="Filter our full catalog of premium baby & mum items and buy exactly what you want, one item at a time."
            href="/shop"
            cta="Shop items"
          />
          <PathCard
            eyebrow="Custom"
            title="Build-a-Gift Pack"
            body="Set a budget from ₦50,000 and hand-pick a curated arrangement suited to their exact needs."
            href="/build-a-gift"
            cta="Start building"
          />
          <PathCard
            eyebrow="Signature"
            title="Mystery Scoop"
            body="Our surprise pre-configured bundles across three tiers — the fastest way to send something delightful."
            href="/mystery-scoop"
            cta="See tiers"
            featured
          />
        </div>
      </section>

      {/* Mystery scoop teaser */}
      <section className="bg-lavender-50 border-y border-lavender-100">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <div>
              <p className="uppercase tracking-[0.3em] text-xs text-lavender font-body mb-3">
                Signature Service
              </p>
              <h2 className="font-display text-3xl">Mystery Scoop Tiers</h2>
            </div>
            <Link
              href="/mystery-scoop"
              className="focus-ring rounded-full text-sm font-body uppercase tracking-wide text-lavender hover:underline"
            >
              View all tiers →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {MYSTERY_SCOOPS.map((s) => (
              <div
                key={s.id}
                className={`rounded-2xl p-7 bg-white border ${
                  s.featured ? 'border-gold-400 shadow-lg shadow-gold-100' : 'border-lavender-100'
                }`}
              >
                {s.featured && (
                  <span className="inline-block mb-3 text-[11px] uppercase tracking-wide bg-gold-100 text-gold-700 rounded-full px-3 py-1">
                    Most Popular
                  </span>
                )}
                <h3 className="font-display text-2xl mb-1">{s.name}</h3>
                <p className="text-lavender font-body font-semibold mb-3">
                  {formatNaira(s.price)}
                </p>
                <p className="text-sm text-charcoal/60 font-body">{s.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function PathCard({ eyebrow, title, body, href, cta, featured }) {
  return (
    <Link
      href={href}
      className={`focus-ring group block rounded-2xl p-8 border transition-shadow ${
        featured
          ? 'border-gold-400 bg-white shadow-md hover:shadow-xl'
          : 'border-charcoal/10 bg-white hover:shadow-lg'
      }`}
    >
      <p className="uppercase tracking-[0.25em] text-xs text-gold-700 font-body mb-3">
        {eyebrow}
      </p>
      <h3 className="font-display text-2xl mb-3">{title}</h3>
      <p className="text-sm text-charcoal/60 font-body mb-6">{body}</p>
      <span className="text-sm font-body text-lavender group-hover:underline">
        {cta} →
      </span>
    </Link>
  );
}
