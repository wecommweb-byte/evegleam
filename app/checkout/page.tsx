'use client';
import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, Copy, Check } from 'lucide-react';

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'PB',
    zip: '',
    country: 'PK',
  });

  const PAKISTAN_STATES = [
    { code: 'PB', name: 'Punjab' },
    { code: 'SD', name: 'Sindh' },
    { code: 'KP', name: 'Khyber Pakhtunkhwa' },
    { code: 'BA', name: 'Balochistan' },
    { code: 'IS', name: 'Islamabad' },
    { code: 'GB', name: 'Gilgit-Baltistan' },
    { code: 'JK', name: 'Azad Kashmir' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCopy = () => {
    if (orderId) {
      navigator.clipboard.writeText(`#${orderId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Bundle selections to include as order note
      const bundleNote = items
        .filter(item => item.variation)
        .map(item => `${item.name}: ${item.variation}`)
        .join('\n\n');

      const orderData = {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        set_paid: false,
        status: 'processing',
        billing: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.zip,
          country: formData.country,
          email: formData.email,
          phone: formData.phone,
        },
        shipping: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          address_1: formData.address,
          city: formData.city,
          state: formData.state,
          postcode: formData.zip,
          country: formData.country,
        },
        line_items: items.map(item => ({
          product_id: item.id,
          variation_id: item.variationId,
          quantity: item.quantity,
          meta_data: item.variation
            ? [{ key: 'Selected Nail Sets', value: item.variation }]
            : [],
        })),
        customer_note: bundleNote || '',
        // Passed to API route to post as admin order note
        _bundleNote: bundleNote ? `BUNDLE SELECTIONS:\n\n${bundleNote}` : '',
      };

      // Call our server-side API route (avoids CORS issues)
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      if (data.id) {
        setOrderId(data.id);
        if (typeof window !== 'undefined' && (window as any).fbq) {
          (window as any).fbq('track', 'Purchase', {
            content_ids: items.map(item => String(item.id)),
            content_type: 'product',
            value: total,
            currency: 'PKR',
          });
        }
        clearCart();
      } else {
        throw new Error('Order was not created. Please try again.');
      }
    } catch (err: any) {
      console.warn('Checkout error:', err);
      setError(err.message || 'There was an error processing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Success screen with Order ID
  if (orderId) {
    return (
      <div className="bg-bg min-h-screen pt-32 pb-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-10 md:p-14 rounded-3xl text-center max-w-lg w-full shadow-soft-lg"
        >
          {/* Check icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex items-center justify-center mb-6"
          >
            <CheckCircle size={72} className="text-brand-gold" strokeWidth={1.5} />
          </motion.div>

          <h1 className="font-heading italic text-4xl text-dark mb-3">Order Confirmed!</h1>
          <p className="text-gray-500 font-body mb-8">
            Thank you for shopping with Eve Gleam. Your gorgeous accessories are being prepared with love. 💅
          </p>

          {/* Order ID box */}
          <div className="bg-blush rounded-2xl px-6 py-5 mb-8">
            <p className="text-sm text-gray-500 font-body mb-1">Your Order ID</p>
            <div className="flex items-center justify-center gap-3">
              <span className="font-heading text-3xl text-dark font-semibold">#{orderId}</span>
              <button
                onClick={handleCopy}
                className="p-2 rounded-full hover:bg-brand-pink transition-colors text-gray-500 hover:text-brand-dark"
                title="Copy Order ID"
              >
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2 font-body">
              Save this ID to track your order
            </p>
          </div>

          <div className="space-y-3">
            <Link href="/shop" className="block">
              <button className="w-full px-8 py-3 rounded-full bg-brand-pink text-brand-dark font-medium hover:bg-brand-gold hover:text-white transition-colors">
                Continue Shopping
              </button>
            </Link>
            <Link href="/" className="block">
              <button className="w-full px-8 py-3 rounded-full border border-blush-deep text-gray-500 font-medium hover:border-brand-gold hover:text-brand-dark transition-colors text-sm">
                Back to Home
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-bg min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading italic text-4xl md:text-5xl text-dark mb-12">Checkout</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft">
            <h2 className="text-2xl text-dark mb-4">Your cart is empty</h2>
            <Link href="/shop">
              <button className="px-8 py-3 rounded-full border-2 border-brand-gold text-brand-gold font-medium hover:bg-brand-gold hover:text-brand-dark transition-colors">
                Go to Shop
              </button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">

            {/* Form Section */}
            <div className="w-full lg:w-2/3">
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-soft">
                <h2 className="text-xl font-medium text-dark mb-6 border-b border-blush pb-4">Shipping Information</h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">First Name</label>
                    <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-3 bg-bg border-none rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Last Name</label>
                    <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-3 bg-bg border-none rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-500 mb-2">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-3 bg-bg border-none rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-500 mb-2">Phone Number</label>
                    <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-3 bg-bg border-none rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-500 mb-2">Street Address</label>
                    <input required type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-3 bg-bg border-none rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">City</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-bg border-none rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">State / Province</label>
                    <select required name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-bg border-none rounded-xl focus:ring-2 focus:ring-brand-gold outline-none">
                      {PAKISTAN_STATES.map(state => (
                        <option key={state.code} value={state.code}>{state.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">ZIP / Postal Code</label>
                    <input required type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full px-4 py-3 bg-bg border-none rounded-xl focus:ring-2 focus:ring-brand-gold outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-2">Country</label>
                    <input readOnly type="text" value="Pakistan" className="w-full px-4 py-3 bg-bg border-none rounded-xl outline-none text-gray-500 cursor-not-allowed" />
                  </div>
                </div>

                <div className="mt-10">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-gold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white p-8 rounded-3xl shadow-soft sticky top-32">
                <h2 className="text-xl font-medium text-dark mb-6 border-b border-blush pb-4">Order Summary</h2>

                <div className="space-y-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.variationId}`} className="flex gap-4">
                      <div className="w-16 h-16 bg-blush rounded-lg overflow-hidden flex-shrink-0 relative">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                        <span className="absolute -top-2 -right-2 bg-dark text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-dark line-clamp-1">{item.name}</h4>
                        {item.variation && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.variation}</p>
                        )}
                        <p className="text-sm text-dark mt-1">₨ {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-blush pt-4 space-y-3">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Subtotal</span>
                    <span>₨ {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Shipping</span>
                    <span>Calculated at next step</span>
                  </div>
                  <div className="border-t border-blush pt-3 mt-3 flex justify-between text-lg font-medium text-dark">
                    <span>Total</span>
                    <span>₨ {total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
