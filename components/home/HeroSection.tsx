'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { useIsDesktop } from '@/hooks/useScrollAnimation';
import Link from 'next/link';

export default function HeroSection() {
  const [init, setInit] = useState(false);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (isDesktop) {
      initParticlesEngine(async (engine) => {
        await loadSlim(engine);
      }).then(() => {
        setInit(true);
      });
    }
  }, [isDesktop]);

  return (
    <section className="relative w-full h-[100vh] flex items-center justify-center overflow-hidden bg-dark -mt-[60px]">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1600)' }}
      />
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.6) 100%)' }} />

      {/* Particles */}
      {init && isDesktop && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-20 pointer-events-none"
          options={{
            fullScreen: { enable: false },
            particles: {
              color: { value: '#FBD4D9' },
              shape: { type: 'star' },
              opacity: { value: { min: 0.4, max: 0.8 } },
              size: { value: { min: 2, max: 4 } },
              move: { enable: true, speed: 0.8, direction: 'top', outModes: 'out' },
              number: { value: 40, density: { enable: true, width: 800, height: 800 } }
            }
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-30 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.p
          initial={isDesktop ? { opacity: 0, y: 20 } : false}
          animate={isDesktop ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-brand-gold tracking-[0.2em] text-xs md:text-sm font-medium mb-6 uppercase"
        >
          ✦ Premium Press-On Nails & Jewelry
        </motion.p>
        
        <motion.h1
          initial={isDesktop ? { opacity: 0, y: 30 } : false}
          animate={isDesktop ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-white font-heading italic text-5xl md:text-[clamp(3.5rem,8vw,7rem)] leading-tight mb-6"
        >
          Discover Your Gleam
        </motion.h1>

        <motion.p
          initial={isDesktop ? { opacity: 0, y: 20 } : false}
          animate={isDesktop ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="text-white/90 text-lg md:text-xl font-light mb-10 max-w-lg mx-auto"
        >
          Premium accessories for the modern woman
        </motion.p>

        <motion.div
          initial={isDesktop ? { opacity: 0, y: 20 } : false}
          animate={isDesktop ? { opacity: 1, y: 0 } : false}
          transition={{ delay: 1.1, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 w-full sm:w-auto"
        >
          <Link href="/shop" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-brand-pink text-brand-dark px-8 py-3 rounded-full font-medium hover:bg-brand-gold transition-all duration-300 hover:scale-105 hover:shadow-soft hover:text-white">
              Shop Collection
            </button>
          </Link>
          <Link href="/collections" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-transparent border-2 border-white text-white px-8 py-3 rounded-full font-medium hover:bg-white/15 transition-all duration-300 hover:scale-105">
              View Collections
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={isDesktop ? { opacity: 0 } : false}
          animate={isDesktop ? { opacity: 1 } : false}
          transition={{ delay: 1.4, duration: 0.7 }}
          className="text-white/80 text-sm tracking-wide"
        >
          COD • Free Shipping over ₨3,000 • 3-Day Delivery
        </motion.div>
      </div>

      {/* Scroll Hint */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 text-white/70"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </motion.div>
    </section>
  );
}
