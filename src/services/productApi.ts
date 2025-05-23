import apiClient from '../lib/axioInstance';
import {endpoints} from '../constant/endpoint';
import {Product, ProductFilter, PaginationData} from '../types/product';
import {ImageFile} from '../types/auth';

interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: PaginationData;
}

interface ProductResponse {
  success: boolean;
  data: Product;
}

interface CreateProductData {
  title: string;
  description: string;
  price: number;
  location: {
    name: string;
    longitude: number;
    latitude: number;
  };
  images: ImageFile[];
}

interface UpdateProductData extends Partial<CreateProductData> {}

// Get products with filters and pagination
export const getProducts = async (
  filters: ProductFilter = {},
): Promise<ProductsResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.minPrice) {
      params.append('minPrice', filters.minPrice.toString());
    }
    if (filters.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters.sortBy) {
      params.append('sortBy', filters.sortBy);
    }
    if (filters.order) {
      params.append('order', filters.order);
    }

    const url = `${endpoints.products.getProducts}?${params.toString()}`;
    const response = await apiClient.get<ProductsResponse>(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Search products
export const searchProducts = async (
  query: string,
): Promise<ProductsResponse> => {
  try {
    const response = await apiClient.get<ProductsResponse>(
      `${endpoints.products.searchProducts}?query=${encodeURIComponent(query)}`,
    );

    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<ProductResponse> => {
  try {
    const url = endpoints.products.getProductById.replace(':id', id);
    const response = await apiClient.get<ProductResponse>(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    throw error;
  }
};

// Create new product
export const createProduct = async (
  data: CreateProductData,
): Promise<ProductResponse> => {
  try {
    const formData = new FormData();

    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('location', JSON.stringify(data.location));

    // Add images
    data.images.forEach((image, index) => {
      if (image.uri) {
        formData.append('images', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.fileName || `image_${index}.jpg`,
        } as any);
      }
    });

    const response = await apiClient.post<ProductResponse>(
      endpoints.products.createProduct,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update product
export const updateProduct = async (
  id: string,
  data: UpdateProductData,
): Promise<ProductResponse> => {
  try {
    const formData = new FormData();

    if (data.title) {
      formData.append('title', data.title);
    }
    if (data.description) {
      formData.append('description', data.description);
    }
    if (data.price) {
      formData.append('price', data.price.toString());
    }
    if (data.location) {
      formData.append('location', JSON.stringify(data.location));
    }

    // Add images if provided
    if (data.images) {
      data.images.forEach((image, index) => {
        if (image.uri) {
          formData.append('images', {
            uri: image.uri,
            type: image.type || 'image/jpeg',
            name: image.fileName || `image_${index}.jpg`,
          } as any);
        }
      });
    }

    const url = endpoints.products.updateProduct.replace(':id', id);
    const response = await apiClient.put<ProductResponse>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (
  id: string,
): Promise<{success: boolean; message: string}> => {
  try {
    const url = endpoints.products.deleteProduct.replace(':id', id);
    const response = await apiClient.delete<{
      success: boolean;
      data: {message: string};
    }>(url);

    return {
      success: response.data.success,
      message: response.data.data.message,
    };
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};
