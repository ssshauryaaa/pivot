import { Preloader } from '@/components/preloader'
import { SmoothScroll } from '@/components/smooth-scroll'
import { HeroExplode } from '@/components/hero/hero-explode'
import { ThenNowStickyStack } from '@/components/sections/then-now'
import { Testimonials } from '@/components/sections/testimonials'
import { ExperienceShowcase } from '@/components/sections/experience-showcase'
import { CabinetSurfer } from '@/components/sections/showcase2'
import { SiteFooter } from '@/components/sections/site-footer'
import { GalleryDemo } from '@/components/media-gallery-demo'
import { FindReplaySection } from '@/components/sections/find-replay-section'

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
        <FindReplaySection />
        <Testimonials />
        <SiteFooter />
      </main>
    </>
  )
}