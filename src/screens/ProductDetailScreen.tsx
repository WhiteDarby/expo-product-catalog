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
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addToCart,
  decreaseQuantity,
  increaseQuantity,
  selectCartItems,
} from '../store/cartSlice';
import { recordEvent } from '../store/analyticsSlice';
import { useAppTheme } from '../theme/theme';
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
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const cartItems = useAppSelector(selectCartItems);
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
      dispatch(
        recordEvent({
          metadata: { productId: productResponse.id, productTitle: productResponse.title },
          type: 'product_viewed',
        }),
      );
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
      <SafeAreaView style={[styles.stateScreen, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} size="large" />
      </SafeAreaView>
    );
  }

  if (error || !product) {
    return (
      <SafeAreaView style={[styles.stateScreen, { backgroundColor: colors.background }]}>
        <Text style={[styles.stateTitle, { color: colors.text }]}>Something went wrong</Text>
        <Text style={[styles.stateMessage, { color: colors.mutedText }]}>{error ?? 'Product not found.'}</Text>
        <Pressable onPress={loadProduct} style={[styles.retryButton, { backgroundColor: colors.text }]}>
          <Text style={[styles.retryText, { color: colors.background }]}>Try again</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const discountedPrice =
    product.price * (1 - product.discountPercentage / 100);
  const images = product.images.length > 0 ? product.images : [product.thumbnail];

  const handleAddToCart = () => {
    dispatch(addToCart(product));
    dispatch(
      recordEvent({
        metadata: { productId: product.id, productTitle: product.title },
        type: 'add_to_cart',
      }),
    );
    console.log('add_to_cart', {
      productId: product.id,
      timestamp: new Date().toISOString(),
    });
  };

  const cartQuantity = cartItems.find(
    (item) => item.product.id === product.id,
  )?.quantity ?? 0;

  const handleImageScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveImage(Math.round(event.nativeEvent.contentOffset.x / width));
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.gallery, { backgroundColor: colors.imageBackground }]}>
          <FlatList
            data={images}
            horizontal
            keyExtractor={(image, index) => `${image}-${index}`}
            onScroll={handleImageScroll}
            pagingEnabled
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={[styles.galleryImage, { backgroundColor: colors.imageBackground, width }]} />
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
            <Text style={[styles.category, { color: colors.accent }]}>{product.category}</Text>
            {product.brand ? <Text style={[styles.brand, { color: colors.mutedText }]}>{product.brand}</Text> : null}
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{product.title}</Text>
          <View style={styles.ratingRow}>
            <Text style={[styles.rating, { color: colors.accent }]}>★ {product.rating.toFixed(1)}</Text>
            <Text style={[styles.reviewCount, { color: colors.mutedText }]}>
              {product.reviews?.length ?? 0} reviews
            </Text>
          </View>

          <View style={styles.priceBlock}>
            <Text style={[styles.price, { color: colors.text }]}>{formatPrice(discountedPrice)}</Text>
            <Text style={[styles.originalPrice, { color: colors.subtleText }]}>{formatPrice(product.price)}</Text>
            <View style={[styles.discountBadge, { backgroundColor: colors.dangerSoft }]}>
              <Text style={[styles.discountText, { color: colors.danger }]}>
                {Math.round(product.discountPercentage)}% off
              </Text>
            </View>
          </View>

          <View style={[styles.availabilityCard, { backgroundColor: colors.successSoft }]}>
            <View>
              <Text style={[styles.availabilityLabel, { color: colors.mutedText }]}>Availability</Text>
              <Text style={[styles.availabilityValue, { color: colors.success }]}>
                {product.availabilityStatus ?? `${product.stock} in stock`}
              </Text>
            </View>
            <Text style={[styles.shipping, { color: colors.success }]}>{product.shippingInformation}</Text>
          </View>

          {cartQuantity === 0 ? (
            <Pressable
              onPress={handleAddToCart}
              style={[styles.addButton, { backgroundColor: colors.text }]}
            >
              <Text style={[styles.addButtonText, { color: colors.background }]}>Add to cart</Text>
            </Pressable>
          ) : (
            <View style={[styles.quantityStepper, { backgroundColor: colors.text }]}>
              <Pressable
                accessibilityLabel={`Decrease ${product.title} quantity`}
                onPress={() => dispatch(decreaseQuantity(product.id))}
                style={styles.stepperButton}
              >
                <Text style={[styles.stepperButtonText, { color: colors.background }]}>-</Text>
              </Pressable>
              <Text style={[styles.stepperQuantity, { color: colors.background }]}>
                {cartQuantity}
              </Text>
              <Pressable
                accessibilityLabel={`Increase ${product.title} quantity`}
                onPress={() => dispatch(increaseQuantity(product.id))}
                style={styles.stepperButton}
              >
                <Text style={[styles.stepperButtonText, { color: colors.background }]}>+</Text>
              </Pressable>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>About this product</Text>
          <Text style={[styles.description, { color: colors.mutedText }]}>{product.description}</Text>

          <Text style={[styles.sectionTitle, { color: colors.text }]}>Product details</Text>
          <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
            {product.warrantyInformation ? (
              <DetailRow label="Warranty" value={product.warrantyInformation} />
            ) : null}
            {product.returnPolicy ? (
              <Pressable
                onPress={() => navigation.navigate('ReturnPolicy')}
                style={styles.policyRow}
              >
                <Text style={[styles.detailLabel, { color: colors.mutedText }]}>Return policy</Text>
                <Text style={[styles.policyLink, { color: colors.accent }]}>{product.returnPolicy}</Text>
              </Pressable>
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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>You may also like</Text>
              {isRelatedLoading ? (
                <ActivityIndicator color={colors.text} style={styles.relatedLoader} />
              ) : (
                <FlatList
                  contentContainerStyle={styles.relatedList}
                  data={relatedProducts}
                  horizontal
                  ItemSeparatorComponent={() => <View style={styles.relatedSeparator} />}
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
        style={[styles.backButton, { backgroundColor: colors.surface }]}
      >
        <View style={[styles.backArrow, { borderBottomColor: colors.text, borderLeftColor: colors.text }]} />
      </Pressable>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.detailRow}>
      <Text style={[styles.detailLabel, { color: colors.mutedText }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  activeDot: {
    backgroundColor: '#17191C',
    width: 18,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: '#17191C',
    borderRadius: 14,
    marginBottom: 30,
    paddingVertical: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
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
  quantityStepper: {
    alignItems: 'center',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  stepperButton: {
    alignItems: 'center',
    borderRadius: 10,
    height: 42,
    justifyContent: 'center',
    width: 48,
  },
  stepperButtonText: {
    fontSize: 25,
    fontWeight: '500',
    lineHeight: 28,
  },
  stepperQuantity: {
    fontSize: 18,
    fontWeight: '800',
  },
  policyLink: {
    color: '#8B6215',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 16,
    maxWidth: '60%',
    textAlign: 'right',
  },
  policyRow: {
    borderBottomColor: '#E7E8E5',
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
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
  relatedSeparator: {
    width: 12,
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
