import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { TabParamList } from '../navigation/types';
import { useAppTheme } from '../theme/theme';
import {
  clearCart,
  decreaseQuantity,
  increaseQuantity,
  removeFromCart,
  selectCartItems,
  selectCartSubtotal,
} from '../store/cartSlice';

function formatPrice(price: number) {
  return `$${price.toFixed(2)}`;
}

export function CartScreen() {
  const dispatch = useAppDispatch();
  const { colors } = useAppTheme();
  const navigation = useNavigation<BottomTabNavigationProp<TabParamList, 'Cart'>>();
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartSubtotal);

  const openProduct = useCallback(
    (productId: number) => {
      navigation.navigate('Home', {
        params: { productId },
        screen: 'ProductDetail',
      });
    },
    [navigation],
  );

  if (items.length === 0) {
    return (
      <View style={[styles.emptyScreen, { backgroundColor: colors.background }]}>
        <Text style={[styles.emptyIcon, { backgroundColor: colors.accentSoft, color: colors.danger }]}>+</Text>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
        <Text style={[styles.emptyMessage, { color: colors.mutedText }]}>
          Add something you love and it will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>YOUR BAG</Text>
            <Text style={[styles.title, { color: colors.text }]}>Cart</Text>
          </View>
          <Pressable accessibilityRole="button" onPress={() => dispatch(clearCart())}>
            <Text style={[styles.clearText, { color: colors.danger }]}>Clear all</Text>
          </Pressable>
        </View>

        {items.map(({ product, quantity }) => {
          const price =
            product.price * (1 - product.discountPercentage / 100);
          return (
            <View key={product.id} style={[styles.itemCard, { backgroundColor: colors.surface }]}>
              <Pressable
                onPress={() => openProduct(product.id)}
                style={styles.itemImageWrap}
              >
                <Image source={{ uri: product.thumbnail }} style={[styles.itemImage, { backgroundColor: colors.imageBackground }]} />
              </Pressable>
              <View style={styles.itemInfo}>
                <Text numberOfLines={2} style={[styles.itemTitle, { color: colors.text }]}>{product.title}</Text>
                <Text style={[styles.itemCategory, { color: colors.subtleText }]}>{product.category}</Text>
                <Text style={[styles.itemPrice, { color: colors.text }]}>{formatPrice(price)}</Text>
                <View style={styles.itemFooter}>
                  <View style={styles.quantityControl}>
                    <Pressable
                      accessibilityLabel={`Decrease ${product.title} quantity`}
                      onPress={() => dispatch(decreaseQuantity(product.id))}
                      style={[styles.quantityButton, { backgroundColor: colors.input }]}
                    >
                      <Text style={[styles.quantityButtonText, { color: colors.text }]}>-</Text>
                    </Pressable>
                    <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
                    <Pressable
                      accessibilityLabel={`Increase ${product.title} quantity`}
                      onPress={() => dispatch(increaseQuantity(product.id))}
                      style={[styles.quantityButton, { backgroundColor: colors.input }]}
                    >
                      <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
                    </Pressable>
                  </View>
                  <Pressable
                    accessibilityLabel={`Remove ${product.title}`}
                    onPress={() => dispatch(removeFromCart(product.id))}
                  >
                    <Text style={[styles.removeText, { color: colors.subtleText }]}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          );
        })}

        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{formatPrice(subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.mutedText }]}>Shipping</Text>
            <Text style={[styles.freeText, { color: colors.success }]}>Calculated at checkout</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>{formatPrice(subtotal)}</Text>
          </View>
        </View>
        <Text style={[styles.checkoutNote, { color: colors.subtleText }]}>Checkout will be available in the next step.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  clearText: {
    color: '#B44837',
    fontSize: 13,
    fontWeight: '700',
  },
  checkoutNote: {
    color: '#8A8F98',
    fontSize: 12,
    marginTop: 14,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  divider: {
    backgroundColor: '#E7E8E5',
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  emptyIcon: {
    alignItems: 'center',
    backgroundColor: '#F3EADF',
    borderRadius: 32,
    color: '#B44837',
    fontSize: 28,
    height: 64,
    lineHeight: 61,
    marginBottom: 18,
    textAlign: 'center',
    width: 64,
  },
  emptyMessage: {
    color: '#777D86',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 260,
    textAlign: 'center',
  },
  emptyScreen: {
    alignItems: 'center',
    backgroundColor: '#FBFBF9',
    flex: 1,
    justifyContent: 'center',
    padding: 30,
  },
  emptyTitle: {
    color: '#17191C',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 7,
  },
  eyebrow: {
    color: '#8B6215',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.7,
    marginBottom: 7,
  },
  freeText: {
    color: '#4E674C',
    fontSize: 12,
  },
  headerRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    flexDirection: 'row',
    marginBottom: 12,
    padding: 10,
  },
  itemCategory: {
    color: '#8A8F98',
    fontSize: 11,
    marginTop: 5,
    textTransform: 'capitalize',
  },
  itemFooter: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  itemImage: {
    height: '100%',
    width: '100%',
  },
  itemImageWrap: {
    backgroundColor: '#F5F5F2',
    borderRadius: 12,
    height: 102,
    overflow: 'hidden',
    width: 92,
  },
  itemInfo: {
    flex: 1,
    paddingLeft: 13,
  },
  itemPrice: {
    color: '#17191C',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 7,
  },
  itemTitle: {
    color: '#17191C',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  quantity: {
    color: '#17191C',
    fontSize: 13,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
  quantityButton: {
    alignItems: 'center',
    backgroundColor: '#F2F3F5',
    borderRadius: 12,
    height: 25,
    justifyContent: 'center',
    width: 25,
  },
  quantityButtonText: {
    color: '#17191C',
    fontSize: 16,
    lineHeight: 18,
  },
  quantityControl: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  removeText: {
    color: '#8A8F98',
    fontSize: 11,
  },
  screen: {
    backgroundColor: '#FBFBF9',
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 12,
    padding: 17,
  },
  summaryLabel: {
    color: '#777D86',
    fontSize: 13,
  },
  summaryRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  summaryValue: {
    color: '#17191C',
    fontSize: 13,
    fontWeight: '700',
  },
  title: {
    color: '#17191C',
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.7,
  },
  totalLabel: {
    color: '#17191C',
    fontSize: 16,
    fontWeight: '800',
  },
  totalValue: {
    color: '#17191C',
    fontSize: 20,
    fontWeight: '900',
  },
});
