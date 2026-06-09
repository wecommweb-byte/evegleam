import SingleProductClient from './SingleProductClient';

// Allow any slug to be rendered dynamically (not just pre-built ones)
export const dynamic = 'force-dynamic';

export default function SingleProductPage({ params }: { params: { slug: string } }) {
  return <SingleProductClient slug={params.slug} />;
}
