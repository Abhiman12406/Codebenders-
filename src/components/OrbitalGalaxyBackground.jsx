import React, { useEffect, useRef } from 'react';

/**
 * OrbitalGalaxyBackground - ArtCraft Signature Three.js Galaxy Re-creation
 *
 * Recreates the multi-armed Archimedean cosmic spiral vortex from getartcraft.com:
 * - 6 Archimedean spiral arms with continuous -50°/min retrograde spin
 * - 16 gauge tick marks straddling the outer half of each arm
 * - 3 concentric dashed orbital boundary rings in 3D perspective
 * - Orbiting luminous particle energy pulses in ArtCraft palette:
 *   Mint Green (#2fd39c), Electric Blue (#2d81ff), Lilac (#c08fff), Amber (#ffb347)
 * - 6 floating drifting StudioFlow app squircles / monograms revolving along the arms
 * - Interactive mouse parallax and scroll scrubbing
 * - High-DPI canvas rendering with keep-out alpha mask for central hero typography
 */
export default function OrbitalGalaxyBackground() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    // Mouse coordinates relative to center (-1 to 1)
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetMouseX = x * 2;
      targetMouseY = y * 2;
    };

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    handleResize();

    // Galaxy Mathematical Constants (matching ArtCraft tunables)
    const ARMS = 6;
    const TURNS = 1.05;
    const THETA_MAX = TURNS * 2 * Math.PI;
    const TICKS_PER_ARM = 16;
    const SPIN_SPEED = (-50 * (Math.PI / 180)) / 60; // -50 deg/min in rad/sec
    const TILT_Y = 0.52; // Vertical 3D perspective compression

    // Palette
    const ARM_COLORS = [
      { main: '#2d81ff', pulse: '#60a5fa', glow: 'rgba(45, 129, 255, 0.45)' }, // Electric Blue
      { main: '#2fd39c', pulse: '#4ade80', glow: 'rgba(47, 211, 156, 0.45)' }, // Mint Green
      { main: '#c08fff', pulse: '#d8b4fe', glow: 'rgba(192, 143, 255, 0.45)' }, // Lilac Purple
      { main: '#ffb347', pulse: '#fcd34d', glow: 'rgba(255, 179, 71, 0.45)' }, // Amber Orange
      { main: '#2d81ff', pulse: '#60a5fa', glow: 'rgba(45, 129, 255, 0.45)' }, // Electric Blue
      { main: '#2fd39c', pulse: '#4ade80', glow: 'rgba(47, 211, 156, 0.45)' }, // Mint Green
    ];

    // Floating StudioFlow App Badges on the spiral arms
    const BADGES = [
      { label: 'SF MONO', code: 'SF', arm: 0, slot: 0.38, color: '#2d81ff' },
      { label: 'RUNWAY RADAR', code: '94D', arm: 1, slot: 0.62, color: '#2fd39c' },
      { label: 'WHAT-IF SIM', code: 'SIM', arm: 2, slot: 0.48, color: '#ffb347' },
      { label: 'AR AGING 90D', code: 'AR', arm: 3, slot: 0.74, color: '#c08fff' },
      { label: 'DEFICIT GUARD', code: 'TRIAGE', arm: 4, slot: 0.55, color: '#f43f5e' },
      { label: 'WHATSAPP CHASE', code: 'WA', arm: 5, slot: 0.82, color: '#2fd39c' },
    ];

    let startTime = performance.now();

    const render = (now) => {
      animationFrameId = requestAnimationFrame(render);
      if (!ctx || width === 0 || height === 0) return;

      const elapsed = (now - startTime) / 1000;

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      const scrollY = window.scrollY || 0;
      const scrollScrub = (scrollY * 0.0003); // Scrubbing along arms on scroll

      // Center with mouse parallax
      const cx = width / 2 + mouseX * 22;
      const cy = height * 0.44 + mouseY * 14;
      const rMax = Math.max(width, height) * 0.68;
      const birthR = rMax * 0.08;
      const b = (rMax - birthR) / THETA_MAX;

      // Continuous spin
      const spin = elapsed * SPIN_SPEED + scrollScrub;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // 1. Concentric Dashed Orbital Boundary Rings
      const orbitalRadii = [rMax * 0.34, rMax * 0.56, rMax * 0.84];
      orbitalRadii.forEach((r, idx) => {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * TILT_Y, 0, 0, Math.PI * 2);
        ctx.strokeStyle = idx === 1 ? 'rgba(255, 255, 255, 0.09)' : 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.setLineDash(idx === 1 ? [4, 12] : [2, 16]);
        ctx.stroke();
      });
      ctx.setLineDash([]); // Reset dash

      // 2. Archimedean Spiral Arms and Gauged Ticks
      for (let arm = 0; arm < ARMS; arm++) {
        const armBaseAngle = (arm * 2 * Math.PI) / ARMS;
        const colorSet = ARM_COLORS[arm];

        // Draw Spiral Arm Ribbon
        ctx.beginPath();
        const steps = 140;
        for (let s = 0; s <= steps; s++) {
          const t = (s / steps) * THETA_MAX;
          const r = birthR + b * t;
          const angle = t + armBaseAngle + spin;
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle) * TILT_Y;

          if (s === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        // Arm gradient stroke
        const grad = ctx.createLinearGradient(
          cx,
          cy,
          cx + rMax * Math.cos(armBaseAngle + spin),
          cy + rMax * Math.sin(armBaseAngle + spin) * TILT_Y
        );
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.01)');
        grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.06)');
        grad.addColorStop(0.6, `${colorSet.main}22`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.25;
        ctx.stroke();

        // Draw Straddling Ticks along Outer Half of Arm
        for (let k = 0; k < TICKS_PER_ARM; k++) {
          const tFrac = 0.44 + (0.54 * (k + 0.5)) / TICKS_PER_ARM;
          const t = tFrac * THETA_MAX;
          const r = birthR + b * t;
          const angle = t + armBaseAngle + spin;

          const cosA = Math.cos(angle);
          const sinA = Math.sin(angle);

          // Normal direction to arm tangent
          const tickLen = k % 4 === 0 ? 9 : 5;
          const x1 = cx + (r - tickLen) * cosA;
          const y1 = cy + (r - tickLen) * sinA * TILT_Y;
          const x2 = cx + (r + tickLen) * cosA;
          const y2 = cy + (r + tickLen) * sinA * TILT_Y;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = k % 4 === 0 ? 'rgba(255, 255, 255, 0.22)' : 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 3. Orbiting Energy Pulse Nodes
        const pulsesPerArm = 2;
        for (let p = 0; p < pulsesPerArm; p++) {
          const pulseOffset = p / pulsesPerArm;
          const pulseCycle = (elapsed * 0.16 + pulseOffset + arm * 0.08) % 1;
          const pulseTheta = (0.12 + pulseCycle * 0.85) * THETA_MAX;
          const pulseR = birthR + b * pulseTheta;
          const pulseAngle = pulseTheta + armBaseAngle + spin;

          const px = cx + pulseR * Math.cos(pulseAngle);
          const py = cy + pulseR * Math.sin(pulseAngle) * TILT_Y;

          // Pulse glow aura
          const auraGrad = ctx.createRadialGradient(px, py, 0, px, py, 14);
          auraGrad.addColorStop(0, colorSet.glow);
          auraGrad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.arc(px, py, 14, 0, Math.PI * 2);
          ctx.fillStyle = auraGrad;
          ctx.fill();

          // Pulse bright center dot
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = colorSet.pulse;
          ctx.shadowColor = colorSet.main;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      }

      // 4. Floating StudioFlow App Squircles / Monograms
      BADGES.forEach((badge) => {
        const armBaseAngle = (badge.arm * 2 * Math.PI) / ARMS;
        const wobble = Math.sin(elapsed * 1.5 + badge.arm) * 4;

        // Position along the spiral
        const t = badge.slot * THETA_MAX;
        const r = birthR + b * t + wobble;
        const angle = t + armBaseAngle + spin;

        const bx = cx + r * Math.cos(angle);
        const by = cy + r * Math.sin(angle) * TILT_Y;

        // Draw card background
        const cardW = 54;
        const cardH = 22;
        const cornerR = 3;

        ctx.save();
        ctx.translate(bx, by);

        // Keep cards readable (slight counter-tilt)
        ctx.fillStyle = 'rgba(18, 19, 24, 0.88)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
        ctx.lineWidth = 1;

        // Squircle box
        ctx.beginPath();
        ctx.roundRect(-cardW / 2, -cardH / 2, cardW, cardH, cornerR);
        ctx.fill();
        ctx.stroke();

        // Glowing mini status dot
        ctx.beginPath();
        ctx.arc(-cardW / 2 + 8, 0, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = badge.color;
        ctx.shadowColor = badge.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Monospace text label
        ctx.font = '600 8px "Geist Mono", monospace';
        ctx.fillStyle = '#f3f4f6';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badge.code, -cardW / 2 + 15, 0);

        ctx.restore();
      });

      // 5. Central Keep-out Radial Falloff
      // Ensures the main headline text remains completely crisp and unobstructed
      const centerHoleGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rMax * 0.42);
      centerHoleGrad.addColorStop(0, 'rgba(16, 16, 20, 0.85)');
      centerHoleGrad.addColorStop(0.5, 'rgba(16, 16, 20, 0.45)');
      centerHoleGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = centerHoleGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rMax * 0.42, rMax * 0.42 * TILT_Y, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
