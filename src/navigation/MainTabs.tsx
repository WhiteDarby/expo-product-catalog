import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { CartScreen } from '../screens/CartScreen';
import { ProductListingScreen } from '../screens/ProductListingScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { useAppSelector } from '../store/hooks';
import { selectCartCount } from '../store/cartSlice';
import { useAppTheme } from '../theme/theme';
import { TabParamList } from './types';

const Tabs = createBottomTabNavigator<TabParamList>();

export function MainTabs() {
  const cartCount = useAppSelector(selectCartCount);
  const { colors } = useAppTheme();

  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: { fontSize: 12, fontWeight: '700' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderRadius: 25,
          borderTopWidth: 0,
          bottom: 16,
          elevation: 8,
          height: 68,
          paddingRight:8,
          paddingLeft: 8,
          paddingBottom: 8,
          paddingTop: 7,
          position: 'absolute',
          shadowColor: colors.text,
          shadowOffset: { height: 4, width: 0 },
          shadowOpacity: 0.08,
          shadowRadius: 12,
        },
      }}
    >
      <Tabs.Screen
        name="Home"
        component={ProductListingScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'home' : 'home-outline'} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="Cart"
        component={CartScreen}
        options={{
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: { backgroundColor: colors.danger, color: colors.background },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons color={color} name={focused ? 'cart' : 'cart-outline'} size={22} />
          ),
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              color={color}
              name={focused ? 'settings' : 'settings-outline'}
              size={22}
            />
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
