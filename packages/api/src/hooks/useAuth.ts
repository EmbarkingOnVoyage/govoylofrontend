// packages/api/src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import {
  LoginRequest, LoginResponse, LoginResponseSchema,
  OtpRequest, OtpResponse, OtpResponseSchema // 💡 Import new models
} from '../models/auth.schema';
import { AUTH_BASE_URL } from '../authConfig';

// --- Existing Password Login Engine ---
async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Authentication failed');
  const rawData = await response.json();
  return LoginResponseSchema.parse(rawData);
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginUser(credentials),
    onSuccess: (data) => console.log('Login token assigned:', data.token),
    onError: (error) => console.error('Login error:', error.message)
  });
}


// --- 💡 NEW: Systematic Request OTP Mutation Engine ---
// ORIGINAL REAL-API IMPLEMENTATION — restore this once a real send-otp
// backend exists at the correct URL; commented out in favor of the dev
// mock below, which lets the OTP flow be tested without a live backend.
async function requestOtp(payload: OtpRequest): Promise<OtpResponse> {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Failed to send OTP verification email. Please try again.');
  }

  const rawData = await response.json();

  // Enforce schema validation contract at runtime
  return OtpResponseSchema.parse(rawData);
}

// TEMPORARY DEV MOCK: there is no real backend at localhost:5037 yet, so
// every OTP request would otherwise fail with a network error. Simulates a
// successful dispatch instead — swap back to the real implementation above
// once an actual send-otp endpoint exists.
// async function requestOtp(payload: OtpRequest): Promise<OtpResponse> {
//   return OtpResponseSchema.parse({
//     success: true,
//     message: `Mock OTP sent to ${payload.email} (dev mode) — enter 123456 to verify.`,
//   });
// }

/**
 * Custom Hook to trigger the OTP sequence during login/sign up
 */
export function useRequestOtpMutation() {
  return useMutation({
    mutationFn: (payload: OtpRequest) => requestOtp(payload),
    onSuccess: (data) => {
      console.log('OTP request lifecycle success:', data.message || 'OTP dispatched');
    },
    onError: (error) => {
      console.error('OTP request error intercepted:', error.message);
    }
  });
}
