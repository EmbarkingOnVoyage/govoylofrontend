import type { CabinClass, FlightSearchRequest, FlightSearchSummary, TripType } from "./useSearchFlightsMobile";

// A flight search as URL query params, so the web results page can be
// refreshed, bookmarked or shared and re-runs the same search:
//   ?trip=RoundTrip&cabin=Economy&seg=DEL-BOM-2026-11-20&seg=BOM-DEL-2026-11-25&adt=1&chd=0&inf=0&nonstop=1
// Each `seg` is origin-destination-date, in request order.

const TRIP_TYPES: TripType[] = ["OneWay", "RoundTrip", "MultiCity"];
const CABIN_CLASSES: CabinClass[] = ["Economy", "PremiumEconomy", "Business", "First"];
const MAX_SEGMENTS = 5;

// The search form sends each travel date as midnight UTC of the picked day.
function toDateParam(travelDate: string): string {
  return travelDate.slice(0, 10);
}

function fromDateParam(date: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const parsed = new Date(`${date}T00:00:00.000Z`);
  return isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function countParam(value: string | null, min: number): number | null {
  if (value === null) return min;
  if (!/^\d+$/.test(value)) return null;
  const count = Number(value);
  return count >= min && count <= 9 ? count : null;
}

// The summary the results page renders from — same shape the mobile search
// form builds, derived from the request alone.
export function summaryFromRequest(request: FlightSearchRequest, nonStopOnly = false): FlightSearchSummary {
  const [first, second] = request.segments;
  return {
    request,
    originCode: first.origin,
    destinationCode: first.destination,
    departureDate: first.travelDate,
    returnDate: second?.travelDate,
    passengerCount: request.adultCount + request.childCount + request.infantCount,
    cabinClass: request.cabinClass,
    nonStopOnly,
  };
}

export function encodeFlightSearch(summary: FlightSearchSummary): string {
  const { request } = summary;
  const params = new URLSearchParams();
  params.set("trip", request.tripType);
  params.set("cabin", request.cabinClass);
  for (const segment of request.segments) {
    params.append("seg", `${segment.origin}-${segment.destination}-${toDateParam(segment.travelDate)}`);
  }
  params.set("adt", String(request.adultCount));
  params.set("chd", String(request.childCount));
  params.set("inf", String(request.infantCount));
  if (summary.nonStopOnly) params.set("nonstop", "1");
  return params.toString();
}

// Null when the params don't describe a complete, valid search (a hand-edited
// or truncated URL) — the caller sends the user back to the search form.
export function decodeFlightSearch(query: string | URLSearchParams): FlightSearchSummary | null {
  const params = typeof query === "string" ? new URLSearchParams(query) : query;

  const tripType = params.get("trip") as TripType | null;
  const cabinClass = params.get("cabin") as CabinClass | null;
  if (!tripType || !TRIP_TYPES.includes(tripType)) return null;
  if (!cabinClass || !CABIN_CLASSES.includes(cabinClass)) return null;

  const rawSegments = params.getAll("seg");
  if (rawSegments.length === 0 || rawSegments.length > MAX_SEGMENTS) return null;
  if (tripType === "RoundTrip" && rawSegments.length !== 2) return null;
  if (tripType === "MultiCity" && rawSegments.length < 2) return null;

  const segments = [];
  for (const raw of rawSegments) {
    const match = raw.match(/^([A-Za-z]{3})-([A-Za-z]{3})-(\d{4}-\d{2}-\d{2})$/);
    const travelDate = match ? fromDateParam(match[3]) : null;
    if (!match || !travelDate) return null;
    segments.push({ origin: match[1].toUpperCase(), destination: match[2].toUpperCase(), travelDate });
  }

  const adultCount = countParam(params.get("adt"), 1);
  const childCount = countParam(params.get("chd"), 0);
  const infantCount = countParam(params.get("inf"), 0);
  if (adultCount === null || childCount === null || infantCount === null) return null;
  if (infantCount > adultCount) return null;

  const request: FlightSearchRequest = { tripType, cabinClass, segments, adultCount, childCount, infantCount };
  return summaryFromRequest(request, params.get("nonstop") === "1");
}
