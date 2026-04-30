'use client';
import { Star, Truck, Leaf, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useScrollAnimation';

const cards = [
  { icon: Star, title: "Premium Quality", desc: "Handcrafted with care, every time" },
  { icon: Truck, title: "Free Shipping", desc: "On all orders above ₨3,000" },
  { icon: Leaf, title: "Eco-Friendly", desc: "Sustainable materials, guilt-free glam" },
  { icon: Gift, title: "Gift Ready", desc: "Beautifully packaged for gifting" },
];

export default function ValueProps() {
  const isDesktop = useIsDesktop();

  return (
    <section className="py-20 bg-blush">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark">Why Eve Gleam</h2>
        </div>

        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: isDesktop ? 50 : 0 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
              }}
              whileHover={isDesktop ? { y: -6, boxShadow: "0 16px 40px rgba(201,149,107,0.2)" } : undefined}
              className="bg-white rounded-2xl p-6 text-center shadow-soft flex flex-col items-center transition-shadow"
            >
              <motion.div 
                whileHover={isDesktop ? { rotate: 10, scale: 1.1 } : undefined}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="w-14 h-14 bg-gold rounded-full flex items-center justify-center text-white mb-6"
              >
                <card.icon size={24} />
              </motion.div>
              <h3 className="font-body font-semibold text-dark mb-2">{card.title}</h3>
              <p className="font-body text-sm text-gray-500">{card.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
