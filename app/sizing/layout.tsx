import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Press-On Nail Sizing Guide – Find Your Perfect Fit',
  description:
    'How to measure your nails for press-on nails: simple at-home sizing guide with size chart. Get a perfect, salon-quality fit for your Eve Gleam artificial nails.',
  alternates: { canonical: 'https://www.evegleam.com/sizing' },
};

export default function SizingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
