import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProductResponse } from '../types/product';

const CACHE_PREFIX = '@nua-market/products/';

function cacheKey(query: string, category: string | null, skip: number) {
  return `${CACHE_PREFIX}${JSON.stringify({ category, query: query.trim(), skip })}`;
}

export async function cacheProducts(
  query: string,
  category: string | null,
  skip: number,
  response: ProductResponse,
) {
  await AsyncStorage.setItem(cacheKey(query, category, skip), JSON.stringify(response));
}

export async function readCachedProducts(
  query: string,
  category: string | null,
  skip: number,
): Promise<ProductResponse | null> {
  const cached = await AsyncStorage.getItem(cacheKey(query, category, skip));
  return cached ? (JSON.parse(cached) as ProductResponse) : null;
}
