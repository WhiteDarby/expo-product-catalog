import { configureStore } from '@reduxjs/toolkit';
import { fetchProducts } from '../services/products';
import productsReducer, { loadProducts, setQuery } from './productsSlice';
import { ProductResponse } from '../types/product';

jest.mock('../services/productsCache', () => ({
  cacheProducts: jest.fn(),
  readCachedProducts: jest.fn().mockResolvedValue(null),
}));

jest.mock('../services/products', () => ({
  fetchCategories: jest.fn(),
  fetchProductById: jest.fn(),
  fetchProducts: jest.fn(),
  fetchTopDeals: jest.fn(),
}));

const mockedFetchProducts = fetchProducts as jest.MockedFunction<typeof fetchProducts>;

function product(id: number, title: string) {
  return {
    category: 'test',
    description: title,
    discountPercentage: 0,
    id,
    images: [],
    price: 10,
    rating: 4,
    stock: 10,
    thumbnail: '',
    title,
  };
}

function response(item: ReturnType<typeof product>): ProductResponse {
  return { limit: 20, products: [item], skip: 0, total: 1 };
}

describe('products search race protection', () => {
  it('keeps the latest laptop results when the older phone request resolves last', async () => {
    let resolvePhone!: (value: ProductResponse) => void;
    let resolveLaptop!: (value: ProductResponse) => void;

    mockedFetchProducts.mockImplementation((query) => {
      if (query === 'phone') {
        return new Promise((resolve) => {
          resolvePhone = resolve;
        });
      }
      return new Promise((resolve) => {
        resolveLaptop = resolve;
      });
    });

    const store = configureStore({ reducer: { products: productsReducer } });
    store.dispatch(setQuery('phone'));
    const phoneRequest = store.dispatch(
      loadProducts({ category: null, mode: 'initial', query: 'phone' }),
    );
    store.dispatch(setQuery('laptop'));
    const laptopRequest = store.dispatch(
      loadProducts({ category: null, mode: 'initial', query: 'laptop' }),
    );

    resolveLaptop(response(product(2, 'Laptop')));
    await laptopRequest;
    resolvePhone(response(product(1, 'Phone')));
    await phoneRequest;

    expect(store.getState().products.items).toEqual([product(2, 'Laptop')]);
  });
});
