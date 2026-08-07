import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product } from '../types/product';

const CART_STORAGE_KEY = '@nua-market/cart';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  hydrated: boolean;
};

const initialState: CartState = {
  hydrated: false,
  items: [],
};

export const hydrateCart = createAsyncThunk('cart/hydrate', async () => {
  const storedCart = await AsyncStorage.getItem(CART_STORAGE_KEY);
  return storedCart ? (JSON.parse(storedCart) as CartItem[]) : [];
});

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<Product>) {
      const existingItem = state.items.find(
        (item) => item.product.id === action.payload.id,
      );

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        state.items.push({ product: action.payload, quantity: 1 });
      }
    },
    decreaseQuantity(state, action: PayloadAction<number>) {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === action.payload,
      );

      if (!item) return;
      if (item.quantity === 1) {
        state.items = state.items.filter(
          (cartItem) => cartItem.product.id !== action.payload,
        );
      } else {
        item.quantity -= 1;
      }
    },
    increaseQuantity(state, action: PayloadAction<number>) {
      const item = state.items.find(
        (cartItem) => cartItem.product.id === action.payload,
      );
      if (item) item.quantity += 1;
    },
    removeFromCart(state, action: PayloadAction<number>) {
      state.items = state.items.filter(
        (item) => item.product.id !== action.payload,
      );
    },
    clearCart(state) {
      state.items = [];
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.hydrated = true;
    });
    builder.addCase(hydrateCart.rejected, (state) => {
      state.hydrated = true;
    });
  },
});

export const {
  addToCart,
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
} = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((count, item) => count + item.quantity, 0);
export const selectCartQuantity = (
  state: { cart: CartState },
  productId: number,
) => state.cart.items.find((item) => item.product.id === productId)?.quantity ?? 0;
export const selectCartSubtotal = (state: { cart: CartState }) =>
  state.cart.items.reduce(
    (subtotal, item) =>
      subtotal +
      item.product.price *
        (1 - item.product.discountPercentage / 100) *
        item.quantity,
    0,
  );

export { CART_STORAGE_KEY };
export default cartSlice.reducer;
