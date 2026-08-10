import { describe, test, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';
import { createRequest, ApiValidationError } from './client';

// Define a strict target test schema contract
const TestUserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
});

describe('Configuration-Driven Network Engine', () => {
  beforeEach(() => {
    vi.restoreAllMocks(); // Resets mock behavior between test passes
  });

  test('should pass successfully and infer types when API returns valid contract data', async () => {
    const mockApiResponse = {
      id: 101,
      name: 'Shwetamber Chourey',
      email: 'shwetamber@govoylo.com',
    };

    // Mock the global native fetch engine response
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse,
    } as Response);

    const result = await createRequest({
      path: '/v1/test-user',
      schema: TestUserSchema,
    });

    // Enforce contract integrity assertions
    expect(result.id).toBe(101);
    expect(result.name).toBe('Shwetamber Chourey');
    expect(result.email).toBe('shwetamber@govoylo.com');
  });

  test('should reject payload and throw ApiValidationError when contract is broken', async () => {
    const corruptApiResponse = {
      id: "NOT_A_NUMBER", // Structural breach: String instead of number
      name: 'Shwetamber Chourey',
      email: 'invalid-email-format', // Structural breach: Bad format
    };

    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => corruptApiResponse,
    } as Response);

    // Assert that the engine interceptor intercepts and throws the custom error contract
    await expect(
      createRequest({
        path: '/v1/test-user',
        schema: TestUserSchema,
      })
    ).rejects.toThrow(ApiValidationError);
  });
});
