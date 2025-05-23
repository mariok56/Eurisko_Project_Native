export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Verification: {email: string; password: string};
  ForgotPassword: undefined;
  Home: undefined;
  ProductDetail: {productId: string};
  ProfileEdit: undefined;
  AddProduct: undefined;
  EditProduct: {productId: string};
};

export type TabParamList = {
  ProductsTab: undefined;
  PostsTab: undefined;
  ProfileTab: undefined;
};
