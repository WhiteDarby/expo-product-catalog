import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { ProductListingScreen } from './src/screens/ProductListingScreen';
import { store } from './src/store/store';

export default function App() {
  return (
    <Provider store={store}>
      <ProductListingScreen />
      <StatusBar style="dark" />
    </Provider>
  );
}
