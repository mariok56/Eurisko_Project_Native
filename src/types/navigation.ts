export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Verification: { email: string; password: string };
  Home: undefined;
  ProductList: undefined;
  ProductDetail: { productId: string };
};