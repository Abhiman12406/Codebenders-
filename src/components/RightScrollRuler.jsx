import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * RightScrollRuler - ArtCraft Signature Vertical Scroll Ruler
 *
 * Implements the precision-machined vertical scroll ruler found on getartcraft.com:
 * - Fixed 60px frosted glass track on the right edge with directional blur mask
 * - Monospace calibrated ticks from 0% to 100% with 5% major labels and 1% minor ticks
 * - Dynamic velocity and proximity tick stretching
 * - Active glowing viewport indicator box with hairline bounds
 * - Active position needle with pulsing accent glow and live percentage readout
 * - Interactive ghost line with tooltip on mouse hover
 * - Drag-to-scrub and click-to-jump smooth scrolling
 * - Section navigation anchors (#overview, #command-bar, #stress-test, #forecast, #outflows, #aging)
 */
export default function RightScrollRuler() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [viewportRatio, setViewportRatio] = useState(0.2);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverY, setHoverY] = useState(null);
  const [hoverPct, setHoverPct] = useState(0);

  const rulerRef = useRef(null);
  const rafRef = useRef(null);
  const lastScrollY = useRef(0);
  const velocityRef = useRef(0);

  // Measure document and update scroll state
  const updateScroll = useCallback(() => {
    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight;
    const currentScroll = window.scrollY || window.pageYOffset || 0;
    const maxScroll = Math.max(1, docH - winH);

    const progress = Math.min(1, Math.max(0, currentScroll / maxScroll));
    const ratio = Math.min(1, Math.max(0.05, winH / docH));

    // Calculate instantaneous scroll velocity for tick stretching
    const delta = Math.abs(currentScroll - lastScrollY.current);
    velocityRef.current = Math.min(1, delta / 40);
    lastScrollY.current = currentScroll;

    setScrollProgress(progress);
    setViewportRatio(ratio);
  }, []);

  useEffect(() => {
    updateScroll();

    let decayTimer;
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        updateScroll();
        clearTimeout(decayTimer);
        decayTimer = setTimeout(() => {
          velocityRef.current = 0;
        }, 120);
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      clearTimeout(decayTimer);
    };
  }, [updateScroll]);

  // Jump to document percentage
  const scrollToPercent = (pct, smooth = true) => {
    const docH = document.documentElement.scrollHeight;
    const winH = window.innerHeight;
    const maxScroll = Math.max(0, docH - winH);
    const targetY = (pct / 100) * maxScroll;

    if (smooth) {
      window.scrollTo({
        top: targetY,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo(0, targetY);
    }
  };

  // Convert clientY within ruler to percentage
  const calculatePctFromClientY = (clientY) => {
    if (!rulerRef.current) return 0;
    const rect = rulerRef.current.getBoundingClientRect();
    const edgePad = 24; // padding from top and bottom
    const usableHeight = rect.height - edgePad * 2;
    const relativeY = clientY - rect.top - edgePad;
    const clampedRatio = Math.max(0, Math.min(1, relativeY / usableHeight));
    return Math.round(clampedRatio * 100);
  };

  const handleClick = (e) => {
    const pct = calculatePctFromClientY(e.clientY);
    scrollToPercent(pct, true);
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    const pct = calculatePctFromClientY(e.clientY);
    scrollToPercent(pct, false);

    const onPointerMove = (moveEvent) => {
      const movePct = calculatePctFromClientY(moveEvent.clientY);
      scrollToPercent(movePct, false);
      setHoverPct(movePct);
      setHoverY(moveEvent.clientY);
    };

    const onPointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  };

  const handlePointerMove = (e) => {
    if (!rulerRef.current) return;
    const rect = rulerRef.current.getBoundingClientRect();
    const pct = calculatePctFromClientY(e.clientY);
    setHoverPct(pct);
    setHoverY(e.clientY - rect.top);
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    if (!isDragging) {
      setIsHovered(false);
      setHoverY(null);
    }
  };

  // Generate tick marks (0 to 100)
  const ticks = [];
  for (let i = 0; i <= 100; i++) {
    const isMajor = i % 5 === 0;
    ticks.push({
      pct: i,
      isMajor,
    });
  }

  // Calculate needle and viewport bracket vertical positions
  const edgePad = 24;
  const currentPct = Math.round(scrollProgress * 100);

  // Key navigation section anchors with their approximate positions
  const sectionAnchors = [
    { id: 'overview', label: 'STUDIOFLOW', pct: 0 },
    { id: 'command-bar', label: 'INPUT', pct: 15 },
    { id: 'stress-test', label: 'SIM', pct: 32 },
    { id: 'forecast', label: 'RADAR', pct: 52 },
    { id: 'outflows', label: 'BILLS', pct: 72 },
    { id: 'aging', label: 'AGING', pct: 90 },
  ];

  return (
    <div
      ref={rulerRef}
      role="scrollbar"
      aria-controls="main"
      aria-orientation="vertical"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={currentPct}
      aria-label="Page position"
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      className="fixed inset-y-0 right-0 z-40 w-[60px] cursor-crosshair overflow-hidden select-none hidden md:block"
      style={{
        touchAction: 'none',
      }}
    >
      {/* Frosted Glass Directional Mask Backdrop (ArtCraft signature) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(9px)',
          WebkitBackdropFilter: 'blur(9px)',
          backgroundColor: 'rgba(16, 16, 20, 0.65)',
          maskImage:
            'linear-gradient(to left, black 40%, rgba(0, 0, 0, 0.745) 47.5%, rgba(0, 0, 0, 0.53) 55%, rgba(0, 0, 0, 0.357) 62.5%, rgba(0, 0, 0, 0.22) 70%, rgba(0, 0, 0, 0.118) 77.5%, rgba(0, 0, 0, 0.047) 85%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to left, black 40%, rgba(0, 0, 0, 0.745) 47.5%, rgba(0, 0, 0, 0.53) 55%, rgba(0, 0, 0, 0.357) 62.5%, rgba(0, 0, 0, 0.22) 70%, rgba(0, 0, 0, 0.118) 77.5%, rgba(0, 0, 0, 0.047) 85%, transparent 100%)',
        }}
      />

      {/* Subtle Hairline Left Border */}
      <div className="absolute left-0 inset-y-0 w-[1px] bg-white/[0.04] pointer-events-none" />

      {/* Ruler Track Container */}
      <div
        className="absolute inset-x-0 top-0 bottom-0 pointer-events-none"
        style={{
          paddingTop: `${edgePad}px`,
          paddingBottom: `${edgePad}px`,
        }}
      >
        <div className="relative w-full h-full">
          {/* Ticks & Labels */}
          {ticks.map((tick) => {
            const topPct = tick.pct;
            // Proximity stretch effect to active needle or hover
            const distToCurrent = Math.abs(topPct - currentPct);
            const distToHover = hoverY !== null ? Math.abs(topPct - hoverPct) : 999;
            const isNearActive = distToCurrent < 6;
            const isNearHover = distToHover < 4;

            const stretchFactor = isNearHover
              ? 1.4
              : isNearActive
              ? 1.25 + velocityRef.current * 0.4
              : 1;

            return (
              <div
                key={tick.pct}
                className="absolute inset-x-0"
                style={{
                  top: `${topPct}%`,
                  height: '0px',
                }}
              >
                {/* Tick Mark Line */}
                <span
                  className="absolute block bg-ink transition-transform duration-75"
                  style={{
                    right: '0px',
                    top: '0px',
                    width: tick.isMajor ? `${20 * stretchFactor}px` : `${10 * stretchFactor}px`,
                    height: '1px',
                    opacity: tick.isMajor
                      ? isNearActive
                        ? 0.95
                        : 0.7
                      : isNearActive
                      ? 0.6
                      : 0.28,
                    transformOrigin: 'right center',
                  }}
                />

                {/* Major Tick Monospace Label */}
                {tick.isMajor && (
                  <span
                    className="absolute -translate-y-1/2 font-mono text-ink select-none tracking-tighter"
                    style={{
                      right: '25px',
                      top: '0px',
                      fontSize: '9px',
                      letterSpacing: '0.08em',
                      opacity: isNearActive ? 0.9 : 0.4,
                      color: isNearActive ? 'var(--accent, #2d81ff)' : undefined,
                    }}
                  >
                    {tick.pct}
                  </span>
                )}
              </div>
            );
          })}

          {/* Section Jump Anchors (Mini dots on ruler) */}
          {sectionAnchors.map((anchor) => (
            <div
              key={anchor.id}
              className="absolute group pointer-events-auto cursor-pointer"
              style={{
                top: `${anchor.pct}%`,
                right: '48px',
                transform: 'translateY(-50%)',
              }}
              onClick={(e) => {
                e.stopPropagation();
                const el = document.getElementById(anchor.id);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              title={`Jump to ${anchor.label}`}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-accent group-hover:scale-125 transition-all" />
              {/* Tooltip on hover */}
              <div className="hidden group-hover:block absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[8px] bg-bg-raised border border-line px-1.5 py-0.5 rounded-none whitespace-nowrap text-ink shadow-md pointer-events-none">
                {anchor.label}
              </div>
            </div>
          ))}

          {/* Active Viewport Bracket (Window Span Indicator) */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 pointer-events-none transition-all duration-75"
            style={{
              top: `${scrollProgress * (100 - viewportRatio * 100)}%`,
              height: `${viewportRatio * 100}%`,
              opacity: isHovered || isDragging ? 0.9 : 0.6,
            }}
          >
            {/* Soft Semi-Transparent Fill */}
            <div className="absolute inset-0 bg-ink/10" />
            {/* Top Border Hairline */}
            <span className="absolute inset-x-0 top-0 block bg-ink/40 h-[1px]" />
            {/* Bottom Border Hairline */}
            <span className="absolute inset-x-0 bottom-0 block bg-ink/40 h-[1px]" />
          </div>

          {/* Active Scroll Needle with Glow & Live Percentage Readout */}
          <div
            aria-hidden="true"
            className="absolute inset-x-0 pointer-events-none transition-all duration-75"
            style={{
              top: `${scrollProgress * 100}%`,
              height: '0px',
            }}
          >
            {/* High-Contrast Luminous Cyan/Blue Active Line */}
            <span
              className="absolute inset-x-0 block bg-accent"
              style={{
                top: '0px',
                height: '1px',
                boxShadow: '0 0 8px #2d81ff, 0 0 2px #2d81ff',
              }}
            />

            {/* Monospace Live % Readout */}
            <div
              className="absolute font-mono text-accent whitespace-nowrap select-none flex items-center"
              style={{
                right: '4px',
                top: '3px',
                fontSize: '9px',
                letterSpacing: '0.08em',
                lineHeight: 1,
                textShadow: '0 0 6px rgba(45, 129, 255, 0.6)',
              }}
            >
              <span className="font-semibold">{currentPct}</span>
              <span className="text-[7px] ml-0.5 opacity-80">%</span>
            </div>
          </div>

          {/* Ghost Line on Hover (Target Indicator) */}
          {isHovered && hoverY !== null && !isDragging && (
            <div
              aria-hidden="true"
              className="absolute inset-x-0 pointer-events-none"
              style={{
                top: `${hoverY - edgePad}px`,
                height: '0px',
              }}
            >
              <span
                className="absolute inset-x-0 block bg-white/40"
                style={{
                  top: '0px',
                  height: '1px',
                }}
              />
              <span
                className="absolute font-mono text-ink-muted whitespace-nowrap select-none"
                style={{
                  right: '4px',
                  top: '-12px',
                  fontSize: '8px',
                  letterSpacing: '0.06em',
                }}
              >
                {hoverPct}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
