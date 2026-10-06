import { describe, test, expect } from 'vitest';
import type { FlightSearchRequest } from './useSearchFlightsMobile';
import { decodeFlightSearch, encodeFlightSearch, summaryFromRequest } from './flightSearchParams';

const roundTrip: FlightSearchRequest = {
  tripType: 'RoundTrip',
  cabinClass: 'Economy',
  segments: [
    { origin: 'DEL', destination: 'BOM', travelDate: '2026-11-20T00:00:00.000Z' },
    { origin: 'BOM', destination: 'DEL', travelDate: '2026-11-25T00:00:00.000Z' },
  ],
  adultCount: 2,
  childCount: 1,
  infantCount: 1,
};

describe('flight search URL params', () => {
  test('round-trips a search through the URL unchanged', () => {
    const summary = summaryFromRequest(roundTrip, true);
    const query = encodeFlightSearch(summary);
    expect(query).toBe(
      'trip=RoundTrip&cabin=Economy&seg=DEL-BOM-2026-11-20&seg=BOM-DEL-2026-11-25&adt=2&chd=1&inf=1&nonstop=1'
    );
    expect(decodeFlightSearch(`?${query}`)).toEqual(summary);
  });

  test('builds the same summary the mobile search form does', () => {
    const summary = summaryFromRequest(roundTrip);
    expect(summary).toMatchObject({
      originCode: 'DEL',
      destinationCode: 'BOM',
      departureDate: '2026-11-20T00:00:00.000Z',
      returnDate: '2026-11-25T00:00:00.000Z',
      passengerCount: 4,
      cabinClass: 'Economy',
      nonStopOnly: false,
    });
  });

  test('passenger counts default to one adult', () => {
    const summary = decodeFlightSearch('trip=OneWay&cabin=Business&seg=del-dxb-2026-12-01');
    expect(summary?.request).toEqual({
      tripType: 'OneWay',
      cabinClass: 'Business',
      segments: [{ origin: 'DEL', destination: 'DXB', travelDate: '2026-12-01T00:00:00.000Z' }],
      adultCount: 1,
      childCount: 0,
      infantCount: 0,
    });
  });

  test.each([
    ['unknown trip type', 'trip=Return&cabin=Economy&seg=DEL-BOM-2026-11-20'],
    ['no segments', 'trip=OneWay&cabin=Economy'],
    ['round trip with one segment', 'trip=RoundTrip&cabin=Economy&seg=DEL-BOM-2026-11-20'],
    ['bad date', 'trip=OneWay&cabin=Economy&seg=DEL-BOM-20-11-2026'],
    ['zero adults', 'trip=OneWay&cabin=Economy&seg=DEL-BOM-2026-11-20&adt=0'],
    ['more infants than adults', 'trip=OneWay&cabin=Economy&seg=DEL-BOM-2026-11-20&adt=1&inf=2'],
  ])('rejects %s', (_, query) => {
    expect(decodeFlightSearch(query)).toBeNull();
  });
});
