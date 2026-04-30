'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProducts } from '@/lib/woocommerce';
import ProductCard from '@/components/shop/ProductCard';
import { Product } from '@/lib/types';
import Link from 'next/link';

export default function BestSellers() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        let [fData, bData] = await Promise.all([
          getProducts({ featured: true, per_page: 8 }),
          getProducts({ tag: 'best-seller', per_page: 4 })
        ]);

        // If they don't have featured/tagged products set up yet, just pull recent products
        if (!fData || fData.length === 0) {
          fData = await getProducts({ per_page: 8 });
        }
        if (!bData || bData.length === 0) {
          bData = await getProducts({ per_page: 4, offset: 8 }); // get the next 4
        }

        // Fallbacks if the store is completely empty
        const mockProducts = Array.from({ length: 8 }).map((_, i) => ({
          id: i, slug: `product-${i}`, name: `Luxury Nail Set ${i+1}`, price: "2500", images: []
        })) as unknown as Product[];
        
        setFeatured(fData && fData.length ? fData : mockProducts);
        setBestSellers(bData && bData.length ? bData : mockProducts.slice(0, 4));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const Skeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse flex flex-col h-[350px] bg-white rounded-2xl p-4">
          <div className="bg-blush rounded-xl aspect-square w-full mb-4" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
          <div className="mt-auto h-10 bg-blush-deep rounded-full w-full" />
        </div>
      ))}
    </div>
  );

  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Most Loved */}
        <div className="mb-24">
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark text-center mb-12">Our Most Loved</h2>
          {loading ? <Skeleton /> : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
            >
              {featured.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </motion.div>
          )}
          <div className="mt-12 text-center">
            <Link href="/shop">
              <button className="px-8 py-3 rounded-full border-2 border-gold text-gold font-medium hover:bg-gold hover:text-white transition-colors duration-300">
                View All Products
              </button>
            </Link>
          </div>
        </div>

        {/* Best Sellers */}
        <div>
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark text-center mb-12">Best Sellers</h2>
          {loading ? <Skeleton /> : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8"
            >
              {bestSellers.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}
