import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CartQuantityControl } from './CartQuantityControl';
import { Product } from '../types/product';
import { useAppTheme } from '../theme/theme';

type DealsCarouselProps = {
  products: Product[];
  onProductPress: (product: Product) => void;
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export function DealsCarousel({ products, onProductPress }: DealsCarouselProps) {
  const { colors } = useAppTheme();

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {products.map((product) => {
        const discountedPrice =
          product.price * (1 - product.discountPercentage / 100);

        return (
          <Pressable
            accessibilityRole="button"
            key={product.id}
            onPress={() => onProductPress(product)}
            style={[styles.card, { backgroundColor: colors.accentSoft }]}
          >
            <View style={styles.imageWrapper}>
              <Image source={{ uri: product.thumbnail }} style={[styles.image, { backgroundColor: colors.imageBackground }]} />
              <CartQuantityControl compact product={product} />
            </View>
            <View style={styles.details}>
              <Text numberOfLines={1} style={[styles.title, { color: colors.text }]}>
                {product.title}
              </Text>
              <Text style={[styles.discount, { color: colors.danger }]}>
                Save {Math.round(product.discountPercentage)}%
              </Text>
              <View style={styles.priceRow}>
                <Text style={[styles.price, { color: colors.text }]}>{formatPrice(discountedPrice)}</Text>
                <Text style={[styles.originalPrice, { color: colors.subtleText }]}>{formatPrice(product.price)}</Text>
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F3EADF',
    borderRadius: 18,
    flexDirection: 'row',
    marginRight: 12,
    overflow: 'hidden',
    position: 'relative',
    width: 258,
  },
  content: {
    paddingBottom: 2,
  },
  details: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  discount: {
    color: '#B44837',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 7,
  },
  image: {
    backgroundColor: '#E9DDCF',
    height: 122,
    width: 92,
  },
  imageWrapper: {
    height: 122,
    position: 'relative',
    width: 92,
  },
  originalPrice: {
    color: '#969BA3',
    fontSize: 11,
    marginLeft: 5,
    textDecorationLine: 'line-through',
  },
  price: {
    color: '#17191C',
    fontSize: 15,
    fontWeight: '800',
  },
  priceRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    marginTop: 5,
  },
  title: {
    color: '#17191C',
    fontSize: 13,
    fontWeight: '700',
  },
});
