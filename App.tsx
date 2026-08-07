import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { MainTabs } from './src/navigation/MainTabs';
import { ReturnPolicyScreen } from './src/screens/ReturnPolicyScreen';
import { RootStackParamList } from './src/navigation/types';
import { CartPersistence } from './src/components/CartPersistence';
import { SettingsPersistence } from './src/components/SettingsPersistence';
import { AnalyticsPersistence } from './src/components/AnalyticsPersistence';
import { useAppTheme } from './src/theme/theme';
import { store } from './src/store/store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <CartPersistence />
        <SettingsPersistence />
        <AnalyticsPersistence />
        <ThemedNavigation />
      </Provider>
    </SafeAreaProvider>
  );
}

function ThemedNavigation() {
  const { colors, mode } = useAppTheme();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        dark: mode === 'dark',
        colors: {
          background: colors.background,
          border: colors.border,
          card: colors.surface,
          notification: colors.danger,
          primary: colors.accent,
          text: colors.text,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen component={MainTabs} name="MainTabs" />
        <Stack.Screen component={ProductDetailScreen} name="ProductDetail" />
        <Stack.Screen component={ReturnPolicyScreen} name="ReturnPolicy" />
      </Stack.Navigator>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}
