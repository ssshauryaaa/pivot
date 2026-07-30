import { Users, Hand, Trophy } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const PILLARS = [
  {
    icon: Users,
    label: 'SOCIAL',
    title: 'An arcade was never a solo activity',
    copy:
      'Cabinets face each other for a reason. You watch, you heckle, you hand over the stick. Nobody comes to REPLAY and leaves without talking to someone.',
    stat: 'Open floor, no reservations',
  },
  {
    icon: Hand,
    label: 'TACTILE',
    title: 'Real sticks. Real switches. Real weight.',
    copy:
      'Microswitch buttons and ball-top joysticks give your hands something to actually do — full range, real resistance, none of the squinting a phone screen demands.',
    stat: 'Leaf-spring sticks, 60g buttons',
  },
  {
    icon: Trophy,
    label: 'COMPETITIVE',
    title: 'The board keeps score. That is the point.',
    copy:
      'No participation mode, no difficulty apologies. Weekly ladders, house tournaments, and initials that stay up until somebody earns the right to knock them off.',
    stat: 'Weekly ladder, monthly finals',
  },
]

export function WhyReplay() {
  return (
    <section id="why" className="relative border-t border-primary/15 bg-[#0f1424] py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6 sm:px-10">
        <Reveal className="max-w-2xl">
          <p className="font-display text-[10px] tracking-[0.2em] text-primary">02 — WHY REPLAY</p>
          <h2 className="font-display mt-5 text-2xl text-balance leading-snug sm:text-3xl">
            Three good reasons. None of them nostalgia.
          </h2>
        </Reveal>

        <Reveal className="mt-14 grid gap-6 md:grid-cols-3" stagger={0.14}>
          {PILLARS.map((pillar) => (
            <article
              key={pillar.label}
              tabIndex={0}
              className="group relative overflow-hidden border border-primary/20 bg-card p-7 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary/60 hover:shadow-[0_18px_50px_-20px_rgba(255,182,39,0.45)] focus-visible:-translate-y-1 focus-visible:border-primary/60 sm:p-8"
            >
              {/* CRT edge-light on hover */}
              <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
              <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 [background:radial-gradient(120%_60%_at_50%_0%,rgba(255,182,39,0.12),transparent_70%)]" />

              <pillar.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              <p className="font-display mt-6 text-[10px] tracking-[0.2em] text-primary/80">{pillar.label}</p>
              <h3 className="font-display mt-3 text-base leading-snug text-foreground sm:text-lg">
                {pillar.title}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{pillar.copy}</p>
              <p className="mt-6 border-t border-primary/15 pt-4 font-display text-[10px] tracking-widest text-foreground/70">
                {pillar.stat}
              </p>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
