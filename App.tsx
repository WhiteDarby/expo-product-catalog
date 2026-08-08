import { StatusBar } from 'expo-status-bar';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MainTabs } from './src/navigation/MainTabs';
import { CartPersistence } from './src/components/CartPersistence';
import { SettingsPersistence } from './src/components/SettingsPersistence';
import { AnalyticsPersistence } from './src/components/AnalyticsPersistence';
import { useAppTheme } from './src/theme/theme';
import { store } from './src/store/store';

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
      <MainTabs />
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </NavigationContainer>
  );
}
