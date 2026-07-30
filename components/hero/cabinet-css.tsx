'use client'

/**
 * Low-tier / mobile path: the same cabinet, drawn as CSS-3D layers instead of a
 * live WebGL scene. The pinned GSAP timeline targets these exact class names,
 * so both paths drive one identical animation — and this one is pure
 * transform/opacity compositing, so it holds 60fps on a phone.
 */
export function CabinetCss() {
  return (
    <div
      aria-hidden="true"
      className="relative flex h-full w-full items-center justify-center [perspective:1100px]"
    >
      <div className="relative h-[min(72vh,520px)] w-[min(78vw,300px)] [transform-style:preserve-3d]">
        {/* marquee header */}
        <div className="marquee will-animate absolute -top-[14%] left-1/2 h-[13%] w-[112%] -translate-x-1/2 [transform-style:preserve-3d]">
          <div className="flex h-full items-center justify-center border-2 border-primary/70 bg-primary shadow-[0_0_40px_rgba(255,182,39,0.45)]">
            <span className="font-display text-[10px] tracking-tight text-void sm:text-xs">REPLAY</span>
          </div>
        </div>

        {/* side panels */}
        <div className="side-panel-left will-animate absolute -left-[9%] top-0 h-full w-[9%] bg-gradient-to-b from-accent/70 via-[#12172b] to-void" />
        <div className="side-panel-right will-animate absolute -right-[9%] top-0 h-full w-[9%] bg-gradient-to-b from-primary/70 via-[#12172b] to-void" />

        {/* body */}
        <div className="absolute inset-0 border border-primary/20 bg-[#1b2242] shadow-[inset_0_0_60px_rgba(10,13,26,0.8)]" />

        {/* screen */}
        <div className="screen will-animate absolute left-1/2 top-[8%] h-[42%] w-[82%] -translate-x-1/2 [transform-style:preserve-3d]">
          <div className="scanlines animate-flicker relative h-full w-full overflow-hidden border-[6px] border-void bg-[#173a3a] shadow-[0_0_50px_rgba(47,143,127,0.5)]">
            <div className="absolute inset-0 flex flex-col justify-center gap-2 p-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-primary" />
                <span className="h-2 w-2 bg-primary" />
                <span className="h-2 w-2 bg-primary" />
              </div>
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-foreground" />
                <span className="h-2 w-2 bg-foreground" />
              </div>
              <div className="flex gap-1 self-end">
                <span className="h-2 w-2 bg-accent" />
                <span className="h-2 w-2 bg-accent" />
                <span className="h-2 w-2 bg-accent" />
              </div>
            </div>
          </div>
        </div>

        {/* control panel */}
        <div className="absolute bottom-[16%] left-1/2 h-[20%] w-[96%] -translate-x-1/2 bg-[#12172b] shadow-[0_-6px_20px_rgba(10,13,26,0.6)]">
          <div className="flex h-full items-center justify-between px-5">
            <div className="joystick will-animate relative">
              <span className="block h-2 w-8 rounded-full bg-void" />
              <span className="absolute -top-6 left-1/2 h-6 w-1 -translate-x-1/2 bg-foreground" />
              <span className="absolute -top-9 left-1/2 h-4 w-4 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_14px_rgba(255,62,154,0.6)]" />
            </div>
            <div className="buttons will-animate flex gap-2">
              <span className="h-4 w-4 rounded-full bg-primary shadow-[0_0_12px_rgba(255,182,39,0.6)]" />
              <span className="h-4 w-4 rounded-full bg-primary shadow-[0_0_12px_rgba(255,182,39,0.6)]" />
              <span className="h-4 w-4 rounded-full bg-primary shadow-[0_0_12px_rgba(255,182,39,0.6)]" />
            </div>
          </div>
        </div>

        {/* coin slot + plinth */}
        <div className="absolute bottom-[6%] left-1/2 flex h-6 w-16 -translate-x-1/2 items-center justify-center bg-foreground/90">
          <span className="h-3 w-1 bg-void" />
        </div>
        <div className="absolute -bottom-4 left-1/2 h-4 w-[104%] -translate-x-1/2 bg-void" />
      </div>
    </div>
  )
}
