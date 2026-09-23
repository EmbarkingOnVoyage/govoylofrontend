import React, { useState } from 'react';
import { ArrowLeftRight, Calendar, Menu, PlaneTakeoff, PlaneLanding, ShieldCheck, User, Users, X, ChevronRight } from 'lucide-react';
import { useSearchFlightsMobile, type TripType, type FlightSearchSegment, type FlightOffer } from './useSearchFlightsMobile';
import { AirportSearchDropdown } from './AirportSearchDropdown.web';
import { FareCalendarDropdown } from './FareCalendarDropdown.web';
import { TravellersClassDropdown, type CabinClass, type TravellersClassValues } from './TravellersClassDropdown.web';
import type { Airport } from './airports';
import govoyloLogo from '../../assets/images/govoylo-logo.svg';
import iconFlights from '../../assets/images/icon-flights.png';
import iconHotels from '../../assets/images/icon-hotels.png';
import iconFlightsHotels from '../../assets/images/icon-flights-hotels.png';

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
          className="w-full flex items-center gap-2 text-left px-4 py-3"
        >
          <PlaneTakeoff size={16} className="text-[#182339] shrink-0" />
          {segOrigin ? (
            <span className="text-[15px] truncate">
              <span className="font-bold text-[#182339]">{segOrigin.city},</span>{' '}
              <span className="text-[#3E4B64]">
                {segOrigin.name} ({segOrigin.code})
              </span>
            </span>
          ) : (
            <span className="text-[15px] font-normal text-[#3E4B64]">Origin</span>
          )}
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
        className="w-8 h-8 rounded-full border border-[#7C1AEE]/50 flex items-center justify-center shrink-0 bg-white"
        aria-label="Swap origin and destination"
      >
        <ArrowLeftRight size={16} color="#182339" />
      </button>

      <div className="relative flex-1 min-w-0">
        <button
          type="button"
          onClick={() =>
            setActiveDropdown((cur) =>
              cur?.type === 'destination' && cur.segmentIndex === segIndex ? null : { type: 'destination', segmentIndex: segIndex }
            )
          }
          className="w-full flex items-center gap-2 text-left px-4 py-3"
        >
          <PlaneLanding size={16} className="text-[#182339] shrink-0" />
          {segDestination ? (
            <span className="text-[15px] truncate">
              <span className="font-bold text-[#182339]">{segDestination.city},</span>{' '}
              <span className="text-[#3E4B64]">
                {segDestination.name} ({segDestination.code})
              </span>
            </span>
          ) : (
            <span className="text-[15px] font-normal text-[#3E4B64]">Destination</span>
          )}
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
        className="w-full flex items-center gap-2 text-left px-4 py-3"
      >
        <Calendar size={16} className="text-[#182339] shrink-0" />
        <span className={value ? 'text-[15px] font-bold text-[#182339] truncate' : 'text-[15px] font-normal text-[#3E4B64] truncate'}>
          {value ? formatShortDate(value) : field === 'return' ? 'Return' : 'Select date'}
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

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <div className="bg-white">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          <img src={govoyloLogo} alt="goVoylo" className="h-8 w-auto" />
          <div className="flex items-center gap-6 text-sm font-medium text-[#182339]">
            <span className="flex items-center gap-1.5">🇮🇳 INR</span>
            <span className="cursor-pointer hover:text-[#7C1AEE]">Help &amp; support</span>
            <button
              type="button"
              onClick={() => onNavigate?.('/signin')}
              className="flex items-center gap-1.5 hover:text-[#7C1AEE]"
            >
              <User size={16} />
              Log in/Sign up
            </button>
            <Menu size={20} className="cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <div
        className="pb-16"
        style={{ background: 'linear-gradient(to bottom, rgba(11,19,237,0.8), rgba(211,178,250,0.3))' }}
      >
        <div className="max-w-[1440px] mx-auto px-8 pt-6 relative flex items-center justify-center">
          <div className="flex items-center gap-[9px] bg-[#E8EEFF] rounded-[9999px] p-[12px]">
            {[
              { icon: iconFlights, label: 'Flights', active: true },
              { icon: iconHotels, label: 'Hotels', active: false },
              { icon: iconFlightsHotels, label: 'Flights\n+ Hotels', active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={['relative w-[146px] h-[67px]', item.active ? 'tab-active-ring' : ''].join(' ')}
              >
                <div className="absolute inset-[3px] flex items-center gap-2 px-2 rounded-[9999px] bg-white shadow-sm">
                  <img src={item.icon} alt="" className="w-[52px] h-[52px] rounded-full shrink-0" />
                  <span className="font-bold text-[#182339] text-[13px] whitespace-pre-line leading-tight">{item.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search card */}
      <div className="max-w-[1200px] mx-auto px-6 -mt-12">
        <div className="bg-white rounded-[17.8px] shadow-lg p-6">
          <div className="flex items-center justify-between gap-6 mb-4">
            <div className="flex items-center gap-6">
              {TRIP_TYPE_TABS.map((tab) => (
                <label key={tab.key} className="flex items-center gap-2 cursor-pointer">
                  <span
                    className={[
                      'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                      tripType === tab.key ? 'border-[#7C1AEE]' : 'border-[#697691]',
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

            <div className="flex items-center bg-[#F4F4F6] rounded-full p-1 shrink-0">
              <span className="px-4 py-1.5 rounded-full text-white text-sm font-bold bg-gradient-to-r from-[#9335FF] to-[#5731FF]">
                Flights
              </span>
              <span className="px-4 py-1.5 text-sm font-bold text-[#182339]">Voylo AI</span>
            </div>
          </div>

          {tripType !== 'MultiCity' ? (
            <div className="flex items-stretch gap-4 bg-[#DDDDDD] rounded-lg p-2">
              <div className="flex-1 min-w-0 flex items-center bg-white rounded-lg divide-x divide-[#DFE3EC]">
                {renderOriginDestination(null, origin, destination, handleSwap)}
                <div className="w-px" />
                {renderDateField('departure', null, 'Departure', departureDate, origin, destination)}
                {tripType === 'RoundTrip' &&
                  renderDateField('return', null, 'Return', returnDate, destination, origin)}
                <div className="relative flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveDropdown((cur) => (cur?.type === 'travellers' ? null : { type: 'travellers' }))}
                    className="w-full flex items-center gap-2 text-left px-4 py-3"
                  >
                    <Users size={16} className="text-[#182339] shrink-0" />
                    <span className="text-[15px] font-bold text-[#182339] truncate">{passengerSummary}</span>
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
                className="w-[136px] flex items-center justify-center gap-1 rounded-xl bg-[#7C1AEE] hover:bg-[#6B15D1] text-white font-semibold text-base disabled:opacity-60"
              >
                {searchFlights.isPending ? 'Searching…' : (
                  <>
                    Search
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {multiCitySegments.map((seg, index) => (
                <div key={index} className="flex items-stretch gap-4 bg-[#DDDDDD] rounded-lg p-2">
                  <div className="flex-1 min-w-0 flex items-center bg-white rounded-lg divide-x divide-[#DFE3EC]">
                    {renderOriginDestination(index, seg.origin, seg.destination, () => swapMultiCitySegment(index))}
                    {renderDateField('departure', index, 'Departure', seg.date, seg.origin, seg.destination)}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMultiCitySegment(index)}
                    aria-label="Remove flight"
                    className="w-11 h-11 flex items-center justify-center bg-white rounded-lg shrink-0"
                  >
                    <X size={16} color="#697691" />
                  </button>
                </div>
              ))}

              <div className="flex items-center justify-between gap-3">
                {multiCitySegments.length < 5 ? (
                  <button
                    type="button"
                    onClick={addMultiCitySegment}
                    className="w-[134px] h-11 flex items-center justify-center rounded-[6px] bg-[#F3E8FF] text-[#6014B7] font-medium text-[15px]"
                  >
                    Add Flight
                  </button>
                ) : (
                  <span />
                )}

                <div className="flex items-stretch gap-3">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveDropdown((cur) => (cur?.type === 'travellers' ? null : { type: 'travellers' }))}
                      className="w-[339px] h-11 flex items-center gap-2 px-4 border border-[#DFE3EC] rounded-[6px] bg-white text-left"
                    >
                      <Users size={16} className="text-[#182339] shrink-0" />
                      <span className="text-[15px] font-bold text-[#182339] truncate">{passengerSummary}</span>
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
                    className="w-[136px] flex items-center justify-center gap-1 rounded-xl bg-[#7C1AEE] hover:bg-[#6B15D1] text-white font-semibold text-base disabled:opacity-60"
                  >
                    {searchFlights.isPending ? 'Searching…' : (
                      <>
                        Search
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </div>
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
                  'h-9 px-4 rounded-full border text-sm font-medium',
                  selectedFare === fare ? 'border-[#7C1AEE] bg-[#F3E8FF] text-[#7C1AEE]' : 'border-[#697691] text-[#697691]',
                ].join(' ')}
              >
                {fare === 'Student' ? 'Student' : 'Senior Citizen'}
              </button>
            ))}
          </div>

          {!!formError && <p className="text-sm text-red-500 text-center mt-4">{formError}</p>}

          <div className="mt-4 bg-[#F3E8FF] rounded-lg px-5 py-3 flex items-center gap-3">
            <ShieldCheck size={24} className="text-[#7C1AEE] shrink-0" />
            <p className="text-sm text-[#182339]">
              <span className="font-bold">Fly with confidence, </span>
              protect your trip with affordable travel insurance.
            </p>
          </div>
        </div>
      </div>

      {activeDropdown && (
        <div className="fixed inset-0 z-20" onClick={closeDropdown} />
      )}
    </div>
  );
};
