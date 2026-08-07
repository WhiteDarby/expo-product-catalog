import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useAppTheme } from '../theme/theme';

type CategoryChipsProps = {
  categories: string[];
  selectedCategory: string | null;
  onSelect: (category: string | null) => void;
};

function labelForCategory(category: string) {
  return category.replace(/-/g, ' ');
}

export function CategoryChips({
  categories,
  selectedCategory,
  onSelect,
}: CategoryChipsProps) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.chip, { backgroundColor: colors.input }, !selectedCategory && { backgroundColor: colors.text }]}
      >
        <Text style={[styles.text, { color: colors.mutedText }, !selectedCategory && { color: colors.background }]}>All</Text>
      </Pressable>
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <Pressable
            key={category}
            onPress={() => onSelect(isSelected ? null : category)}
            style={[styles.chip, { backgroundColor: colors.input }, isSelected && { backgroundColor: colors.text }]}
          >
            <Text style={[styles.text, { color: colors.mutedText }, isSelected && { color: colors.background }]}>
              {labelForCategory(category)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: '#F1F2F2',
    borderRadius: 20,
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  content: {
    paddingBottom: 2,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
