import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasMore: boolean;
}

interface UsePagedQueryOptions {
  pageSize?: number;
  params?: Record<string, unknown>;
}

export function usePagedQuery<T>(
  baseKey: string,
  url: string,
  options: UsePagedQueryOptions = {}
) {
  const { pageSize = 12, params = {} } = options;
  const [page, setPage] = useState(1);
  const paramsKey = JSON.stringify(params);

  const query = useQuery({
    queryKey: [baseKey, 'page', page, pageSize, paramsKey],
    queryFn: async (): Promise<PageResponse<T>> => {
      const res = await apiClient.get<PageResponse<T>>(url, {
        params: { page: page - 1, size: pageSize, ...params },
      });
      return res.data;
    },
    placeholderData: keepPreviousData,
  });

  return {
    refetch: query.refetch,
    isLoading: query.isPending,
    isFetching: query.isFetching,
    page,
    setPage,
    pageSize,
    items: query.data?.content ?? ([] as T[]),
    total: query.data?.totalElements ?? 0,
    totalPages: query.data?.totalPages ?? 1,
  };
}
