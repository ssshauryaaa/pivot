import { NearbyArcadesPin } from '@/components/ui/nearby-arcades-pin'
import { FindReplayBackdrop } from '@/components/sections/find-replay-backdrop'

export function FindReplaySection() {
  return (
    <section id="visit" className="relative overflow-hidden bg-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
      <FindReplayBackdrop />

      <div className="relative z-10 mx-auto max-w-2xl px-2 text-center sm:px-0">
        <p className="font-display text-[10px] tracking-[0.2em] text-accent sm:text-xs">FIND A CABINET</p>
        <h2 className="font-display mt-3 text-[clamp(1.5rem,7vw,2.2rem)] leading-tight text-foreground text-glow-amber sm:text-[clamp(1.75rem,4vw,2.75rem)]">
          Your Next Round Is Nearby
        </h2>
      </div>

      <div className="relative mt-12 sm:mt-16">
        <NearbyArcadesPin />
      </div>
    </section>
  )
}