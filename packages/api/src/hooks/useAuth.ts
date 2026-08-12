// packages/api/src/hooks/useAuth.ts
import { useMutation } from '@tanstack/react-query';
import { LoginRequest, LoginResponse, LoginResponseSchema } from '../models/auth.schema';

// Simulated fetch client engine adhering to your client.ts configuration
async function loginUser(payload: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('https://yourbackend.com', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('Authentication failed');
  }

  const rawData = await response.json();
  
  // Strict Contract Enforcement Check at runtime
  return LoginResponseSchema.parse(rawData);
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: (credentials: LoginRequest) => loginUser(credentials),
    onSuccess: (data) => {
      // Logic to save token inside packages/state/auth can go here
      console.log('Login successful, token assigned:', data.token);
    },
    onError: (error) => {
      console.error('Login runtime error intercepted:', error.message);
    }
  });
}
