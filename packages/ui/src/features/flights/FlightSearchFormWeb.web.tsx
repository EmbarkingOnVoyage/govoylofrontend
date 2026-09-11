import React, { useState } from 'react';
import { ArrowLeftRight, Plane, Search as SearchIcon, X } from 'lucide-react';
import { useSearchFlightsMobile, type TripType, type FlightSearchSegment, type FlightOffer } from './useSearchFlightsMobile';
import { AirportSearchDropdown } from './AirportSearchDropdown.web';
import { FareCalendarDropdown } from './FareCalendarDropdown.web';
import { TravellersClassDropdown, type CabinClass, type TravellersClassValues } from './TravellersClassDropdown.web';
import type { Airport } from './airports';

interface MultiCitySegment {
  origin: Airport | null;
  destination: Airport | null;
  date: string;
}

const CABIN_CLASS_LABELS: Record<CabinClass, string> = {
  Economy: 'Economy',
  PremiumEconomy: 'Premium Economy',
  Business: 'Business',
  First: 'First',
};

const TRIP_TYPE_TABS: { key: TripType; label: string }[] = [
  { key: 'OneWay', label: 'One way' },
  { key: 'RoundTrip', label: 'Round trip' },
  { key: 'MultiCity', label: 'Multi city' },
];

function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}

function formatShortDate(display: string): string {
  const match = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return '';
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' });
}

function parseDisplayDate(display: string): string | null {
  const match = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
}

function parseDisplayDateLocal(display: string): Date | null {
  const match = display.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

type ActiveDropdown =
  | { type: 'origin' | 'destination'; segmentIndex: number | null }
  | { type: 'departure' | 'return'; segmentIndex: number | null }
  | { type: 'travellers' }
  | null;

export interface FlightSearchFormWebProps {
  onResults: (offers: FlightOffer[]) => void;
  onNavigate?: (route: string) => void;
}

export const FlightSearchFormWeb: React.FC<FlightSearchFormWebProps> = ({ onResults, onNavigate }) => {
  const searchFlights = useSearchFlightsMobile();

  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
  const [tripType, setTripType] = useState<TripType>('OneWay');

  const [origin, setOrigin] = useState<Airport | null>(null);
  const [destination, setDestination] = useState<Airport | null>(null);
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');

  const [multiCitySegments, setMultiCitySegments] = useState<MultiCitySegment[]>([
    { origin: null, destination: null, date: '' },
    { origin: null, destination: null, date: '' },
  ]);

  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [cabinClass, setCabinClass] = useState<CabinClass>('Economy');
  const [nonStopOnly, setNonStopOnly] = useState(false);

  const [selectedFare, setSelectedFare] = useState<'Student' | 'SeniorCitizen' | null>(null);
  const [formError, setFormError] = useState('');

  const closeDropdown = () => setActiveDropdown(null);

  const handleSwap = () => {
    const prevOrigin = origin;
    setOrigin(destination);
    setDestination(prevOrigin);
  };

  const updateMultiCitySegment = (index: number, patch: Partial<MultiCitySegment>) => {
    setMultiCitySegments((prev) => prev.map((seg, i) => (i === index ? { ...seg, ...patch } : seg)));
  };

  const swapMultiCitySegment = (index: number) => {
    setMultiCitySegments((prev) =>
      prev.map((seg, i) => (i === index ? { ...seg, origin: seg.destination, destination: seg.origin } : seg))
    );
  };

  const addMultiCitySegment = () => {
    if (multiCitySegments.length >= 5) return;
    setMultiCitySegments((prev) => [...prev, { origin: null, destination: null, date: '' }]);
  };

  const removeMultiCitySegment = (index: number) => {
    setMultiCitySegments((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));
  };

  const passengerSummary = `${adultCount} Adult${adultCount > 1 ? 's' : ''}${
    childCount > 0 ? `, ${childCount} Child${childCount > 1 ? 'ren' : ''}` : ''
  }${infantCount > 0 ? `, ${infantCount} Infant${infantCount > 1 ? 's' : ''}` : ''}, ${CABIN_CLASS_LABELS[cabinClass]}`;

  const handleSearch = async () => {
    setFormError('');
    const segments: FlightSearchSegment[] = [];

    if (tripType === 'MultiCity') {
      for (const seg of multiCitySegments) {
        const travelDate = parseDisplayDate(seg.date);
        if (!seg.origin || !seg.destination || !travelDate) {
          setFormError('Please fill in origin, destination and date for every flight.');
          return;
        }
        segments.push({ origin: seg.origin.code, destination: seg.destination.code, travelDate });
      }
    } else {
      const departure = parseDisplayDate(departureDate);
      if (!origin || !destination || !departure) {
        setFormError('Please fill in origin, destination and departure date.');
        return;
      }
      segments.push({ origin: origin.code, destination: destination.code, travelDate: departure });

      if (tripType === 'RoundTrip') {
        const returnTravelDate = parseDisplayDate(returnDate);
        if (!returnTravelDate) {
          setFormError('Please select a return date.');
          return;
        }
        segments.push({ origin: destination.code, destination: origin.code, travelDate: returnTravelDate });
      }
    }

    try {
      const response = await searchFlights.mutateAsync({
        tripType,
        cabinClass,
        segments,
        adultCount,
        childCount,
        infantCount,
      });
      onResults(response.offers);
    } catch (err: any) {
      setFormError(err?.message || 'Failed to search flights.');
    }
  };

  const renderOriginDestination = (
    segIndex: number | null,
    segOrigin: Airport | null,
    segDestination: Airport | null,
    onSwap: () => void
  ) => (
    <>
      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={() =>
            setActiveDropdown((cur) =>
              cur?.type === 'origin' && cur.segmentIndex === segIndex ? null : { type: 'origin', segmentIndex: segIndex }
            )
          }
          className="w-full text-left px-4 py-2.5"
        >
          <p className="text-[11px] font-bold text-[#7C8CAD] uppercase tracking-wide">From</p>
          <p className={segOrigin ? 'text-[17px] font-semibold text-[#182339] truncate' : 'text-[17px] font-semibold text-[#9CA3AF]'}>
            {segOrigin ? `${segOrigin.city}, ${segOrigin.name} (${segOrigin.code})` : 'Origin'}
          </p>
        </button>
        {activeDropdown?.type === 'origin' && activeDropdown.segmentIndex === segIndex && (
          <div className="absolute z-30 top-full left-0 mt-2">
            <AirportSearchDropdown
              onSelect={(airport) => {
                if (segIndex !== null) updateMultiCitySegment(segIndex, { origin: airport });
                else setOrigin(airport);
                closeDropdown();
              }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onSwap}
        className="w-9 h-9 rounded-full border border-[#ADB8CD] flex items-center justify-center shrink-0 hover:border-[#7C1AEE] hover:text-[#7C1AEE]"
        aria-label="Swap origin and destination"
      >
        <ArrowLeftRight size={16} color="#7C1AEE" />
      </button>

      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={() =>
            setActiveDropdown((cur) =>
              cur?.type === 'destination' && cur.segmentIndex === segIndex ? null : { type: 'destination', segmentIndex: segIndex }
            )
          }
          className="w-full text-left px-4 py-2.5"
        >
          <p className="text-[11px] font-bold text-[#7C8CAD] uppercase tracking-wide">To</p>
          <p className={segDestination ? 'text-[17px] font-semibold text-[#182339] truncate' : 'text-[17px] font-semibold text-[#9CA3AF]'}>
            {segDestination ? `${segDestination.city}, ${segDestination.name} (${segDestination.code})` : 'Destination'}
          </p>
        </button>
        {activeDropdown?.type === 'destination' && activeDropdown.segmentIndex === segIndex && (
          <div className="absolute z-30 top-full left-0 mt-2">
            <AirportSearchDropdown
              onSelect={(airport) => {
                if (segIndex !== null) updateMultiCitySegment(segIndex, { destination: airport });
                else setDestination(airport);
                closeDropdown();
              }}
            />
          </div>
        )}
      </div>
    </>
  );

  const renderDateField = (
    field: 'departure' | 'return',
    segIndex: number | null,
    label: string,
    value: string,
    fieldOrigin: Airport | null,
    fieldDestination: Airport | null
  ) => (
    <div className="relative flex-1 min-w-0">
      <button
        type="button"
        onClick={() =>
          setActiveDropdown((cur) =>
            cur?.type === field && cur.segmentIndex === segIndex ? null : { type: field, segmentIndex: segIndex }
          )
        }
        className="w-full text-left px-4 py-2.5"
      >
        <p className="text-[11px] font-bold text-[#7C8CAD] uppercase tracking-wide">{label}</p>
        <p className={value ? 'text-[17px] font-semibold text-[#182339]' : 'text-[17px] font-semibold text-[#9CA3AF]'}>
          {value ? formatShortDate(value) : field === 'return' ? 'Return' : 'Select date'}
        </p>
      </button>
      {activeDropdown?.type === field && activeDropdown.segmentIndex === segIndex && (
        <div className="absolute z-30 top-full left-0 mt-2">
          <FareCalendarDropdown
            footerLabel={field === 'departure' ? 'Departure date' : 'Return date'}
            initialDate={parseDisplayDate(value)}
            minDate={field === 'return' ? parseDisplayDateLocal(departureDate) ?? undefined : undefined}
            origin={fieldOrigin?.code}
            destination={fieldDestination?.code}
            showAddReturnLink={field === 'departure' && tripType === 'RoundTrip' && !returnDate}
            onAddReturnDate={() => setActiveDropdown({ type: 'return', segmentIndex: null })}
            onConfirm={(date) => {
              const formatted = formatDisplayDate(date);
              if (segIndex !== null) updateMultiCitySegment(segIndex, { date: formatted });
              else if (field === 'departure') setDepartureDate(formatted);
              else setReturnDate(formatted);
              closeDropdown();
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F4F4F6]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6A16CB] to-[#350B65] pb-16">
        <div className="max-w-[1440px] mx-auto px-8 pt-5 flex items-center justify-between">
          <span className="text-white text-2xl font-extrabold">
            go<span className="text-[#CF31FF]">Voylo</span>
          </span>
          <div className="flex items-center gap-6 text-white text-sm font-medium">
            <span>INR</span>
            <span className="cursor-pointer hover:underline">Help &amp; support</span>
            <button
              type="button"
              onClick={() => onNavigate?.('/signin')}
              className="px-4 py-2 rounded-full bg-white text-[#5113A3] font-semibold hover:bg-[#F3E9FE]"
            >
              Log in/Sign up
            </button>
          </div>
        </div>

        <div className="max-w-[1440px] mx-auto px-8 mt-6 flex items-center justify-center gap-10">
          {[
            { icon: <Plane size={20} />, label: 'Flights', active: true },
            { icon: <SearchIcon size={20} />, label: 'Hotels', active: false },
            { icon: <Plane size={20} />, label: 'Flights + Hotels', active: false },
          ].map((item) => (
            <div
              key={item.label}
              className={[
                'flex items-center gap-2 px-5 py-2.5 rounded-full',
                item.active ? 'bg-white/95' : '',
              ].join(' ')}
            >
              <span
                className={[
                  'w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-[#973DFF] to-[#CF31FF] text-white',
                ].join(' ')}
              >
                {item.icon}
              </span>
              <span className={item.active ? 'font-bold text-[#182339]' : 'font-bold text-white'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search card */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-6 mb-4">
            {TRIP_TYPE_TABS.map((tab) => (
              <label key={tab.key} className="flex items-center gap-2 cursor-pointer">
                <span
                  className={[
                    'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                    tripType === tab.key ? 'border-[#7C1AEE]' : 'border-[#ADB8CD]',
                  ].join(' ')}
                >
                  {tripType === tab.key && <span className="w-2 h-2 rounded-full bg-[#7C1AEE]" />}
                </span>
                <input
                  type="radio"
                  className="sr-only"
                  checked={tripType === tab.key}
                  onChange={() => setTripType(tab.key)}
                />
                <span className="text-[15px] font-semibold text-[#182339]">{tab.label}</span>
              </label>
            ))}
          </div>

          {tripType !== 'MultiCity' ? (
            <div className="flex items-stretch gap-4">
              <div className="flex-1 flex items-center border border-[#DFE3EC] rounded-xl divide-x divide-[#DFE3EC]">
                {renderOriginDestination(null, origin, destination, handleSwap)}
                <div className="w-px" />
                {renderDateField('departure', null, 'Departure', departureDate, origin, destination)}
                {tripType === 'RoundTrip' &&
                  renderDateField('return', null, 'Return', returnDate, destination, origin)}
                <div className="relative flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown((cur) => (cur?.type === 'travellers' ? null : { type: 'travellers' }))}
                    className="w-full text-left px-4 py-2.5"
                  >
                    <p className="text-[11px] font-bold text-[#7C8CAD] uppercase tracking-wide">Travellers</p>
                    <p className="text-[17px] font-semibold text-[#182339] truncate">{passengerSummary}</p>
                  </button>
                  {activeDropdown?.type === 'travellers' && (
                    <div className="absolute z-30 top-full right-0 mt-2">
                      <TravellersClassDropdown
                        initial={{ adultCount, childCount, infantCount, cabinClass, nonStopOnly }}
                        onConfirm={(values: TravellersClassValues) => {
                          setAdultCount(values.adultCount);
                          setChildCount(values.childCount);
                          setInfantCount(values.infantCount);
                          setCabinClass(values.cabinClass);
                          setNonStopOnly(values.nonStopOnly);
                          closeDropdown();
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleSearch}
                disabled={searchFlights.isPending}
                className="w-[136px] rounded-xl bg-[#7C1AEE] hover:bg-[#6B15D1] text-white font-semibold text-base disabled:opacity-60"
              >
                {searchFlights.isPending ? 'Searching…' : 'Search'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {multiCitySegments.map((seg, index) => (
                <div key={index} className="border border-[#DFE3EC] rounded-xl">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-[#ECEEF3]">
                    <span className="text-xs font-bold text-[#7C1AEE] bg-[#F3E8FF] px-2 py-1 rounded-md">
                      Flight {index + 1}
                    </span>
                    {multiCitySegments.length > 2 && (
                      <button type="button" onClick={() => removeMultiCitySegment(index)} aria-label="Remove flight">
                        <X size={16} color="#7C8CAD" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-stretch divide-x divide-[#DFE3EC]">
                    {renderOriginDestination(index, seg.origin, seg.destination, () => swapMultiCitySegment(index))}
                    {renderDateField('departure', index, 'Departure', seg.date, seg.origin, seg.destination)}
                  </div>
                </div>
              ))}

              {multiCitySegments.length < 5 && (
                <button
                  type="button"
                  onClick={addMultiCitySegment}
                  className="text-[#7C1AEE] font-semibold text-sm hover:underline"
                >
                  + Add Flight
                </button>
              )}

              <div className="flex justify-end">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown((cur) => (cur?.type === 'travellers' ? null : { type: 'travellers' }))}
                    className="px-4 py-2.5 border border-[#DFE3EC] rounded-xl text-left mr-3"
                  >
                    <p className="text-[11px] font-bold text-[#7C8CAD] uppercase tracking-wide">Travellers</p>
                    <p className="text-[15px] font-semibold text-[#182339]">{passengerSummary}</p>
                  </button>
                  {activeDropdown?.type === 'travellers' && (
                    <div className="absolute z-30 top-full right-0 mt-2">
                      <TravellersClassDropdown
                        initial={{ adultCount, childCount, infantCount, cabinClass, nonStopOnly }}
                        onConfirm={(values: TravellersClassValues) => {
                          setAdultCount(values.adultCount);
                          setChildCount(values.childCount);
                          setInfantCount(values.infantCount);
                          setCabinClass(values.cabinClass);
                          setNonStopOnly(values.nonStopOnly);
                          closeDropdown();
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searchFlights.isPending}
                  className="w-[136px] rounded-xl bg-[#7C1AEE] hover:bg-[#6B15D1] text-white font-semibold text-base disabled:opacity-60"
                >
                  {searchFlights.isPending ? 'Searching…' : 'Search'}
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 mt-5">
            <span className="text-sm font-semibold text-[#182339]">Special Fares (Optional)</span>
            {(['Student', 'SeniorCitizen'] as const).map((fare) => (
              <button
                key={fare}
                type="button"
                onClick={() => setSelectedFare((cur) => (cur === fare ? null : fare))}
                className={[
                  'h-9 px-4 rounded-lg border text-sm font-medium',
                  selectedFare === fare ? 'border-[#7C1AEE] bg-[#F3E8FF] text-[#7C1AEE]' : 'border-[#ADB8CD] text-[#4C5973]',
                ].join(' ')}
              >
                {fare === 'Student' ? 'Student' : 'Senior Citizen'}
              </button>
            ))}
          </div>

          {!!formError && <p className="text-sm text-red-500 text-center mt-4">{formError}</p>}
        </div>

        <div className="mt-4 bg-[#F3E9FE] rounded-xl px-5 py-3 flex items-center gap-3">
          <span className="text-[#7C1AEE]">🛡</span>
          <p className="text-sm text-[#182339]">
            <span className="font-bold">Fly with confidence, </span>
            protect your trip with affordable travel insurance.
          </p>
        </div>
      </div>

      {activeDropdown && (
        <div className="fixed inset-0 z-20" onClick={closeDropdown} />
      )}
    </div>
  );
};
