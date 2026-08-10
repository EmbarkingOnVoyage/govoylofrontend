import { z } from 'zod';

// Strict Architectural Error Class Contracts
export class ApiNetworkError extends Error {
  constructor(public status: number, message: string, public details?: any) {
    super(message);
    this.name = 'ApiNetworkError';
  }
}

export class ApiValidationError extends Error {
  constructor(message: string, public issues: z.ZodIssue[]) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

// Configuration Contract Schema for Requests
export interface IRequestConfig<TResponseSchema extends z.ZodTypeAny> {
  path: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  schema: TResponseSchema; // The strict structural validation contract
  baseUrl?: string;
}

const DEFAULT_BASE_URL = 'https://govoylo.com'; // Global Architecture Endpoint Standard

/**
 * Core Abstract Network Engine Function
 * Enforces dynamic runtime contract safety using Zod
 */
export async function createRequest<TResponseSchema extends z.ZodTypeAny>(
  config: IRequestConfig<TResponseSchema>
): Promise<z.infer<TResponseSchema>> {
  const { path, method = 'GET', body, schema, baseUrl = DEFAULT_BASE_URL } = config;
  const url = `${baseUrl}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Perform Network Call using standard cross-platform fetch API
  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Handle Infrastructure Level Errors (e.g. 404, 500)
  if (!response.ok) {
    let errorDetails: any = null;
    try {
      errorDetails = await response.json();
    } catch {
      errorDetails = await response.text();
    }
    throw new ApiNetworkError(response.status, `Network request failed at: ${path}`, errorDetails);
  }

  const rawData = await response.json();

  // Run data through the runtime configuration contract
  const validationResult = schema.safeParse(rawData);

  if (!validationResult.success) {
    // Log contract failures automatically for developer analysis
    console.error(`[ARCHITECTURE CONTRACT VIOLATION] Data mismatch at ${path}:`, validationResult.error.issues);
    throw new ApiValidationError(`API data contract broken for route: ${path}`, validationResult.error.issues);
  }

  // Return strictly typed data matching the schema definition
  return validationResult.data;
}
