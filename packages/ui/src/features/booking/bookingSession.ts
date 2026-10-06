import { useCallback, useState } from "react";

// Every bookable product goes through the same steps (search -> results ->
// details -> travellers -> pay), so each one keeps its in-progress selection
// here under its own key. sessionStorage keeps it per browser tab and across
// a refresh, but not after the tab closes; prices are re-checked at hold time
// anyway, so a selection is never trusted as a final price.
export type BookingVertical = "flights" | "hotels" | "buses" | "cabs" | "holidays";

const STORAGE_PREFIX = "govoylo_booking_";

function storageKey(vertical: BookingVertical): string {
  return `${STORAGE_PREFIX}${vertical}`;
}

export function readBookingSession<T>(vertical: BookingVertical): T | null {
  try {
    const raw = sessionStorage.getItem(storageKey(vertical));
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeBookingSession<T>(vertical: BookingVertical, value: T): void {
  try {
    sessionStorage.setItem(storageKey(vertical), JSON.stringify(value));
  } catch {
    // Storage unavailable or full — the selection just won't survive a refresh.
  }
}

export function clearBookingSession(vertical: BookingVertical): void {
  try {
    sessionStorage.removeItem(storageKey(vertical));
  } catch {
    // Storage unavailable — nothing to clear.
  }
}

// React state backed by the vertical's session entry. Passing null clears it.
export function useBookingSession<T>(vertical: BookingVertical): [T | null, (value: T | null) => void] {
  const [value, setValue] = useState<T | null>(() => readBookingSession<T>(vertical));

  const update = useCallback(
    (next: T | null) => {
      if (next === null) {
        clearBookingSession(vertical);
      } else {
        writeBookingSession(vertical, next);
      }
      setValue(next);
    },
    [vertical]
  );

  return [value, update];
}
