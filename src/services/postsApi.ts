import apiClient from '../lib/axioInstance';
import {endpoints} from '../constant/endpoint';

export interface Post {
  _id: string;
  article_id: string;
  title: string;
  link: string;
  keywords: string[];
  creator: string[];
  video_url: string | null;
  description: string;
  content: string;
  pubDate: string;
  image_url: string;
  source_id: string;
  source_priority: number;
  source_url: string;
  source_icon: string | null;
  language: string;
  country: string[];
  category: string[];
  ai_tag: string;
  sentiment: string;
  sentiment_stats: string;
  ai_region: string;
}

interface PostsResponse {
  success: boolean;
  data: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalItems: number;
    limit: number;
  };
}

interface PostsFilter {
  page?: number;
  limit?: number;
}

export const getPosts = async (
  filters: PostsFilter = {},
): Promise<PostsResponse> => {
  try {
    const params = new URLSearchParams();

    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }

    const url = `${endpoints.posts.getPosts}?${params.toString()}`;
    const response = await apiClient.get<PostsResponse>(url);

    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};
