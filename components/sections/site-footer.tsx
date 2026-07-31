import Link from 'next/link'
import { FooterBackdrop } from '@/components/footer-backdrop'
import { ReserveTokenCard } from '@/components/reserve-token-card'

/* ─── content ─────────────────────────────────────────────────────────
 * Same four info blocks as before — kept because short, scannable,
 * high-contrast blocks are exactly what works for a senior audience.
 * The reservation form is gone: one big tap target to /contact instead
 * of typing into two inputs on a phone.
 * ──────────────────────────────────────────────────────────────────── */


const SITE_LINKS = [
  { label: 'Visit', href: '#visit' },
  { label: 'The Lineup', href: '#lineup' },
  { label: 'Contact', href: '/contact' },
  { label: 'Accessibility', href: '#accessibility' },
]

/* ─── SiteFooter ─────────────────────────────────────────────────────── */

export function SiteFooter() {
  return (
    <footer className="relative border-t border-primary/15 bg-[#0f1424]">
      <FooterBackdrop />

      <div className="relative z-10 mx-auto max-w-5xl px-6 py-20 sm:px-10 sm:py-28">
        <ReserveTokenCard />

        <div className="mt-16 flex flex-col gap-6 border-t border-primary/15 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-[10px] tracking-[0.2em] text-foreground/50">
            © {new Date().getFullYear()} REPLAY ARCADE — EST. 1979, REOPENED FOR YOU
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {SITE_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="font-display text-[10px] tracking-[0.18em] text-foreground/60 transition-colors hover:text-primary"
                >
                  {link.label.toUpperCase()}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}