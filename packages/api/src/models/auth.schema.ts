// packages/api/src/models/auth.model.ts
import { z } from 'zod';

// Contract: Shape of data sent to Backend
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// Contract: Shape of data returned from Backend
export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    email: z.string(),
    name: z.string(),
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;
