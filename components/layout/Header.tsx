'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useIsDesktop } from '@/hooks/useScrollAnimation';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { itemCount, openCart } = useCart();
  const isDesktop = useIsDesktop();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isHome = pathname === '/';
  const isTransparent = (!mounted) ? true : (isHome && !scrolled);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', href: '/shop' },
    { name: 'Collections', href: '/collections' },
    { name: 'Sizing', href: '/sizing' },
    { name: 'Contact', href: '/contact' },
  ];

  const headerClass = `fixed top-0 left-0 right-0 z-50 transition-all duration-400 ease-in-out ${
    !isTransparent ? 'bg-gold backdrop-blur-md shadow-soft' : 'bg-transparent text-white'
  }`;

  const linkClass = `relative inline-block text-sm uppercase tracking-widest font-medium after:content-[''] after:absolute after:w-0 after:h-[2px] after:bg-white after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full text-white`;

  return (
    <>
      <header className={headerClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[60px] md:h-[80px]">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 z-50 flex items-center">
              <Image 
                src="/logo.png.png" 
                alt="Eve Gleam" 
                width={70} 
                height={70} 
                className="object-contain"
                priority
              />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-10">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href} className={linkClass}>
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-6 z-50">
              <button className="hover:text-white/70 transition-colors text-white">
                <Search size={20} />
              </button>
              <button 
                onClick={openCart}
                className="relative hover:text-white/70 transition-colors text-white"
              >
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      key="cart-badge"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-2 -right-2 bg-white text-gold text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile menu button */}
              <button
                className="md:hidden text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-white z-40 md:hidden pt-24 px-6 shadow-soft-lg"
            >
              <nav className="flex flex-col space-y-8">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="text-2xl font-heading text-dark hover:text-gold transition-colors block"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </motion.div>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
