'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/shop/ProductCard';
import { Product, Category } from '@/lib/types';
import { motion } from 'framer-motion';

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const urlCategory = searchParams.get('category');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(
    urlCategory ? parseInt(urlCategory) : null
  );
  const [sortOption, setSortOption] = useState<string>('Latest');

  useEffect(() => {
    const cat = searchParams.get('category');
    setSelectedCategory(cat ? parseInt(cat) : null);
  }, [searchParams]);

  // Load categories via server route
  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  // Build query string helper
  function buildQuery(p: number, category: number | null, sort: string) {
    const params = new URLSearchParams();
    params.set('per_page', '12');
    params.set('page', String(p));
    if (category) params.set('category', String(category));
    if (sort === 'Price: Low to High') { params.set('orderby', 'price'); params.set('order', 'asc'); }
    else if (sort === 'Price: High to Low') { params.set('orderby', 'price'); params.set('order', 'desc'); }
    else if (sort === 'Most Popular') { params.set('orderby', 'popularity'); }
    else { params.set('orderby', 'date'); params.set('order', 'desc'); }
    return params.toString();
  }

  // Fetch products via server route
  useEffect(() => {
    setLoading(true);
    fetch(`/api/products?${buildQuery(1, selectedCategory, sortOption)}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setProducts(list);
        setHasMore(list.length === 12);
        setPage(1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, sortOption]);

  const loadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    fetch(`/api/products?${buildQuery(nextPage, selectedCategory, sortOption)}`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          setHasMore(false);
        } else {
          setProducts(prev => [...prev, ...list]);
          setPage(nextPage);
          setHasMore(list.length === 12);
        }
      })
      .catch(() => setHasMore(false))
      .finally(() => setLoadingMore(false));
  };

  return (
    <div className="bg-bg min-h-screen">
      <div className="bg-blush bg-texture-1 py-16 text-center border-b border-blush-deep">
        <h1 className="font-heading italic text-[clamp(2.5rem,5vw,4rem)] text-dark mb-4">Shop All</h1>
        <p className="text-gray-500 font-body">Discover our complete collection of premium accessories</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${selectedCategory === null ? 'bg-brand-pink text-brand-dark' : 'border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark'}`}
            >
              All Products
            </button>
            {categories
              .filter(c => !['Uncategorized'].includes(c.name) && c.count > 0)
              .map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-6 py-2 rounded-full font-medium text-sm transition-colors ${selectedCategory === c.id ? 'bg-brand-pink text-brand-dark' : 'border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-dark'}`}
                >
                  {c.name}
                </button>
              ))}
          </div>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 bg-transparent border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-gold"
          >
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
            {products.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <p>No products found in this category.</p>
              </div>
            ) : (
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
            )}

            {hasMore && products.length > 0 && (
              <div className="mt-16 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-10 py-3 rounded-full border-2 border-brand-gold text-brand-gold font-medium hover:bg-brand-gold hover:text-brand-dark transition-colors disabled:opacity-50"
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

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <ShopContent />
    </Suspense>
  );
}
