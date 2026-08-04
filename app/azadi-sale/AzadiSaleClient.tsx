'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Truck, BadgePercent, ShieldCheck, Star, Clock, Gift } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';
import { Product } from '@/lib/types';

// Curated "Azadi Edit" — greens and whites to match the flag, in display order.
const AZADI_PICKS = [57, 108, 90, 91, 88, 35, 50, 39, 86, 92, 87, 43];

const BUNDLE_SLUGS = ['basic-bundle', 'bridal-bundle', 'gift-bundle'];

// How many of the full catalogue to reveal per "Load More" click.
const PAGE_SIZE = 20;

// Pakistan Standard Time is UTC+5 — pin the deadlines so they read the same for everyone.
const DELIVERY_CUTOFF = new Date('2026-08-10T23:59:59+05:00').getTime();
const INDEPENDENCE_DAY = new Date('2026-08-14T00:00:00+05:00').getTime();

type Remaining = { days: number; hours: number; minutes: number; seconds: number };

function breakdown(ms: number): Remaining {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

function Countdown() {
  // null until mounted so server and client markup match on first paint
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const beforeCutoff = now === null || now < DELIVERY_CUTOFF;
  const target = beforeCutoff ? DELIVERY_CUTOFF : INDEPENDENCE_DAY;
  const label = beforeCutoff
    ? 'Time left to order and wear them on 14 August'
    : 'Counting down to Independence Day';
  const t = breakdown(now === null ? 0 : target - now);

  const units: [string, number][] = [
    ['Days', t.days],
    ['Hours', t.hours],
    ['Mins', t.minutes],
    ['Secs', t.seconds],
  ];

  return (
    <div className="mt-10">
      <p className="flex items-center justify-center gap-2 text-white/80 text-sm font-body mb-4">
        <Clock size={15} /> {label}
      </p>
      <div className="flex justify-center gap-3 sm:gap-4">
        {units.map(([unit, value]) => (
          <div
            key={unit}
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl w-[68px] sm:w-20 py-3"
          >
            <div className="font-heading text-3xl sm:text-4xl text-white tabular-nums leading-none">
              {now === null ? '--' : String(value).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-widest text-white/60 mt-1.5">
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AzadiSaleClient() {
  const [picks, setPicks] = useState<Product[]>([]);
  const [bundles, setBundles] = useState<Product[]>([]);
  const [allNails, setAllNails] = useState<Product[]>([]);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products?per_page=100')
      .then(r => r.json())
      .then((data: Product[]) => {
        const all = Array.isArray(data) ? data : [];
        const byId = new Map(all.map(p => [p.id, p]));
        setPicks(AZADI_PICKS.map(id => byId.get(id)).filter(Boolean) as Product[]);
        setBundles(
          BUNDLE_SLUGS.map(slug => all.find(p => p.slug === slug)).filter(Boolean) as Product[]
        );
        setAllNails(all.filter(p => !BUNDLE_SLUGS.includes(p.slug) && p.images?.length > 0));
      })
      .catch(() => {
        setPicks([]);
        setBundles([]);
        setAllNails([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-bg min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#01411C] px-4 py-20 sm:py-24 text-center">
        {/* Crescent + star motif */}
        <div className="pointer-events-none absolute -right-10 top-6 opacity-[0.07] select-none">
          <svg width="260" height="260" viewBox="0 0 100 100" fill="white" aria-hidden="true">
            <path d="M62 50a28 28 0 1 1-20-26.8A34 34 0 1 0 62 50Z" />
            <path d="M70 30l3.2 7.4 8 .8-6 5.4 1.7 7.9L70 47.4 63.1 51.5l1.7-7.9-6-5.4 8-.8z" />
          </svg>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-white/70 tracking-[0.25em] text-[11px] sm:text-xs font-medium uppercase mb-5"
          >
            ✦ 14 August · Independence Day
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-heading italic text-[clamp(2.6rem,6vw,4.75rem)] text-white leading-[1.05]"
          >
            Jashn-e-Azadi Sale
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12 }}
            className="text-white/85 font-body text-lg mt-5 max-w-xl mx-auto"
          >
            Green, white and ready for the big day. Flat 50% off every press-on set —
            a salon-worthy manicure at home, in ten minutes flat.
          </motion.p>

          <Countdown />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-10 flex flex-col sm:flex-row gap-3 justify-center"
          >
            <a href="#azadi-edit" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-9 py-3.5 rounded-full bg-white text-[#01411C] font-medium hover:bg-brand-pink transition-colors">
                Shop the Azadi Offer
              </button>
            </a>
            <a href="#bundles" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-9 py-3.5 rounded-full border border-white/40 text-white font-medium hover:bg-white/10 transition-colors">
                Build a Bundle &amp; Save More
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Offer strip */}
      <section className="bg-white border-b border-blush">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-blush">
          {[
            { Icon: BadgePercent, title: 'Flat 50% Off', sub: 'Every design, no exceptions' },
            { Icon: Truck, title: 'Free Delivery', sub: 'On orders over Rs. 3,000' },
            { Icon: ShieldCheck, title: 'Cash on Delivery', sub: 'Pay at your doorstep' },
          ].map(({ Icon, title, sub }) => (
            <div key={title} className="flex items-center justify-center gap-3 px-6 py-5 text-center sm:text-left">
              <Icon size={22} className="text-[#01411C] shrink-0" />
              <div>
                <p className="font-body font-medium text-dark text-sm">{title}</p>
                <p className="text-gray-500 text-xs font-body">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Azadi Edit */}
      <section id="azadi-edit" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-[#01411C]/10 text-[#01411C] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Star size={12} fill="currentColor" strokeWidth={0} /> Curated for 14 August
          </span>
          <h2 className="font-heading italic text-[clamp(2rem,4vw,3rem)] text-dark mb-3">
            The Azadi Edit
          </h2>
          <p className="text-gray-600 font-body max-w-xl mx-auto">
            Greens and crisp whites picked to match your Independence Day outfit —
            from emerald solids to classic French tips.
          </p>
        </div>

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
        ) : picks.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 font-body mb-6">
              We couldn&apos;t load the edit right now.
            </p>
            <Link href="/shop">
              <button className="px-8 py-3 rounded-full border-2 border-brand-gold text-brand-gold font-medium hover:bg-brand-gold hover:text-brand-dark transition-colors">
                Browse All Nails
              </button>
            </Link>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
          >
            {picks.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </motion.div>
        )}

        <div className="mt-14 text-center">
          <a href="#all-designs">
            <button className="px-10 py-3 rounded-full border-2 border-brand-gold text-brand-gold font-medium hover:bg-brand-gold hover:text-brand-dark transition-colors">
              View All Designs
            </button>
          </a>
        </div>
      </section>

      {/* Bundles */}
      <section id="bundles" className="bg-white border-y border-blush py-16 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 bg-brand-gold/15 text-brand-gold text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Gift size={12} /> Best Value This Azadi
            </span>
            <h2 className="font-heading italic text-[clamp(2rem,4vw,3rem)] text-dark mb-3">
              Bundle &amp; Save More
            </h2>
            <p className="text-gray-600 font-body max-w-xl mx-auto">
              Pick any four nail sets for one price — or choose the Gift Bundle and get a
              fifth set free as a surprise.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="animate-pulse flex flex-col h-[350px] bg-bg rounded-2xl p-4">
                  <div className="bg-blush rounded-xl aspect-square w-full mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="mt-auto h-10 bg-blush-deep rounded-full w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
              {bundles.map((b, i) => (
                <ProductCard key={b.id} product={b} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Full catalogue */}
      <section id="all-designs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 scroll-mt-20">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-[#01411C]/10 text-[#01411C] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <BadgePercent size={12} /> Everything 50% Off
          </span>
          <h2 className="font-heading italic text-[clamp(2rem,4vw,3rem)] text-dark mb-3">
            Shop All Designs
          </h2>
          <p className="text-gray-600 font-body max-w-xl mx-auto">
            The full collection at half price — French tips, florals, chrome, cat-eye and
            bold reds. Something for every 14 August outfit.
          </p>
        </div>

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {allNails.slice(0, visible).map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>

            {visible < allNails.length && (
              <div className="mt-14 text-center">
                <button
                  onClick={() => setVisible(v => v + PAGE_SIZE)}
                  className="px-10 py-3 rounded-full border-2 border-brand-gold text-brand-gold font-medium hover:bg-brand-gold hover:text-brand-dark transition-colors"
                >
                  Load More ({allNails.length - visible} left)
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Delivery cutoff notice */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto bg-[#01411C] rounded-3xl px-8 py-10 text-center">
          <h3 className="font-heading italic text-2xl sm:text-3xl text-white mb-3">
            Want them on the 14th?
          </h3>
          <p className="text-white/80 font-body max-w-lg mx-auto mb-7">
            Order by <span className="text-white font-medium">10 August</span> and we&apos;ll
            pack and deliver in time for Independence Day. Later orders still ship — they just
            land after the celebrations.
          </p>
          <a href="#azadi-edit">
            <button className="px-9 py-3.5 rounded-full bg-white text-[#01411C] font-medium hover:bg-brand-pink transition-colors">
              Pick Your Set
            </button>
          </a>
        </div>
      </section>
    </div>
  );
}
