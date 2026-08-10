import { z } from 'zod';

// 1. The Strict Runtime Data Contract Validation Engine
export const BookingSchema = z.object({
  id: z.string().uuid(),                     // Enforces a strict, valid UUID string
  customerName: z.string().min(2),           // Enforces name strings must be at least 2 characters
  serviceDate: z.string(),                   // ISO Date string format
  amount: z.number().positive(),             // Financial amount contract validation
  status: z.enum(['pending', 'confirmed', 'cancelled']), // Strict Enum contract
});

// 2. The Strict Runtime List Contract Validation Engine
export const BookingListSchema = z.array(BookingSchema);

// 3. COMPILE-TIME INFERENCE: This extracts a flawless Type Contract 
// for your UI layer automatically, with zero duplicate writing effort.
export type IBooking = z.infer<typeof BookingSchema>;
