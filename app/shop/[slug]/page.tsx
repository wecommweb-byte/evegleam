import { getProducts } from '@/lib/woocommerce';
import SingleProductClient from './SingleProductClient';

export async function generateStaticParams() {
  try {
    // Fetch up to 100 products to statically generate their pages
    const products = await getProducts({ per_page: 100 });
    if (!products || products.length === 0) {
      // Must return at least one valid object
      return [{ slug: 'fallback' }];
    }
    return products.map((p: any) => ({
      slug: p.slug || p.id.toString(),
    }));
  } catch (e) {
    console.error('Failed to generate static params:', e);
    return [{ slug: 'fallback' }];
  }
}

export default function SingleProductPage({ params }: { params: { slug: string } }) {
  return <SingleProductClient slug={params.slug} />;
}
