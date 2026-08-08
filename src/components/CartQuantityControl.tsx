import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  addToCart,
  decreaseQuantity,
  increaseQuantity,
  selectCartQuantity,
} from '../store/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useAppTheme } from '../theme/theme';
import { Product } from '../types/product';
import { trackEvent } from '../utils/analytics';

type CartQuantityControlProps = {
  compact?: boolean;
  product: Product;
};

export function CartQuantityControl({
  compact = false,
  product,
}: CartQuantityControlProps) {
  const dispatch = useAppDispatch();
  const { colors, mode } = useAppTheme();
  const controlBackground = mode === 'dark'
    ? 'rgba(27, 30, 33, 0.82)'
    : 'rgba(255, 255, 255, 0.78)';
  const quantity = useAppSelector((state) =>
    selectCartQuantity(state, product.id),
  );

  const stopCardPress = (event: { stopPropagation: () => void }) => {
    event.stopPropagation();
  };

  const addProduct = () => {
    dispatch(addToCart(product));
    if (quantity === 0) {
      trackEvent(dispatch, 'add_to_cart', {
        productId: product.id,
        productTitle: product.title,
      });
    }
  };

  if (quantity === 0) {
    return (
      <Pressable
        accessibilityLabel={`Add ${product.title} to cart`}
        accessibilityRole="button"
        hitSlop={5}
        onPress={(event) => {
          stopCardPress(event);
          addProduct();
        }}
        style={[
          styles.addButton,
          compact && styles.compactAddButton,
          { backgroundColor: controlBackground },
        ]}
      >
        <Ionicons color={colors.text} name="add" size={compact ? 19 : 21} />
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.stepper,
        compact && styles.compactStepper,
        { backgroundColor: controlBackground },
      ]}
    >
      <Pressable
        accessibilityLabel={`Decrease ${product.title} quantity`}
        accessibilityRole="button"
        hitSlop={4}
        onPress={(event) => {
          stopCardPress(event);
          dispatch(decreaseQuantity(product.id));
        }}
        style={styles.stepperButton}
      >
        <Ionicons color={colors.text} name="remove" size={compact ? 15 : 17} />
      </Pressable>
      <Text style={[styles.quantity, { color: colors.text }]}>{quantity}</Text>
      <Pressable
        accessibilityLabel={`Increase ${product.title} quantity`}
        accessibilityRole="button"
        hitSlop={4}
        onPress={(event) => {
          stopCardPress(event);
          dispatch(increaseQuantity(product.id));
        }}
        style={styles.stepperButton}
      >
        <Ionicons color={colors.text} name="add" size={compact ? 15 : 17} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    borderRadius: 18,
    bottom: 10,
    elevation: 3,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    right: 10,
    shadowColor: '#17191C',
    shadowOpacity: 0.13,
    shadowRadius: 4,
    width: 36,
  },
  compactAddButton: {
    bottom: 8,
    height: 32,
    right: 8,
    width: 32,
  },
  compactStepper: {
    bottom: 8,
    right: 8,
  },
  quantity: {
    fontSize: 13,
    fontWeight: '800',
    minWidth: 20,
    textAlign: 'center',
  },
  stepper: {
    alignItems: 'center',
    borderRadius: 18,
    bottom: 10,
    elevation: 3,
    flexDirection: 'row',
    height: 36,
    justifyContent: 'space-between',
    paddingHorizontal: 3,
    position: 'absolute',
    right: 10,
    shadowColor: '#17191C',
    shadowOpacity: 0.13,
    shadowRadius: 4,
  },
  stepperButton: {
    alignItems: 'center',
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
});
