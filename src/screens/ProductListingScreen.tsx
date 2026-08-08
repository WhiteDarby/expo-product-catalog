import { useCallback, useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  ActivityIndicator,
  FlatList,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  NativeScrollEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CategoryChips } from '../components/CategoryChips';
import { DealsCarousel } from '../components/DealsCarousel';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { HomeStackParamList } from '../navigation/types';
import {
  loadCatalogSections,
  loadProducts,
  setCategory,
  setQuery,
} from '../store/productsSlice';
import { recordEvent } from '../store/analyticsSlice';
import { Product } from '../types/product';
import { useAppTheme } from '../theme/theme';

export function ProductListingScreen() {
  const [query, setInputQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const listRef = useRef<FlatList<Product>>(null);
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const {
    categories,
    category: selectedCategory,
    error,
    hasMore,
    items: products,
    sectionsStatus,
    status,
    topDeals,
    total,
  } = useAppSelector((state) => state.products);
  const isLoading = status === 'idle' || status === 'loading';
  const isRefreshing = status === 'refreshing';
  const isLoadingMore = status === 'loadingMore';
  const isLoadingSections = sectionsStatus === 'idle' || sectionsStatus === 'loading';

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    void dispatch(loadCatalogSections());
  }, [dispatch]);

  const loadFirstPage = useCallback(async (searchQuery: string, refreshing = false) => {
    dispatch(setQuery(searchQuery));
    await dispatch(loadProducts({
      category: selectedCategory,
      mode: refreshing ? 'refresh' : 'initial',
      query: searchQuery,
    }));
  }, [dispatch, selectedCategory]);

  useEffect(() => {
    if (debouncedQuery.trim()) {
      dispatch(
        recordEvent({
          metadata: { query: debouncedQuery.trim() },
          type: 'search_performed',
        }),
      );
    }
    void loadFirstPage(debouncedQuery);
  }, [debouncedQuery, dispatch, loadFirstPage]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore || products.length === 0) return;
    await dispatch(loadProducts({
      category: selectedCategory,
      mode: 'more',
      query: debouncedQuery,
    }));
  }, [
    debouncedQuery,
    dispatch,
    hasMore,
    isLoading,
    isLoadingMore,
    products.length,
    selectedCategory,
  ]);

  const handleCategorySelect = (category: string | null) => {
    setInputQuery('');
    dispatch(setCategory(category));
  };

  const handleQueryChange = (value: string) => {
    setInputQuery(value);
    if (value.trim()) dispatch(setCategory(null));
  };

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return <View style={styles.footerSpace} />;
    return <ActivityIndicator color={colors.text} style={styles.footerLoader} />;
  }, [colors, isLoadingMore]);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return <ActivityIndicator color={colors.text} size="large" style={styles.centerState} />;
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Text style={[styles.stateTitle, { color: colors.text }]}>Something went wrong</Text>
          <Text style={[styles.stateMessage, { color: colors.mutedText }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => void loadFirstPage(debouncedQuery)}
            style={[styles.retryButton, { backgroundColor: colors.text }]}
          >
            <Text style={[styles.retryText, { color: colors.background }]}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerState}>
        <Text style={[styles.stateTitle, { color: colors.text }]}>No products found</Text>
        <Text style={[styles.stateMessage, { color: colors.mutedText }]}>Try searching for something else.</Text>
      </View>
    );
  }, [colors, debouncedQuery, error, isLoading, loadFirstPage]);

  const renderProduct = useCallback(
    ({ item }: { item: Product }) => (
      <ProductCard
        onPress={() => navigation.navigate('ProductDetail', { productId: item.id })}
        product={item}
      />
    ),
    [navigation],
  );

  const openProductDetail = useCallback(
    (product: Product) => {
      navigation.navigate('ProductDetail', { productId: product.id });
    },
    [navigation],
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > 500);
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }] }>
      <FlatList
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        data={products}
        keyExtractor={(item) => String(item.id)}
        onScroll={handleScroll}
        ref={listRef}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          <View>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>NUA MARKET</Text>
            <Text style={[styles.heading, { color: colors.text }]}>Find your next favorite</Text>
            <SearchBar onChangeText={handleQueryChange} value={query} />
            {!query && topDeals.length > 0 ? (
              <View>
                <View style={styles.sectionTitleRow}>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Top deals</Text>
                  <Text style={[styles.sectionHint, { color: colors.subtleText }]}>Limited-time picks</Text>
                </View>
                <DealsCarousel onProductPress={openProductDetail} products={topDeals} />
              </View>
            ) : null}
            <View style={styles.categorySection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Shop by category</Text>
              {isLoadingSections ? (
                <ActivityIndicator color={colors.text} style={styles.categoryLoader} />
              ) : (
                <CategoryChips
                  categories={categories}
                  onSelect={handleCategorySelect}
                  selectedCategory={selectedCategory}
                />
              )}
            </View>
            <View style={styles.resultRow}>
              <Text style={[styles.resultLabel, { color: colors.text }]}>
                {query
                  ? 'Search results'
                  : selectedCategory
                    ? selectedCategory.replace(/-/g, ' ')
                    : 'All products'}
              </Text>
              {!isLoading && total > 0 ? <Text style={[styles.resultCount, { color: colors.subtleText }]}>{total} items</Text> : null}
            </View>
          </View>
        }
        keyboardShouldPersistTaps="handled"
        numColumns={2}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadFirstPage(debouncedQuery, true)}
            refreshing={isRefreshing}
            tintColor={colors.text}
          />
        }
        renderItem={renderProduct}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      />
      {showScrollTop ? (
        <Pressable
          accessibilityLabel="Scroll to top"
          accessibilityRole="button"
          onPress={() => listRef.current?.scrollToOffset({ animated: true, offset: 0 })}
          style={[styles.scrollTopButton, { backgroundColor: colors.surface }]}
        >
          <Ionicons color={colors.text} name="arrow-up" size={22} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centerState: {
    alignItems: 'center',
    minHeight: 260,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  categoryLoader: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
  },
  categorySection: {
    marginTop: 24,
  },
  columnWrapper: {
    gap: 12,
  },
  eyebrow: {
    color: '#8B6215',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 8,
  },
  footerLoader: {
    paddingVertical: 18,
  },
  footerSpace: {
    height: 18,
  },
  heading: {
    color: '#17191C',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 35,
    marginBottom: 20,
    maxWidth: 290,
  },
  listContent: {
    paddingBottom: 110,
    paddingHorizontal: 16,
    paddingTop: 22,
  },
  resultCount: {
    color: '#8A8F98',
    fontSize: 13,
  },
  resultLabel: {
    color: '#17191C',
    fontSize: 17,
    fontWeight: '700',
  },
  resultRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
    marginTop: 27,
  },
  sectionHint: {
    color: '#8A8F98',
    fontSize: 12,
  },
  sectionTitle: {
    color: '#17191C',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 25,
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
    fontSize: 14,
    fontWeight: '700',
  },
  screen: {
    backgroundColor: '#FBFBF9',
    flex: 1,
  },
  scrollTopButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',
    borderRadius: 28,
    bottom: 100,
    elevation: 5,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 32,
    shadowColor: '#17191C',
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    width: 56,
  },
  stateMessage: {
    color: '#777D86',
    fontSize: 14,
    marginTop: 7,
    textAlign: 'center',
  },
  stateTitle: {
    color: '#17191C',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
});
