import { StyleSheet, TextInput, View } from 'react-native';

type SearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

export function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        accessibilityLabel="Search products"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        onChangeText={onChangeText}
        placeholder="Search products"
        placeholderTextColor="#8A8F98"
        returnKeyType="search"
        style={styles.input}
        value={value}
      />
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
  input: {
    color: '#17191C',
    fontSize: 16,
    paddingHorizontal: 16,
  },
});
