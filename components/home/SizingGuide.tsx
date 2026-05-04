'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Download } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useScrollAnimation';
import AnimatedSection from '@/components/ui/AnimatedSection';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SizingGuide() {
  const isDesktop = useIsDesktop();
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDesktop && typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      if (imageRef.current) {
        gsap.to(imageRef.current, {
          scale: 1.05,
          ease: "none",
          scrollTrigger: {
            trigger: imageRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          }
        });
      }
    }
  }, [isDesktop]);

  return (
    <section className="py-24 bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Image Side */}
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-soft-lg group">
            <div ref={imageRef} className="absolute inset-0 w-full h-full">
              <Image
                src="https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800"
                alt="Perfect Fit Guide"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
            {/* Soft Overlay */}
            <div className="absolute inset-0 bg-gold/10" />
          </div>

          {/* Text Side */}
          <AnimatedSection className="flex flex-col items-start max-w-xl">
            <p className="text-gold tracking-[0.2em] text-sm font-medium mb-4 uppercase">
              Free Sizing Guide
            </p>
            <h2 className="font-heading italic text-[clamp(2.5rem,4vw,3.5rem)] text-dark leading-tight mb-6">
              Find Your Perfect Fit
            </h2>
            <p className="text-gray-600 font-body text-lg mb-8 leading-relaxed">
              Every hand is unique. We've created a simple, print-at-home guide to ensure your press-ons fit flawlessly on the very first try. Download our free sizing guide to measure your nails accurately from the comfort of your home.
            </p>
            
            <motion.a
              href="/sizing-guide.pdf"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="group flex items-center justify-center bg-brand-pink text-brand-dark px-8 py-4 rounded-full font-medium hover:bg-brand-gold transition-all duration-300 shadow-soft"
            >
              <motion.span
                className="mr-3"
                variants={{ hover: { y: [0, -3, 0], transition: { repeat: Infinity, duration: 1 } } }}
              >
                <Download size={20} />
              </motion.span>
              Download Sizing Guide (PDF)
            </motion.a>
          </AnimatedSection>

        </div>
      </div>
    </section>
  );
}
