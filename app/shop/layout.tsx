import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Press-On Nails Online in Pakistan – All Designs',
  description:
    'Shop 60+ premium press-on nail designs in Pakistan — French tips, bridal, glitter, matte & everyday styles. 50% off, cash on delivery, free shipping over Rs. 3,000.',
  alternates: { canonical: 'https://www.evegleam.com/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return children;
}
