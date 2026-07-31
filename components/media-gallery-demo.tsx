'use client'

import { MediaGalleryCarousel, type GalleryMediaItem } from './ui/media-gallery-carousel'

const CAMPAIGN_MEDIA: GalleryMediaItem[] = [
  {
    src: '/gallery/replay-poster-01.jpg',
    alt: 'REPLAY arcade launch poster featuring a glowing joystick',
    title: 'Launch Poster',
    category: 'POSTER',
    href: '/gallery/replay-poster-01.jpg',
  },
  {
    src: '/Level up.png',
    alt: 'Arcade x Senior Citizens print advertisement, childhood games to arcade split visual',
    title: '"Level Up" Print Ad',
    category: 'AD',
    href: '/Level up.png',
},
  {
    src: '/gallery/replay-reel-01.jpg',
    alt: 'Cover still from the REPLAY social reel',
    title: 'Instagram Reel',
    category: 'REEL',
    href: '/gallery/replay-reel-01.mp4',
    ctaLabel: 'WATCH REEL',
  },
  {
    src: '/gallery/replay-mockup-01.jpg',
    alt: 'Storefront mockup of the REPLAY arcade entrance',
    title: 'Storefront Mockup',
    category: 'MOCKUP',
  },
]

export function GalleryDemo() {
  return (
    <section className="grid-backdrop relative px-4 py-20 sm:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-display text-[10px] tracking-[0.2em] text-accent sm:text-xs">CAMPAIGN GALLERY</p>
        <h2 className="font-display mt-3 text-[clamp(1.75rem,4vw,2.75rem)] text-foreground text-glow-amber">
          Every Piece Of The Pitch
        </h2>
      </div>

      <div className="mx-auto mt-14 max-w-5xl">
        <MediaGalleryCarousel items={CAMPAIGN_MEDIA} autoPlay intervalMs={7000} />
      </div>
    </section>
  )
}