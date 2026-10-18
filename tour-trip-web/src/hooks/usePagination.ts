import { useCallback, useMemo, useState } from 'react';

export interface UsePaginationResult<T> {
  page: number;
  setPage: (page: number) => void;
  totalPages: number;
  pageItems: T[];
  total: number;
  pageSize: number;
}

export function usePagination<T>(items: T[], pageSize = 12): UsePaginationResult<T> {
  const [rawPage, setRawPage] = useState(1);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(rawPage, totalPages);

  const setPage = useCallback((next: number) => {
    setRawPage(Math.max(1, next));
  }, []);

  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize]
  );

  return { page, setPage, totalPages, pageItems, total, pageSize };
}
