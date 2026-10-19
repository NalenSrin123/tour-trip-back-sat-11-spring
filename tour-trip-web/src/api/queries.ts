import type { Destination } from '../types';
import { apiClient } from './client';
import { extractData } from './utils';

export const destinationsQueryOptions = {
  queryKey: ['destinations'] as const,
  queryFn: async (): Promise<Destination[]> => extractData(await apiClient.get('/api/v1/destinations')),
};
