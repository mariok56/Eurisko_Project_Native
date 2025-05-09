export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Verification: { email: string; password: string };
  ProductList: undefined;
  ProductDetail: { productId: string };
};