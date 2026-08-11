import { useQuery } from '@tanstack/react-query';
import { createRequest } from '../client';
import { BookingListSchema, IBooking } from '../models/booking.schema';

/**
 * Shared Architectural Data Service Hook
 * Fetches, validates, caches, and returns your booking records securely.
 */
export function useBookings() {
  return useQuery<IBooking[], Error>({
    queryKey: ['bookings', 'list'], // Unique memory storage caching address key
    queryFn: async () => {
      // Execute the request through our validation contract network client engine
      return createRequest({
        path: '/v1/bookings', // Simulated backend endpoint path string
        schema: BookingListSchema, // Enforce our strict schema validation engine
      });
    },
    staleTime: 1000 * 60 * 5, // Cache stays fresh for 5 minutes (Optimistic Memory Control)
    retry: 2, // Automatically retry 2 times before throwing a network error layout
  });
}
