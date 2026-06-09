'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from '@/components/shop/ProductCard';
import { Product } from '@/lib/types';
import Link from 'next/link';

export default function BestSellers() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        // Fetch via server routes to avoid CORS on Vercel
        const [fRes, recentRes] = await Promise.all([
          fetch('/api/products?featured=true&per_page=8'),
          fetch('/api/products?per_page=8&orderby=date&order=desc'),
        ]);
        const [fData, recent] = await Promise.all([fRes.json(), recentRes.json()]);

        const mostLoved: Product[] = fData?.length ? fData : recent;

        const bsRes = await fetch('/api/products?per_page=4&offset=8&orderby=date&order=desc');
        const bsData = await bsRes.json();
        const bestSellersData: Product[] = bsData?.length ? bsData : (recent?.slice(4, 8) ?? []);

        if (!mostLoved?.length && !bestSellersData?.length) {
          setError(true);
        } else {
          setFeatured(mostLoved ?? []);
          setBestSellers(bestSellersData ?? []);
        }
      } catch (e) {
        console.warn('BestSellers fetch error:', e);
        setError(true);
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

  if (error) return null; // silently hide if API is down — don't show fake data

  return (
    <section className="py-20 bg-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Most Loved */}
        <div className="mb-24">
          <h2 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark text-center mb-12">Our Most Loved</h2>
          {loading ? <Skeleton /> : featured.length > 0 ? (
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
          ) : null}
          <div className="mt-12 text-center">
            <Link href="/shop">
              <button className="px-8 py-3 rounded-full border-2 border-brand-gold text-brand-gold font-medium hover:bg-brand-gold hover:text-brand-dark transition-colors duration-300">
                View All Products
              </button>
            </Link>
          </div>
        </div>

        {/* Best Sellers */}
        {(loading || bestSellers.length > 0) && (
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
        )}

      </div>
    </section>
  );
}
