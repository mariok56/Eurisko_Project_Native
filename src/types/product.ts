export interface ProductImage {
  url: string;
  _id?: string;
}

export interface Location {
  name: string;
  longitude: number;
  latitude: number;
}

export interface ProductUser {
  id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImage?: {
    url: string;
  };
}

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  images: ProductImage[];
  location?: Location;
  user?: ProductUser;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItems: number;
  limit: number;
}
