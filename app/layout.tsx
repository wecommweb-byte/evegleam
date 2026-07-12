import { Cormorant_Garamond, Inter } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { CartProvider } from '@/context/CartContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/layout/CartDrawer';
import TopLoader from '@/components/layout/TopLoader';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-heading',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL('https://www.evegleam.com'),
  title: {
    default: 'Eve Gleam | Press-On Nails in Pakistan – Premium Artificial Nails',
    template: '%s | Eve Gleam',
  },
  description:
    'Buy premium press-on nails online in Pakistan. Salon-quality artificial nails — reusable, easy to apply at home. Bridal, French & everyday designs. Cash on delivery nationwide.',
  keywords: [
    'press on nails Pakistan',
    'artificial nails Pakistan',
    'fake nails price in Pakistan',
    'press on nails online',
    'bridal press on nails',
    'French tip press on nails',
    'nail extensions at home',
    'reusable press on nails',
    'glue on nails Pakistan',
    'Eve Gleam nails',
  ],
  verification: {
    google: 'qqn8VFlgS4wI0xceVbIfKgps5NwWKbsNj65aORXLqf0',
  },
  openGraph: {
    siteName: 'Eve Gleam',
    type: 'website',
    locale: 'en_PK',
    url: 'https://www.evegleam.com',
    title: 'Eve Gleam | Press-On Nails in Pakistan',
    description:
      'Premium press-on nails delivered across Pakistan. Salon-quality, reusable, easy to apply at home. Cash on delivery available.',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'Eve Gleam' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eve Gleam | Press-On Nails in Pakistan',
    description: 'Premium press-on nails delivered across Pakistan. Cash on delivery available.',
  },
  icons: {
    icon: [{ url: '/logo.png', type: 'image/png' }],
    apple: [{ url: '/logo.png', type: 'image/png' }],
  },
};

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Eve Gleam',
  url: 'https://www.evegleam.com',
  logo: 'https://www.evegleam.com/logo.png',
  sameAs: [
    'https://www.facebook.com/share/191e6opxBv/',
    'https://www.instagram.com/evegleam_nails',
  ],
};

const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Eve Gleam',
  url: 'https://www.evegleam.com',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="antialiased">
        <Script id="fb-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1318278960393978');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1318278960393978&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <Analytics />
        <Suspense fallback={null}>
          <TopLoader />
        </Suspense>
        <CartProvider>
          <Header />
          <main className="min-h-screen pt-[60px] md:pt-[80px]">
            {children}
          </main>
          <CartDrawer />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
