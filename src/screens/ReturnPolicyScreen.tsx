import { useLayoutEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../navigation/types';
import { useAppTheme } from '../theme/theme';

type ReturnPolicyScreenProps = NativeStackScreenProps<
  HomeStackParamList,
  'ReturnPolicy'
>;

export function ReturnPolicyScreen({ navigation }: ReturnPolicyScreenProps) {
  const { colors } = useAppTheme();
  useLayoutEffect(() => {
    navigation.setOptions({ headerShown: true, title: 'Return Policy' });
  }, [navigation]);

  return (
    <WebView
      startInLoadingState
      renderLoading={() => (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.text} size="large" />
        </View>
      )}
      source={{ uri: 'https://www.shopify.com/blog/return-policy' }}
      style={[styles.webview, { backgroundColor: colors.background }]}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: '#FBFBF9',
    flex: 1,
    justifyContent: 'center',
  },
  webview: {
    flex: 1,
  },
});
