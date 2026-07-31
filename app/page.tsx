import { Preloader } from '@/components/preloader'
import { SmoothScroll } from '@/components/smooth-scroll'
import { HeroExplode } from '@/components/hero/hero-explode'
import { ThenNowStickyStack } from '@/components/sections/then-now'
import { WhyReplay } from '@/components/sections/why-replay'
import { Testimonials } from '@/components/sections/testimonials'
import { HighScores } from '@/components/sections/high-scores'
import { ExperienceShowcase } from '@/components/sections/experience-showcase'
import { CabinetSurfer } from '@/components/sections/showcase2'
import { VisitReplay } from '@/components/sections/visit-replay'
import { GalleryDemo } from '@/components/media-gallery-demo'

export default function Page() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <main id="top">
        <HeroExplode />
        <ThenNowStickyStack />
        <ExperienceShowcase />
        <CabinetSurfer />
        <GalleryDemo />
        <Testimonials />
        <HighScores />
        <VisitReplay />
      </main>
    </>
  )
}