import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchCategories,
  fetchProducts,
  fetchTopDeals,
} from '../services/products';
import { Product, ProductResponse } from '../types/product';

type RequestMode = 'initial' | 'refresh' | 'more';

type ProductRequest = {
  query: string;
  category: string | null;
  mode: RequestMode;
};

type ProductState = {
  items: Product[];
  total: number;
  query: string;
  category: string | null;
  hasMore: boolean;
  status: 'idle' | 'loading' | 'refreshing' | 'loadingMore' | 'succeeded' | 'failed';
  sectionsStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  topDeals: Product[];
  categories: string[];
};

const initialState: ProductState = {
  categories: [],
  category: null,
  error: null,
  hasMore: true,
  items: [],
  query: '',
  sectionsStatus: 'idle',
  status: 'idle',
  topDeals: [],
  total: 0,
};

export const loadProducts = createAsyncThunk<
  ProductResponse,
  ProductRequest
>('products/loadProducts', async ({ category, mode, query }, { getState }) => {
  const state = getState() as { products: ProductState };
  const skip = mode === 'more' ? state.products.items.length : 0;
  return fetchProducts(query, skip, category ?? undefined);
});

export const loadCatalogSections = createAsyncThunk(
  'products/loadCatalogSections',
  async () => {
    const [dealsResponse, categories] = await Promise.all([
      fetchTopDeals(),
      fetchCategories(),
    ]);
    return { categories, deals: dealsResponse.products };
  },
);

function isCurrentRequest(state: ProductState, request: ProductRequest) {
  return state.query === request.query && state.category === request.category;
}

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setCategory(state, action: PayloadAction<string | null>) {
      state.category = action.payload;
    },
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProducts.pending, (state, action) => {
        const { mode } = action.meta.arg;
        state.error = null;
        state.status = mode === 'more' ? 'loadingMore' : mode === 'refresh' ? 'refreshing' : 'loading';
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        const request = action.meta.arg;
        if (!isCurrentRequest(state, request)) return;

        const incoming = action.payload.products;
        if (request.mode === 'more') {
          const existingIds = new Set(state.items.map((product) => product.id));
          state.items.push(...incoming.filter((product) => !existingIds.has(product.id)));
        } else {
          state.items = incoming;
        }
        state.total = action.payload.total;
        state.hasMore = action.payload.skip + incoming.length < action.payload.total;
        state.status = 'succeeded';
      })
      .addCase(loadProducts.rejected, (state, action) => {
        if (!isCurrentRequest(state, action.meta.arg)) return;
        state.error = action.meta.arg.mode === 'more'
          ? 'We could not load more products.'
          : 'We could not load the products. Please try again.';
        state.status = 'failed';
      })
      .addCase(loadCatalogSections.pending, (state) => {
        state.sectionsStatus = 'loading';
      })
      .addCase(loadCatalogSections.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.topDeals = action.payload.deals;
        state.sectionsStatus = 'succeeded';
      })
      .addCase(loadCatalogSections.rejected, (state) => {
        state.sectionsStatus = 'failed';
      });
  },
});

export const { setCategory, setQuery } = productsSlice.actions;
export default productsSlice.reducer;
