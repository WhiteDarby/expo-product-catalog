import { ProductResponse } from '../types/product';

const API_URL = 'https://dummyjson.com/products';
export const PAGE_SIZE = 20;

export async function fetchProducts(
  query: string,
  skip: number,
  category?: string,
): Promise<ProductResponse> {
  const endpoint = category
    ? `${API_URL}/category/${encodeURIComponent(category)}?limit=${PAGE_SIZE}&skip=${skip}`
    : query.trim()
    ? `${API_URL}/search?q=${encodeURIComponent(query.trim())}&limit=${PAGE_SIZE}&skip=${skip}`
    : `${API_URL}?limit=${PAGE_SIZE}&skip=${skip}`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error('Unable to load products.');
  }

  return response.json() as Promise<ProductResponse>;
}

export async function fetchProductById(id: number): Promise<ProductResponse['products'][number]> {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error('Unable to load product details.');
  }

  return response.json();
}

export async function fetchTopDeals(): Promise<ProductResponse> {
  const response = await fetch(
    `${API_URL}?sortBy=discountPercentage&order=desc&limit=6`,
  );

  if (!response.ok) {
    throw new Error('Unable to load top deals.');
  }

  return response.json() as Promise<ProductResponse>;
}

export async function fetchCategories(): Promise<string[]> {
  const response = await fetch(`${API_URL}/categories`);

  if (!response.ok) {
    throw new Error('Unable to load categories.');
  }

  const categories = (await response.json()) as Array<string | { slug: string }>;
  return categories.map((category) =>
    typeof category === 'string' ? category : category.slug,
  );
}
