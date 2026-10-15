import { useMemo } from 'react';
import type { FlightOffer } from './useSearchFlightsMobile';
import { useAirportsByCodesMobile } from './useAirportsByCodesMobile';

// Whether any flight being booked leaves or reaches an airport outside India
// (passports are then required). False while the airports are still loading.
export function useIsInternationalTrip(legs: FlightOffer[]): boolean {
  const codes = useMemo(
    () => [...new Set(legs.flatMap((leg) => leg.segments.flatMap((s) => [s.origin, s.destination])))],
    [legs]
  );
  const { data } = useAirportsByCodesMobile(codes);
  return useMemo(
    () => (data ?? []).some((airport) => !!airport.country && airport.country.trim().toLowerCase() !== 'india'),
    [data]
  );
}
