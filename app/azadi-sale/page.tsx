import { Metadata } from 'next';
import AzadiSaleClient from './AzadiSaleClient';

export const metadata: Metadata = {
  title: 'Azadi Sale 2026 – Flat 50% Off Press-On Nails | 14 August',
  description:
    'Jashn-e-Azadi Sale: flat 50% off press-on nails in Pakistan. Shop green & white Independence Day designs. Order by 10 August for delivery before 14 August. Cash on delivery.',
  keywords: [
    'Azadi sale',
    'Azadi sale 2026',
    '14 August sale Pakistan',
    'Independence Day sale nails',
    'green and white nails Pakistan',
    'press on nails Azadi offer',
  ],
  alternates: { canonical: 'https://www.evegleam.com/azadi-sale' },
  openGraph: {
    title: 'Jashn-e-Azadi Sale – Flat 50% Off Press-On Nails',
    description:
      'Celebrate 14 August in green and white. Flat 50% off every nail set, cash on delivery across Pakistan. Order by 10 August to get it in time.',
    url: 'https://www.evegleam.com/azadi-sale',
    siteName: 'Eve Gleam',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jashn-e-Azadi Sale – Flat 50% Off Press-On Nails',
    description: 'Celebrate 14 August in green and white. Cash on delivery across Pakistan.',
  },
};

export default function AzadiSalePage() {
  return <AzadiSaleClient />;
}
