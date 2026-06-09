'use client';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useScrollAnimation';
import Link from 'next/link';

const bundles = [
  { id: 1, title: "Basic Bundle", price: "Rs. 2,999", desc: "Choose any 4 nail sets from our full collection", popular: false },
  { id: 2, title: "Bridal Bundle", price: "Rs. 4,999", desc: "Perfect for brides and special occasions", popular: false },
  { id: 3, title: "Gift Bundle", price: "Rs. 5,499", desc: "Choose 4 sets + get 1 FREE random set as a gift 🎁", popular: true },
];

export default function BundleAndSave() {
  const isDesktop = useIsDesktop();

  return (
    <section className="py-24 bg-blush bg-texture-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark">Bundle & Save</h2>
          <p className="text-gray-500 font-body mt-4">Pick any 4 nail sets and save big</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {bundles.map((bundle, i) => (
            <motion.div
              key={bundle.id}
              variants={{
                hidden: { opacity: 0, y: isDesktop ? 40 : 0 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={isDesktop ? { y: -8, boxShadow: "0 24px 60px rgba(201,149,107,0.25)" } : undefined}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative bg-white rounded-2xl border-2 border-gold p-8 text-center flex flex-col items-center overflow-hidden"
            >
              {bundle.popular && (
                <div className="absolute top-6 -right-10 bg-brand-gold text-white text-xs font-bold px-10 py-1 rotate-45 transform origin-center shadow-sm">
                  MOST POPULAR
                </div>
              )}

              <h3 className="font-heading italic text-2xl text-dark mb-3 mt-4">{bundle.title}</h3>
              <div className="font-heading font-bold text-3xl text-brand-dark mb-3">{bundle.price}</div>
              <p className="text-gray-500 font-body mb-8 flex-1 text-sm">{bundle.desc}</p>

              <Link href="/bundles" className="w-full">
                <button className="w-full bg-brand-pink text-brand-dark rounded-full py-3 font-medium hover:bg-brand-gold hover:text-white transition-colors duration-300">
                  Build My Bundle
                </button>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <div className="text-center mt-12">
          <Link href="/bundles">
            <button className="px-10 py-3 rounded-full border-2 border-brand-gold text-brand-gold font-medium hover:bg-brand-gold hover:text-white transition-colors duration-300">
              View All Bundles
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
