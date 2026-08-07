import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AnalyticsEvent, clearEvents } from '../store/analyticsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setThemePreference } from '../store/settingsSlice';
import { ThemePreference, useAppTheme } from '../theme/theme';

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { colors, preference } = useAppTheme();
  const events = useAppSelector((state) => state.analytics.events);
  const options: Array<{ label: string; value: ThemePreference }> = [
    { label: 'System default', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.eyebrow, { color: colors.accent }]}>PREFERENCES</Text>
      <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.label, { color: colors.text }]}>Appearance</Text>
          <Text style={[styles.description, { color: colors.mutedText }]}>Choose how Nua looks</Text>
        </View>
        <Text style={[styles.value, { color: colors.subtleText }]}>
          {options.find((option) => option.value === preference)?.label}
        </Text>
      </View>
      <View style={[styles.preferenceCard, { backgroundColor: colors.surface }]}>
        {options.map((option) => {
          const selected = option.value === preference;
          return (
            <Pressable
              key={option.value}
              onPress={() => dispatch(setThemePreference(option.value))}
              style={[
                styles.preferenceOption,
                selected && { backgroundColor: colors.text },
              ]}
            >
              <Text
                style={[
                  styles.preferenceText,
                  { color: selected ? colors.background : colors.mutedText },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View>
          <Text style={[styles.label, { color: colors.text }]}>About Nua Market</Text>
          <Text style={[styles.description, { color: colors.mutedText }]}>Product discovery demo</Text>
        </View>
        <Text style={[styles.value, { color: colors.subtleText }]}>v1.0</Text>
      </View>
      <View style={styles.activityHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent activity</Text>
          <Text style={[styles.description, { color: colors.mutedText }]}>Your in-app event history</Text>
        </View>
        {events.length > 0 ? (
          <Pressable onPress={() => dispatch(clearEvents())}>
            <Text style={[styles.clearText, { color: colors.danger }]}>Clear activity</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
        {events.length === 0 ? (
          <Text style={[styles.emptyActivity, { color: colors.mutedText }]}>No activity recorded yet.</Text>
        ) : (
          events.map((event, index) => (
            <ActivityRow event={event} isLast={index === events.length - 1} key={event.id} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

function ActivityRow({ event, isLast }: { event: AnalyticsEvent; isLast: boolean }) {
  const { colors } = useAppTheme();
  const labels: Record<AnalyticsEvent['type'], string> = {
    add_to_cart: 'Added to cart',
    app_backgrounded: 'App moved to background',
    product_viewed: 'Viewed product',
    search_performed: 'Searched products',
  };
  const detail = event.type === 'search_performed'
    ? `"${event.metadata.query ?? ''}"`
    : event.type === 'app_backgrounded'
      ? 'Session paused'
      : String(event.metadata.productTitle ?? `Product #${event.metadata.productId ?? ''}`);

  return (
    <View style={[styles.activityRow, !isLast && { borderBottomColor: colors.border }]}>
      <View style={[styles.activityDot, { backgroundColor: colors.accent }]} />
      <View style={styles.activityCopy}>
        <Text style={[styles.activityLabel, { color: colors.text }]}>{labels[event.type]}</Text>
        <Text numberOfLines={1} style={[styles.activityDetail, { color: colors.mutedText }]}>{detail}</Text>
      </View>
      <Text style={[styles.activityTime, { color: colors.subtleText }]}>
        {formatActivityTime(event.timestamp)}
      </Text>
    </View>
  );
}

function formatActivityTime(timestamp: string) {
  return new Date(timestamp).toLocaleString([], {
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
  });
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    padding: 17,
  },
  activityCard: {
    borderRadius: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  activityCopy: {
    flex: 1,
    marginLeft: 10,
  },
  activityDetail: {
    fontSize: 12,
    marginTop: 4,
  },
  activityDot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  activityHeader: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 14,
  },
  activityLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  activityRow: {
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    minHeight: 66,
  },
  activityTime: {
    fontSize: 10,
    marginLeft: 8,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginTop: 5,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 7,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  screen: {
    flex: 1,
    padding: 20,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.7,
    marginBottom: 24,
  },
  value: {
    fontSize: 13,
  },
  preferenceCard: {
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 5,
  },
  preferenceOption: {
    alignItems: 'center',
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  preferenceText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyActivity: {
    fontSize: 13,
    paddingVertical: 20,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: 120,
    paddingTop: 20,
  },
});
