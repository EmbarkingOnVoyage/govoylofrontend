// packages/api/src/models/auth.schema.ts
import { z } from 'zod';

// --- Existing Password Schema Codes ---
export const LoginRequestSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({ id: z.string(), email: z.string(), name: z.string() }),
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;


// --- 💡 NEW: OTP Flow Structural Schemas ---

// Contract: Shape of data sent to trigger the OTP email
export const OtpRequestSchema = z.object({
  email: z.string().email('Invalid email address format'),
});
export type OtpRequest = z.infer<typeof OtpRequestSchema>;

// Contract: Shape of data returned from the backend after sending OTP
export const OtpResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});
export type OtpResponse = z.infer<typeof OtpResponseSchema>;
