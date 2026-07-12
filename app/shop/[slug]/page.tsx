import { Metadata } from 'next';
import SingleProductClient from './SingleProductClient';
import { getSupabase } from '@/lib/supabase';

// Allow any slug to be rendered dynamically (not just pre-built ones)
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://www.evegleam.com';

function stripHtml(html: string): string {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function getProduct(slug: string): Promise<any | null> {
  const idMatch = slug.match(/^(\d+)/);
  if (!idMatch) return null;
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data } = await sb.from('products').select('*').eq('id', Number(idMatch[1])).maybeSingle();
    return data;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProduct(params.slug);
  if (!product) {
    return {
      title: 'Press-On Nails | Eve Gleam Pakistan',
      description: 'Premium press-on nails in Pakistan. Salon-quality artificial nails, reusable and easy to apply at home. Cash on delivery across Pakistan.',
    };
  }

  const title = `${product.name} – Press-On Nails Price in Pakistan | Eve Gleam`;
  const description =
    stripHtml(product.short_description || product.description).slice(0, 155) ||
    `Buy ${product.name} press-on nails online in Pakistan at Rs. ${product.price}. Salon-quality, reusable artificial nails with free delivery on orders above Rs. 3,000.`;
  const image = product.images?.[0]?.src;
  const canonical = `${SITE_URL}/shop/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Eve Gleam',
      type: 'website',
      ...(image && { images: [{ url: image, width: 800, height: 800, alt: product.name }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && { images: [image] }),
    },
  };
}

export default async function SingleProductPage({ params }: { params: { slug: string } }) {
  const product = await getProduct(params.slug);

  // Product structured data (JSON-LD) → rich results in Google (price, availability)
  const jsonLd = product
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        description: stripHtml(product.short_description || product.description),
        image: (product.images || []).map((i: any) => i.src),
        sku: String(product.id),
        brand: { '@type': 'Brand', name: 'Eve Gleam' },
        offers: {
          '@type': 'Offer',
          url: `${SITE_URL}/shop/${params.slug}`,
          priceCurrency: 'PKR',
          price: String(product.price ?? ''),
          availability:
            product.stock_status === 'instock'
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          itemCondition: 'https://schema.org/NewCondition',
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SingleProductClient slug={params.slug} />
    </>
  );
}
