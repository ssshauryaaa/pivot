'use client'

import { MediaGalleryCarousel, type GalleryMediaItem } from './ui/media-gallery-carousel'

const CAMPAIGN_MEDIA: GalleryMediaItem[] = [
  {
    src: '/p2 (2).jpeg',
    alt: 'REPLAY arcade launch poster featuring a glowing joystick',
    title: 'Launch Poster',
    category: 'POSTER',
    href: '/p2 (2).jpeg',
  },
  {
    src: '/Level up.png',
    alt: 'Arcade x Senior Citizens print advertisement, childhood games to arcade split visual',
    title: '"Level Up" Print Poster',
    category: 'AD',
    href: '/Level up.png',
},
{
    src: '/p2 (1).jpeg',
    alt: 'REPLAY arcade launch poster featuring a glowing joystick',
    title: 'Launch Poster',
    category: 'POSTER',
    href: '/p2 (1).jpeg',
  },
  {
    src: '/PLAYER 1.png',
    alt: 'Arcade x Senior Citizens print advertisement, childhood games to arcade split visual',
    title: '"PLAYER 1" Poster',
    category: 'AD',
    href: '/PLAYER 1.png',
  },
  {
    src: '/VIDEO-2026-08-01-01-38-01.mp4',
    poster: '/p2 (2).jpeg',
    alt: 'REPLAY campaign video teaser',
    title: 'Campaign Teaser',
    category: 'VIDEO',
    href: '/VIDEO-2026-08-01-01-38-01.mp4',
    ctaLabel: 'WATCH VIDEO',
    mediaType: 'video',
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