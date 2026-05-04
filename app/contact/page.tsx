'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

import { Instagram, Facebook, Phone, Mail, MapPin } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  return (
    <div className="bg-bg min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          
          {/* Info Side */}
          <AnimatedSection className="flex flex-col justify-center">
            <h1 className="font-heading italic text-[clamp(3rem,6vw,4.5rem)] text-dark mb-6 leading-tight">Let's Get in Touch</h1>
            <p className="text-gray-600 font-body text-lg mb-12 max-w-md">
              Whether you have a question about sizing, order status, or just want to say hi — we're here for you.
            </p>
            
            <div className="space-y-8 mb-16">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gold shadow-sm mr-6">
                  <Mail size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-dark mb-1">Email Us</h4>
                  <p className="text-gray-500">hello@evegleam.pk</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gold shadow-sm mr-6">
                  <Phone size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-dark mb-1">Call Us</h4>
                  <p className="text-gray-500">+92 300 1234567</p>
                </div>
              </div>
            </div>

            {/* WhatsApp CTA */}
            <motion.a
              href="https://wa.me/923001234567"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center justify-center bg-[#25D366] text-white px-8 py-4 rounded-full font-medium text-lg hover:bg-[#1DA851] transition-colors shadow-soft max-w-sm mb-12 relative overflow-hidden"
            >
              <span className="absolute left-6 w-3 h-3 bg-white rounded-full animate-ping opacity-75" />
              <span className="absolute left-6 w-3 h-3 bg-white rounded-full" />
              <span className="ml-8">Chat on WhatsApp</span>
            </motion.a>

            {/* Socials */}
            <div>
              <h4 className="font-medium text-dark mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-dark hover:text-gold hover:shadow-soft transition-all"><Instagram size={20} /></a>
                <a href="#" className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-dark hover:text-gold hover:shadow-soft transition-all"><Facebook size={20} /></a>
              </div>
            </div>
          </AnimatedSection>

          {/* Form Side */}
          <AnimatedSection delay={0.2} className="bg-white p-8 md:p-12 rounded-3xl shadow-soft-lg">
            {success ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center py-20">
                <div className="w-20 h-20 bg-blush rounded-full flex items-center justify-center text-gold mb-6">
                  <Mail size={32} />
                </div>
                <h3 className="font-heading text-3xl text-dark mb-2">Message Sent!</h3>
                <p className="text-gray-500 font-body">We'll get back to you within 24 hours.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Full Name</label>
                  <input required type="text" className="w-full px-5 py-4 bg-bg border border-transparent focus:border-gold focus:bg-white rounded-xl outline-none transition-all" placeholder="Jane Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Email Address</label>
                  <input required type="email" className="w-full px-5 py-4 bg-bg border border-transparent focus:border-gold focus:bg-white rounded-xl outline-none transition-all" placeholder="jane@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Phone Number (Optional)</label>
                  <input type="tel" className="w-full px-5 py-4 bg-bg border border-transparent focus:border-gold focus:bg-white rounded-xl outline-none transition-all" placeholder="+92 3XX XXXXXXX" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark mb-2">Your Message</label>
                  <textarea required rows={5} className="w-full px-5 py-4 bg-bg border border-transparent focus:border-gold focus:bg-white rounded-xl outline-none transition-all resize-none" placeholder="How can we help you?" />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-pink text-brand-dark py-4 rounded-xl font-medium text-lg hover:bg-brand-gold hover:text-white transition-all shadow-soft disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </AnimatedSection>
          
        </div>
      </div>
    </div>
  );
}
