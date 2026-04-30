'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, useMotionValue, animate } from 'framer-motion';
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
  "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400",
  "https://images.unsplash.com/photo-1604654894616-df63bc536371?w=400",
  "https://picsum.photos/seed/nail1/400/400",
  "https://picsum.photos/seed/nail2/400/400",
  "https://picsum.photos/seed/nail3/400/400",
  "https://picsum.photos/seed/nail4/400/400",
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
                className="min-w-[85vw] md:min-w-0 snap-center bg-white rounded-2xl shadow-soft border border-blush overflow-hidden flex flex-col"
              >
                <div className="bg-[#25D366] text-white px-4 py-3 flex items-center font-medium">
                  <div className="w-2 h-2 rounded-full bg-white mr-2" />
                  WhatsApp
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-dark">{review.name}</span>
                    <div className="text-gold tracking-tighter text-sm">★★★★★</div>
                  </div>
                  <p className="text-gray-600 leading-relaxed font-body">"{review.text}"</p>
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
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                <Image
                  src={src}
                  alt={`UGC ${i + 1}`}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-104"
                />
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold transition-colors duration-300 z-10" />
              </div>
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
          <div className="text-gold text-2xl mb-2 tracking-widest">★★★★★ <span className="font-heading font-medium">4.9 / 5</span></div>
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
