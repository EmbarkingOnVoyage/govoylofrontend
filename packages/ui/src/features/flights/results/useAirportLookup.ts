import { useCallback, useMemo } from 'react';
import { useAirportsByCodesMobile } from '../useAirportsByCodesMobile';
import { AIRPORTS } from '../airports';

export interface AirportLookup {
  cityFor: (code: string) => string;
  nameFor: (code: string) => string;
}

// City/airport names for every code in a result set, resolved in one batch
// from the airports API, with the bundled airport list (then the raw code)
// as a fallback while that loads or for a code it doesn't know.
export function useAirportLookup(codes: string[]): AirportLookup {
  const { data } = useAirportsByCodesMobile(codes);

  const byCode = useMemo(() => {
    const map = new Map<string, { city: string; name: string }>();
    for (const airport of AIRPORTS) map.set(airport.code, { city: airport.city, name: airport.name });
    for (const airport of data ?? []) map.set(airport.iataCode, { city: airport.city, name: airport.name });
    return map;
  }, [data]);

  const cityFor = useCallback((code: string) => byCode.get(code)?.city ?? code, [byCode]);
  const nameFor = useCallback((code: string) => byCode.get(code)?.name ?? code, [byCode]);

  return { cityFor, nameFor };
}
