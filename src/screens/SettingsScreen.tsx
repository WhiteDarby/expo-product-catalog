import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppDispatch } from '../store/hooks';
import { setThemePreference } from '../store/settingsSlice';
import { ThemePreference, useAppTheme } from '../theme/theme';

export function SettingsScreen() {
  const dispatch = useAppDispatch();
  const { colors, preference } = useAppTheme();
  const options: Array<{ label: string; value: ThemePreference }> = [
    { label: 'System default', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
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
    </View>
  );
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
});
