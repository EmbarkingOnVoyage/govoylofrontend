import { describe, test, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { clearBookingSession, readBookingSession, useBookingSession, writeBookingSession } from './bookingSession';

describe('booking session', () => {
  beforeEach(() => sessionStorage.clear());

  test('each vertical keeps its own selection', () => {
    writeBookingSession('flights', { legs: 1 });
    writeBookingSession('hotels', { rooms: 2 });
    expect(readBookingSession('flights')).toEqual({ legs: 1 });
    expect(readBookingSession('hotels')).toEqual({ rooms: 2 });
    clearBookingSession('flights');
    expect(readBookingSession('flights')).toBeNull();
    expect(readBookingSession('hotels')).toEqual({ rooms: 2 });
  });

  test('unreadable stored data reads as no selection', () => {
    sessionStorage.setItem('govoylo_booking_flights', '{not json');
    expect(readBookingSession('flights')).toBeNull();
  });

  test('the hook starts from storage and writes through', () => {
    writeBookingSession('flights', { legs: 1 });
    const { result } = renderHook(() => useBookingSession<{ legs: number }>('flights'));
    expect(result.current[0]).toEqual({ legs: 1 });

    act(() => result.current[1]({ legs: 2 }));
    expect(result.current[0]).toEqual({ legs: 2 });
    expect(readBookingSession('flights')).toEqual({ legs: 2 });

    act(() => result.current[1](null));
    expect(result.current[0]).toBeNull();
    expect(sessionStorage.getItem('govoylo_booking_flights')).toBeNull();
  });
});
