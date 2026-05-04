'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Twitter, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <footer className="bg-brand-pink text-brand-dark pt-16 pb-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <Image 
                src="/logo.png.png" 
                alt="Eve Gleam" 
                width={120} 
                height={120} 
                className="object-contain"
              />
            </Link>
            <p className="text-brand-dark/80 max-w-sm">
              Premium accessories for the modern woman. Handcrafted press-on nails and luxury jewelry.
            </p>
            <div className="flex space-x-4">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, color: '#C19860' }}
                  className="w-10 h-10 rounded-full bg-brand-pink-light flex items-center justify-center text-brand-dark transition-colors"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-xl mb-6 font-semibold">Quick Links</h4>
            <ul className="space-y-4">
              {['Home', 'Shop', 'Collections', 'Sizing', 'About', 'Contact'].map((item) => (
                <li key={item}>
                  <Link href={item === 'Home' ? '/' : `/${item.toLowerCase()}`} className="text-brand-dark/80 hover:text-brand-gold transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care + Newsletter */}
          <div>
            <h4 className="font-heading text-xl mb-6 font-semibold">Customer Care</h4>
            <ul className="space-y-4 mb-8">
              {['Contact Us', 'Terms & Policy', 'Secure Payment'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-brand-dark/80 hover:text-brand-gold transition-colors duration-200">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h4 className="font-heading text-xl mb-4 font-semibold">Newsletter</h4>
            <form className="flex" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="bg-white text-brand-dark px-4 py-2 w-full rounded-l-md border border-transparent focus:outline-none focus:border-brand-gold transition-colors"
              />
              <button
                type="submit"
                className="bg-brand-gold px-6 py-2 rounded-r-md text-white font-medium hover:opacity-80 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-brand-dark/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-brand-dark/70">
          <div className="flex space-x-2">
            {['COD', 'EasyPaisa', 'JazzCash', 'Bank Transfer'].map((method) => (
              <span key={method} className="px-3 py-1 bg-brand-pink-light rounded-full text-xs border border-brand-dark/10 text-brand-dark">
                {method}
              </span>
            ))}
          </div>
          
          <div className="flex space-x-6 text-brand-dark/70 text-xs">
            <span>🔒 SSL Secured</span>
            <span>🚚 Fast Delivery</span>
            <span>🛡️ Secure Payment</span>
          </div>

          <p>© {new Date().getFullYear()} Eve Gleam. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
