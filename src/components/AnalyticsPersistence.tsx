import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  ANALYTICS_STORAGE_KEY,
  hydrateAnalytics,
  recordEvent,
} from '../store/analyticsSlice';

export function AnalyticsPersistence() {
  const dispatch = useAppDispatch();
  const { events, hydrated } = useAppSelector((state) => state.analytics);
  const previousAppState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    void dispatch(hydrateAnalytics());
  }, [dispatch]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(events));
  }, [events, hydrated]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      const previousState = previousAppState.current;
      if (
        previousState === 'active' &&
        (nextState === 'background' || nextState === 'inactive')
      ) {
        dispatch(
          recordEvent({
            metadata: { fromState: previousState, toState: nextState },
            type: 'app_backgrounded',
          }),
        );
      }
      previousAppState.current = nextState;
    });

    return () => subscription.remove();
  }, [dispatch]);

  return null;
}
