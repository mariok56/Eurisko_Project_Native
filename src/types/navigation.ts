export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Verification: {email: string; password: string};
  ForgotPassword: undefined;
  Home: undefined; // This is for the TabNavigator
  ProductDetail: {productId: string};
  ProfileEdit: undefined;
  AddProduct: undefined;
  EditProduct: {productId: string};
};

// Add separate type for tab navigation
export type TabParamList = {
  ProductsTab: undefined;
  ProfileTab: undefined;
};
