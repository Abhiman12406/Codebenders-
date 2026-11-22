import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * HeroWordmark - 99.9% ArtCraft Signature Scroll-to-Ruler Wordmark Animation
 *
 * Each letter of "STUDIOFLOW" is an individual animated glyph:
 * 1. At resting state (scrollY = 0), letters sit naturally in the Hero H1.
 * 2. As the user scrolls down (scrollY 0px -> 420px):
 *    - Each letter lifts from its hero coordinates.
 *    - Follows an arched quadratic bezier trajectory toward the right scroll ruler rail.
 *    - Staggers smoothly using easeInOutCubic.
 *    - Scales down from display size (~72-96px) to ruler monospace size (~11px).
 *    - Rotates from 0deg to -90deg to dock vertically into the right ruler rail.
 *    - Weight and color transition to match the calibrated ruler needle aesthetic.
 * 3. When scrolling back up, letters reverse along the exact curve and re-dock into the Hero H1.
 * 4. Clicking or hovering the docked wordmark allows immediate smooth jump back to Hero.
 */

const WORD = 'STUDIOFLOW';
const LETTERS = WORD.split('');
const SCROLL_ZONE_PX = 420; // Distance over which transition completes
const STAGGER = 0.043; // Per-letter stagger delay
const ARC_OFFSET_PX = 74; // Horizontal bezier arc bow
const RAIL_WIDTH_PX = 60; // ArtCraft ruler rail width
const RAIL_LETTER_SPACING_PX = 11; // Vertical spacing between docked letters in rail
const DOCKED_FONT_PX = 10.5; // Monospace font size when docked in ruler

function clamp01(val) {
  return Math.max(0, Math.min(1, val));
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function HeroWordmark() {
  const containerRef = useRef(null);
  const letterRefs = useRef([]);
  const metricsRef = useRef({
    ready: false,
    baseX: [],
    baseDocY: [],
    fontPx: 72,
    initialWidths: [],
  });

  const [isDocked, setIsDocked] = useState(false);
  const [isHoveredDock, setIsHoveredDock] = useState(false);
  const rafRef = useRef(null);

  // Measure initial resting positions of each letter in the document
  const measure = useCallback(() => {
    if (!containerRef.current) return;
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) {
      metricsRef.current.ready = false;
      return;
    }

    const els = letterRefs.current.filter(Boolean);
    if (els.length !== LETTERS.length) return;

    // Reset styles temporarily to read pristine natural layout bounding rects
    els.forEach((el) => {
      el.style.transform = '';
      el.style.opacity = '1';
    });

    const scrollY = window.scrollY || window.pageYOffset || 0;
    const computed = window.getComputedStyle(els[0]);
    const fontPx = parseFloat(computed.fontSize) || 72;

    const rects = els.map((el) => el.getBoundingClientRect());
    const baseX = rects.map((r) => r.left + r.width / 2);
    const baseDocY = rects.map((r) => r.top + r.height / 2 + scrollY);
    const initialWidths = rects.map((r) => r.width);

    metricsRef.current = {
      ready: true,
      baseX,
      baseDocY,
      fontPx,
      initialWidths,
    };

    // Re-apply current scroll position frame
    applyScrollFrame(scrollY);
  }, []);

  // Compute and apply transforms to all letters along the bezier arc
  const applyScrollFrame = useCallback((scrollY) => {
    const { ready, baseX, baseDocY, fontPx } = metricsRef.current;
    const els = letterRefs.current.filter(Boolean);
    if (!ready || els.length !== LETTERS.length) return;

    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) {
      // On mobile/tablet without right ruler, keep standard hero display
      els.forEach((el) => {
        el.style.transform = '';
        el.style.color = '';
      });
      return;
    }

    // Scroll progress normalized between 0 and 1
    const p = clamp01(scrollY / SCROLL_ZONE_PX);
    const dockedState = p >= 0.95;
    setIsDocked(dockedState);

    const N = LETTERS.length;
    const totalStaggerSpan = 1 + (N - 1) * STAGGER;

    // Target position in right ruler rail
    const railCenterX = window.innerWidth - RAIL_WIDTH_PX / 2;
    const dockTopY = 68; // Vertical rail position below navbar

    for (let i = 0; i < N; i++) {
      const el = els[i];
      if (!el) continue;

      // Calculate staggered progress for this specific letter
      const letterP = clamp01((p * totalStaggerSpan - i * STAGGER) / 1);
      const d = easeInOutCubic(letterP);

      // Start position (resting in Hero relative to current viewport)
      const startX = baseX[i];
      const startY = baseDocY[i] - scrollY;

      // End target position in right ruler rail
      const endX = railCenterX;
      // Stacking downwards vertically along the rail
      const endY = dockTopY + i * RAIL_LETTER_SPACING_PX;
      const endRot = -90; // Vertical orientation in rail
      const endScale = DOCKED_FONT_PX / fontPx;

      // Quadratic Bezier arc control point
      // Arcs outward toward the top-right corner before settling into the rail
      const ctrlX = (startX + endX) / 2 + ARC_OFFSET_PX * (1 - d * 0.4);
      const ctrlY = Math.min(startY, endY) - 35 * (1 - d);

      // Quadratic Bezier formula: B(t) = (1-d)^2*P0 + 2(1-d)d*P1 + d^2*P2
      const invD = 1 - d;
      const curX = invD * invD * startX + 2 * invD * d * ctrlX + d * d * endX;
      const curY = invD * invD * startY + 2 * invD * d * ctrlY + d * d * endY;
      const curRot = 0 + (endRot - 0) * d;
      const curScale = 1 + (endScale - 1) * d;

      // Apply transform relative to element's native resting point (startX, startY)
      const deltaX = curX - startX;
      const deltaY = curY - startY;

      el.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) rotate(${curRot.toFixed(2)}deg) scale(${curScale.toFixed(4)})`;

      // Interpolate styling: transition from bold hero display to crisp rail monospace
      if (d > 0.05) {
        el.style.color = d > 0.85 
          ? 'var(--accent, #2d81ff)' 
          : `color-mix(in srgb, var(--accent, #2d81ff) ${(d * 100).toFixed(0)}%, #ededed)`;
        el.style.textShadow = d > 0.5 
          ? '0 0 8px rgba(45, 129, 255, 0.5)' 
          : 'none';
        el.style.zIndex = '50';
      } else {
        el.style.color = '';
        el.style.textShadow = '';
        el.style.zIndex = '';
      }
    }
  }, []);

  // Set up listeners for scroll, resize, and font loading
  useEffect(() => {
    measure();

    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const sy = window.scrollY || window.pageYOffset || 0;
        applyScrollFrame(sy);
      });
    };

    const handleResize = () => {
      measure();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [measure, applyScrollFrame]);

  // Jump to top when clicking docked wordmark in ruler
  const handleJumpToHero = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div
      ref={containerRef}
      className="relative select-none"
      style={{
        contain: 'layout',
      }}
    >
      <h1
        role="heading"
        aria-level={1}
        aria-label="STUDIOFLOW"
        className="font-display font-black text-5xl sm:text-7xl lg:text-8xl uppercase tracking-tighter text-ink leading-none flex items-center flex-wrap"
      >
        {/* Animated Glyphs */}
        <span className="inline-flex items-center">
          {LETTERS.slice(0, 6).map((letter, idx) => (
            <span
              key={`letter-${idx}`}
              ref={(el) => (letterRefs.current[idx] = el)}
              className="inline-block text-center will-change-transform transform-gpu origin-center cursor-default"
              style={{
                fontKerning: 'normal',
                WebkitFontSmoothing: 'antialiased',
              }}
            >
              {letter}
            </span>
          ))}
        </span>

        {/* ArtCraft Signature Inline Typography Graphic Pill */}
        <span
          className="inline-block w-14 sm:w-20 lg:w-24 h-6 sm:h-9 lg:h-10 rounded-full align-middle bg-cover bg-center mx-2.5 sm:mx-3 border border-line-strong shadow-lg shrink-0 pointer-events-none transition-transform hover:scale-105"
          style={{
            backgroundImage:
              'radial-gradient(circle at 30% 30%, rgba(45, 129, 255, 0.4), transparent 70%), linear-gradient(135deg, #18181f 0%, #0a0a0c 100%)',
          }}
          aria-hidden="true"
        />

        {/* Remaining Glyphs */}
        <span className="inline-flex items-center">
          {LETTERS.slice(6).map((letter, idx) => {
            const actualIdx = 6 + idx;
            return (
              <span
                key={`letter-${actualIdx}`}
                ref={(el) => (letterRefs.current[actualIdx] = el)}
                className="inline-block text-center will-change-transform transform-gpu origin-center cursor-default"
                style={{
                  fontKerning: 'normal',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                {letter}
              </span>
            );
          })}
        </span>
      </h1>

      {/* Invisible Interactive Click Target over Docked Ruler Slot when Docked */}
      {isDocked && (
        <button
          type="button"
          onClick={handleJumpToHero}
          onMouseEnter={() => setIsHoveredDock(true)}
          onMouseLeave={() => setIsHoveredDock(false)}
          className="fixed z-50 cursor-pointer hidden md:block"
          style={{
            right: 0,
            top: '64px',
            width: `${RAIL_WIDTH_PX}px`,
            height: `${LETTERS.length * RAIL_LETTER_SPACING_PX + 16}px`,
            background: 'transparent',
            border: 'none',
          }}
          aria-label="Scroll back to Hero section"
          title="Jump to Hero"
        >
          {isHoveredDock && (
            <div className="absolute right-14 top-1/2 -translate-y-1/2 font-mono text-[9px] uppercase tracking-wider bg-bg-raised border border-line px-2 py-1 text-accent whitespace-nowrap shadow-xl pointer-events-none">
              Hero Section (Top)
            </div>
          )}
        </button>
      )}
    </div>
  );
}