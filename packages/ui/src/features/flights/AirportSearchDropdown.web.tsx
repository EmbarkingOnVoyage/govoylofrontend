import React, { useMemo, useState } from 'react';
import { MapPin, Plane, Trash2 } from 'lucide-react';
import {
  AIRPORTS,
  groupAirportsByCity,
  getRecentAirports,
  addRecentAirport,
  type Airport,
} from './airports';

interface AirportSearchDropdownProps {
  onSelect: (airport: Airport) => void;
}

export const AirportSearchDropdown: React.FC<AirportSearchDropdownProps> = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<Airport[]>(() => getRecentAirports());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return AIRPORTS;
    return AIRPORTS.filter(
      (a) =>
        a.city.toLowerCase().includes(q) ||
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q)
    );
  }, [query]);

  const groups = useMemo(() => groupAirportsByCity(filtered), [filtered]);

  const handleSelect = (airport: Airport) => {
    addRecentAirport(airport);
    onSelect(airport);
  };

  return (
    <div className="w-[371px] bg-white rounded-b-2xl shadow-xl border border-[#ECEEF3] border-t-0 overflow-hidden">
      <div className="p-3">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city or airport"
          className="w-full h-10 px-3 rounded-lg border border-[#ADB8CD] text-sm text-[#182339] outline-none focus:border-[#7C1AEE]"
        />
      </div>

      <div className="max-h-[420px] overflow-y-auto pb-2">
        {!query && recent.length > 0 && (
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[#182339]">Recent Searches</span>
              <button
                type="button"
                onClick={() => {
                  setRecent([]);
                }}
                className="text-[#7C8CAD] hover:text-[#4C5973]"
                aria-label="Clear recent searches"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((a) => (
                <button
                  key={a.code}
                  type="button"
                  onClick={() => handleSelect(a)}
                  className="h-8 px-3 rounded-full border border-[#ADB8CD] text-sm text-[#4C5973] hover:border-[#7C1AEE] hover:text-[#7C1AEE]"
                >
                  {a.city}
                </button>
              ))}
            </div>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.city} className="px-4 py-2 border-t border-[#ECEEF3] first:border-t-0">
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={16} color="#182339" />
              <div>
                <p className="text-[15px] font-bold text-[#182339] leading-tight">{group.city}, India</p>
                <p className="text-xs text-[#7C8CAD] leading-tight">{group.state}, India</p>
              </div>
            </div>
            <div className="mt-1">
              {group.airports.map((airport) => (
                <button
                  key={airport.code}
                  type="button"
                  onClick={() => handleSelect(airport)}
                  className="w-full flex items-center gap-2 py-2 text-left hover:bg-[#F8F5FF] rounded-lg px-1 -mx-1"
                >
                  <Plane size={16} color="#4C5973" />
                  <span className="flex-1 text-sm text-[#182339]">{airport.name}</span>
                  <span className="text-sm font-bold text-[#182339]">{airport.code}</span>
                </button>
              ))}
            </div>
          </div>
        ))}

        {groups.length === 0 && (
          <p className="px-4 py-6 text-sm text-[#7C8CAD] text-center">No airports match "{query}".</p>
        )}
      </div>
    </div>
  );
};
