import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    quote: "StudioFlow eliminated the existential blind spot between invoicing clients and maintaining runway. We knew 45 days in advance that our anchor retainer was slipping and restructured without panic.",
    author: "Elena Rostova",
    role: "Principal & Creative Director",
    studio: "Atelier Forma (London)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    metrics: "14-Day DSO Reduction"
  },
  {
    quote: "The Bad Day triage protocol is the single most valuable financial tool our studio has used. We cut our average payment turnaround from 38 days to 11 days by using the 50% split payment mechanism.",
    author: "Marcus Vance",
    role: "Managing Partner",
    studio: "Monoform Digital (Berlin)",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    metrics: "$48,000 Recovered"
  },
  {
    quote: "Zero subscription lock-in, total local data ownership, and instant runway calculations. It is what financial software for independent creatives should feel like: fast, sober, and uncompromised.",
    author: "Siobhan Reed",
    role: "Design Lead & Founder",
    studio: "Kanso Architecture & Identity",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80",
    metrics: "100% Sovereign Storage"
  }
];

export default function FeedbackCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prev = () => {
    setCurrentIndex((prevIdx) => (prevIdx === 0 ? TESTIMONIALS.length - 1 : prevIdx - 1));
  };

  const next = () => {
    setCurrentIndex((prevIdx) => (prevIdx === TESTIMONIALS.length - 1 ? 0 : prevIdx + 1));
  };

  const current = TESTIMONIALS[currentIndex];

  return (
    <div className="w-full card-spacex p-7 sm:p-10 relative overflow-hidden bg-[#0a0a0a] border border-[#3a3a3f]">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 md:gap-12 relative z-10">
        
        {/* Portraits Stack */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32">
            {TESTIMONIALS.map((t, idx) => {
              const isActive = idx === currentIndex;
              return (
                <div
                  key={idx}
                  className={`absolute inset-0 rounded-[8px] border overflow-hidden transition-all duration-300 ease-out grayscale ${
                    isActive
                      ? 'border-white z-20 scale-100 opacity-100'
                      : 'border-[#3a3a3f] z-10 scale-90 opacity-30 translate-x-3 translate-y-3'
                  }`}
                >
                  <img
                    src={t.avatar}
                    alt={t.author}
                    className="w-full h-full object-cover"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Testimonial Quote & Metadata */}
        <div className="flex-1 space-y-5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 micro-cap text-white border border-[#3a3a3f] px-3 py-1 rounded-[32px] bg-black">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            <span>Verified Impact:</span>
            <span className="text-white font-bold">{current.metrics}</span>
          </div>

          <p className="text-base sm:text-xl font-body text-white leading-relaxed">
            "{current.quote}"
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#3a3a3f]">
            <div>
              <h4 className="button-cap text-white">
                {current.author}
              </h4>
              <p className="text-xs text-[#5a5a5f] mt-0.5">
                {current.role} · <span className="text-[#f0f0fa]">{current.studio}</span>
              </p>
            </div>

            {/* Carousel Controls */}
            <div className="flex items-center justify-center md:justify-end gap-3">
              <button
                onClick={prev}
                aria-label="Previous testimonial"
                className="w-8 h-8 rounded-[32px] border border-[#3a3a3f] hover:border-white flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-2">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-1.5 rounded-none transition-all ${
                      i === currentIndex ? 'w-5 bg-white' : 'w-2 bg-[#3a3a3f]'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={next}
                aria-label="Next testimonial"
                className="w-8 h-8 rounded-[32px] border border-[#3a3a3f] hover:border-white flex items-center justify-center text-white transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
