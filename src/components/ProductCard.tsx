import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { CartQuantityControl } from './CartQuantityControl';
import { Product } from '../types/product';
import { useAppTheme } from '../theme/theme';

type ProductCardProps = {
  compact?: boolean;
  product: Product;
  onPress?: () => void;
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export const ProductCard = memo(function ProductCard({
  compact = false,
  product,
  onPress,
}: ProductCardProps) {
  const { colors } = useAppTheme();
  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface }, compact && styles.compactCard]}
    >
      <View style={[styles.imageWrapper, { backgroundColor: colors.imageBackground }]}>
        <Image source={{ uri: product.thumbnail }} style={styles.image} />
        {product.discountPercentage > 0 ? (
          <View
            style={[styles.discountBadge, { backgroundColor: colors.danger }]}
          >
            <Text style={[styles.discountText, { color: colors.background }]}>
              -{Math.round(product.discountPercentage)}%
            </Text>
          </View>
        ) : null}
        <CartQuantityControl compact={compact} product={product} />
      </View>
      <View style={[styles.content, compact && styles.compactContent]}>
        <Text numberOfLines={1} style={[styles.category, { color: colors.mutedText }]}>
          {product.category}
        </Text>
        <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
          {product.title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: colors.text }]}>{formatPrice(discountedPrice)}</Text>
          <Text style={[styles.originalPrice, { color: colors.subtleText }]}>{formatPrice(product.price)}</Text>
        </View>
        <Text style={[styles.rating, { color: colors.accent }]}>★ {product.rating.toFixed(1)}</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    elevation: 2,
    flex: 1,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#1C2026',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
  },
  category: {
    color: '#7A8089',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.7,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  compactCard: {
    flex: 0,
    height: 292,
    marginBottom: 0,
    width: 184,
  },
  compactContent: {
    minHeight: 142,
  },
  content: {
    padding: 12,
  },
  discountBadge: {
    backgroundColor: '#E65747',
    borderBottomRightRadius: 10,
    left: 0,
    paddingHorizontal: 9,
    paddingVertical: 6,
    position: 'absolute',
    top: 0,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  imageWrapper: {
    backgroundColor: '#F5F5F2',
    height: 150,
    position: 'relative',
  },
  originalPrice: {
    color: '#969BA3',
    fontSize: 12,
    marginLeft: 6,
    textDecorationLine: 'line-through',
  },
  price: {
    color: '#17191C',
    fontSize: 16,
    fontWeight: '800',
  },
  priceRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: 11,
  },
  rating: {
    color: '#8B6215',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
  title: {
    color: '#17191C',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
});
