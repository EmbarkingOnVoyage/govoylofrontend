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
  verificationToken: z.string(),
  message: z.string().optional(),
});
export type OtpResponse = z.infer<typeof OtpResponseSchema>;

// Contract: Shape of data sent to verify an OTP code
export const VerifyOtpRequestSchema = z.object({
  email: z.string().email('Invalid email address format'),
  verificationToken: z.string(),
  otp: z.string(),
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;

// Contract: Shape of data returned from the backend after verifying an OTP
export const VerifyOtpResponseSchema = z.object({
  isVerified: z.boolean(),
  message: z.string().optional(),
});
export type VerifyOtpResponse = z.infer<typeof VerifyOtpResponseSchema>;
