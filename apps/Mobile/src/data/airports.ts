import type { AirportResult } from '@workspace/ui';

export interface Airport {
  code: string;
  city: string;
  state: string;
  country: string;
  name: string;
}

// Backed by the real GET /api/v1/airports/* endpoints now (see
// useAirportsMobile / useAirportsByCodesMobile in @workspace/ui) instead of a
// hardcoded list. The backend's AirportDto has no state/region field, so it's
// always '' here — AirportSearchScreen only shows city/country, not state.
export function toAirport(result: AirportResult): Airport {
  return { code: result.iataCode, city: result.city, state: '', country: result.country, name: result.name };
}

const airportCache = new Map<string, Airport>();

export function primeAirportCache(results: AirportResult[]) {
  for (const result of results) {
    airportCache.set(result.iataCode, toAirport(result));
  }
}

export function findAirportByCode(code: string): Airport | null {
  return airportCache.get(code) ?? null;
}

export interface AirportCityGroup {
  city: string;
  state: string;
  country: string;
  airports: Airport[];
}

export function groupAirportsByCity(airports: Airport[]): AirportCityGroup[] {
  const groups: AirportCityGroup[] = [];
  for (const airport of airports) {
    let group = groups.find((g) => g.city === airport.city);
    if (!group) {
      group = { city: airport.city, state: airport.state, country: airport.country, airports: [] };
      groups.push(group);
    }
    group.airports.push(airport);
  }
  return groups;
}

// Simple in-memory "recent searches" list, shared across the app session.
// Not persisted — resets on app reload, same as the rest of this form's state.
let recentAirports: Airport[] = [];

export function getRecentAirports(): Airport[] {
  return recentAirports;
}

export function addRecentAirport(airport: Airport) {
  recentAirports = [airport, ...recentAirports.filter((a) => a.code !== airport.code)].slice(0, 5);
}
