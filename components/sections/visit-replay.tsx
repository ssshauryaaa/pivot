import { Reveal } from '@/components/reveal'

const DETAILS = [
  {
    label: 'HOURS',
    lines: ['Tue – Thu · 10am – 8pm', 'Fri – Sat · 10am – 11pm', 'Sun · 12pm – 6pm', 'Mondays: maintenance'],
  },
  {
    label: 'THE ROOM',
    lines: [
      'Step-free entry and wide aisles',
      'Seating at every cabinet, height-adjustable',
      'Sound calibrated to 68–72 dB',
      'Warm, even lighting — no strobe cabinets',
    ],
  },
  {
    label: 'TOKENS',
    lines: ['Day pass · $12 free play', 'Token Club · $30 / month', 'First visit is on the house', 'No app required'],
  },
  {
    label: 'FIND US',
    lines: ['418 Marquee Street', 'Bay Ridge, Brooklyn NY', 'Bus B37 · two blocks', 'Parking behind the building'],
  },
]

export function VisitReplay() {
  return (
    <section id="visit" className="relative border-t border-primary/15 bg-[#0f1424] py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6 sm:px-10">
        <Reveal className="max-w-2xl">
          <p className="font-display text-[10px] tracking-[0.2em] text-primary">04 — VISIT REPLAY</p>
          <h2 className="font-display mt-5 text-2xl text-balance leading-snug sm:text-3xl">
            Come in. First game is free.
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
            No signup wall, no membership pitch at the door. Walk in, take a token, pick a cabinet.
            Somebody will already be on the board waiting for you.
          </p>
        </Reveal>

        <dl className="mt-14 grid gap-10 sm:grid-cols-2">
          {DETAILS.map((detail) => (
            <div key={detail.label}>
              <dt className="font-display border-b border-primary/20 pb-3 text-[10px] tracking-[0.2em] text-primary">
                {detail.label}
              </dt>
              <dd className="mt-4">
                <ul className="space-y-2 text-lg leading-relaxed text-foreground/85">
                  {detail.lines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>

        <form
          className="mt-16 border border-primary/25 bg-card p-6 sm:p-9"
          aria-label="Reserve a first-visit token"
        >
          <h3 className="font-display text-base text-foreground sm:text-lg">Reserve a token</h3>
          <p className="mt-3 text-lg leading-relaxed text-muted-foreground">
            Leave a name and we&apos;ll have a token waiting at the counter. That&apos;s the whole process.
          </p>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row">
            <label className="flex-1">
              <span className="sr-only">Your name</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                className="w-full border border-input bg-background px-4 py-3.5 text-lg text-foreground transition-colors duration-200 placeholder:text-muted-foreground/70 hover:border-primary/50 focus:border-primary focus:outline-none"
              />
            </label>
            <label className="flex-1">
              <span className="sr-only">Email address</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email address"
                className="w-full border border-input bg-background px-4 py-3.5 text-lg text-foreground transition-colors duration-200 placeholder:text-muted-foreground/70 hover:border-primary/50 focus:border-primary focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="bg-primary px-7 py-3.5 font-display text-[11px] tracking-wide text-primary-foreground transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(255,182,39,0.35)] sm:text-xs"
            >
              HOLD MY TOKEN
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
