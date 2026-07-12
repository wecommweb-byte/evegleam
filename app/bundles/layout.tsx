import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nail Bundles – Mix & Match 4 Press-On Nail Sets & Save',
  description:
    'Build your own press-on nail bundle in Pakistan. Pick any 4 nail sets from Rs. 2,999 — basic, bridal & gift bundles with a free surprise set. Cash on delivery.',
  alternates: { canonical: 'https://www.evegleam.com/bundles' },
};

export default function BundlesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
