'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  { q: "What is the Essentials Set?", a: "Our Essentials Set includes our 5 most popular nail styles bundled at 20% off. Perfect for first-time buyers wanting variety." },
  { q: "How many times can I reuse the nails?", a: "With proper care, our press-ons can be reused 8–10+ times. Remove gently, clean with isopropyl alcohol, and store in the original box." },
  { q: "Do you offer Cash on Delivery?", a: "Yes! COD is available across all major Pakistani cities including Lahore, Karachi, Islamabad, Faisalabad, and more." },
  { q: "What if the size doesn't fit?", a: "We offer free size exchanges within 7 days of delivery. Use our sizing guide before ordering for the best first-time fit." },
  { q: "How long does delivery take?", a: "Standard delivery: 2–4 business days nationwide. Express delivery (1–2 days) available for Lahore, Karachi, and Islamabad." },
  { q: "Is glue included or do I use tabs?", a: "Every set includes adhesive tabs. Nail glue is available as an add-on at checkout for longer-lasting wear." },
  { q: "Are these safe for weak or thin nails?", a: "Absolutely. We recommend adhesive tabs for sensitive nails — they bond securely without damaging the natural nail." },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-[750px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <div key={i} className="border-b border-blush">
                <button
                  onClick={() => toggleFAQ(i)}
                  className="w-full text-left py-6 flex justify-between items-center focus:outline-none"
                >
                  <span className="font-body font-medium text-lg text-dark pr-8">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: isOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-brand-gold text-2xl"
                  >
                    +
                  </motion.span>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: 'easeInOut' }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="faq-answer">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
