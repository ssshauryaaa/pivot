import { Preloader } from '@/components/preloader'
import { SmoothScroll } from '@/components/smooth-scroll'
import { HeroExplode } from '@/components/hero/hero-explode'
import { PivotSplitTable } from '@/components/sections/then-now'
import { WhyReplay } from '@/components/sections/why-replay'
import { SlashCompare } from '@/components/sections/slash-compare'
import { Testimonials } from '@/components/sections/testimonials'
import { HighScores } from '@/components/sections/high-scores'
import { ExperienceShowcase } from '@/components/sections/experience-showcase'
import { VisitReplay } from '@/components/sections/visit-replay'

export default function Page() {
  return (
    <>
      <Preloader />
      <SmoothScroll />
      <main id="top">
        <HeroExplode />
        <PivotSplitTable />
        <ExperienceShowcase />
        <WhyReplay />
        <SlashCompare />
        <Testimonials />
        <HighScores />
        <VisitReplay />
      </main>
    </>
  )
}