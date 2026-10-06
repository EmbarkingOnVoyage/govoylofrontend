import React from 'react';
import { Check } from 'lucide-react';
import type { FlightOffer } from '../useSearchFlightsMobile';
import {
  STOP_BUCKETS_WEB,
  TIME_BUCKETS,
  cheapestForStopBucket,
  cheapestInBucket,
  formatMinutesDuration,
  formatPrice,
  getTotalDurationMinutes,
  type CombinedFilterState,
  type StopBucketId,
  type TimeBucketId,
} from '../logic/flightResults';

const Checkbox: React.FC<{ checked: boolean; label: React.ReactNode; aside?: React.ReactNode; onChange: () => void }> = ({
  checked,
  label,
  aside,
  onChange,
}) => (
  <label className="flex items-center justify-between gap-2 py-1 cursor-pointer text-sm text-[#182339]">
    <span className="flex items-center gap-2 min-w-0">
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
          checked ? 'bg-[#7C1AEE] border-[#7C1AEE]' : 'border-[#99A6C0] bg-white'
        }`}
      >
        {checked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <span className="truncate">{label}</span>
    </span>
    {aside && <span className="text-xs text-[#697691] shrink-0">{aside}</span>}
  </label>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="py-4 border-b border-[#E4E7EC] last:border-b-0">
    <h4 className="text-sm font-semibold text-[#182339] mb-2">{title}</h4>
    {children}
  </div>
);

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

// The results page's left filter column (Web Dev Figma "Filters"). Every
// option is computed from the full current list, so a filter never hides its
// own alternatives; prices are the cheapest flight each option would leave.
export const FlightFiltersWeb: React.FC<{
  offers: FlightOffer[];
  filters: CombinedFilterState;
  onChange: (filters: CombinedFilterState) => void;
  airlines: string[];
  layoverCities: string[];
  originCity: string;
  destinationCity: string;
  onClear: () => void;
}> = ({ offers, filters, onChange, onClear, airlines, layoverCities, originCity, destinationCity }) => {
  const currency = offers[0]?.currencyCode ?? 'INR';
  const price = (amount: number | null) => (amount === null ? '—' : formatPrice(amount, currency));
  const set = (patch: Partial<CombinedFilterState>) => onChange({ ...filters, ...patch });

  const popularAll = filters.stops.has('nonstop') && filters.hideNonRefundable && filters.cabinCheckinBaggage;
  const maxPrice = Math.max(0, ...offers.map((o) => o.totalAmount));
  const minPrice = Math.min(maxPrice, ...offers.map((o) => o.totalAmount));
  const durations = offers.map(getTotalDurationMinutes);
  const maxDuration = Math.max(0, ...durations);
  const minDuration = Math.min(maxDuration, ...durations);

  const cheapestByAirline = new Map<string, number>();
  for (const o of offers) {
    const current = cheapestByAirline.get(o.airlineName);
    if (current === undefined || o.totalAmount < current) cheapestByAirline.set(o.airlineName, o.totalAmount);
  }

  const timeButtons = (field: 'departure' | 'arrival') => (
    <div className="grid grid-cols-2 gap-2">
      {TIME_BUCKETS.map((bucket) => {
        const cheapest = cheapestInBucket(offers, bucket.id, field);
        const selected = filters.time[field] === bucket.id;
        return (
          <button
            key={bucket.id}
            type="button"
            disabled={cheapest === null}
            onClick={() =>
              set({ time: { ...filters.time, [field]: selected ? null : (bucket.id as TimeBucketId) } })
            }
            className={`px-2 py-1.5 rounded-lg border text-center disabled:opacity-40 ${
              selected ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-[#D5DAE3]'
            }`}
          >
            <div className="text-xs font-medium text-[#182339]">{bucket.label}</div>
            <div className="text-[11px] text-[#697691]">{price(cheapest)}</div>
          </button>
        );
      })}
    </div>
  );

  return (
    <aside className="bg-white rounded-xl border border-[#E4E7EC] px-4">
      <div className="flex items-center justify-between pt-4">
        <h3 className="text-base font-semibold text-[#182339]">Filters</h3>
        <button
          type="button"
          onClick={onClear}
          className="text-xs font-medium text-[#7C1AEE] hover:underline"
        >
          Clear all
        </button>
      </div>

      <Section title="Popular">
        <Checkbox
          checked={popularAll}
          label="Select all popular"
          onChange={() =>
            set({
              stops: popularAll ? new Set() : new Set<StopBucketId>(['nonstop']),
              hideNonRefundable: !popularAll,
              cabinCheckinBaggage: !popularAll,
            })
          }
        />
        <Checkbox
          checked={filters.stops.has('nonstop')}
          label="Non-Stop"
          onChange={() => set({ stops: toggle(filters.stops, 'nonstop' as StopBucketId) })}
        />
        <Checkbox
          checked={filters.hideNonRefundable}
          label="Hide non-refundable flights"
          onChange={() => set({ hideNonRefundable: !filters.hideNonRefundable })}
        />
        <Checkbox
          checked={filters.cabinCheckinBaggage}
          label="Cabin + check-in baggage"
          onChange={() => set({ cabinCheckinBaggage: !filters.cabinCheckinBaggage })}
        />
      </Section>

      <Section title="Stops">
        <div className="grid grid-cols-3 gap-2">
          {STOP_BUCKETS_WEB.map((bucket) => {
            const cheapest = cheapestForStopBucket(offers, bucket.id);
            const selected = filters.stops.has(bucket.id);
            return (
              <button
                key={bucket.id}
                type="button"
                disabled={cheapest === null}
                onClick={() => set({ stops: toggle(filters.stops, bucket.id) })}
                className={`px-1 py-1.5 rounded-lg border text-center disabled:opacity-40 ${
                  selected ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-[#D5DAE3]'
                }`}
              >
                <div className="text-xs font-medium text-[#182339]">{bucket.label}</div>
                <div className="text-[11px] text-[#697691]">{price(cheapest)}</div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title={`Departure from ${originCity}`}>{timeButtons('departure')}</Section>
      <Section title={`Arrival at ${destinationCity}`}>{timeButtons('arrival')}</Section>

      {maxPrice > minPrice && (
        <Section title="Price">
          <input
            type="range"
            min={minPrice}
            max={maxPrice}
            step={Math.max(1, Math.round((maxPrice - minPrice) / 100))}
            value={filters.priceMax ?? maxPrice}
            onChange={(e) => {
              const value = Number(e.target.value);
              set({ priceMax: value >= maxPrice ? null : value });
            }}
            className="w-full accent-[#7C1AEE]"
          />
          <div className="flex justify-between text-xs text-[#697691]">
            <span>{price(minPrice)}</span>
            <span>Up to {price(filters.priceMax ?? maxPrice)}</span>
          </div>
        </Section>
      )}

      {maxDuration > minDuration && (
        <Section title="Flight duration">
          <input
            type="range"
            min={minDuration}
            max={maxDuration}
            step={5}
            value={filters.durationMax ?? maxDuration}
            onChange={(e) => {
              const value = Number(e.target.value);
              set({ durationMax: value >= maxDuration ? null : value });
            }}
            className="w-full accent-[#7C1AEE]"
          />
          <div className="flex justify-between text-xs text-[#697691]">
            <span>{formatMinutesDuration(minDuration)}</span>
            <span>Up to {formatMinutesDuration(filters.durationMax ?? maxDuration)}</span>
          </div>
        </Section>
      )}

      {airlines.length > 0 && (
        <Section title="Airlines">
          {airlines.map((name) => (
            <Checkbox
              key={name}
              checked={filters.airlines.has(name)}
              label={name}
              aside={price(cheapestByAirline.get(name) ?? null)}
              onChange={() => set({ airlines: toggle(filters.airlines, name) })}
            />
          ))}
        </Section>
      )}

      {layoverCities.length > 0 && (
        <Section title="Layover cities">
          {layoverCities.map((city) => (
            <Checkbox
              key={city}
              checked={filters.layoverCities.has(city)}
              label={city}
              onChange={() => set({ layoverCities: toggle(filters.layoverCities, city) })}
            />
          ))}
        </Section>
      )}
    </aside>
  );
};
