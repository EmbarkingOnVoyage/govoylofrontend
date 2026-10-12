import React, { useState } from 'react';
import { ArrowLeftRight, Calendar, ChevronDown, PlaneTakeoff, PlaneLanding, ShieldCheck, Users, X, ChevronRight } from 'lucide-react';
import {
  useSearchFlightsMobile,
  type TripType,
  type FlightSearchSegment,
  type FlightSearchResponse,
  type FlightSearchSummary,
} from './useSearchFlightsMobile';
import { summaryFromRequest } from './flightSearchParams';
import { AirportSearchDropdown } from './AirportSearchDropdown.web';
import { FareCalendarDropdown } from './FareCalendarDropdown.web';
import { TravellersClassDropdown, type CabinClass, type TravellersClassValues } from './TravellersClassDropdown.web';
import { AIRPORTS, type Airport } from './airports';
import { MenuBar } from '../../components/layout/MenuBar';
import iconFlights from '../../assets/images/icon-flights.png';
import iconHotels from '../../assets/images/icon-hotels.png';
import iconFlightsHotels from '../../assets/images/icon-flights-hotels.png';

// Web Dev Desktop-7 / Desktop-13 colours and shadows (from the Figma export).
const HERO_GRADIENT =
  'linear-gradient(169.5deg, rgba(11,19,237,0.8) -271px, rgba(211,178,250,0.3) 448.4px)';
const HERO_GRADIENT_MULTI =
  'linear-gradient(165.96deg, rgba(11,19,237,0.8) -360.8px, rgba(211,178,250,0.3) 597px)';
const TOGGLE_GRADIENT = 'linear-gradient(180deg, #9335FF, #5731FF)';
const CARD_SHADOW =
  '0 -2.23px 17.8px rgba(79,94,113,0.04), 0 -37.83px 22.25px rgba(79,94,113,0.05), 0 -16.69px 16.69px rgba(79,94,113,0.1), 0 -5.56px 17.8px rgba(79,94,113,0.15), 0 -2.23px 6.68px -1.11px rgba(79,94,113,0.14), 0 1.11px 2.23px -1.11px rgba(79,94,113,0.15)';
const ELEVATION_SHADOW =
  '0 8px 24px -5px rgba(79,94,113,0.1), 0 5px 16px -3px rgba(79,94,113,0.12), 0 1px 4px rgba(79,94,113,0.12), 0 0 1px rgba(41,47,55,0.3)';
const SWAP_SHADOW = ELEVATION_SHADOW;
const CHIP_SHADOW = ELEVATION_SHADOW;
const TAB_SHADOW = '0 3.25px 3.25px rgba(0,0,0,0.25)';

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

// A search's travel date (midnight UTC ISO) as the form's DD/MM/YYYY.
function displayDateFromIso(iso: string | undefined): string {
  const match = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : '';
}

function airportForCode(code: string): Airport {
  return AIRPORTS.find((a) => a.code === code) ?? { code, city: code, state: '', name: code };
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
  | { type: 'tripType' }
  | null;

export interface FlightSearchFormWebProps {
  onResults: (response: FlightSearchResponse, summary: FlightSearchSummary) => void;
  onNavigate?: (route: string) => void;
  // A previous search to start from ("Modify search" on the results page).
  initialSummary?: FlightSearchSummary | null;
  // 'hero': the home page (Web Dev Desktop-7/13). 'bar': the compact search
  // bar inside the results page header (Desktop-15), without page chrome.
  variant?: 'hero' | 'bar';
}

export const FlightSearchFormWeb: React.FC<FlightSearchFormWebProps> = ({
  onResults,
  onNavigate,
  initialSummary,
  variant = 'hero',
}) => {
  const initial = initialSummary?.request;
  const initialSegments = initial?.segments ?? [];
  const searchFlights = useSearchFlightsMobile();

  const [activeDropdown, setActiveDropdown] = useState<ActiveDropdown>(null);
  const [tripType, setTripType] = useState<TripType>(initial?.tripType ?? 'OneWay');

  const [origin, setOrigin] = useState<Airport | null>(initialSegments[0] ? airportForCode(initialSegments[0].origin) : null);
  const [destination, setDestination] = useState<Airport | null>(
    initialSegments[0] ? airportForCode(initialSegments[0].destination) : null
  );
  const [departureDate, setDepartureDate] = useState(displayDateFromIso(initialSegments[0]?.travelDate));
  const [returnDate, setReturnDate] = useState(
    initial?.tripType === 'RoundTrip' ? displayDateFromIso(initialSegments[1]?.travelDate) : ''
  );

  const [multiCitySegments, setMultiCitySegments] = useState<MultiCitySegment[]>(
    initial?.tripType === 'MultiCity'
      ? initialSegments.map((segment) => ({
          origin: airportForCode(segment.origin),
          destination: airportForCode(segment.destination),
          date: displayDateFromIso(segment.travelDate),
        }))
      : [
          { origin: null, destination: null, date: '' },
          { origin: null, destination: null, date: '' },
        ]
  );

  const [adultCount, setAdultCount] = useState(initial?.adultCount ?? 1);
  const [childCount, setChildCount] = useState(initial?.childCount ?? 0);
  const [infantCount, setInfantCount] = useState(initial?.infantCount ?? 0);
  const [cabinClass, setCabinClass] = useState<CabinClass>(initial?.cabinClass ?? 'Economy');
  const [nonStopOnly, setNonStopOnly] = useState(initialSummary?.nonStopOnly ?? false);

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

    const request = { tripType, cabinClass, segments, adultCount, childCount, infantCount };

    try {
      const response = await searchFlights.mutateAsync(request);
      onResults(response, summaryFromRequest(request, nonStopOnly));
    } catch (err: any) {
      setFormError(err?.message || 'Failed to search flights.');
    }
  };

  // Web Dev Desktop-7/13 search bar segments: white 48px cells on the #DDDDDD
  // bar, 1px apart (the bar shows through as the divider), 12px side padding,
  // 20px thin-stroke icon, 12px gap, Inter 16px #3E4B64.
  const segmentButton = 'w-full h-12 flex items-center gap-3 pl-3 pr-3 text-left';
  const segmentIcon = { size: 20, strokeWidth: 1.25, className: 'text-[#182339] shrink-0' };

  const renderAirportValue = (airport: Airport | null, placeholder: string) =>
    airport ? (
      <span className="flex items-baseline gap-3 min-w-0">
        <span className="text-[16px] leading-5 font-medium text-[#3E4B64] shrink-0">{airport.city},</span>
        <span className="text-[13px] leading-4 text-[#3E4B64] truncate">
          {airport.name} ({airport.code})
        </span>
      </span>
    ) : (
      <span className="text-[16px] leading-5 text-[#3E4B64]">{placeholder}</span>
    );

  const renderOriginDestination = (
    segIndex: number | null,
    segOrigin: Airport | null,
    segDestination: Airport | null,
    onSwap: () => void,
    grow: number
  ) => (
    <>
      <div className="relative min-w-0 bg-white rounded-l-[6px]" style={{ flex: `${grow} 1 0` }}>
        <button
          type="button"
          onClick={() =>
            setActiveDropdown((cur) =>
              cur?.type === 'origin' && cur.segmentIndex === segIndex ? null : { type: 'origin', segmentIndex: segIndex }
            )
          }
          className={segmentButton}
        >
          <PlaneTakeoff {...segmentIcon} />
          {renderAirportValue(segOrigin, 'Origin')}
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
        {/* 31px swap button centred on the origin/destination divider. */}
        <button
          type="button"
          onClick={onSwap}
          className="absolute z-10 top-1/2 -translate-y-1/2 -right-4 w-[31px] h-[31px] rounded-full border border-[#7C1AEE]/50 flex items-center justify-center bg-white"
          style={{ boxShadow: SWAP_SHADOW }}
          aria-label="Swap origin and destination"
        >
          <ArrowLeftRight size={16} strokeWidth={1.25} color="#182339" />
        </button>
      </div>

      <div className="relative min-w-0 bg-white" style={{ flex: `${grow} 1 0` }}>
        <button
          type="button"
          onClick={() =>
            setActiveDropdown((cur) =>
              cur?.type === 'destination' && cur.segmentIndex === segIndex ? null : { type: 'destination', segmentIndex: segIndex }
            )
          }
          className={`${segmentButton} pl-[23px]`}
        >
          <PlaneLanding {...segmentIcon} />
          {renderAirportValue(segDestination, 'Destination')}
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
    fieldDestination: Airport | null,
    grow: number,
    rounded = ''
  ) => (
    <div className={`relative min-w-0 bg-white ${rounded}`} style={{ flex: `${grow} 1 0` }}>
      <button
        type="button"
        onClick={() => {
          // One way still shows the Return cell (as in the design): picking a
          // return date makes it a round trip.
          if (field === 'return' && tripType === 'OneWay') setTripType('RoundTrip');
          setActiveDropdown((cur) =>
            cur?.type === field && cur.segmentIndex === segIndex ? null : { type: field, segmentIndex: segIndex }
          );
        }}
        className={segmentButton}
      >
        <Calendar {...segmentIcon} />
        <span className="text-[16px] leading-5 text-[#3E4B64] truncate">
          {value ? formatShortDate(value) : label}
        </span>
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

  // Title-case trip type for the bar's dropdown ("Round Trip").
  const tripTypeTitle = (key: TripType) =>
    (TRIP_TYPE_TABS.find((t) => t.key === key)?.label ?? '')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

  if (variant === 'bar') {
    // Desktop-15 search bar: grey #DDDDDD tray, white 48px fields joined by
    // 1px gaps (rounded only at the ends), Inter 16px medium labels with a
    // 13px airport line, and a 106x48 Search button.
    const fieldButton = 'h-12 w-full flex items-center gap-3 px-3 bg-white text-left';
    const label = 'text-[16px] leading-6 font-medium text-[#3E4B64] whitespace-nowrap';

    const airportField = (
      type: 'origin' | 'destination',
      segIndex: number | null,
      value: Airport | null,
      onSelect: (airport: Airport) => void,
      extraClass: string
    ) => (
      <div className={`relative min-w-0 ${extraClass}`}>
        <button
          type="button"
          onClick={() =>
            setActiveDropdown((cur) => (cur?.type === type && cur.segmentIndex === segIndex ? null : { type, segmentIndex: segIndex }))
          }
          className={`${fieldButton} ${type === 'destination' ? 'px-6' : ''}`}
        >
          {type === 'origin' ? (
            <PlaneTakeoff size={20} className="text-[#3E4B64] shrink-0" />
          ) : (
            <PlaneLanding size={20} className="text-[#3E4B64] shrink-0" />
          )}
          {value ? (
            <span className="flex items-baseline gap-2 min-w-0">
              <span className={label}>{value.city},</span>
              <span className="text-[13px] leading-4 text-[#3E4B64] truncate">
                {value.name} ({value.code})
              </span>
            </span>
          ) : (
            <span className={`${label} !font-normal`}>{type === 'origin' ? 'From' : 'To'}</span>
          )}
        </button>
        {activeDropdown?.type === type && activeDropdown.segmentIndex === segIndex && (
          <div className="absolute z-40 top-full left-0 mt-2">
            <AirportSearchDropdown
              onSelect={(airport) => {
                onSelect(airport);
                closeDropdown();
              }}
            />
          </div>
        )}
      </div>
    );

    const dateField = (
      field: 'departure' | 'return',
      segIndex: number | null,
      value: string,
      from: Airport | null,
      to: Airport | null,
      extraClass: string
    ) => (
      <div className={`relative min-w-0 ${extraClass}`}>
        <button
          type="button"
          onClick={() =>
            setActiveDropdown((cur) => (cur?.type === field && cur.segmentIndex === segIndex ? null : { type: field, segmentIndex: segIndex }))
          }
          className={fieldButton}
        >
          <Calendar size={20} className="text-[#3E4B64] shrink-0" />
          <span className={value ? label : `${label} !font-normal`}>
            {value ? formatShortDate(value) : field === 'return' ? 'Return' : 'Date'}
          </span>
        </button>
        {activeDropdown?.type === field && activeDropdown.segmentIndex === segIndex && (
          <div className="absolute z-40 top-full left-0 mt-2">
            <FareCalendarDropdown
              footerLabel={field === 'departure' ? 'Departure date' : 'Return date'}
              initialDate={parseDisplayDate(value)}
              minDate={field === 'return' ? parseDisplayDateLocal(departureDate) ?? undefined : undefined}
              origin={from?.code}
              destination={to?.code}
              showAddReturnLink={false}
              onAddReturnDate={() => undefined}
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

    const travellersField = (extraClass: string, buttonClass: string) => (
      <div className={`relative min-w-0 ${extraClass}`}>
        <button
          type="button"
          onClick={() => setActiveDropdown((cur) => (cur?.type === 'travellers' ? null : { type: 'travellers' }))}
          className={`${fieldButton} ${buttonClass}`}
        >
          <Users size={20} className="text-[#3E4B64] shrink-0" />
          <span className={`${label} truncate`}>{passengerSummary}</span>
        </button>
        {activeDropdown?.type === 'travellers' && (
          <div className="absolute z-40 top-full right-0 mt-2">
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
    );

    const searchButton = (
      <button
        type="button"
        onClick={handleSearch}
        disabled={searchFlights.isPending}
        className="h-12 w-[106px] shrink-0 flex items-center justify-center gap-0.5 p-3 rounded-xl bg-[#7C1AEE] text-white text-[15px] leading-5 font-medium disabled:opacity-60"
      >
        {searchFlights.isPending ? (
          'Searching…'
        ) : (
          <>
            Search
            <ChevronRight size={20} />
          </>
        )}
      </button>
    );

    const tripTypeField = (
      <div className="relative w-[22%] min-w-[150px]">
        <button
          type="button"
          onClick={() => setActiveDropdown((cur) => (cur?.type === 'tripType' ? null : { type: 'tripType' }))}
          className={`${fieldButton} rounded-l-lg justify-between`}
        >
          <span className={label}>{tripTypeTitle(tripType)}</span>
          <ChevronDown size={20} className="text-[#3E4B64]" />
        </button>
        {activeDropdown?.type === 'tripType' && (
          <div className="absolute z-40 top-full left-0 mt-2 w-full bg-white rounded-lg shadow-xl py-1">
            {TRIP_TYPE_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setTripType(tab.key);
                  closeDropdown();
                }}
                className={`w-full text-left px-4 py-2 text-[15px] ${tab.key === tripType ? 'text-[#7C1AEE] font-medium' : 'text-[#182339]'}`}
              >
                {tripTypeTitle(tab.key)}
              </button>
            ))}
          </div>
        )}
      </div>
    );

    // Desktop-15: the bar sits 4px inside the header's 32px padding (x=36).
    return (
      <div className="mx-1 flex flex-col gap-3">
        {tripType !== 'MultiCity' ? (
          <div className="flex items-center gap-4 bg-[#DDDDDD] rounded-lg p-2">
            <div className="flex-1 min-w-0 flex items-center gap-px">
              {tripTypeField}
              {airportField('origin', null, origin, setOrigin, 'w-[24%]')}
              {airportField('destination', null, destination, setDestination, 'w-[22%]')}
              {dateField('departure', null, departureDate, origin, destination, 'w-[11%] min-w-[128px]')}
              {tripType === 'RoundTrip' && dateField('return', null, returnDate, destination, origin, 'w-[11%] min-w-[128px]')}
              {travellersField('flex-1', 'rounded-r-lg')}
            </div>
            {searchButton}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {multiCitySegments.map((seg, index) => (
              <div key={index} className="flex items-center gap-4 bg-[#DDDDDD] rounded-lg p-2">
                <div className="flex-1 min-w-0 flex items-center gap-px">
                  {index === 0 ? (
                    tripTypeField
                  ) : (
                    <div className="w-[22%] min-w-[150px] h-12 bg-white rounded-l-lg flex items-center px-3 text-[16px] font-medium text-[#697691]">
                      Flight {index + 1}
                    </div>
                  )}
                  {airportField('origin', index, seg.origin, (a) => updateMultiCitySegment(index, { origin: a }), 'w-[28%]')}
                  {airportField('destination', index, seg.destination, (a) => updateMultiCitySegment(index, { destination: a }), 'w-[28%]')}
                  {dateField('departure', index, seg.date, seg.origin, seg.destination, 'flex-1 [&>button]:rounded-r-lg')}
                </div>
                {index === 0 ? (
                  searchButton
                ) : multiCitySegments.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => removeMultiCitySegment(index)}
                    aria-label="Remove flight"
                    className="w-[106px] h-12 flex items-center justify-center bg-white rounded-xl shrink-0"
                  >
                    <X size={16} color="#697691" />
                  </button>
                ) : (
                  <span className="w-[106px] shrink-0" />
                )}
              </div>
            ))}
            <div className="flex items-center gap-3">
              {multiCitySegments.length < 5 && (
                <button
                  type="button"
                  onClick={addMultiCitySegment}
                  className="h-11 px-5 rounded-[6px] bg-[#F3E8FF] text-[#6014B7] font-medium text-[15px]"
                >
                  Add Flight
                </button>
              )}
              {travellersField('w-[280px]', 'rounded-lg h-11')}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[15px] leading-5 font-medium text-[#3E4B64]">Special Fares (Optional)</span>
          {(['Student', 'SeniorCitizen'] as const).map((fare) => (
            <button
              key={fare}
              type="button"
              onClick={() => setSelectedFare((cur) => (cur === fare ? null : fare))}
              className={[
                'h-7 px-3 rounded border text-[15px] leading-5 font-medium bg-white',
                'shadow-[0px_0px_1px_rgba(41,47,55,0.3),0px_1px_4px_rgba(79,94,113,0.12)]',
                selectedFare === fare ? 'border-[#7C1AEE] text-[#7C1AEE]' : 'border-[#697691] text-[#697691]',
              ].join(' ')}
            >
              {fare === 'Student' ? 'Student' : 'Senior Citizen'}
            </button>
          ))}
          {!!formError && <span className="ml-4 text-sm text-[#C8102E]">{formError}</span>}
        </div>

        {activeDropdown && <div className="fixed inset-0 z-30" onClick={closeDropdown} />}
      </div>
    );
  }

  const isMultiCity = tripType === 'MultiCity';
  const searchButton = (
    <button
      type="button"
      onClick={handleSearch}
      disabled={searchFlights.isPending}
      className="w-[106px] h-12 shrink-0 flex items-center justify-center gap-[7px] pl-[6px] rounded-xl bg-[#7C1AEE] hover:bg-[#6B15D1] text-white text-[15px] leading-5 font-medium disabled:opacity-60"
    >
      {searchFlights.isPending ? (
        'Searching…'
      ) : (
        <>
          Search
          <ChevronRight size={22} strokeWidth={2} />
        </>
      )}
    </button>
  );
  const openTravellers = () =>
    setActiveDropdown((cur) => (cur?.type === 'travellers' ? null : { type: 'travellers' }));

  // Web Dev Desktop-7 (one way / round trip) and Desktop-13 (multi city), 1440 wide:
  // a gradient band from the header down to 26px below the card; the card
  // (42px from the page edges) starts 77px into it, with the product tabs
  // overlapping its top edge.
  return (
    <div className="min-h-screen bg-white">
      {/* Same site header as every other page: sign-in, account menu, My Trips. */}
      <MenuBar onNavigate={onNavigate} showProductLinks={false} />

      <div className="relative pt-[77px] pb-[26px]" style={{ background: isMultiCity ? HERO_GRADIENT_MULTI : HERO_GRADIENT }}>
        <div className="max-w-[1440px] mx-auto px-[42px] relative">
          {/* Product tabs: 92px #E8EEFF pill, 12px padding, 146x67 tabs 9px apart. */}
          <div className="absolute z-20 -top-[51px] left-1/2 -translate-x-1/2 flex items-center gap-[9px] bg-[#E8EEFF] rounded-[9999px] p-[12px]">
            {[
              { icon: iconFlights, label: 'Flights', active: true },
              { icon: iconHotels, label: 'Hotels', active: false },
              { icon: iconFlightsHotels, label: 'Flights\n+\nHotels', active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={['relative w-[145.5px] h-[67.5px]', item.active ? 'tab-active-ring' : ''].join(' ')}
              >
                <div
                  className="absolute inset-[3px] flex items-center gap-2 pl-[7.4px] rounded-[9999px] bg-white"
                  style={item.active ? { boxShadow: TAB_SHADOW } : undefined}
                >
                  <img src={item.icon} alt="" className="w-[52px] h-[52px] rounded-full shrink-0" />
                  <span className="font-semibold text-[#182339] text-[13.5px] leading-[1.15] whitespace-pre-line text-center">
                    {item.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="relative bg-white rounded-[17.8px] px-8 pt-[25px] pb-6" style={{ boxShadow: CARD_SHADOW }}>
            {/* Trip type (118px per option) and the Flights | Voylo AI switch. */}
            <div className="h-[30px] flex items-center justify-between pr-[78px]">
              <div className="flex items-center pl-[2px]">
                {TRIP_TYPE_TABS.map((tab) => {
                  const checked = tripType === tab.key;
                  return (
                    <label key={tab.key} className="w-[118px] flex items-center gap-[10px] cursor-pointer">
                      <span
                        className={[
                          'w-5 h-5 rounded-full flex items-center justify-center shrink-0',
                          checked ? 'border-2 border-[#7C1AEE]' : 'border border-[#ADB8CD]',
                        ].join(' ')}
                      >
                        {checked && <span className="w-[10px] h-[10px] rounded-full bg-[#7C1AEE]" />}
                      </span>
                      <input type="radio" className="sr-only" checked={checked} onChange={() => setTripType(tab.key)} />
                      <span className="text-[15px] leading-5 text-[#182339]">{tab.label}</span>
                    </label>
                  );
                })}
              </div>

              <div
                className="w-[134px] h-[30px] rounded-[15px] border-2 border-transparent flex items-center gap-[2px] p-px shrink-0"
                style={{ background: `linear-gradient(#fff, #fff) padding-box, ${TOGGLE_GRADIENT} border-box` }}
              >
                <span
                  className="w-[60px] h-6 rounded-[12px] flex items-center justify-center text-white text-[13.5px] font-semibold"
                  style={{ background: TOGGLE_GRADIENT }}
                >
                  Flights
                </span>
                <span className="w-[66px] h-6 rounded-[12px] flex items-center justify-center text-black text-[12.5px] font-medium">
                  Voylo AI
                </span>
              </div>
            </div>

            {!isMultiCity ? (
              <div className="mt-[13px] h-16 flex items-center gap-4 bg-[#DDDDDD] rounded-lg p-2">
                <div className="flex-1 min-w-0 h-12 flex gap-px">
                  {renderOriginDestination(null, origin, destination, handleSwap, 309)}
                  {renderDateField('departure', null, 'Departure', departureDate, origin, destination, 155)}
                  {renderDateField('return', null, 'Return', tripType === 'RoundTrip' ? returnDate : '', destination, origin, 155)}
                  <div className="relative min-w-0 bg-white rounded-r-[6px]" style={{ flex: '222 1 0' }}>
                    <button type="button" onClick={openTravellers} className={segmentButton}>
                      <Users {...segmentIcon} />
                      <span className="text-[16px] leading-5 font-medium text-[#3E4B64] truncate">{passengerSummary}</span>
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
                {searchButton}
              </div>
            ) : (
              <>
                <div className="mt-[21px] flex flex-col gap-2">
                  {multiCitySegments.map((seg, index) => (
                    <div key={index} className="h-16 flex items-center gap-4 bg-[#DDDDDD] rounded-lg p-2">
                      <div className="flex-1 min-w-0 h-12 flex gap-px">
                        {renderOriginDestination(index, seg.origin, seg.destination, () => swapMultiCitySegment(index), 404.67)}
                        {renderDateField('departure', index, 'Departure', seg.date, seg.origin, seg.destination, 404.67, 'rounded-r-[6px]')}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMultiCitySegment(index)}
                        aria-label="Remove flight"
                        className="w-11 h-11 flex items-center justify-center bg-white rounded-[6px] shrink-0"
                      >
                        <X size={20} strokeWidth={1.25} color="#182339" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-[11.5px] h-[49px] flex items-center justify-between">
                  {multiCitySegments.length < 5 ? (
                    <button
                      type="button"
                      onClick={addMultiCitySegment}
                      className="ml-[2px] w-[134px] h-11 flex items-center justify-center rounded-[6px] bg-[#F3E8FF] text-[#6014B7] text-[15px] leading-5 font-medium"
                    >
                      Add Flight
                    </button>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-[27px]">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={openTravellers}
                        className="w-[340px] h-[49px] flex items-center gap-3 pl-3 pr-3 border border-[#ADB8CD] rounded-[6.5px] bg-white text-left"
                      >
                        <Users {...segmentIcon} />
                        <span className="text-[16px] leading-5 font-medium text-[#3E4B64] truncate">{passengerSummary}</span>
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
                    {searchButton}
                  </div>
                </div>
              </>
            )}

            {/* Special fares: 28px chips, 4px radius, soft shadow. */}
            <div className={`${isMultiCity ? 'mt-[17.5px]' : 'mt-5'} h-7 flex items-center gap-2 pl-2`}>
              <span className="mr-px text-[15px] leading-5 font-medium text-[#3E4B64]">Special Fares (Optional)</span>
              {(['Student', 'SeniorCitizen'] as const).map((fare) => (
                <button
                  key={fare}
                  type="button"
                  onClick={() => setSelectedFare((cur) => (cur === fare ? null : fare))}
                  className={[
                    'h-7 px-3 rounded-[4px] border text-[15px] leading-5',
                    selectedFare === fare ? 'border-[#7C1AEE] bg-[#F3E8FF] text-[#7C1AEE]' : 'border-[#697691] bg-white text-[#697691]',
                  ].join(' ')}
                  style={{ boxShadow: CHIP_SHADOW }}
                >
                  {fare === 'Student' ? 'Student' : 'Senior Citizen'}
                </button>
              ))}
              {!!formError && <span className="ml-4 text-sm text-[#C8102E]">{formError}</span>}
            </div>

            <div className="mt-6 mx-2 h-16 bg-[#F3E8FF] rounded-lg pl-[17px] flex items-center gap-4">
              <ShieldCheck size={24} strokeWidth={1.25} className="text-[#7C1AEE] shrink-0" />
              <p className="text-[15px] leading-5 text-black">
                <span className="font-bold">Fly with confidence,</span> protect your trip with affordable travel insurance.
              </p>
            </div>
          </div>
        </div>
      </div>

      {activeDropdown && <div className="fixed inset-0 z-20" onClick={closeDropdown} />}
    </div>
  );
};
