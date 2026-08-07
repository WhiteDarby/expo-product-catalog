import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProductCard } from '../components/ProductCard';
import { RootStackParamList } from '../navigation/types';
import { fetchProductById, fetchProducts } from '../services/products';
import { Product } from '../types/product';

type ProductDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ProductDetail'
>;

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export function ProductDetailScreen({ navigation, route }: ProductDetailScreenProps) {
  const { width } = useWindowDimensions();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRelatedLoading, setIsRelatedLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const requestId = useRef(0);

  const loadProduct = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setIsRelatedLoading(true);
    setRelatedProducts([]);
    setError(null);

    try {
      const productResponse = await fetchProductById(route.params.productId);
      if (currentRequest !== requestId.current) return;

      setProduct(productResponse);
      console.log('product_viewed', {
        productId: productResponse.id,
        timestamp: new Date().toISOString(),
      });

      try {
        const relatedResponse = await fetchProducts('', 0, productResponse.category);
        if (currentRequest !== requestId.current) return;

        setRelatedProducts(
          relatedResponse.products
            .filter((relatedProduct) => relatedProduct.id !== productResponse.id)
            .slice(0, 6),
        );
      } catch {
        // Related products are optional and should not block the detail screen.
      } finally {
        if (currentRequest === requestId.current) setIsRelatedLoading(false);
      }
    } catch {
      setError('We could not load this product.');
      setIsRelatedLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [route.params.productId]);

  useEffect(() => {
    void loadProduct();
  }, [loadProduct]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <ActivityIndicator color="#17191C" size="large" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={styles.stateScreen}>
        <Text style={styles.stateTitle}>Something went wrong</Text>
        <Text style={styles.stateMessage}>{error ?? 'Product not found.'}</Text>
        <Pressable onPress={loadProduct} style={styles.retryButton}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);
  const images = product.images.length > 0 ? product.images : [product.thumbnail];

  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveImage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.screen}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.gallery}>
          <FlatList
            data={images}
            horizontal
            keyExtractor={(image, index) => `${image}-${index}`}
            onScroll={handleImageScroll}
            pagingEnabled
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={[styles.galleryImage, { width }]} />
            )}
            scrollEventThrottle={16}
            showsHorizontalScrollIndicator={false}
          />
          {images.length > 1 ? (
            <View style={styles.dots}>
              {images.map((image, index) => (
                <View
                  key={`${image}-dot`}
                  style={[styles.dot, index === activeImage && styles.activeDot]}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.content}>
          <View style={styles.metaRow}>
            <Text style={styles.category}>{product.category}</Text>
            {product.brand ? <Text style={styles.brand}>{product.brand}</Text> : null}
          </View>
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.ratingRow}>
            <Text style={styles.rating}>★ {product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>
              {product.reviews?.length ?? 0} reviews
            </Text>
          </View>

          <View style={styles.priceBlock}>
            <Text style={styles.price}>{formatPrice(discountedPrice)}</Text>
            <Text style={styles.originalPrice}>{formatPrice(product.price)}</Text>
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round(product.discountPercentage)}% off
              </Text>
            </View>
          </View>

          <View style={styles.availabilityCard}>
            <View>
              <Text style={styles.availabilityLabel}>Availability</Text>
              <Text style={styles.availabilityValue}>
                {product.availabilityStatus ?? `${product.stock} in stock`}
              </Text>
            </View>
            <Text style={styles.shipping}>{product.shippingInformation}</Text>
          </View>

          <Text style={styles.sectionTitle}>About this product</Text>
          <Text style={styles.description}>{product.description}</Text>

          <Text style={styles.sectionTitle}>Product details</Text>
          <View style={styles.detailsCard}>
            {product.warrantyInformation ? (
              <DetailRow label="Warranty" value={product.warrantyInformation} />
            ) : null}
            {product.returnPolicy ? (
              <DetailRow label="Return policy" value={product.returnPolicy} />
            ) : null}
            {product.minimumOrderQuantity ? (
              <DetailRow
                label="Minimum order"
                value={`${product.minimumOrderQuantity} items`}
              />
            ) : null}
            {product.sku ? <DetailRow label="SKU" value={product.sku} /> : null}
          </View>

          {isRelatedLoading || relatedProducts.length > 0 ? (
            <View style={styles.relatedSection}>
              <Text style={styles.sectionTitle}>You may also like</Text>
              {isRelatedLoading ? (
                <ActivityIndicator color="#17191C" style={styles.relatedLoader} />
              ) : (
                <FlatList
                  contentContainerStyle={styles.relatedList}
                  data={relatedProducts}
                  horizontal
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <ProductCard
                      compact
                      onPress={() =>
                        navigation.push('ProductDetail', { productId: item.id })
                      }
                      product={item}
                    />
                  )}
                  showsHorizontalScrollIndicator={false}
                />
              )}
            </View>
          ) : null}
        </View>
      </ScrollView>
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <View style={styles.backArrow} />
      </Pressable>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: '#17191C',
    width: 18,
  },
  availabilityCard: {
    alignItems: 'center',
    backgroundColor: '#F2F5EC',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    padding: 16,
  },
  availabilityLabel: {
    color: '#777D86',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  availabilityValue: {
    color: '#3B6B39',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 5,
  },
  backArrow: {
    borderBottomColor: '#17191C',
    borderLeftColor: '#17191C',
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    height: 11,
    transform: [{ rotate: '45deg' }],
    width: 11,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 22,
    elevation: 3,
    height: 44,
    justifyContent: 'center',
    left: 16,
    position: 'absolute',
    top: 38,
    width: 44,
    zIndex: 5,
  },
  brand: {
    color: '#777D86',
    fontSize: 13,
    fontWeight: '600',
  },
  category: {
    color: '#8B6215',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  content: {
    padding: 20,
  },
  description: {
    color: '#686E77',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 28,
  },
  detailLabel: {
    color: '#777D86',
    fontSize: 13,
  },
  detailRow: {
    borderBottomColor: '#E7E8E5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  detailValue: {
    color: '#17191C',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 16,
    maxWidth: '60%',
    textAlign: 'right',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  discountBadge: {
    backgroundColor: '#FBE8E4',
    borderRadius: 7,
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  discountText: {
    color: '#B44837',
    fontSize: 11,
    fontWeight: '800',
  },
  dot: {
    backgroundColor: '#D2D3CF',
    borderRadius: 3,
    height: 6,
    marginHorizontal: 3,
    width: 6,
  },
  dots: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 12,
    bottom: 14,
    flexDirection: 'row',
    paddingHorizontal: 7,
    paddingVertical: 6,
    position: 'absolute',
  },
  gallery: {
    backgroundColor: '#F4F4F0',
    height: 360,
  },
  galleryImage: {
    height: 360,
    resizeMode: 'contain',
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  originalPrice: {
    color: '#969BA3',
    fontSize: 14,
    marginLeft: 8,
    textDecorationLine: 'line-through',
  },
  price: {
    color: '#17191C',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  priceBlock: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 24,
  },
  rating: {
    color: '#8B6215',
    fontSize: 14,
    fontWeight: '800',
  },
  ratingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 22,
  },
  relatedList: {
    paddingBottom: 4,
    paddingRight: 20,
  },
  relatedLoader: {
    alignSelf: 'flex-start',
    paddingVertical: 18,
  },
  relatedSection: {
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#17191C',
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  reviewCount: {
    color: '#777D86',
    fontSize: 13,
    marginLeft: 10,
  },
  screen: {
    backgroundColor: '#FBFBF9',
    flex: 1,
  },
  sectionTitle: {
    color: '#17191C',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  shipping: {
    color: '#4E674C',
    fontSize: 12,
    maxWidth: 140,
    textAlign: 'right',
  },
  stateMessage: {
    color: '#777D86',
    fontSize: 14,
    marginTop: 7,
    textAlign: 'center',
  },
  stateScreen: {
    alignItems: 'center',
    backgroundColor: '#FBFBF9',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  stateTitle: {
    color: '#17191C',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  title: {
    color: '#17191C',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.7,
    lineHeight: 34,
    marginBottom: 12,
  },
});
