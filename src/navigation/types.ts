import { NavigatorScreenParams } from '@react-navigation/native';

export type HomeStackParamList = {
  Catalog: undefined;
  ProductDetail: { productId: number };
  ReturnPolicy: undefined;
};

export type TabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Cart: undefined;
  Settings: undefined;
};
