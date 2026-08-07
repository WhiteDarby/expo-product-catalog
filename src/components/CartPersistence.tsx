import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hydrateCart, CART_STORAGE_KEY } from '../store/cartSlice';

export function CartPersistence() {
  const dispatch = useAppDispatch();
  const { hydrated, items } = useAppSelector((state) => state.cart);

  useEffect(() => {
    void dispatch(hydrateCart());
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  return null;
}
