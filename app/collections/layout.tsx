import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nail Collections – French, Bridal, Glitter & More',
  description:
    'Explore Eve Gleam nail collections: French tips, bridal couture, glitter & shimmer, solid colors and floral press-on nails. Premium artificial nails made for Pakistan.',
  alternates: { canonical: 'https://www.evegleam.com/collections' },
};

export default function CollectionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
