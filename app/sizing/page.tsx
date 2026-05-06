'use client';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import AnimatedSection from '@/components/ui/AnimatedSection';

export default function SizingPage() {
  const steps = [
    { num: 1, title: "Find some clear tape", desc: "Place a piece of clear tape across the widest part of your nail bed." },
    { num: 2, title: "Mark the edges", desc: "Use a pen to mark the exact side edges of your nail on the tape." },
    { num: 3, title: "Measure", desc: "Remove the tape, place it flat, and measure the distance between the lines in millimeters." },
    { num: 4, title: "Match your size", desc: "Compare your measurements with our sizing chart below to find your perfect fit." }
  ];

  return (
    <div className="bg-bg min-h-screen pb-24">
      {/* Hero */}
      <div className="bg-blush bg-texture py-20 text-center border-b border-blush-deep px-4">
        <h1 className="font-heading italic text-[clamp(2.5rem,5vw,4.5rem)] text-dark mb-4">Find Your Perfect Fit</h1>
        <p className="text-gray-600 font-body max-w-xl mx-auto text-lg">
          Follow our simple guide to measure your nails accurately at home and guarantee a flawless, natural look.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        
        {/* Steps */}
        <div className="mb-24 space-y-12">
          {steps.map((step, i) => (
            <AnimatedSection key={i} delay={i * 0.1} className="flex items-start gap-6 bg-white p-8 rounded-2xl shadow-soft">
              <div className="w-12 h-12 bg-brand-pink-light rounded-full flex-shrink-0 flex items-center justify-center text-brand-dark font-heading text-xl font-bold">
                {step.num}
              </div>
              <div>
                <h3 className="font-heading text-2xl text-dark mb-2">{step.title}</h3>
                <p className="text-gray-600 font-body text-lg leading-relaxed">{step.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>

        {/* Chart */}
        <AnimatedSection className="bg-white rounded-2xl shadow-soft-lg overflow-hidden border border-blush mb-16">
          <div className="bg-dark text-white p-6 text-center">
            <h3 className="font-heading italic text-3xl">Sizing Chart</h3>
          </div>
          <div className="p-8 overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b-2 border-blush">
                  <th className="pb-4 font-heading text-xl text-dark">Size</th>
                  <th className="pb-4 font-medium text-gray-500">Thumb</th>
                  <th className="pb-4 font-medium text-gray-500">Index</th>
                  <th className="pb-4 font-medium text-gray-500">Middle</th>
                  <th className="pb-4 font-medium text-gray-500">Ring</th>
                  <th className="pb-4 font-medium text-gray-500">Pinky</th>
                </tr>
              </thead>
              <tbody className="text-lg">
                {[
                  { name: 'Small (S)', m: ['14mm', '10mm', '11mm', '10mm', '7mm'] },
                  { name: 'Medium (M)', m: ['15mm', '11mm', '12mm', '11mm', '8mm'] },
                  { name: 'Large (L)', m: ['16mm', '12mm', '13mm', '12mm', '9mm'] },
                  { name: 'Extra Large (XL)', m: ['17mm', '13mm', '14mm', '13mm', '10mm'] },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-blush last:border-0 hover:bg-bg transition-colors">
                    <td className="py-6 font-medium text-dark">{row.name}</td>
                    {row.m.map((val, j) => (
                      <td key={j} className="py-6 text-gray-600">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedSection>

        {/* PDF CTA */}
        <div className="text-center">
          <motion.a
            href="/sizing-guide.pdf"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            className="inline-flex items-center justify-center bg-brand-pink text-brand-dark px-10 py-5 rounded-full font-medium text-lg hover:bg-brand-gold hover:text-white transition-all duration-300 shadow-soft"
          >
            <Download size={24} className="mr-3" />
            Download PDF Guide
          </motion.a>
        </div>

      </div>
    </div>
  );
}
