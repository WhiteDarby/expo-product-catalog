import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { ThemePreference } from '../theme/theme';

const SETTINGS_STORAGE_KEY = '@nua-market/settings';

type SettingsState = {
  hydrated: boolean;
  preference: ThemePreference;
};

const initialState: SettingsState = {
  hydrated: false,
  preference: 'system',
};

export const hydrateSettings = createAsyncThunk('settings/hydrate', async () => {
  const storedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
  if (!storedSettings) return 'system' as ThemePreference;

  const parsed = JSON.parse(storedSettings) as { preference?: ThemePreference };
  return parsed.preference ?? 'system';
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemePreference(state, action: PayloadAction<ThemePreference>) {
      state.preference = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateSettings.fulfilled, (state, action) => {
      state.preference = action.payload;
      state.hydrated = true;
    });
    builder.addCase(hydrateSettings.rejected, (state) => {
      state.hydrated = true;
    });
  },
});

export const { setThemePreference } = settingsSlice.actions;
export { SETTINGS_STORAGE_KEY };
export default settingsSlice.reducer;
