import {useQuery} from '@tanstack/react-query';
import * as postsApi from '../services/postsApi';

interface PostsFilter {
  page?: number;
  limit?: number;
}

export const usePosts = (filters: PostsFilter = {}) => {
  return useQuery({
    queryKey: ['posts', filters],
    queryFn: () => postsApi.getPosts(filters),
    retry: 1,
    refetchOnWindowFocus: false,
    select: data => ({
      posts: data.data || [],
      pagination: data.pagination,
      success: data.success,
    }),
  });
};
