import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import * as productsApi from '../services/productApi';
import {ProductFilter} from '../types/product';
import {getUserFriendlyErrorMessage} from '../utils/errorHandling';
import {ImageFile} from '../types/auth';

// Hook for fetching products with filters
export const useProducts = (filters: ProductFilter = {}) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => productsApi.getProducts(filters),
    retry: 1,
    refetchOnWindowFocus: false,
    select: data => ({
      products: data.data || [],
      pagination: data.pagination,
      success: data.success,
    }),
  });
};

// Hook for searching products
export const useSearchProducts = (query: string) => {
  return useQuery({
    queryKey: ['products', 'search', query],
    queryFn: () => productsApi.searchProducts(query),
    enabled: query.length > 0, // Only run query if there's a search term
    retry: 1,
    refetchOnWindowFocus: false,
    select: data => ({
      products: data.data || [],
      success: data.success,
    }),
  });
};

// Hook for fetching single product by ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
    retry: 1,
    refetchOnWindowFocus: false,
    select: data => ({
      product: data.data,
      success: data.success,
    }),
  });
};

// Hook for creating a new product
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      price: number;
      location: {
        name: string;
        longitude: number;
        latitude: number;
      };
      images: ImageFile[];
    }) => {
      try {
        const response = await productsApi.createProduct(data);

        if (!response.success) {
          throw new Error('Failed to create product');
        }

        return response.data;
      } catch (error) {
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({queryKey: ['products']});
    },
  });
};

// Hook for updating a product
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: {
        title?: string;
        description?: string;
        price?: number;
        location?: {
          name: string;
          longitude: number;
          latitude: number;
        };
        images?: ImageFile[];
      };
    }) => {
      try {
        const response = await productsApi.updateProduct(id, data);

        if (!response.success) {
          throw new Error('Failed to update product');
        }

        return response.data;
      } catch (error) {
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
    onSuccess: updatedProduct => {
      // Invalidate products list and specific product queries
      queryClient.invalidateQueries({queryKey: ['products']});
      queryClient.invalidateQueries({
        queryKey: ['product', updatedProduct._id],
      });
    },
  });
};

// Hook for deleting a product
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      try {
        const response = await productsApi.deleteProduct(id);

        if (!response.success) {
          throw new Error('Failed to delete product');
        }

        return response;
      } catch (error) {
        const userFriendlyMessage = getUserFriendlyErrorMessage(error);
        throw new Error(userFriendlyMessage);
      }
    },
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({queryKey: ['products']});
    },
  });
};
