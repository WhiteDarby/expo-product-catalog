import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './cartSlice';
import analyticsReducer from './analyticsSlice';
import productsReducer from './productsSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    analytics: analyticsReducer,
    cart: cartReducer,
    products: productsReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
