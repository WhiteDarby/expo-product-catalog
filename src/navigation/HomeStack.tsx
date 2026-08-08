import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProductDetailScreen } from '../screens/ProductDetailScreen';
import { ProductListingScreen } from '../screens/ProductListingScreen';
import { ReturnPolicyScreen } from '../screens/ReturnPolicyScreen';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={ProductListingScreen} name="Catalog" />
      <Stack.Screen component={ProductDetailScreen} name="ProductDetail" />
      <Stack.Screen component={ReturnPolicyScreen} name="ReturnPolicy" />
    </Stack.Navigator>
  );
}
