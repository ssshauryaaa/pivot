const LINKS = [
  { href: '#then-now', label: 'THEN & NOW' },
  { href: '#why', label: 'WHY REPLAY' },
  { href: '#high-scores', label: 'HIGH SCORES' },
  { href: '#visit', label: 'VISIT' },
]

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 px-4 sm:top-5">
      <div className="mx-auto flex w-fit items-center gap-4 rounded-full border border-primary/20 bg-void/80 py-2 pl-5 pr-2 shadow-[0_8px_32px_rgba(10,13,26,0.6),inset_0_1px_0_rgba(255,182,39,0.08)] backdrop-blur-xl sm:gap-6">
        <a
          href="#top"
          className="font-display text-[11px] tracking-tight text-primary transition-colors duration-200 hover:text-foreground"
        >
          REPLAY
        </a>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-4 sm:gap-5">
            {LINKS.map((link) => (
              <li key={link.href} className="hidden sm:block">
                <a
                  href={link.href}
                  className="font-display text-[9px] tracking-widest text-muted-foreground transition-colors duration-200 hover:text-primary"
                >
                  {link.label}
                </a>
              </li>
            ))}

          </ul>
        </nav>
      </div>
    </header>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-primary/20 bg-void py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-end sm:justify-between sm:px-10">
        <div>
          <p className="font-display text-sm text-primary">REPLAY</p>
          <p className="mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
            Your High Score Never Expires. 418 Marquee Street, Bay Ridge, Brooklyn.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <a
            href="tel:+17185550119"
            className="text-base text-foreground/85 transition-colors duration-200 hover:text-primary"
          >
            (718) 555-0119
          </a>
          <a
            href="mailto:tokens@replayarcade.com"
            className="text-base text-foreground/85 transition-colors duration-200 hover:text-primary"
          >
            tokens@replayarcade.com
          </a>
          <p className="font-display mt-3 text-[9px] tracking-widest text-muted-foreground">
            © {new Date().getFullYear()} REPLAY ARCADE
          </p>
        </div>
      </div>
    </footer>
  )
}
