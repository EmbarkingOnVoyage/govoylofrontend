import { useQuery } from '@tanstack/react-query';
import { createRequest } from '../client';
import { LocationResponseSchema } from '../models/location.schema';

/**
 * Shared Architectural Location Service Hook
 * Replaces the old unprotected fetch loop with our contract validation core.
 */
export function useLocations() {
  return useQuery<string[], Error>({
    queryKey: ['locations', 'list'],
    queryFn: async () => {
      // 1. Pass request configuration straight to our core abstract client engine
      const validatedData = await createRequest({
        path: '/locations', // Clean path routing (base URL handled dynamically)
        schema: LocationResponseSchema, // Enforces the schema contract rule
      });

      // 2. Perform the array map transform safely on validated, guaranteed payloads
      return validatedData.map((item) => item.name);
    },
    staleTime: 1000 * 60 * 30, // Locations rarely change, cache for 30 mins to maximize speed
  });
}
