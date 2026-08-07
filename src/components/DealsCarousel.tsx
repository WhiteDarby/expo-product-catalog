import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Product } from '../types/product';

type DealsCarouselProps = {
  products: Product[];
};

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export function DealsCarousel({ products }: DealsCarouselProps) {
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
          <Pressable accessibilityRole="button" key={product.id} style={styles.card}>
            <Image source={{ uri: product.thumbnail }} style={styles.image} />
            <View style={styles.details}>
              <Text numberOfLines={1} style={styles.title}>
                {product.title}
              </Text>
              <Text style={styles.discount}>
                Save {Math.round(product.discountPercentage)}%
              </Text>
              <View style={styles.priceRow}>
                <Text style={styles.price}>{formatPrice(discountedPrice)}</Text>
                <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
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
