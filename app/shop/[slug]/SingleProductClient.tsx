'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ShoppingBag, Heart, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
// Encoding is fixed server-side in /api/products route
import { useCart } from '@/context/CartContext';
import { Product } from '@/lib/types';
import Link from 'next/link';
import ProductCard from '@/components/shop/ProductCard';

export default function SingleProductClient({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  
  const { addToCart } = useCart();

  useEffect(() => {
    async function load() {
      try {
        let p: any = null;

        // Extract numeric ID from slug format: "123-product-name" or just "123"
        const idMatch = slug.match(/^(\d+)/);
        if (idMatch) {
          // Fetch directly by ID — always works regardless of slug encoding
          const res = await fetch(`/api/products/${idMatch[1]}`);
          if (res.ok) p = await res.json();
        }

        // Fallback 1: try slug lookup
        if (!p) {
          const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
          const data = await res.json();
          p = Array.isArray(data) ? data[0] : null;
        }

        // Fallback 2: search by name
        if (!p) {
          const searchTerm = slug.replace(/^\d+-/, '').replace(/-+/g, ' ').trim();
          const res = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}&per_page=5`);
          const data = await res.json();
          p = Array.isArray(data) ? data[0] : null;
        }

        if (!p) { setLoading(false); return; }

        setProduct(p);
        setActiveImage(p.images?.[0]?.src || '');

        const relRes = await fetch(`/api/products?per_page=5`);
        const relData = await relRes.json();
        setRelated(Array.isArray(relData) ? relData.filter((r: any) => r.id !== p.id).slice(0, 4) : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (product && typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'ViewContent', {
        content_ids: [String(product.id)],
        content_type: 'product',
        value: parseInt(product.price || '0'),
        currency: 'PKR',
      });
    }
  }, [product?.id]);

  const handleAdd = () => {
    if (!product) return;
    const itemPrice = parseInt(product.price || '2500');
    addToCart({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: itemPrice,
      quantity,
      image: activeImage,
    });
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'AddToCart', {
        content_ids: [String(product.id)],
        content_type: 'product',
        value: itemPrice,
        currency: 'PKR',
      });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) return (
    <div className="bg-bg min-h-screen pb-24 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="h-4 bg-gray-200 rounded w-48 mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-square bg-blush rounded-3xl" />
          <div className="space-y-4 pt-4">
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-10 bg-gray-200 rounded w-2/3" />
            <div className="h-8 bg-blush rounded w-1/4" />
            <div className="h-4 bg-gray-100 rounded w-full mt-6" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
            <div className="h-4 bg-gray-100 rounded w-4/6" />
            <div className="h-14 bg-blush-deep rounded-full w-full mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
  if (!product) return <div className="min-h-screen bg-bg flex items-center justify-center">Product not found.</div>;

  const price = parseInt(product.price || '3500').toLocaleString();
  const regularPrice = product.regular_price ? parseInt(product.regular_price) : null;
  const isOnSale = regularPrice && regularPrice > parseInt(product.price || '0');

  return (
    <div className="bg-bg min-h-screen pb-24">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gold">Home</Link> <span className="mx-2">/</span>
        <Link href="/shop" className="hover:text-gold">Shop</Link> <span className="mx-2">/</span>
        <span className="text-dark">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 mb-24">
          
          {/* Image Gallery */}
          <div className="lg:w-[55%] space-y-4">
            <div className="relative aspect-[4/5] md:aspect-square bg-blush rounded-2xl overflow-hidden shadow-soft">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image src={activeImage} alt={product.name} fill unoptimized className="object-cover" />
                </motion.div>
              </AnimatePresence>
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.slice(0, 4).map((img: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(img.src)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                      activeImage === img.src ? 'border-gold' : 'border-transparent hover:border-gold/50'
                    }`}
                  >
                    <Image src={img.src} alt="Thumbnail" fill unoptimized className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:w-[45%] flex flex-col pt-4 lg:pt-8">
            <h1 className="font-heading italic text-4xl lg:text-[2.5rem] text-dark mb-4">{product.name}</h1>
            <div className="mb-6">
              {isOnSale ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-heading text-3xl text-brand-dark">₨ {price}</span>
                  <span className="text-gray-400 line-through text-xl">₨ {regularPrice!.toLocaleString()}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">50% OFF</span>
                </div>
              ) : (
                <span className="font-heading text-3xl text-brand-dark">₨ {price}</span>
              )}
            </div>
            
            <div className="text-gray-600 font-body leading-relaxed mb-8" dangerouslySetInnerHTML={{ __html: product.short_description || '<p>A stunning handcrafted press-on nail set featuring premium materials and a perfect fit.</p>' }} />

            <div className="border-t border-b border-blush py-8 mb-8 space-y-6">
              <div className="flex items-center space-x-6">
                <span className="font-medium text-dark w-20">Quantity</span>
                <div className="flex items-center border border-gray-300 rounded-full px-4 py-2">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1 hover:text-brand-dark/80 transition-colors"><Minus size={18} /></button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="p-1 hover:text-brand-dark/80 transition-colors"><Plus size={18} /></button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAdd}
                  className={`flex-1 flex items-center justify-center py-4 rounded-full font-medium transition-all duration-300 ${
                    added ? 'bg-brand-pink text-brand-dark scale-[0.98]' : 'bg-brand-pink text-brand-dark hover:bg-brand-gold hover:text-white shadow-soft'
                  }`}
                >
                  {added ? (
                    <span className="flex items-center">✓ Added to Bag</span>
                  ) : (
                    <span className="flex items-center"><ShoppingBag size={20} className="mr-2" /> Add to Bag</span>
                  )}
                </button>
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  className="w-14 h-14 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-gold hover:border-gold transition-colors"
                >
                  <Heart size={24} />
                </motion.button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="flex justify-between border border-blush rounded-xl p-4 bg-white/50 text-sm">
              <div className="flex flex-col items-center text-center space-y-2">
                <ShieldCheck className="text-brand-dark" size={24} />
                <span className="text-gray-600 font-medium text-xs">Secure<br/>Payment</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Truck className="text-brand-dark" size={24} />
                <span className="text-gray-600 font-medium text-xs">Free Delivery<br/>over ₨3K</span>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <RefreshCcw className="text-brand-dark" size={24} />
                <span className="text-gray-600 font-medium text-xs">7 Days<br/>Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-24">
          <div className="flex border-b border-blush space-x-8">
            {['description', 'sizing', 'reviews'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-lg font-medium capitalize transition-colors relative ${activeTab === tab ? 'text-dark' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab}
                {activeTab === tab && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                )}
              </button>
            ))}
          </div>
          <div className="py-8 min-h-[200px]">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="prose prose-lg text-gray-600">
                  <div dangerouslySetInnerHTML={{ __html: product.description || '<p>Experience luxury at your fingertips. Our handcrafted nails are designed for durability, comfort, and unmatched style. Wear them for weeks or reuse them for multiple occasions.</p>' }} />
                </motion.div>
              )}
              {activeTab === 'sizing' && (
                <motion.div key="size" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-gray-600">
                  <p className="mb-4">Not sure about your size? Download our free Sizing Guide PDF to measure your natural nails accurately.</p>
                  <Link href="/sizing"><button className="text-brand-dark underline">View Sizing Guide</button></Link>
                </motion.div>
              )}
              {activeTab === 'reviews' && (
                <motion.div key="rev" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-gray-600">
                  <p>No reviews yet. Be the first to review this product!</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div>
            <h3 className="font-heading italic text-3xl text-dark text-center mb-10">You May Also Like</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
