export interface Airport {
  code: string;
  city: string;
  state: string;
  name: string;
}

// A practical starting set of major Indian + a few international airports.
// The backend's flight-search validator requires 3-letter IATA codes, and
// there is no airport-lookup API wired up yet (useLocations() only returns
// plain city display names, no codes) — this hardcoded list is a stand-in
// until a real airport/IATA lookup endpoint exists. Mirrors
// apps/Mobile/src/data/airports.ts so web and mobile show the same results.
export const AIRPORTS: Airport[] = [
  { code: 'DEL', city: 'New Delhi', state: 'Delhi', name: 'Indira Gandhi International Airport' },
  { code: 'BOM', city: 'Mumbai', state: 'Maharashtra', name: 'Chhatrapati Shivaji Maharaj International Airport' },
  { code: 'NMI', city: 'Mumbai', state: 'Maharashtra', name: 'Navi Mumbai International Airport' },
  { code: 'BLR', city: 'Bengaluru', state: 'Karnataka', name: 'Kempegowda International Airport' },
  { code: 'HYD', city: 'Hyderabad', state: 'Telangana', name: 'Rajiv Gandhi International Airport' },
  { code: 'MAA', city: 'Chennai', state: 'Tamil Nadu', name: 'Chennai International Airport' },
  { code: 'CCU', city: 'Kolkata', state: 'West Bengal', name: 'Netaji Subhas Chandra Bose International Airport' },
  { code: 'PNQ', city: 'Pune', state: 'Maharashtra', name: 'Pune Airport' },
  { code: 'AMD', city: 'Ahmedabad', state: 'Gujarat', name: 'Sardar Vallabhbhai Patel International Airport' },
  { code: 'JAI', city: 'Jaipur', state: 'Rajasthan', name: 'Jaipur International Airport' },
  { code: 'GOI', city: 'Goa', state: 'Goa', name: 'Goa International Airport (Mopa)' },
  { code: 'COK', city: 'Kochi', state: 'Kerala', name: 'Cochin International Airport' },
  { code: 'LKO', city: 'Lucknow', state: 'Uttar Pradesh', name: 'Chaudhary Charan Singh International Airport' },
  { code: 'IXC', city: 'Chandigarh', state: 'Chandigarh', name: 'Chandigarh Airport' },
  { code: 'GAU', city: 'Guwahati', state: 'Assam', name: 'Lokpriya Gopinath Bordoloi International Airport' },
  { code: 'PAT', city: 'Patna', state: 'Bihar', name: 'Jay Prakash Narayan International Airport' },
  { code: 'DXB', city: 'Dubai', state: 'Dubai, UAE', name: 'Dubai International Airport' },
  { code: 'SIN', city: 'Singapore', state: 'Singapore', name: 'Singapore Changi Airport' },
  { code: 'LHR', city: 'London', state: 'England, UK', name: 'London Heathrow Airport' },
  { code: 'JFK', city: 'New York', state: 'New York, USA', name: 'John F. Kennedy International Airport' },
  { code: 'BKK', city: 'Bangkok', state: 'Thailand', name: 'Suvarnabhumi Airport' },
];

export interface AirportCityGroup {
  city: string;
  state: string;
  airports: Airport[];
}

export function groupAirportsByCity(airports: Airport[]): AirportCityGroup[] {
  const groups: AirportCityGroup[] = [];
  for (const airport of airports) {
    let group = groups.find((g) => g.city === airport.city);
    if (!group) {
      group = { city: airport.city, state: airport.state, airports: [] };
      groups.push(group);
    }
    group.airports.push(airport);
  }
  return groups;
}

// Simple in-memory "recent searches" list, shared across the app session.
// Not persisted — resets on page reload, same as the rest of this form's state.
let recentAirports: Airport[] = [];

export function getRecentAirports(): Airport[] {
  return recentAirports;
}

export function addRecentAirport(airport: Airport) {
  recentAirports = [airport, ...recentAirports.filter((a) => a.code !== airport.code)].slice(0, 5);
}
