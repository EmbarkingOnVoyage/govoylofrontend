import { z } from 'zod';

// Strict runtime schema contract mapping for a location item
export const LocationResponseSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
  })
);

// TypeScript compile-time type inferred directly from our runtime contract
export type ILocationResponse = z.infer<typeof LocationResponseSchema>;
