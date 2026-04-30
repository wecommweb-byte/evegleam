export interface CartItem {
  id: number;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variation?: string;
  variationId?: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: { id: number; src: string; alt: string }[];
  categories: { id: number; name: string; slug: string }[];
  average_rating: string;
  rating_count: number;
  attributes: any[];
  type: string;
  featured: boolean;
  tags: { id: number; name: string; slug: string }[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
}
