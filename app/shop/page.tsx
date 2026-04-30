'use client';
import { useEffect, useState } from 'react';
import { getProducts, getCategories } from '@/lib/woocommerce';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/lib/types';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Actually Next.js 14 requires Suspense for useSearchParams, so we will use basic client state for simplicity or skip it for this component and fetch normally.

  useEffect(() => {
    async function init() {
      try {
        const [pData, cData] = await Promise.all([
          getProducts({ per_page: 12, page: 1 }),
          getCategories()
        ]);
        
        // Fallback mockup
        const mockP = Array.from({ length: 12 }).map((_, i) => ({
          id: i, slug: `product-${i}`, name: `Premium Style ${i+1}`, price: "2500", images: []
        })) as unknown as Product[];
        const mockC = [
          { id: 1, name: 'Press-On Nails', slug: 'nails', count: 12 },
          { id: 2, name: 'Rings', slug: 'rings', count: 8 },
          { id: 3, name: 'Necklaces', slug: 'necklaces', count: 5 },
        ] as Category[];

        setProducts(pData.length ? pData : mockP);
        setCategories(cData.length ? cData : mockC);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const moreProducts = await getProducts({ per_page: 12, page: nextPage });
      if (moreProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts(prev => [...prev, ...moreProducts]);
        setPage(nextPage);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="bg-bg min-h-screen">
      {/* Hero Bar */}
      <div className="bg-blush py-16 text-center border-b border-blush-deep">
        <h1 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark mb-4">Shop All</h1>
        <p className="text-gray-500 font-body">Discover our complete collection of premium accessories</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="px-6 py-2 rounded-full bg-gold text-white font-medium text-sm transition-colors">
              All Products
            </button>
            {categories.map(c => (
              <button key={c.id} className="px-6 py-2 rounded-full border border-gold text-gold font-medium text-sm hover:bg-gold hover:text-white transition-colors">
                {c.name}
              </button>
            ))}
          </div>
          
          <select className="px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gold">
            <option>Latest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Popular</option>
          </select>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col h-[350px] bg-white rounded-2xl p-4">
                <div className="bg-blush rounded-xl aspect-square w-full mb-4" />
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="mt-auto h-10 bg-blush-deep rounded-full w-full" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            >
              {products.map((p, i) => (
                <ProductCard key={`${p.id}-${i}`} product={p} index={i} />
              ))}
            </motion.div>

            {hasMore && (
              <div className="mt-16 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-10 py-3 rounded-full border-2 border-gold text-gold font-medium hover:bg-gold hover:text-white transition-colors disabled:opacity-50"
                >
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
