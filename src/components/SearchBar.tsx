import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useAppTheme } from '../theme/theme';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.input }]}>
      <TextInput
        accessibilityLabel="Search products"
        autoCapitalize="none"
        autoCorrect={false}
        onChangeText={onChangeText}
        placeholder="Search products"
        placeholderTextColor={colors.subtleText}
        returnKeyType="search"
        style={[styles.input, { color: colors.text }]}
        value={value}
      />
      {value.length > 0 ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => onChangeText('')}
          style={styles.clearButton}
        >
          <View style={[styles.iconLine, styles.iconLineOne, { backgroundColor: colors.mutedText }]} />
          <View style={[styles.iconLine, styles.iconLineTwo, { backgroundColor: colors.mutedText }]} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F2F3F5',
    borderRadius: 14,
    height: 48,
    justifyContent: 'center',
  },
  clearButton: {
    alignItems: 'center',
    elevation: 2,
    height: 32,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    width: 32,
    zIndex: 2,
  },
  iconLine: {
    backgroundColor: '#6F747C',
    borderRadius: 1,
    height: 2,
    position: 'absolute',
    width: 15,
  },
  iconLineOne: {
    transform: [{ rotate: '45deg' }],
  },
  iconLineTwo: {
    transform: [{ rotate: '-45deg' }],
  },
  input: {
    color: '#17191C',
    fontSize: 16,
    paddingLeft: 16,
    paddingRight: 48,
  },
});
