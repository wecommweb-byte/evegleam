'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, animate } from 'framer-motion';
import { Instagram } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useScrollAnimation';
import AnimatedSection from '@/components/ui/AnimatedSection';

const reviews = [
  {
    name: "Ayesha K.",
    text: "Absolutely love my order! The nails fit perfectly and lasted over 2 weeks. Will definitely reorder! 🌸",
    stars: 5
  },
  {
    name: "Fatima R.",
    text: "Delivery was so fast — arrived in 2 days to Lahore. The packaging is so pretty, I gifted it to my bestie!",
    stars: 5
  },
  {
    name: "Sana M.",
    text: "Best press-ons I've tried in Pakistan. The sizing guide helped me get the perfect fit on the first try ✨",
    stars: 5
  }
];

const images = [
  "/ig-1.jpg",
  "/ig-2.jpg",
  "/ig-3.jpeg",
  "/ig-4.jpeg",
  "/ig-5.webp",
  "/ig-6.jpg"
];

function Counter({ from, to }: { from: number; to: number }) {
  const count = useMotionValue(from);
  const [display, setDisplay] = useState(from);

  useEffect(() => {
    const controls = animate(count, to, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (value) => setDisplay(Math.floor(value)),
    });
    return controls.stop;
  }, [count, to]);

  return <span>{display}</span>;
}

export default function SocialProof() {
  const isDesktop = useIsDesktop();

  return (
    <section className="py-24 bg-bg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* WhatsApp Reviews */}
        <div className="mb-24">
          <h2 className="font-heading italic text-[clamp(2.5rem,4vw,3.5rem)] text-dark text-center mb-12">Real Women, Real Gleam</h2>
          
          <motion.div 
            className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto snap-x snap-mandatory pb-8 md:pb-0 hide-scrollbar"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: isDesktop ? 30 : 0 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
                }}
                className="min-w-[85vw] md:min-w-0 snap-center bg-white rounded-2xl shadow-soft border border-brand-pink overflow-hidden flex flex-col"
              >
                <div className="bg-[#25D366] text-white px-4 py-3 flex items-center font-medium">
                  <div className="w-2 h-2 rounded-full bg-white mr-2" />
                  WhatsApp
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-dark">{review.name}</span>
                    <div className="text-brand-gold tracking-tighter text-sm">★★★★★</div>
                  </div>
                  <p className="text-brand-dark/80 leading-relaxed font-body">"{review.text}"</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* UGC Grid */}
        <AnimatedSection className="mb-24">
          <h2 className="font-heading italic text-3xl text-dark text-center mb-10">Follow the Gleam</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {images.map((src, i) => (
              <a 
                href="https://www.instagram.com/evegleam_nails/" 
                target="_blank" 
                rel="noopener noreferrer"
                key={i} 
                className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer block"
              >
                <Image
                  src={src}
                  alt={`Instagram Post ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                />
                <div className="absolute inset-0 bg-dark/0 group-hover:bg-dark/20 transition-colors duration-300 z-10 flex items-center justify-center">
                  <Instagram className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-8 h-8" />
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand-gold transition-colors duration-300 z-20 pointer-events-none" />
              </a>
            ))}
          </div>
        </AnimatedSection>

        {/* Trust Counter */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0, scale: 0.9 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut" } }
          }}
          className="text-center"
        >
          <div className="text-brand-gold text-2xl mb-2 tracking-widest">★★★★★ <span className="font-heading font-medium">4.9 / 5</span></div>
          <p className="text-xl text-dark font-body font-medium">
            Loved by <Counter from={0} to={500} />+ women across Pakistan
          </p>
        </motion.div>

      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </section>
  );
}
