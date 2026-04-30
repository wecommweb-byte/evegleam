'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeFromCart, total } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black z-50"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[400px] bg-white z-50 flex flex-col shadow-soft-lg"
          >
            <div className="flex items-center justify-between p-6 border-b border-blush">
              <h2 className="font-heading text-2xl font-semibold">Your Bag ({items.length})</h2>
              <button onClick={closeCart} className="p-2 hover:bg-blush rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="w-20 h-20 bg-blush rounded-full flex items-center justify-center text-gold">
                    <ShoppingBag size={32} />
                  </div>
                  <h3 className="font-heading text-xl">Your bag is empty</h3>
                  <button
                    onClick={closeCart}
                    className="mt-4 px-8 py-3 bg-gold text-white rounded-full hover:bg-gold-deep transition-colors"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {items.map((item) => (
                      <motion.div
                        key={`${item.id}-${item.variationId || 0}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex gap-4 border-b border-blush pb-6"
                      >
                        <div className="w-20 h-24 relative rounded-md overflow-hidden flex-shrink-0 bg-blush">
                          {item.image && (
                            <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                          )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-sm leading-tight">{item.name}</h4>
                              {item.variation && (
                                <p className="text-xs text-gray-500 mt-1">{item.variation}</p>
                              )}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id, item.variationId)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-200 rounded-full px-2 py-1">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.variationId)}
                                className="p-1 hover:text-gold transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.variationId)}
                                className="p-1 hover:text-gold transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <span className="font-heading font-medium text-gold">₨ {item.price.toLocaleString()}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-blush bg-bg">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-medium text-dark-soft">Subtotal</span>
                  <span className="font-heading font-semibold text-xl text-dark">₨ {total.toLocaleString()}</span>
                </div>
                <Link href="/checkout" onClick={closeCart} className="block w-full">
                  <button className="w-full bg-gold text-white py-4 rounded-full font-medium tracking-wide hover:bg-gold-deep transition-colors shadow-gold text-center">
                    Proceed to Checkout →
                  </button>
                </Link>
                <button
                  onClick={closeCart}
                  className="w-full mt-4 text-sm text-gray-500 hover:text-dark transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
