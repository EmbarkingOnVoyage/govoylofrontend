import React, { useState } from 'react';
import { Briefcase, Check, IndianRupee, Luggage, Minus, Plus, Search } from 'lucide-react';
import type { FlightOffer } from '../useSearchFlightsMobile';
import {
  STOP_BUCKETS_WEB,
  TIME_BUCKETS,
  cheapestForStopBucket,
  cheapestInBucket,
  formatMinutesDuration,
  formatPrice,
  getLayoverMinutes,
  getTotalDurationMinutes,
  hasCheckInBaggage,
  type CombinedFilterState,
  type StopBucketId,
  type TimeBucketId,
} from '../logic/flightResults';
import { RangeSliderWeb } from './RangeSliderWeb.web';

const LIST_PREVIEW = 3;
const AIRLINE_PREVIEW = 5;

function toggle<T>(set: Set<T> | undefined, value: T): Set<T> {
  const next = new Set(set ?? []);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

// 16px rounded-4 box on the right of a row (Popular rows).
const SmallBox: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span
    className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
      checked ? 'bg-[#7C1AEE] border-[#7C1AEE]' : 'bg-white border-[#ADB8CD]'
    }`}
  >
    {checked && <Check size={11} color="#FFFFFF" strokeWidth={3} />}
  </span>
);

// 20px rounded-6 box (city / airport / airline lists).
const ListBox: React.FC<{ checked: boolean }> = ({ checked }) => (
  <span className="w-6 h-6 flex items-center justify-center shrink-0">
    <span
      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
        checked ? 'bg-[#7C1AEE] border-[#7C1AEE]' : 'border-[#ADB8CD]'
      }`}
    >
      {checked && <Check size={13} color="#FFFFFF" strokeWidth={3} />}
    </span>
  </span>
);

// Sections are separated by a 1px #ECEEF3 rule with 14px vertical padding.
const Section: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`w-full py-3.5 border-t border-[#ECEEF3] ${className}`}>{children}</div>
);

const SectionLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="py-0.5 text-[15px] leading-5 font-medium text-[#182339]">{children}</div>
);

const Rupee: React.FC<{ amount: number | null; size?: 'sm' | 'xs' }> = ({ amount, size = 'xs' }) =>
  amount === null ? (
    <span className="text-[#697691]">—</span>
  ) : (
    <span className={`flex items-end justify-center text-[#697691] ${size === 'sm' ? 'text-[12px] leading-[15px]' : 'text-[10px] leading-[15px]'}`}>
      {size === 'sm' && <IndianRupee size={13} />}
      {size === 'sm' ? Math.round(amount).toLocaleString('en-IN') : formatPrice(Math.round(amount), 'INR')}
    </span>
  );

const Stepper: React.FC<{ value: number; max: number; onChange: (v: number) => void; label: string }> = ({ value, max, onChange, label }) => (
  <div className="flex items-center">
    <button
      type="button"
      aria-label={`Fewer ${label}`}
      disabled={value === 0}
      onClick={() => onChange(value - 1)}
      className="w-11 h-11 flex items-center justify-center disabled:opacity-50"
    >
      <span className="w-6 h-6 rounded-full bg-[#CCD3E0] flex items-center justify-center">
        <Minus size={16} color="#182339" />
      </span>
    </button>
    <span className="w-5 text-center text-[16px] leading-6 font-medium text-[#182339]">{value}</span>
    <button
      type="button"
      aria-label={`More ${label}`}
      disabled={value >= max}
      onClick={() => onChange(value + 1)}
      className="w-11 h-11 flex items-center justify-center disabled:opacity-50"
    >
      <span className="w-6 h-6 rounded-full bg-[#CCD3E0] flex items-center justify-center">
        <Plus size={16} color="#182339" />
      </span>
    </button>
  </div>
);

// Search box + checkbox rows + "Show more" (airports, airlines, cities).
const CheckList: React.FC<{
  items: { key: string; label: string }[];
  selected: Set<string> | undefined;
  onToggle: (key: string) => void;
  preview: number;
  searchable?: boolean;
}> = ({ items, selected, onToggle, preview, searchable }) => {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const filtered = items.filter((i) => i.label.toLowerCase().includes(query.trim().toLowerCase()));
  const shown = expanded || query ? filtered : filtered.slice(0, preview);
  return (
    <div className="flex flex-col gap-2 mt-1">
      {searchable && (
        <label className="h-9 flex items-center gap-3 px-3 py-2 bg-white border border-[#ADB8CD] rounded-lg">
          <Search size={20} className="text-[#697691] shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 min-w-0 text-[16px] leading-5 text-[#182339] placeholder:text-[#697691] outline-none bg-transparent"
          />
        </label>
      )}
      {shown.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => onToggle(item.key)}
          className="flex items-center justify-between gap-2 px-2 h-6 text-left"
        >
          <span className="text-[15px] leading-5 text-[#182339] truncate">{item.label}</span>
          <ListBox checked={!!selected?.has(item.key)} />
        </button>
      ))}
      {!query && filtered.length > preview && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="self-start p-2 rounded-lg text-[13px] leading-4 font-medium text-[#114BFF]"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
};

// Web Dev Desktop-15 "Sidebar": 295px white column, 20/16px padding,
// sections split by #ECEEF3 rules. Options and prices come from the full
// current list, so a filter never hides its own alternatives.
export const FlightFiltersWeb: React.FC<{
  offers: FlightOffer[];
  filters: CombinedFilterState;
  onChange: (filters: CombinedFilterState) => void;
  airlines: string[];
  layoverCities: string[];
  originCity: string;
  destinationCity: string;
  cityFor: (code: string) => string;
}> = ({ offers, filters, onChange, airlines, layoverCities, originCity, destinationCity, cityFor }) => {
  const set = (patch: Partial<CombinedFilterState>) => onChange({ ...filters, ...patch });

  const prices = offers.map((o) => o.totalAmount);
  const minPrice = Math.floor(Math.min(...prices, Infinity));
  const maxPrice = Math.ceil(Math.max(...prices, 0));
  const durations = offers.map(getTotalDurationMinutes);
  const maxDuration = Math.max(0, ...durations);
  const minDuration = Math.min(maxDuration, ...durations);
  const layovers = offers.filter((o) => o.segments.length > 1).map(getLayoverMinutes);
  const maxLayover = Math.max(0, ...layovers);
  const minLayover = Math.min(maxLayover, ...layovers);

  const countBy = (keyOf: (o: FlightOffer) => string) => {
    const counts = new Map<string, number>();
    offers.forEach((o) => counts.set(keyOf(o), (counts.get(keyOf(o)) ?? 0) + 1));
    return counts;
  };
  const airlineCounts = countBy((o) => o.airlineName);
  // The most-flown airline doubles as a Popular shortcut (Figma: "Oman Air").
  const popularAirline = [...airlineCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
  const departAirports = [...countBy((o) => o.segments[0].origin).keys()].sort();
  const arriveAirports = [...countBy((o) => o.segments[o.segments.length - 1].destination).keys()].sort();
  const cheapestWithBags = Math.min(...offers.filter(hasCheckInBaggage).map((o) => o.totalAmount), Infinity);

  const popularAll =
    filters.stops.has('nonstop') &&
    filters.hideNonRefundable &&
    filters.cabinCheckinBaggage &&
    (!popularAirline || filters.airlines.has(popularAirline));

  const popularRows: { label: string; checked: boolean; toggle: () => void; small?: boolean }[] = [
    { label: 'Non-Stop', checked: filters.stops.has('nonstop'), toggle: () => set({ stops: toggle(filters.stops, 'nonstop' as StopBucketId) }) },
    { label: 'Hide Non Refundable flights', checked: filters.hideNonRefundable, toggle: () => set({ hideNonRefundable: !filters.hideNonRefundable }) },
    { label: 'Cabin + check-in baggage', checked: filters.cabinCheckinBaggage, toggle: () => set({ cabinCheckinBaggage: !filters.cabinCheckinBaggage }) },
    ...(popularAirline
      ? [{ label: popularAirline, checked: filters.airlines.has(popularAirline), toggle: () => set({ airlines: toggle(filters.airlines, popularAirline) }), small: true }]
      : []),
  ];

  const timeGrid = (field: 'departure' | 'arrival') => (
    <div className="grid grid-cols-2 gap-4 mt-1">
      {TIME_BUCKETS.map((bucket) => {
        const cheapest = cheapestInBucket(offers, bucket.id, field);
        const selected = filters.time[field] === bucket.id;
        return (
          <button
            key={bucket.id}
            type="button"
            disabled={cheapest === null}
            onClick={() => set({ time: { ...filters.time, [field]: selected ? null : (bucket.id as TimeBucketId) } })}
            className={`h-[47px] flex flex-col items-center justify-center px-0.5 rounded border disabled:opacity-50 ${
              selected ? 'bg-[#F3E8FF] border-[#7C1AEE]' : 'bg-white border-[#D7DCE7]'
            }`}
          >
            <span className="text-[11px] leading-4 font-medium text-[#182339]">{bucket.label}</span>
            <Rupee amount={cheapest} size="sm" />
          </button>
        );
      })}
    </div>
  );

  const rangeValues = (left: string, right: string) => (
    <div className="flex justify-between px-2 text-[15px] leading-5 text-[#3E4B64]">
      <span>{left}</span>
      <span>{right}</span>
    </div>
  );

  return (
    <aside className="w-[295px] shrink-0 bg-white px-4 py-5 flex flex-col gap-2 self-start">
      <div className="text-[16px] leading-6 font-bold text-[#182339]">Filters</div>

      <div className="pt-[18px]">
        <Section>
          <button
            type="button"
            onClick={() =>
              set({
                stops: popularAll ? new Set() : new Set<StopBucketId>(['nonstop']),
                hideNonRefundable: !popularAll,
                cabinCheckinBaggage: !popularAll,
                airlines: popularAirline ? (popularAll ? new Set() : new Set([popularAirline])) : filters.airlines,
              })
            }
            className="w-full flex items-center justify-between h-7"
          >
            <span className="text-[15px] leading-5 font-medium text-[#182339]">Select all Popular</span>
            <SmallBox checked={popularAll} />
          </button>
          {popularRows.map((row, index) => (
            <button
              key={row.label}
              type="button"
              onClick={row.toggle}
              className={`w-full flex items-center justify-between gap-2 ${index === 0 ? 'pt-[13px] pb-[5px]' : 'py-[5px]'}`}
            >
              <span className={`${row.small ? 'text-[12.5px] leading-[19px]' : 'text-[13px] leading-4'} text-[#182339] text-left`}>
                {row.label}
              </span>
              <SmallBox checked={row.checked} />
            </button>
          ))}
        </Section>
      </div>

      <Section>
        <div className="text-[13.5px] leading-5 font-bold text-[#182339]">Stops</div>
        <div className="flex gap-1.5 pt-2">
          {STOP_BUCKETS_WEB.map((bucket) => {
            const cheapest = cheapestForStopBucket(offers, bucket.id);
            const selected = filters.stops.has(bucket.id);
            return (
              <button
                key={bucket.id}
                type="button"
                disabled={cheapest === null}
                onClick={() => set({ stops: toggle(filters.stops, bucket.id) })}
                className={`flex-1 h-[52px] flex flex-col items-center justify-center gap-0.5 px-1 py-2 rounded-lg border disabled:opacity-50 ${
                  selected ? 'bg-[#F3E8FF] border-[#7C1AEE]' : 'bg-white border-[#CCD3E0]'
                }`}
              >
                <span className="text-[11px] leading-4 font-semibold text-[#182339]">{bucket.label}</span>
                <Rupee amount={cheapest} />
              </button>
            );
          })}
        </div>
      </Section>

      <Section>
        <div className="py-2">
          <SectionLabel>Baggage</SectionLabel>
          {[
            { label: 'Cabin baggage', icon: Briefcase, value: filters.cabinBags ?? 0, key: 'cabinBags' as const, max: 1 },
            { label: 'Checked baggage', icon: Luggage, value: filters.checkedBags ?? 0, key: 'checkedBags' as const, max: 2 },
          ].map(({ label, icon: Icon, value, key, max }) => (
            <div key={key} className="flex items-end justify-between">
              <span className="flex items-center gap-2 pb-2 text-[15px] leading-5 text-[#182339]">
                <Icon size={20} strokeWidth={1.75} />
                {label}
              </span>
              <Stepper value={value} max={max} label={label.toLowerCase()} onChange={(v) => set({ [key]: v })} />
            </div>
          ))}
        </div>
        <div className="text-[13.5px] leading-5 font-bold text-[#182339]">Baggage</div>
        <button
          type="button"
          onClick={() => set({ cabinCheckinBaggage: !filters.cabinCheckinBaggage })}
          className="w-full flex items-center gap-2 pt-[13px] pb-[5px] text-left"
        >
          <SmallBox checked={filters.cabinCheckinBaggage} />
          <span className="flex-1 text-[12.5px] leading-[19px] text-[#182339]">Cabin + Check-in baggage</span>
          <span className="text-[12px] leading-[18px] text-[#697691]">
            {isFinite(cheapestWithBags) ? formatPrice(Math.round(cheapestWithBags), 'INR') : '—'}
          </span>
        </button>
      </Section>

      {maxDuration > minDuration && (
        <Section>
          <div className="px-2 pb-3">
            <SectionLabel>Flight Duration</SectionLabel>
          </div>
          <RangeSliderWeb
            label="Flight duration"
            min={minDuration}
            max={maxDuration}
            step={5}
            high={filters.durationMax ?? maxDuration}
            onChange={(_, high) => set({ durationMax: high >= maxDuration ? null : high })}
          />
          <div className="flex justify-end px-2 text-[15px] leading-5 text-[#3E4B64]">
            {formatMinutesDuration(filters.durationMax ?? maxDuration)}
          </div>
        </Section>
      )}

      {maxPrice > minPrice && (
        <Section>
          <div className="px-2 pb-3">
            <SectionLabel>Price range</SectionLabel>
          </div>
          <RangeSliderWeb
            label="Price"
            min={minPrice}
            max={maxPrice}
            step={Math.max(1, Math.round((maxPrice - minPrice) / 100))}
            low={filters.priceMin ?? minPrice}
            high={filters.priceMax ?? maxPrice}
            onChange={(low, high) =>
              set({ priceMin: low !== undefined && low > minPrice ? low : null, priceMax: high < maxPrice ? high : null })
            }
          />
          {rangeValues(formatPrice(filters.priceMin ?? minPrice, 'INR'), formatPrice(filters.priceMax ?? maxPrice, 'INR'))}
        </Section>
      )}

      <Section>
        <SectionLabel>Departure from {originCity}</SectionLabel>
        {timeGrid('departure')}
      </Section>

      <Section>
        <SectionLabel>Arrival at {destinationCity}</SectionLabel>
        {timeGrid('arrival')}
      </Section>

      {maxLayover > minLayover && (
        <Section>
          <div className="px-2 pb-3">
            <SectionLabel>Layover duration</SectionLabel>
          </div>
          <RangeSliderWeb
            label="Layover duration"
            min={minLayover}
            max={maxLayover}
            step={5}
            low={filters.layoverMin ?? minLayover}
            high={filters.layoverMax ?? maxLayover}
            onChange={(low, high) =>
              set({ layoverMin: low !== undefined && low > minLayover ? low : null, layoverMax: high < maxLayover ? high : null })
            }
          />
          {rangeValues(formatMinutesDuration(filters.layoverMin ?? minLayover), formatMinutesDuration(filters.layoverMax ?? maxLayover))}
        </Section>
      )}

      {layoverCities.length > 0 && (
        <Section>
          <SectionLabel>Layover Cities</SectionLabel>
          <CheckList
            items={layoverCities.map((c) => ({ key: c, label: c }))}
            selected={filters.layoverCities}
            onToggle={(c) => set({ layoverCities: toggle(filters.layoverCities, c) })}
            preview={LIST_PREVIEW}
          />
        </Section>
      )}

      {departAirports.length > 1 && (
        <Section>
          <SectionLabel>Depart Airport</SectionLabel>
          <CheckList
            searchable
            items={departAirports.map((code) => ({ key: code, label: `${code} - ${cityFor(code)}` }))}
            selected={filters.departAirports}
            onToggle={(code) => set({ departAirports: toggle(filters.departAirports, code) })}
            preview={LIST_PREVIEW}
          />
        </Section>
      )}

      {arriveAirports.length > 1 && (
        <Section>
          <SectionLabel>Arrival Airport</SectionLabel>
          <CheckList
            searchable
            items={arriveAirports.map((code) => ({ key: code, label: `${code} - ${cityFor(code)}` }))}
            selected={filters.arriveAirports}
            onToggle={(code) => set({ arriveAirports: toggle(filters.arriveAirports, code) })}
            preview={LIST_PREVIEW}
          />
        </Section>
      )}

      {airlines.length > 0 && (
        <Section>
          <SectionLabel>Airline</SectionLabel>
          <CheckList
            searchable
            items={airlines.map((a) => ({ key: a, label: a }))}
            selected={filters.airlines}
            onToggle={(a) => set({ airlines: toggle(filters.airlines, a) })}
            preview={AIRLINE_PREVIEW}
          />
        </Section>
      )}

      <div className="w-full h-px bg-[#CCD3E0]" />
    </aside>
  );
};
