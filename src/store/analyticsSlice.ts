import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AnalyticsEventType =
  | 'product_viewed'
  | 'add_to_cart'
  | 'search_performed'
  | 'app_backgrounded';

export type AnalyticsMetadata = Record<string, string | number>;

export type AnalyticsEvent = {
  id: string;
  type: AnalyticsEventType;
  timestamp: string;
  metadata: AnalyticsMetadata;
};

type AnalyticsState = {
  events: AnalyticsEvent[];
  hydrated: boolean;
};

const ANALYTICS_STORAGE_KEY = '@nua-market/analytics';
const MAX_EVENTS = 100;

const initialState: AnalyticsState = {
  events: [],
  hydrated: false,
};

export const hydrateAnalytics = createAsyncThunk('analytics/hydrate', async () => {
  const storedEvents = await AsyncStorage.getItem(ANALYTICS_STORAGE_KEY);
  return storedEvents ? (JSON.parse(storedEvents) as AnalyticsEvent[]) : [];
});

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearEvents(state) {
      state.events = [];
    },
    recordEvent(
      state,
      action: PayloadAction<{
        type: AnalyticsEventType;
        metadata?: AnalyticsMetadata;
      }>,
    ) {
      state.events.unshift({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        metadata: action.payload.metadata ?? {},
        timestamp: new Date().toISOString(),
        type: action.payload.type,
      });
      state.events = state.events.slice(0, MAX_EVENTS);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateAnalytics.fulfilled, (state, action) => {
      state.events = action.payload.slice(0, MAX_EVENTS);
      state.hydrated = true;
    });
    builder.addCase(hydrateAnalytics.rejected, (state) => {
      state.hydrated = true;
    });
  },
});

export const { clearEvents, recordEvent } = analyticsSlice.actions;
export const selectAnalyticsEvents = (state: { analytics: AnalyticsState }) =>
  state.analytics.events;
export { ANALYTICS_STORAGE_KEY };
export default analyticsSlice.reducer;
