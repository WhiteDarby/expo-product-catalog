import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

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
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <Pressable
        onPress={() => onSelect(null)}
        style={[styles.chip, !selectedCategory && styles.selectedChip]}
      >
        <Text style={[styles.text, !selectedCategory && styles.selectedText]}>All</Text>
      </Pressable>
      {categories.map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <Pressable
            key={category}
            onPress={() => onSelect(isSelected ? null : category)}
            style={[styles.chip, isSelected && styles.selectedChip]}
          >
            <Text style={[styles.text, isSelected && styles.selectedText]}>
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
  selectedChip: {
    backgroundColor: '#17191C',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  text: {
    color: '#5F646C',
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
