'use client';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useScrollAnimation';

const bundles = [
  { id: 1, title: "The Essentials Set", discount: "20% OFF", desc: "Gleam with quality and style", popular: false },
  { id: 2, title: "The Bridal Bundle", discount: "20% OFF", desc: "Perfect for your special day", popular: false },
  { id: 3, title: "The Gift Box", discount: "30% OFF", desc: "A gift she'll never forget", popular: true },
];

export default function BundleAndSave() {
  const isDesktop = useIsDesktop();

  return (
    <section className="py-24 bg-blush">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark">Bundle & Save</h2>
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
                <div className="absolute top-6 -right-10 bg-gold text-white text-xs font-bold px-10 py-1 rotate-45 transform origin-center shadow-sm">
                  MOST POPULAR
                </div>
              )}
              
              <h3 className="font-heading italic text-2xl text-dark mb-4 mt-4">{bundle.title}</h3>
              <div className="font-heading font-bold text-4xl text-gold mb-4">{bundle.discount}</div>
              <p className="text-gray-500 font-body mb-8 flex-1">{bundle.desc}</p>
              
              <button className="w-full bg-gold text-white rounded-full py-3 font-medium hover:bg-gold-deep transition-colors duration-300">
                Buy Now
              </button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
