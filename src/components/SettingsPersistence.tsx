import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { hydrateSettings, SETTINGS_STORAGE_KEY } from '../store/settingsSlice';

export function SettingsPersistence() {
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  useEffect(() => {
    void dispatch(hydrateSettings());
  }, [dispatch]);

  useEffect(() => {
    if (!settings.hydrated) return;
    void AsyncStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ preference: settings.preference }),
    );
  }, [settings]);

  return null;
}
