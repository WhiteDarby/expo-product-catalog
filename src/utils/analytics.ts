import { AppDispatch } from '../store/store';
import {
  AnalyticsEventMetadata,
  AnalyticsEventType,
  recordEvent,
} from '../store/analyticsSlice';

export function trackEvent(
  dispatch: AppDispatch,
  type: AnalyticsEventType,
  metadata: AnalyticsEventMetadata = {},
) {
  const event = { metadata, type };
  dispatch(recordEvent(event));
  console.log(type, { ...metadata, timestamp: new Date().toISOString() });
}
