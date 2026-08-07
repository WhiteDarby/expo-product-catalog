import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { ProductListingScreen } from './src/screens/ProductListingScreen';
import { RootStackParamList } from './src/navigation/types';
import { store } from './src/store/store';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen component={ProductListingScreen} name="Products" />
            <Stack.Screen component={ProductDetailScreen} name="ProductDetail" />
          </Stack.Navigator>
          <StatusBar style="dark" />
        </NavigationContainer>
      </Provider>
    </SafeAreaProvider>
  );
}
