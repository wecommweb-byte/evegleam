'use client';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useIsDesktop } from '@/hooks/useScrollAnimation';

const categories = [
  {
    name: 'Campus Cuties',
    image: '/cat-campus-cuties.png',
    href: '/collections/campus-cuties',
  },
  {
    name: 'Vanilla Days',
    image: '/cat-vanilla-days.png',
    href: '/collections/vanilla-days',
  },
  {
    name: 'The Statement',
    image: '/cat-the-statement.png',
    href: '/collections/the-statement',
  },
  {
    name: 'Bridal Couture',
    image: '/cat-bridal-couture.png',
    href: '/collections/bridal-couture',
  },
];

export default function ShopByCategory() {
  const isDesktop = useIsDesktop();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark">
            Shop By Category
          </h2>
          <p className="font-body text-gray-500 mt-3 text-base">
            Find your perfect style
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: isDesktop ? 40 : 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: 'easeOut' }}
              className="flex flex-col items-center gap-4"
            >
              <Link href={cat.href} className="group flex flex-col items-center gap-4 w-full">
                <motion.div
                  whileHover={isDesktop ? { scale: 1.06 } : undefined}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden ring-4 ring-[#c9956b]/30 shadow-lg group-hover:ring-[#c9956b]/70 transition-all duration-300"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 144px, (max-width: 768px) 176px, 192px"
                  />
                </motion.div>
                <span className="font-heading italic text-lg sm:text-xl text-dark group-hover:text-[#c9956b] transition-colors duration-300 text-center">
                  {cat.name}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
