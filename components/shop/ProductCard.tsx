'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Star } from 'lucide-react';
import { useIsDesktop } from '@/hooks/useScrollAnimation';
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';

export default function ProductCard({ product, index = 0 }: { product: Product, index?: number }) {
  const isDesktop = useIsDesktop();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);

  const price = product.price ? parseInt(product.price) : 2500;
  const imageSrc = product.images?.[0]?.src || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: price,
      quantity: 1,
      image: imageSrc,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const cardContent = (
    <div className="group flex flex-col h-full bg-white rounded-2xl shadow-sm hover:shadow-soft transition-all duration-300">
      <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-blush">
        <Image
          src={imageSrc}
          alt={product.name || 'Product'}
          fill
          unoptimized
          loading={index > 3 ? "lazy" : "eager"}
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />
        {/* Quick View Button (Desktop only) */}
        {isDesktop && (
          <div className="absolute inset-x-0 bottom-0 p-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out z-10">
            <button className="w-full py-3 bg-white/90 backdrop-blur-sm text-dark rounded-full font-medium shadow-sm hover:bg-brand-gold hover:text-brand-dark transition-colors">
              Quick View
            </button>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-body font-medium text-dark truncate mb-1">{product.name}</h3>
        <div className="flex items-center space-x-1 mb-2">
          <div className="flex text-brand-dark">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} fill="currentColor" strokeWidth={0} />
            ))}
          </div>
          <span className="text-xs text-gray-500 font-medium">4.9</span>
        </div>
        <div className="text-brand-dark font-heading text-[1.1rem] mb-4">₨ {price.toLocaleString()}</div>
        
        <div className="mt-auto">
          <button
            onClick={handleAdd}
            className={`w-full py-2.5 rounded-full border border-gold font-medium flex items-center justify-center transition-all duration-300 ${
              added ? 'bg-brand-pink text-brand-dark' : 'text-brand-gold hover:bg-brand-gold hover:text-brand-dark'
            }`}
          >
            {added ? (
              <span>✓ Added!</span>
            ) : (
              <span className="flex items-center">
                Add to Cart
                <motion.span 
                  className="ml-2 inline-block"
                  variants={{ hover: { x: 4 } }}
                >
                  <ArrowRight size={16} />
                </motion.span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <motion.div
        variants={{
          hidden: { opacity: 0, y: 30 },
          visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
        }}
        whileHover={{ y: -4, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
        className="h-full"
      >
        <Link href={`/shop/${product.slug || product.id}`} className="block h-full">
          {cardContent}
        </Link>
      </motion.div>
    );
  }

  return (
    <Link href={`/shop/${product.slug || product.id}`} className="block h-full">
      {cardContent}
    </Link>
  );
}
