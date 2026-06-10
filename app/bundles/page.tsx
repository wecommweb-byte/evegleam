'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag, Gift, Star, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';

const BUNDLES = [
  {
    id: 1000074,
    slug: 'basic-bundle',
    key: 'basic',
    name: 'Basic Bundle',
    price: 2999,
    tagline: 'Perfect Everyday Glam',
    description: 'Choose any 4 nail sets from our full collection.',
    badge: null,
    color: 'from-pink-50 to-rose-50',
    ring: 'ring-brand-pink',
    icon: Star,
  },
  {
    id: 1000075,
    slug: 'bridal-bundle',
    key: 'bridal',
    name: 'Bridal Bundle',
    price: 4999,
    tagline: 'For Your Special Day',
    description: 'Choose any 4 nail sets from our full collection.',
    badge: 'Most Popular',
    color: 'from-amber-50 to-yellow-50',
    ring: 'ring-brand-gold',
    icon: Star,
  },
  {
    id: 1000076,
    slug: 'gift-bundle',
    key: 'gift',
    name: 'Gift Bundle',
    price: 5499,
    tagline: 'The Ultimate Gift',
    description: 'Choose any 4 nail sets + get 1 FREE random set as a surprise gift!',
    badge: '+1 FREE Set',
    color: 'from-purple-50 to-pink-50',
    ring: 'ring-purple-400',
    icon: Gift,
  },
];

function BundlesContent() {
  const [selectedBundle, setSelectedBundle] = useState<typeof BUNDLES[0] | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedNails, setSelectedNails] = useState<any[]>([]);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart, openCart } = useCart();

  useEffect(() => {
    if (!selectedBundle) return;
    setSelectedNails([]);
    setLoadingProducts(true);
    // Fetch all regular products (exclude bundles by tag or just fetch all)
    const fetchAll = async () => {
      try {
        const pages = await Promise.all([1, 2, 3].map(page =>
          fetch(`/api/products?page=${page}&per_page=50`).then(r => r.json())
        ));
        const all: any[] = pages.flat();
        // Filter out the bundle products themselves
        const filtered = all.filter((p: any) =>
          !['basic-bundle', 'bridal-bundle', 'gift-bundle'].includes(p.slug) &&
          p.images?.length > 0
        );
        setProducts(filtered);
      } catch {
        setProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchAll();
  }, [selectedBundle]);

  const toggleNail = (product: any) => {
    setSelectedNails(prev => {
      const already = prev.find(p => p.id === product.id);
      if (already) return prev.filter(p => p.id !== product.id);
      if (prev.length >= 4) return prev;
      return [...prev, product];
    });
  };

  const handleAddToCart = () => {
    if (!selectedBundle || selectedNails.length !== 4) return;
    const nailNames = selectedNails.map(n => n.name).join(', ');
    const variation = `Selected Sets: ${nailNames}`;
    addToCart({
      id: selectedBundle.id,
      slug: selectedBundle.slug,
      name: selectedBundle.name,
      price: selectedBundle.price,
      quantity: 1,
      image: selectedNails[0]?.images?.[0]?.src || '',
      variation,
    });
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [String(selectedBundle.id)],
        content_type: 'product',
        value: selectedBundle.price,
        currency: 'PKR',
      });
    }
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      openCart();
    }, 1000);
  };

  return (
    <div className="bg-bg min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-blush bg-texture-1 py-20 text-center border-b border-blush-deep px-4">
        <p className="text-brand-gold tracking-[0.2em] text-xs font-medium mb-4 uppercase">✦ Build Your Bundle</p>
        <h1 className="font-heading italic text-[clamp(2.5rem,5vw,4.5rem)] text-dark mb-4">
          Mix, Match & Save
        </h1>
        <p className="text-gray-600 font-body max-w-xl mx-auto text-lg">
          Pick your bundle, choose any 4 nail sets you love, and we&apos;ll pack them beautifully for you.
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Step 1: Choose Bundle */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center text-brand-dark font-bold text-sm">1</div>
            <h2 className="font-heading italic text-3xl text-dark">Choose Your Bundle</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BUNDLES.map((bundle) => {
              const isSelected = selectedBundle?.key === bundle.key;
              return (
                <motion.div
                  key={bundle.key}
                  whileHover={{ y: -4 }}
                  onClick={() => { setSelectedBundle(bundle); setSelectedNails([]); }}
                  className={`relative cursor-pointer rounded-2xl p-6 bg-gradient-to-br ${bundle.color} border-2 transition-all duration-300 ${
                    isSelected ? `${bundle.ring} ring-2 border-transparent shadow-lg` : 'border-blush hover:border-brand-pink/50'
                  }`}
                >
                  {bundle.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                      {bundle.badge}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-brand-gold rounded-full flex items-center justify-center">
                      <Check size={14} className="text-white" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-gray-500 text-sm font-body mb-1">{bundle.tagline}</p>
                    <h3 className="font-heading italic text-2xl text-dark mb-2">{bundle.name}</h3>
                    <p className="text-3xl font-bold text-brand-dark mb-3">
                      Rs. {bundle.price.toLocaleString()}
                    </p>
                    <p className="text-gray-600 text-sm font-body">{bundle.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Pick Nail Sets */}
        <AnimatePresence>
          {selectedBundle && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-brand-pink rounded-full flex items-center justify-center text-brand-dark font-bold text-sm">2</div>
                <h2 className="font-heading italic text-3xl text-dark">Pick Your 4 Nail Sets</h2>
              </div>

              {/* Sticky selection counter */}
              <div className="sticky top-[60px] z-20 bg-white/90 backdrop-blur border border-blush rounded-2xl px-6 py-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-soft">
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                          selectedNails.length >= i
                            ? 'bg-brand-gold border-brand-gold text-white'
                            : 'border-gray-200 text-gray-400'
                        }`}
                      >
                        {selectedNails.length >= i ? <Check size={14} /> : i}
                      </div>
                    ))}
                  </div>
                  <p className="font-body text-dark font-medium">
                    {selectedNails.length === 4
                      ? '✅ All 4 selected!'
                      : `${selectedNails.length} of 4 selected`}
                  </p>
                </div>

                <motion.button
                  whileHover={selectedNails.length === 4 ? { scale: 1.03 } : {}}
                  whileTap={selectedNails.length === 4 ? { scale: 0.97 } : {}}
                  onClick={handleAddToCart}
                  disabled={selectedNails.length !== 4}
                  className={`flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all duration-300 ${
                    selectedNails.length === 4
                      ? 'bg-brand-pink text-brand-dark hover:bg-brand-gold hover:text-white shadow-soft cursor-pointer'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {addedToCart ? (
                    <><Check size={18} /> Added!</>
                  ) : (
                    <><ShoppingBag size={18} /> Add Bundle to Cart — Rs. {selectedBundle.price.toLocaleString()}</>
                  )}
                </motion.button>
              </div>

              {/* Selected nails preview */}
              {selectedNails.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-8">
                  {selectedNails.map(nail => (
                    <div
                      key={nail.id}
                      onClick={() => toggleNail(nail)}
                      className="flex items-center gap-2 bg-brand-pink/20 border border-brand-pink/40 rounded-full px-4 py-2 cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors group"
                    >
                      {nail.images?.[0]?.src && (
                        <Image
                          src={nail.images[0].src}
                          alt={nail.name}
                          width={24}
                          height={24}
                          className="rounded-full object-cover w-6 h-6"
                        />
                      )}
                      <span className="text-sm font-body text-dark">{nail.name}</span>
                      <span className="text-red-400 group-hover:text-red-600 text-xs">✕</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Products grid */}
              {loadingProducts ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {products.map(product => {
                    const isChosen = selectedNails.some(n => n.id === product.id);
                    const isDisabled = !isChosen && selectedNails.length >= 4;
                    const img = product.images?.[0]?.src;
                    return (
                      <motion.div
                        key={product.id}
                        whileHover={!isDisabled ? { y: -3 } : {}}
                        onClick={() => !isDisabled && toggleNail(product)}
                        className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                          isChosen
                            ? 'border-brand-gold ring-2 ring-brand-gold/40 shadow-md'
                            : isDisabled
                            ? 'border-gray-100 opacity-40 cursor-not-allowed'
                            : 'border-blush cursor-pointer hover:border-brand-pink hover:shadow-soft'
                        }`}
                      >
                        <div className="aspect-square bg-gray-50 relative">
                          {img ? (
                            <Image
                              src={img}
                              alt={product.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="w-full h-full bg-blush flex items-center justify-center text-gray-400 text-xs">No Image</div>
                          )}
                          {isChosen && (
                            <div className="absolute inset-0 bg-brand-gold/20 flex items-center justify-center">
                              <div className="w-10 h-10 bg-brand-gold rounded-full flex items-center justify-center shadow-lg">
                                <Check size={20} className="text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="p-2 bg-white">
                          <p className="font-body text-xs text-dark font-medium leading-tight line-clamp-2">{product.name}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Step 3: checkout note */}
              {selectedNails.length === 4 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-brand-pink/10 border border-brand-pink/30 rounded-2xl p-6 text-center"
                >
                  <p className="font-heading italic text-xl text-dark mb-2">Ready to Checkout?</p>
                  <p className="text-gray-600 font-body text-sm">
                    Your selected nail sets will be saved with your order. We&apos;ll confirm your choices via WhatsApp before packing!
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA if no bundle selected yet */}
        {!selectedBundle && (
          <div className="text-center py-12 text-gray-400">
            <ChevronDown size={32} className="mx-auto mb-3 animate-bounce" />
            <p className="font-body">Select a bundle above to start picking your nail sets</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BundlesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg" />}>
      <BundlesContent />
    </Suspense>
  );
}
