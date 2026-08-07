import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import {
  loadCatalogSections,
  loadProducts,
  setCategory,
  setQuery,
} from '../store/productsSlice';

export function ProductListingScreen() {
  const [query, setInputQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const dispatch = useAppDispatch();
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
    void loadFirstPage(debouncedQuery);
  }, [debouncedQuery, loadFirstPage]);

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

  const renderFooter = () => {
    if (!isLoadingMore) return <View style={styles.footerSpace} />;
    return <ActivityIndicator color="#17191C" style={styles.footerLoader} />;
  };

  const renderEmpty = () => {
    if (isLoading) {
      return <ActivityIndicator color="#17191C" size="large" style={styles.centerState} />;
    }

    if (error) {
      return (
        <View style={styles.centerState}>
          <Text style={styles.stateTitle}>Something went wrong</Text>
          <Text style={styles.stateMessage}>{error}</Text>
          <TouchableOpacity
            onPress={() => void loadFirstPage(debouncedQuery)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.centerState}>
        <Text style={styles.stateTitle}>No products found</Text>
        <Text style={styles.stateMessage}>Try searching for something else.</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <FlatList
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        data={products}
        keyExtractor={(item) => String(item.id)}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ListHeaderComponent={
          <View>
            <Text style={styles.eyebrow}>NUA MARKET</Text>
            <Text style={styles.heading}>Find your next favorite</Text>
            <SearchBar onChangeText={handleQueryChange} value={query} />
            {!query && topDeals.length > 0 ? (
              <View>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionTitle}>Top deals</Text>
                  <Text style={styles.sectionHint}>Limited-time picks</Text>
                </View>
                <DealsCarousel products={topDeals} />
              </View>
            ) : null}
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Shop by category</Text>
              {isLoadingSections ? (
                <ActivityIndicator color="#17191C" style={styles.categoryLoader} />
              ) : (
                <CategoryChips
                  categories={categories}
                  onSelect={handleCategorySelect}
                  selectedCategory={selectedCategory}
                />
              )}
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>
                {query
                  ? 'Search results'
                  : selectedCategory
                    ? selectedCategory.replace(/-/g, ' ')
                    : 'All products'}
              </Text>
              {!isLoading && total > 0 ? <Text style={styles.resultCount}>{total} items</Text> : null}
            </View>
          </View>
        }
        numColumns={2}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadFirstPage(debouncedQuery, true)}
            refreshing={isRefreshing}
            tintColor="#17191C"
          />
        }
        renderItem={({ item }) => <ProductCard product={item} />}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 24,
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
