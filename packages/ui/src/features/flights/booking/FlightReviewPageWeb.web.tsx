import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BriefcaseBusiness, Check, ChevronRight, Clock, Loader2, Luggage, MapPinPlus, Plane, Plus, X } from 'lucide-react';
import type { FlightOffer, FlightOfferSegment } from '../useSearchFlightsMobile';
import type { FlightBookingSelection, FlightCheckoutDetails } from '../flightBookingSession';
import { useTravellerDetailMobile, useTravellersMobile, type Traveler } from '../../profile/useTravellersMobile';
import { useCustomerProfileMobile } from '../../profile/useCustomerProfileMobile';
import { formatPrice, formatTime24, formatTotalDuration } from '../logic/flightResults';
import {
  GSTIN_PATTERN,
  PAX_LABELS,
  PAX_TYPES,
  checkTravelerAge,
  formatTravelerDob,
  paxCountText,
  savedPaxType,
  PAX_API_TYPES,
  type PaxType,
} from '../logic/travellers';
import type { AddOnSelection } from '../logic/booking';
import type { FareRulesLeg } from '../logic/fareRules';
import { baggageText } from '../logic/addOns';
import { AirlineLogoWeb } from '../results/AirlineLogoWeb.web';
import { FareRulesPanelWeb } from '../results/FareRulesPanelWeb.web';
import { useAirportLookup } from '../results/useAirportLookup';
import { TravellerFormWeb } from './TravellerFormWeb.web';
import { AddOnsSectionWeb, type AddOnLegRoute, type AddOnTraveller } from './AddOnsSectionWeb.web';
import {
  BookingPageWeb,
  CheckboxWeb,
  FareSummaryWeb,
  FieldWeb,
  Separator,
  SectionHeading,
  SubHeading,
  buildFareBreakdown,
  fieldInputClass,
} from './BookingLayoutWeb.web';
import { useEscapeKey } from '../useEscapeKey.web';

export { BookingConfirmedWeb, type BookingConfirmation } from './BookingConfirmedWeb.web';

const VISA_NOTE = 'Please ensure your visa is valid. passport has 6+ months validity, and name matches your passport.';
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "Mon, 30.1" — the itinerary card's date format.
function shortDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}`;
}

// "18/12/2045"
function slashDate(iso: string | null | undefined): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

export function paxSummaryText(counts: { adult: number; child: number; infant: number }): string {
  return `For ${[
    paxCountText('adult', counts.adult),
    counts.child > 0 && paxCountText('child', counts.child),
    counts.infant > 0 && paxCountText('infant', counts.infant),
  ]
    .filter(Boolean)
    .join(', ')}`;
}

// --- Itinerary card ("One-way Itinerary1": 351 wide) ---

const Endpoint: React.FC<{ iso: string; code: string; city: string; airport: string; position: 'top' | 'bottom' }> = ({
  iso,
  code,
  city,
  airport,
  position,
}) => (
  <div className={`flex items-start gap-1 px-4 ${position === 'top' ? 'pt-3' : 'pb-3'}`}>
    <div className="w-16 shrink-0 flex flex-col items-end">
      <span className="text-[15px] leading-5 font-medium text-[#182339]">{formatTime24(iso)}</span>
      <span className="text-[13px] leading-4 text-[#3E4B64] whitespace-nowrap">{shortDate(iso)}</span>
    </div>
    <div className={`w-6 h-9 shrink-0 flex flex-col items-center ${position === 'top' ? 'pt-[6px]' : ''}`}>
      {position === 'bottom' && <span className="w-0.5 h-[6px] bg-[#C2CADA]" />}
      <span className={`w-2 h-2 rounded-full shrink-0 ${position === 'top' ? 'bg-[#3E4B64]' : 'bg-[#4F5E71]'}`} />
      {position === 'top' && <span className="flex-1 w-0.5 bg-[#C2CADA]" />}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-[15px] leading-5 font-medium text-[#182339] truncate">
        {city} · {code}
      </div>
      <div className="text-[13px] leading-4 text-[#3E4B64] truncate">{airport}</div>
    </div>
  </div>
);

const FlyingRow: React.FC<{ segment: FlightOfferSegment; fallbackAirline: string }> = ({ segment, fallbackAirline }) => (
  <div className="h-11 flex items-center gap-1 pl-4 pr-2">
    <span className="w-16 shrink-0 text-right text-[12px] leading-4 font-medium text-[#182339]">
      {formatTotalDuration(segment.departureDateTime, segment.arrivalDateTime)}
    </span>
    <span className="relative w-6 h-11 shrink-0 flex items-center justify-center">
      <span className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-[#C2CADA]" />
      <span className="relative w-4 h-4 bg-white flex items-center justify-center">
        <Plane size={14} className="text-[#182339] rotate-90" />
      </span>
    </span>
    <span className="h-6 flex items-center gap-1 pr-2 rounded-xl bg-[#ECEEF3]">
      <span className="w-6 h-6 rounded-full overflow-hidden flex items-center justify-center">
        <AirlineLogoWeb airlineCode={segment.airlineCode} size={24} />
      </span>
      <span className="text-[12px] leading-4 font-medium text-[#182339] whitespace-nowrap">{segment.airlineName || fallbackAirline}</span>
    </span>
  </div>
);

const ItineraryCard: React.FC<{
  leg: FlightOffer;
  cityFor: (code: string) => string;
  nameFor: (code: string) => string;
}> = ({ leg, cityFor, nameFor }) => {
  const [expanded, setExpanded] = useState(false);
  const segments = leg.segments;
  const first = segments[0];
  const last = segments[segments.length - 1];
  const layovers = segments.slice(0, -1).map((s, i) => ({
    city: cityFor(s.destination),
    duration: formatTotalDuration(s.arrivalDateTime, segments[i + 1].departureDateTime),
  }));
  const endpoint = (iso: string, code: string, position: 'top' | 'bottom') => (
    <Endpoint iso={iso} code={code} city={cityFor(code)} airport={nameFor(code)} position={position} />
  );

  return (
    <div className="w-[351px] shrink-0 flex flex-col gap-3">
      <div className="flex items-start gap-3 px-2">
        <span className="flex-1 min-w-0 flex items-center gap-2 text-[16px] leading-5 font-bold text-[#3E4B64] truncate">
          {cityFor(first.origin)} <ArrowRight size={16} /> {cityFor(last.destination)}
        </span>
        <span className="flex items-center gap-1 text-[15px] leading-5 font-medium text-[#3E4B64] whitespace-nowrap">
          <Clock size={20} />
          {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}
        </span>
      </div>
      <div className="bg-white rounded-t-lg shadow-[0px_0px_1px_rgba(41,47,55,0.3),0px_0px_2px_rgba(79,94,113,0.12),0px_2px_6px_rgba(79,94,113,0.08)]">
        {expanded ? (
          segments.map((segment, index) => (
            <React.Fragment key={index}>
              {endpoint(segment.departureDateTime, segment.origin, 'top')}
              <FlyingRow segment={segment} fallbackAirline={leg.airlineName} />
              {endpoint(segment.arrivalDateTime, segment.destination, 'bottom')}
              {index < segments.length - 1 && (
                <div className="mx-4 mb-3 px-3 py-1.5 rounded-lg bg-[#E8EEFF] text-[13px] leading-4 text-[#182339]">
                  Layover at {layovers[index].city} ({layovers[index].duration})
                </div>
              )}
            </React.Fragment>
          ))
        ) : (
          <>
            {endpoint(first.departureDateTime, first.origin, 'top')}
            <FlyingRow segment={{ ...first, arrivalDateTime: last.arrivalDateTime }} fallbackAirline={leg.airlineName} />
            {endpoint(last.arrivalDateTime, last.destination, 'bottom')}
          </>
        )}
        {layovers.length > 0 && !expanded && (
          <div className="pb-3 border border-[#ECEEF3]">
            <div className="h-px bg-[#E8EDF1]" />
            <div className="flex items-center gap-3 px-4 pt-3">
              <span className="w-6 h-6 rounded-full bg-[#E8EEFF] flex items-center justify-center shrink-0">
                <MapPinPlus size={16} className="text-[#182339]" />
              </span>
              <span className="pt-0.5 text-[13px] leading-4 text-[#182339]">
                {layovers.map((l) => `Layover at ${l.city} (${l.duration})`).join(' · ')}
              </span>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full h-8 flex items-center justify-center rounded-lg text-[15px] leading-5 font-medium text-[#7C1AEE]"
        >
          {expanded ? 'Hide Flight Details' : 'View Flight Details'}
        </button>
      </div>
    </div>
  );
};

const BaggageInfo: React.FC<{ leg: FlightOffer }> = ({ leg }) => {
  const fare = leg.fares.find((f) => f.fareId === leg.selectedFareId) ?? leg.fares[0];
  return (
    <div className="flex flex-col gap-2 text-[13px] leading-4">
      <span className="text-[#697691]">Baggage</span>
      <span className="flex items-center gap-2 text-[#182339]">
        <Luggage size={16} />
        Cabin: {fare?.handBaggage ? `${baggageText(fare.handBaggage)} per adult` : 'as per airline'}
      </span>
      <span className="flex items-center gap-2 text-[#182339]">
        <BriefcaseBusiness size={16} />
        Check-in: {fare?.checkInBaggage ? `${baggageText(fare.checkInBaggage)} per adult` : 'as per airline'}
      </span>
    </div>
  );
};

// --- Saved traveller ("Checkbox with text" + Edit, 286 wide) ---

const TravellerOption: React.FC<{
  traveller: Traveler;
  selected: boolean;
  note?: string;
  onToggle: () => void;
  onEdit?: () => void;
}> = ({ traveller, selected, note, onToggle, onEdit }) => {
  const { data: detail } = useTravellerDetailMobile(traveller.id);
  const passport = detail?.passport;
  return (
    <div className="w-[286px] flex items-start gap-3">
      <div className="w-[222px] flex items-start gap-2">
        <CheckboxWeb checked={selected} onChange={onToggle} label={`Select ${traveller.firstName} ${traveller.lastName}`} />
        <button type="button" onClick={onToggle} className="flex-1 min-w-0 flex flex-col text-left">
          <span className="py-0.5 text-[15px] leading-5 font-medium text-[#182339] break-words">
            {traveller.firstName} {traveller.lastName}
          </span>
          <span className="text-[13px] leading-4 text-[#3E4B64]">
            {passport ? (
              <>
                Passport No.: {passport.maskedPassportNumber},
                <br />
                Expiry Date: {slashDate(passport.expiryDate)}
              </>
            ) : (
              [traveller.gender, formatTravelerDob(traveller.dateOfBirth)].filter(Boolean).join(', ')
            )}
          </span>
          {note && <span className="text-[12px] leading-4 text-[#CE6400]">{note}</span>}
        </button>
      </div>
      {onEdit && (
        <button type="button" onClick={onEdit} className="h-8 px-2 rounded-lg text-[15px] leading-5 font-medium text-[#3E4B64]">
          Edit
        </button>
      )}
    </div>
  );
};

export const SelectedTravellersWeb: React.FC<{
  groups: { type: PaxType; required: number; travellers: Traveler[] }[];
  isSelected: (t: Traveler) => boolean;
  noteFor?: (t: Traveler) => string | undefined;
  onToggle?: (t: Traveler) => void;
  onEdit?: (t: Traveler) => void;
}> = ({ groups, isSelected, noteFor, onToggle, onEdit }) => (
  <div className="flex flex-col">
    {groups.map(({ type, required, travellers }) => (
      <div key={type} className="flex flex-col">
        <div className="h-9 flex items-center gap-9 text-[15px] leading-5 text-[#697691]">
          <span>{PAX_LABELS[type].block}</span>
          <span>
            {travellers.filter(isSelected).length}/{required} Selected
          </span>
        </div>
        {travellers.length === 0 ? (
          <p className="pb-3 text-[13px] leading-4 text-[#697691]">No saved {PAX_LABELS[type].plural} yet. Add one below.</p>
        ) : (
          <div className="flex flex-wrap gap-x-2 gap-y-4 pb-4">
            {travellers.map((t) => (
              <TravellerOption
                key={t.id}
                traveller={t}
                selected={isSelected(t)}
                note={noteFor?.(t)}
                onToggle={() => onToggle?.(t)}
                onEdit={onEdit ? () => onEdit(t) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    ))}
  </div>
);

// Phone codes offered next to the mobile number; bookings go out with the
// national number only, as on mobile.
const PHONE_CODES = ['+91'];

function nationalNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 && digits.startsWith('91') ? digits.slice(2) : digits;
}

// Web Dev "Desktop - 17": flight details, fare policy, travellers (saved
// list + the inline "Adult N" form), contact details, what's included and
// GST, with the fare summary alongside. Continue hands everything to the
// Payment page (Desktop-19), where the seats are held and paid for.
export const FlightReviewPageWeb: React.FC<{
  selection: FlightBookingSelection;
  onBackToResults: () => void;
  onContinue: (checkout: FlightCheckoutDetails) => void;
}> = ({ selection, onBackToResults, onContinue }) => {
  const { legs, legLabels, passengerCounts, checkout: saved } = selection;
  const codes = useMemo(() => legs.flatMap((l) => l.segments.flatMap((s) => [s.origin, s.destination])), [legs]);
  const { cityFor, nameFor } = useAirportLookup(codes);
  const { data: travellers, isLoading: travellersLoading } = useTravellersMobile();
  const { data: profile } = useCustomerProfileMobile();

  // Coming back from Payment keeps what was entered.
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(saved?.travellers.map((t) => t.id) ?? []));
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [hint, setHint] = useState('');
  const [form, setForm] = useState<{ heading: string; traveller: Traveler | null } | null>(null);
  const [email, setEmail] = useState(saved?.email ?? '');
  const [phoneCode, setPhoneCode] = useState('+91');
  const [mobile, setMobile] = useState(saved?.mobile ?? '');
  const [addOns, setAddOns] = useState<AddOnSelection[]>(saved?.addOns ?? []);
  const [useGst, setUseGst] = useState(!!saved?.gst);
  const [gstNumber, setGstNumber] = useState(saved?.gst?.number ?? '');
  const [gstName, setGstName] = useState(saved?.gst?.holderName ?? '');
  const [gstAddress, setGstAddress] = useState(saved?.gst?.address ?? '');
  const [showRules, setShowRules] = useState(false);
  const [error, setError] = useState('');

  useEscapeKey(() => setShowRules(false), showRules);

  // Contact details start from the profile.
  useEffect(() => {
    if (profile?.email && !email) setEmail(profile.email);
    if (profile?.phone && !mobile) setMobile(nationalNumber(profile.phone));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const required: Record<PaxType, number> = {
    adult: passengerCounts.adult,
    child: passengerCounts.child,
    infant: passengerCounts.infant,
  };
  const visibleTypes = PAX_TYPES.filter((type) => required[type] > 0);
  const firstTravelIso = legs[0]?.segments[0]?.departureDateTime;
  const lastSegments = legs[legs.length - 1]?.segments ?? [];
  const lastTravelIso = lastSegments[lastSegments.length - 1]?.departureDateTime;

  const ageChecks = useMemo(
    () => new Map((travellers ?? []).map((t) => [t.id, checkTravelerAge(t, firstTravelIso, lastTravelIso)])),
    [travellers, firstTravelIso, lastTravelIso]
  );
  const paxTypeOf = (t: Traveler): PaxType => ageChecks.get(t.id)?.type ?? savedPaxType(t);
  const byType = useMemo(() => {
    const groups: Record<PaxType, Traveler[]> = { adult: [], child: [], infant: [] };
    (travellers ?? []).forEach((t) => groups[paxTypeOf(t)].push(t));
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travellers, ageChecks]);
  // Adults first, then children, then infants — the supplier's passenger order.
  const selectedTravellers = PAX_TYPES.flatMap((type) => byType[type].filter((t) => selectedIds.has(t.id)));
  const selectedCount = (type: PaxType) => byType[type].filter((t) => selectedIds.has(t.id)).length;

  const breakdown = buildFareBreakdown(legs, addOns, paxSummaryText(passengerCounts));
  const money = (amount: number) => formatPrice(amount, breakdown.currencyCode);

  const addOnTravellers: AddOnTraveller[] = selectedTravellers.map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    gender: t.gender ?? 'Male',
    travelerType: PAX_API_TYPES[paxTypeOf(t)],
  }));

  const legRoutes: AddOnLegRoute[] = legs.map((leg, index) => {
    const first = leg.segments[0];
    // A whole-trip offer is labelled by its turnaround point, not DEL → DEL.
    const firstTrip = leg.segments.filter((s) => (s.tripIndex ?? 0) === (first?.tripIndex ?? 0));
    const last = firstTrip.length < leg.segments.length ? firstTrip[firstTrip.length - 1] : leg.segments[leg.segments.length - 1];
    const fare = leg.fares.find((f) => f.fareId === leg.selectedFareId) ?? leg.fares[0];
    return {
      offerId: leg.offerId,
      fareId: leg.selectedFareId ?? null,
      label: `Flight ${index + 1}`,
      origin: first?.origin ?? '',
      destination: last?.destination ?? '',
      handBaggage: fare?.handBaggage ?? null,
      checkInBaggage: fare?.checkInBaggage ?? null,
      airlineCode: leg.airlineCode,
      airlineName: leg.airlineName,
      flightNumbers: firstTrip.map((s) => `${s.airlineCode} ${s.flightNumber}`),
      departureDateTime: first?.departureDateTime,
    };
  });

  const fareRuleLegs: FareRulesLeg[] = legs.map((leg, index) => ({
    offerId: leg.offerId,
    label: legLabels?.[index] ?? `Flight ${index + 1}`,
    origin: leg.segments[0].origin,
    destination: leg.segments[leg.segments.length - 1].destination,
    airlineName: leg.airlineName,
    airlineCode: leg.airlineCode,
    flightNumbers: leg.segments.map((s) => `${s.airlineCode} ${s.flightNumber}`),
    departureDateTime: leg.segments[0].departureDateTime,
    segments: leg.segments,
    fareId: leg.selectedFareId ?? null,
  }));

  useEffect(() => {
    const added = pendingSelectId ? travellers?.find((t) => t.id === pendingSelectId) : undefined;
    if (!added) return;
    setPendingSelectId(null);
    if (!selectedIds.has(added.id)) toggle(added);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travellers, pendingSelectId]);

  const toggle = (t: Traveler) => {
    const type = paxTypeOf(t);
    const check = ageChecks.get(t.id);
    if (!selectedIds.has(t.id) && check?.blocked) {
      setHint(`${t.firstName} ${t.lastName} can't travel on these dates: ${check.note.toLowerCase()}.`);
      return;
    }
    if (!selectedIds.has(t.id) && selectedCount(type) >= required[type]) {
      setHint(`This search is for ${paxCountText(type, required[type])}. Unselect one to choose another.`);
      return;
    }
    setHint('');
    setError('');
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(t.id)) next.delete(t.id);
      else next.add(t.id);
      return next;
    });
  };

  // The next traveller slot to fill, for the form heading ("Adult 2").
  const nextSlot = (): string => {
    const type = visibleTypes.find((t) => selectedCount(t) < required[t]) ?? 'adult';
    return `${PAX_LABELS[type].block} ${Math.min(selectedCount(type) + 1, Math.max(required[type], 1))}`;
  };

  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const mobileValid = /^\d{10}$/.test(mobile.replace(/[\s-]/g, ''));

  const problem = (): string => {
    const missing = visibleTypes.filter((type) => selectedCount(type) !== required[type]);
    if (missing.length > 0) {
      return `Please select ${missing.map((type) => paxCountText(type, required[type])).join(', ')} for this booking.`;
    }
    if (!emailValid) return 'Please enter a valid email for the booking.';
    if (!mobileValid) return 'Please enter a valid 10-digit mobile number for the booking.';
    if (useGst && (!GSTIN_PATTERN.test(gstNumber.trim().toUpperCase()) || !gstName.trim() || !gstAddress.trim())) {
      return 'Please enter a valid 15-character GSTIN, company name and company address.';
    }
    return '';
  };

  const handleContinue = () => {
    const issue = problem();
    setError(issue);
    if (issue) return;
    onContinue({
      travellers: selectedTravellers,
      paxTypes: Object.fromEntries(selectedTravellers.map((t) => [t.id, paxTypeOf(t)])),
      email: email.trim(),
      mobile: mobile.replace(/[\s-]/g, ''),
      addOns,
      gst: useGst
        ? { number: gstNumber.trim().toUpperCase(), holderName: gstName.trim(), address: gstAddress.trim() }
        : undefined,
    });
  };

  return (
    <BookingPageWeb sidebar={<FareSummaryWeb breakdown={breakdown} />}>
      <div className="flex flex-col gap-4">
        <SectionHeading
          title="Flight details"
          subtitle={VISA_NOTE}
          action={
            <button type="button" onClick={onBackToResults} className="pb-0.5 text-[15px] leading-5 font-medium text-[#7C1AEE] whitespace-nowrap">
              Change flight
            </button>
          }
        />

        <div className="flex flex-col gap-4 max-w-[988px]">
          {legs.map((leg, index) => (
            <div key={`${leg.offerId}-${index}`} className="flex flex-col gap-2">
              {legs.length > 1 && (
                <span className="px-2 text-[11px] leading-4 font-semibold uppercase text-[#7C1AEE]">
                  {legLabels?.[index] ?? `Flight ${index + 1}`}
                </span>
              )}
              <div className="flex items-center gap-[35px]">
                <ItineraryCard leg={leg} cityFor={cityFor} nameFor={nameFor} />
                <BaggageInfo leg={leg} />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() => setShowRules(true)}
            className="w-full flex items-start gap-3 p-3 rounded-xl bg-[#ECEEF3] text-left"
          >
            <span className="flex-1 flex flex-col gap-1">
              <span className="text-[15px] leading-5 font-bold text-[#182339]">Fare policy</span>
              <span className="text-[15px] leading-5 text-[#182339]">View cancellation and rescheduling charges</span>
            </span>
            <span className="w-11 h-11 flex items-center justify-center rounded-xl">
              <ChevronRight size={20} className="text-[#182339]" />
            </span>
          </button>
        </div>

        <div className="max-w-[988px] flex flex-col gap-4">
          <SectionHeading title="Traveller details" subtitle="Choose from the saved list or add a new passenger" />
          {travellersLoading ? (
            <Loader2 className="animate-spin text-[#7C1AEE]" />
          ) : (
            <div className="flex flex-col">
              <SelectedTravellersWeb
                groups={visibleTypes.map((type) => ({ type, required: required[type], travellers: byType[type] }))}
                isSelected={(t) => selectedIds.has(t.id)}
                noteFor={(t) => ageChecks.get(t.id)?.note}
                onToggle={toggle}
                onEdit={(t) => setForm({ heading: `Edit ${t.firstName} ${t.lastName}`, traveller: t })}
              />
              {hint && <p className="pb-3 text-[13px] leading-4 text-[#CE6400]">{hint}</p>}
              {!form && (
                <button
                  type="button"
                  onClick={() => setForm({ heading: nextSlot(), traveller: null })}
                  className="w-full h-11 flex items-center justify-center gap-2 rounded-2xl text-[15px] leading-5 font-medium text-[#7C1AEE]"
                >
                  Add new travellers <Plus size={20} />
                </button>
              )}
              <Separator />
            </div>
          )}
        </div>

        {form && (
          <TravellerFormWeb
            key={form.traveller?.id ?? 'new'}
            heading={form.heading}
            subtitle={VISA_NOTE}
            traveller={form.traveller}
            onCancel={() => setForm(null)}
            onSaved={(id) => {
              setForm(null);
              // A new traveller is selected straight away when there's room.
              if (id && !form.traveller) setPendingSelectId(id);
            }}
          />
        )}

        <div className="flex flex-col gap-3">
          <SubHeading>Contact Details</SubHeading>
          <p className="-mt-2 text-[13px] leading-4 text-[#697691]">Your booking confirmation and e-ticket are sent here.</p>
          <div className="flex items-end gap-4">
            <FieldWeb label="Email address" className="w-[343px]">
              <span className="relative">
                <input
                  type="email"
                  className={`${fieldInputClass} pr-10`}
                  placeholder="Text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                {emailValid && <Check size={20} className="absolute right-3 top-2.5 text-[#007F20]" />}
              </span>
            </FieldWeb>
            <div className="w-[343px] flex items-end gap-2">
              <FieldWeb label="Phone number" className="w-[123px] shrink-0">
                <select className={fieldInputClass} value={phoneCode} onChange={(e) => setPhoneCode(e.target.value)}>
                  {PHONE_CODES.map((code) => (
                    <option key={code}>{code}</option>
                  ))}
                </select>
              </FieldWeb>
              <span className="relative flex-1">
                <input
                  type="tel"
                  aria-label="Mobile number"
                  className={`${fieldInputClass} pr-10`}
                  placeholder="1234"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                />
                {mobileValid && <Check size={20} className="absolute right-3 top-2.5 text-[#007F20]" />}
              </span>
            </div>
          </div>
          <Separator />
        </div>

        <div className="px-3 flex flex-col gap-6">
          <AddOnsSectionWeb
            legRoutes={legRoutes}
            travellers={addOnTravellers}
            currencyCode={breakdown.currencyCode}
            selections={addOns}
            onChange={setAddOns}
          />

          <div className="flex items-start gap-2 py-3 pl-3 pr-3 rounded-lg bg-[#ECEEF3]">
            <CheckboxWeb checked={useGst} onChange={() => setUseGst((v) => !v)} label="Add GST number" />
            <div className="flex-1 flex flex-col gap-3">
              <button type="button" onClick={() => setUseGst((v) => !v)} className="flex flex-col gap-1 text-left">
                <span className="text-[15px] leading-5 font-bold text-[#182339]">GST Number</span>
                <span className="text-[15px] leading-5 text-[#182339]">Add GST to claim tax credit</span>
              </button>
              {useGst && (
                <div className="flex flex-wrap items-center gap-4">
                  <FieldWeb label="GST Number" className="w-[275px]">
                    <input
                      className={`${fieldInputClass} bg-transparent`}
                      placeholder="AXTDF"
                      maxLength={15}
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                    />
                  </FieldWeb>
                  <FieldWeb label="Company Name" className="w-[275px]">
                    <input
                      className={`${fieldInputClass} bg-transparent`}
                      placeholder="Text"
                      maxLength={35}
                      value={gstName}
                      onChange={(e) => setGstName(e.target.value)}
                    />
                  </FieldWeb>
                  <FieldWeb label="GST Address" className="w-[275px]">
                    <input
                      className={`${fieldInputClass} bg-transparent`}
                      placeholder="Text"
                      value={gstAddress}
                      onChange={(e) => setGstAddress(e.target.value)}
                    />
                  </FieldWeb>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="w-[149px] flex flex-col">
              <span className="text-[15px] leading-5 text-black">Total</span>
              <span className="text-[18px] leading-6 font-bold text-[#6A16CB]">{money(breakdown.total)}</span>
            </div>
            <button
              type="button"
              onClick={handleContinue}
              className="w-[225px] h-11 flex items-center justify-center rounded-xl bg-[#7C1AEE] text-[15px] leading-5 font-medium text-white hover:opacity-90"
            >
              Continue
            </button>
            {error && <p className="max-w-[460px] text-[13px] leading-4 text-[#C5001F]">{error}</p>}
          </div>
        </div>
      </div>

      {showRules && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={() => setShowRules(false)}>
          <div
            className="w-full max-w-[813px] h-full bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Fare rules"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#CCD3E0]">
              <div>
                <h3 className="text-[20px] leading-[30px] font-extrabold text-[#182339]">Fare rules</h3>
                <p className="text-[13px] leading-4 text-[#697691]">All charges are per passenger</p>
              </div>
              <button type="button" onClick={() => setShowRules(false)} aria-label="Close" className="w-9 h-9 flex items-center justify-center rounded">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <FareRulesPanelWeb legs={fareRuleLegs} />
            </div>
          </div>
        </div>
      )}
    </BookingPageWeb>
  );
};
