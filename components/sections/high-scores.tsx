import { Reveal } from '@/components/reveal'
import { MarqueeTicker } from '@/components/marquee-ticker'

const SCORES = [
  { rank: '1ST', initials: 'MGV', name: 'Margaret Vasquez, 74', game: 'Galaxy Drift', score: '1,284,600' },
  { rank: '2ND', initials: 'RJO', name: 'Ray Okonkwo, 81', game: 'Neon Circuit', score: '1,102,050' },
  { rank: '3RD', initials: 'DKL', name: 'Denise Kellner, 69', game: 'Block Fever', score: '987,400' },
  { rank: '4TH', initials: 'HAP', name: 'Hal Petersen, 77', game: 'Galaxy Drift', score: '854,900' },
  { rank: '5TH', initials: 'SYM', name: 'Sylvia Moreau, 71', game: 'Coin Rush', score: '812,300' },
  { rank: '6TH', initials: 'BTN', name: 'Bernard Tran, 68', game: 'Neon Circuit', score: '769,150' },
]

const QUOTES = [
  {
    quote: 'I hadn’t held a joystick in forty years. Took me about ninety seconds to remember I was good at this.',
    who: 'Margaret V. — top of the Galaxy Drift board since March',
  },
  {
    quote: 'My grandson brought me. He lasted two rounds. I stayed till close.',
    who: 'Ray O. — Tuesday regular, undefeated at Neon Circuit',
  },
]

export function HighScores() {
  return (
    <section id="high-scores" className="relative border-t border-primary/15 bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="max-w-2xl">
          <p className="font-display text-[10px] tracking-[0.2em] text-primary">03 — HIGH SCORES</p>
          <h2 className="font-display mt-5 text-2xl text-balance leading-snug sm:text-3xl">
            The board, as of this week.
          </h2>
          <p className="mt-5 text-pretty leading-relaxed text-muted-foreground">
            Real members. Real numbers. Initials stay up until someone takes them down — house rules,
            same as they always were.
          </p>
        </Reveal>
      </div>

      <div className="mt-14">
        <MarqueeTicker speed={44} />
      </div>

      {/* attract-mode leaderboard */}
      <div className="mx-auto mt-14 max-w-4xl px-6 sm:px-10">
        <Reveal className="relative overflow-hidden border border-primary/30 bg-void p-6 sm:p-10" stagger={0.08}>
          <div className="scanlines pointer-events-none absolute inset-0 opacity-60" />
          <p className="font-display animate-flicker text-center text-[11px] tracking-[0.2em] text-primary sm:text-sm">
            — HIGH SCORES —
          </p>
          <ul className="relative mt-8 divide-y divide-primary/10">
            {SCORES.map((entry, i) => (
              <li
                key={entry.initials}
                className="grid grid-cols-[3.2rem_1fr_auto] items-center gap-3 py-4 transition-colors duration-200 hover:bg-primary/5 sm:grid-cols-[4rem_1fr_9rem_auto] sm:gap-4"
              >
                <span
                  className={`font-display text-[11px] ${i === 0 ? 'text-accent' : 'text-primary/80'}`}
                >
                  {entry.rank}
                </span>
                <span className="min-w-0">
                  <span className="font-display block text-[11px] text-foreground sm:text-xs">
                    {entry.initials}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">{entry.name}</span>
                </span>
                <span className="hidden text-sm text-muted-foreground sm:block">{entry.game}</span>
                <span className="font-display justify-self-end text-[11px] tabular-nums text-primary sm:text-xs">
                  {entry.score}
                </span>
              </li>
            ))}
          </ul>
          <p className="relative mt-8 text-center font-display text-[9px] tracking-[0.2em] text-muted-foreground">
            PRESS START TO ENTER YOUR INITIALS
          </p>
        </Reveal>

        <Reveal className="mt-12 grid gap-6 sm:grid-cols-2" stagger={0.14}>
          {QUOTES.map((item) => (
            <blockquote
              key={item.who}
              className="border-l-2 border-primary/60 bg-card/60 p-6 transition-colors duration-200 hover:border-primary"
            >
              <p className="text-pretty leading-relaxed text-foreground/90">{item.quote}</p>
              <footer className="mt-4 font-display text-[10px] leading-relaxed tracking-wide text-primary/80">
                {item.who}
              </footer>
            </blockquote>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
