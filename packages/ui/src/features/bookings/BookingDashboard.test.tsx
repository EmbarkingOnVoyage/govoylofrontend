import React from 'react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { BookingDashboard } from './BookingDashboard';
import * as apiModule from '@workspace/api';

// Create automated mock spies for our custom data hooks
vi.mock('@workspace/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@workspace/api')>();
  return {
    ...actual,
    useBookings: vi.fn(),
  };
});

describe('BookingDashboard End-to-End Integration Contract', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test('1. should show an asynchronous loading spinner while data fetching is active', () => {
    // Force the repository hook to return an active loading state configuration
    vi.spyOn(apiModule, 'useBookings').mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { getByText } = render(<BookingDashboard />);
    expect(getByText('Loading bookings safely...')).toBeTruthy();
  });

  test('2. should map completely validated payload contracts cleanly into UI text and card views', () => {
    const mockBookings: apiModule.IBooking[] = [
      {
        id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
        customerName: 'Alex Mercer',
        serviceDate: '2026-07-22T10:00:00.000Z',
        amount: 250.0,
        status: 'confirmed',
      },
    ];

    vi.spyOn(apiModule, 'useBookings').mockReturnValue({
      data: mockBookings,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any);

    const { getByText } = render(<BookingDashboard />);

    // Assert data elements exist exactly as structuralized by the API layer contract
    expect(getByText('CONFIRMED')).toBeTruthy();
    expect(getByText('Alex Mercer')).toBeTruthy();
    expect(getByText('$250.00')).toBeTruthy();
  });

  test('3. should handle transport level failure exceptions gracefully and show a retry bridge', () => {
    vi.spyOn(apiModule, 'useBookings').mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Internal Server Connection Failure (500)'),
      refetch: vi.fn(),
    } as any);

    const { getByText } = render(<BookingDashboard />);

    expect(getByText('Unable to load dashboard records')).toBeTruthy();
    expect(getByText('Internal Server Connection Failure (500)')).toBeTruthy();
    expect(getByText('Retry Connection')).toBeTruthy();
  });
});
