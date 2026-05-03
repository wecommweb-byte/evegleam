'use client';
import { useRef, useEffect } from 'react';
import { Hand, PenLine, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useScrollAnimation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function HowItWorks() {
  const isDesktop = useIsDesktop();
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDesktop && typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top center+=100",
              end: "center center",
              scrub: 1,
            }
          }
        );
      }
    }
  }, [isDesktop]);

  const steps = [
    { icon: Hand, title: "1. Select", desc: "Browse our curated collection and pick your style" },
    { icon: PenLine, title: "2. Personalize", desc: "Choose your size using our free sizing guide" },
    { icon: Sparkles, title: "3. Gleam", desc: "Apply in minutes and shine all day" }
  ];

  return (
    <section ref={sectionRef} className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark">How It Works</h2>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          {isDesktop && (
            <div 
              ref={lineRef}
              className="absolute top-[32px] left-[20%] right-[20%] h-[2px] origin-left"
              style={{
                background: 'repeating-linear-gradient(90deg, #e96789 0px, #e96789 8px, transparent 8px, transparent 18px)'
              }}
            />
          )}

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-6 relative z-10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{ visible: { transition: { staggerChildren: 0.3 } } }}
          >
            {steps.map((step, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: isDesktop ? 30 : 0 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center text-white shadow-gold-lg">
                    <step.icon size={28} />
                  </div>
                  {/* Small circle badge */}
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-dark text-white rounded-full flex items-center justify-center text-xs font-bold font-body">
                    {i + 1}
                  </div>
                </div>
                <h3 className="font-heading italic text-2xl text-dark mb-3">{step.title}</h3>
                <p className="font-body text-gray-500 max-w-xs">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
