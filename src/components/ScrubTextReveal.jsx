import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ScrubTextReveal({
  statement = "Independent studios should never have to guess their survival horizon. StudioFlow converts volatile, delayed receivables into deterministic runway mathematics.",
  tagline = "Runway Clarity"
}) {
  const containerRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (wordsRef.current.length > 0) {
        gsap.fromTo(
          wordsRef.current,
          { opacity: 0.15, y: 4 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.05,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 80%',
              end: 'bottom 45%',
              scrub: 0.8,
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const words = statement.split(' ');

  return (
    <div 
      ref={containerRef}
      className="w-full py-24 sm:py-32 border-y border-[#3a3a3f] bg-black px-4 sm:px-8 text-center flex flex-col items-center justify-center relative overflow-hidden"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <span className="micro-cap text-white font-bold tracking-[1.6px] border border-[#3a3a3f] px-3.5 py-1 rounded-[32px] bg-[#0a0a0a]">
          {tagline}
        </span>

        <p className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-white tracking-[0.96px] leading-[1.25] max-w-4xl mx-auto">
          {words.map((word, i) => (
            <span
              key={i}
              ref={(el) => (wordsRef.current[i] = el)}
              className="inline-block mr-2.5 sm:mr-3.5"
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
