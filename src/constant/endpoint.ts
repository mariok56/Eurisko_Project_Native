export const endpoints = {
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/signup',
    verify: '/api/auth/verify-otp',
    resendOtp: '/api/auth/resend-verification-otp',
    refreshToken: '/api/auth/refresh-token',
    forgotPassword: '/api/auth/forgot-password',
  },
  user: {
    getUser: '/api/user/profile',
    getUserById: '/api/user/profile/:userId',
    updateUser: '/api/user/profile',
  },
  posts: {
    getPosts: '/api/posts',
  },
  products: {
    getProducts: '/api/products',
    searchProducts: '/api/products/search',
    getProductById: '/api/products/:id',
    createProduct: '/api/products',
    updateProduct: '/api/products/:id',
    deleteProduct: '/api/products/:id',
  },
};
