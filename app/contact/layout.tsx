import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us – Eve Gleam Nails Pakistan',
  description:
    'Questions about press-on nails, sizing or your order? Contact Eve Gleam — we ship premium artificial nails across Pakistan with cash on delivery.',
  alternates: { canonical: 'https://www.evegleam.com/contact' },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
