import React, { useState } from 'react';
import { Clock, Plane, X } from 'lucide-react';
import type { FareOption, FlightOffer, FlightOfferSegment } from '../useSearchFlightsMobile';
import {
  CABIN_TIER_LABELS,
  CABIN_TIER_ORDER,
  cabinTierForFare,
  cheapestFareSelection,
  fareDisplayName,
  formatPrice,
  formatTime24,
  formatTotalDuration,
  resolveSelectedFare,
  selectableFares,
  stopsLabel,
  type FareSelection,
} from '../logic/flightResults';
import type { FareRulesLeg } from '../logic/fareRules';
import { baggageText } from '../logic/addOns';
import { AirlineLogoWeb } from './AirlineLogoWeb.web';
import { FareRulesPanelWeb } from './FareRulesPanelWeb.web';
import { useEscapeKey } from '../useEscapeKey.web';

type DrawerTab = 'details' | 'rules';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "Sat, 07 Nov" — the popup's subtitle format.
function dayMonth(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : `${WEEKDAYS[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
}

// "Mon, 30.1" — the itinerary card's date format.
function shortDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '' : `${WEEKDAYS[d.getDay()]}, ${d.getDate()}.${d.getMonth() + 1}`;
}

const EMPTY_SELECTION: FareSelection = { tier: null, fareId: null };

// Fare card header gradients and borders, in card order (Web Dev popup).
const CARD_STYLES = [
  { border: '#ADB8CD', header: 'linear-gradient(88.14deg, rgba(224,224,224,0) -49.47%, rgba(160,160,160,0.7) 134.7%)' },
  { border: '#E2C9FF', header: 'linear-gradient(88.6deg, rgba(255,255,255,0.4) -10.92%, rgba(17,75,255,0.4) 101.87%)' },
  { border: '#CCD3E0', header: 'linear-gradient(88.55deg, rgba(255,255,255,0.5) 0.65%, rgba(224,162,255,0.5) 56.78%, rgba(177,20,255,0.5) 101.87%)' },
  { border: '#D4AF37', header: 'linear-gradient(88.62deg, #FFFFFF 4.46%, #D4AF37 101.87%)' },
];

const FEATURE_COLORS = { included: '#007F20', pay: '#CE6400', na: '#C5001F' } as const;

function toFareRulesLeg(offer: FlightOffer, label: string, fare: FareOption | undefined): FareRulesLeg {
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];
  return {
    offerId: offer.offerId,
    label,
    origin: first.origin,
    destination: last.destination,
    airlineName: offer.airlineName,
    airlineCode: offer.airlineCode,
    flightNumbers: offer.segments.map((s) => `${s.airlineCode} ${s.flightNumber}`),
    departureDateTime: first.departureDateTime,
    segments: offer.segments,
    fareId: fare?.fareId ?? offer.selectedFareId ?? null,
  };
}

const Feature: React.FC<{ tone: keyof typeof FEATURE_COLORS; text: string }> = ({ tone, text }) => (
  <li className="flex items-center gap-1">
    <span className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: FEATURE_COLORS[tone] }}>
      <span className="w-[7px] h-[7px] rounded-full bg-white/90" />
    </span>
    <span className="py-px text-[13px] leading-4 text-[#3E4B64]">{text}</span>
  </li>
);

// Itinerary endpoint row: time/date | dot | city/airport.
const EndpointRow: React.FC<{ iso: string; code: string; cityFor: (c: string) => string; nameFor: (c: string) => string; position: 'start' | 'end' }> = ({
  iso,
  code,
  cityFor,
  nameFor,
  position,
}) => (
  <div className="flex items-start gap-1 px-4 h-9">
    <div className="w-16 flex flex-col items-end">
      <span className="text-[15px] leading-5 font-medium text-[#182339]">{formatTime24(iso)}</span>
      <span className="text-[13px] leading-4 text-[#3E4B64] whitespace-nowrap">{shortDate(iso)}</span>
    </div>
    <div className={`w-6 h-9 flex flex-col items-center ${position === 'start' ? 'pt-3.5' : 'pb-3.5 justify-end'}`}>
      {position === 'end' && <span className="flex-1 w-0.5 bg-[#C2CADA]" />}
      <span className="w-2 h-2 rounded-full bg-[#3E4B64]" />
      {position === 'start' && <span className="flex-1 w-0.5 bg-[#C2CADA]" />}
    </div>
    <div className="min-w-0">
      <div className="text-[15px] leading-5 font-medium text-[#182339]">
        {cityFor(code)} · {code}
      </div>
      <div className="text-[13px] leading-4 text-[#3E4B64] truncate">{nameFor(code)}</div>
    </div>
  </div>
);

const SegmentCard: React.FC<{ segment: FlightOfferSegment; airlineName: string; cityFor: (c: string) => string; nameFor: (c: string) => string }> = ({
  segment,
  airlineName,
  cityFor,
  nameFor,
}) => (
  <div className="w-[343px] py-3 bg-white rounded shadow-[0px_0px_1px_rgba(41,47,55,0.3),0px_0px_2px_rgba(79,94,113,0.12),0px_2px_6px_rgba(79,94,113,0.08)]">
    <EndpointRow iso={segment.departureDateTime} code={segment.origin} cityFor={cityFor} nameFor={nameFor} position="start" />
    <div className="flex items-center gap-1 h-11 pl-4 pr-2">
      <div className="w-16 text-right text-[12px] leading-4 font-medium text-[#182339]">
        {formatTotalDuration(segment.departureDateTime, segment.arrivalDateTime)}
      </div>
      <div className="relative w-6 h-11 flex justify-center">
        <span className="w-0.5 h-full bg-[#C2CADA]" />
        <span className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white flex items-center justify-center">
          <Plane size={14} className="text-[#182339] rotate-90" />
        </span>
      </div>
      <span className="flex items-center gap-1 pr-2 h-6 rounded-xl bg-[#ECEEF3]">
        <AirlineLogoWeb airlineCode={segment.airlineCode} size={24} className="rounded-full" />
        <span className="text-[12px] leading-4 font-medium text-[#182339] whitespace-nowrap">
          {segment.airlineName || airlineName} · {segment.airlineCode} {segment.flightNumber}
        </span>
      </span>
    </div>
    <EndpointRow iso={segment.arrivalDateTime} code={segment.destination} cityFor={cityFor} nameFor={nameFor} position="end" />
  </div>
);

// Web Dev "FlightDetailsDrawer": a 1044px right-hand panel with "Flight
// Details | Fare Rule" tabs — the itinerary, fare categories and fare cards
// (each with its own Book Now) — and the selected fare's rules. Several legs
// (Onward/Return, Flight 1..N) get leg cards and a footer action instead.
export const FlightDetailsDrawerWeb: React.FC<{
  legs: FlightOffer[];
  legLabels?: string[];
  // The leg tab to open on (the leg just picked, in a step-by-step flow).
  initialLegIndex?: number;
  passengerCount: number;
  cabinLabel: string;
  cityFor: (code: string) => string;
  nameFor: (code: string) => string;
  actionLabel: string;
  onAction: (selectedFares: (FareOption | undefined)[]) => void;
  onClose: () => void;
}> = ({ legs, legLabels, initialLegIndex = 0, passengerCount, cabinLabel, cityFor, nameFor, actionLabel, onAction, onClose }) => {
  const [tab, setTab] = useState<DrawerTab>('details');
  const [activeLegIndex, setActiveLegIndex] = useState(initialLegIndex);
  const [showItinerary, setShowItinerary] = useState(true);
  const [selections, setSelections] = useState<FareSelection[]>(() => legs.map((leg) => cheapestFareSelection(leg)));

  useEscapeKey(onClose);

  const isMultiLeg = legs.length > 1;
  const activeOffer = legs[Math.min(activeLegIndex, legs.length - 1)];
  const activeSelection = selections[activeLegIndex] ?? EMPTY_SELECTION;
  const setActiveSelection = (next: FareSelection) => setSelections((prev) => prev.map((s, i) => (i === activeLegIndex ? next : s)));

  const first = activeOffer.segments[0];
  const last = activeOffer.segments[activeOffer.segments.length - 1];
  const allFares = selectableFares(activeOffer);
  const tierSummaries = CABIN_TIER_ORDER.map((tier) => {
    const inTier = allFares.filter((f) => cabinTierForFare(f) === tier);
    const cheapest = inTier.reduce<FareOption | null>((min, f) => (!min || f.totalAmount < min.totalAmount ? f : min), null);
    return { tier, cheapest };
  }).filter((t) => t.cheapest !== null);
  const faresInTier = allFares.filter((f) => cabinTierForFare(f) === activeSelection.tier).sort((a, b) => a.totalAmount - b.totalAmount);

  const perLegFares = legs.map((leg, i) => resolveSelectedFare(leg, selections[i] ?? EMPTY_SELECTION));
  const ready = perLegFares.every((f) => f !== undefined);
  const totalPerAdult = perLegFares.reduce((sum, f) => sum + (f?.totalAmount ?? 0), 0);
  const currency = perLegFares[0]?.currencyCode ?? activeOffer.currencyCode;
  const labelFor = (i: number) => legLabels?.[i] ?? `Flight ${i + 1}`;
  const subtitle = `${dayMonth(first.departureDateTime)} · ${stopsLabel(activeOffer.segments.length - 1)} · ${formatTotalDuration(
    first.departureDateTime,
    last.arrivalDateTime
  )} · ${cabinLabel}`;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[rgba(24,35,57,0.4)]" onClick={onClose}>
      <div
        className="w-full max-w-[1044px] h-full bg-white flex flex-col shadow-[-4px_0px_32px_rgba(24,35,57,0.14)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Flight details"
      >
        <div className="h-11 shrink-0 flex items-start justify-between px-4 border-b border-[#CCD3E0]">
          <div className="flex items-end">
            {(['details', 'rules'] as DrawerTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`h-11 flex items-center justify-center pl-4 pr-3 rounded-t-lg bg-white text-[16px] leading-6 font-medium ${
                  tab === t ? 'border-b-2 border-[#7C1AEE] text-[#182339]' : 'border-b border-[#CCD3E0] text-[#3E4B64]'
                }`}
              >
                {t === 'details' ? 'Flight Details' : 'Fare Rule'}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="mt-1 w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F8F9FB]">
            <X size={18} color="#182339" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="px-5 pt-4 pb-3 border-b border-[#ECEEF3]">
            {tab === 'details' && (
              <h2 className="text-[20px] leading-[30px] font-extrabold text-[#182339]">
                {cityFor(first.origin)} → {cityFor(last.destination)}
              </h2>
            )}
            <p className="pt-1 text-[13px] leading-5 text-[#697691]">{subtitle}</p>
          </div>

          {isMultiLeg && tab === 'details' && (
            <div className="flex gap-2 px-5 pt-4">
              {legs.map((leg, i) => {
                const isActive = i === activeLegIndex;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveLegIndex(i)}
                    className={`w-[167px] text-left px-3.5 py-3 rounded-xl border-2 bg-white ${isActive ? 'border-[#7C1AEE]' : 'border-[#98A5BF]'}`}
                  >
                    <div className={`text-[11px] leading-4 font-bold uppercase ${isActive ? 'text-[#7C1AEE]' : 'text-[#697691]'}`}>{labelFor(i)}</div>
                    <div className="pt-1 text-[18px] leading-6 font-bold text-[#182339]">
                      {leg.segments[0].origin} → {leg.segments[leg.segments.length - 1].destination}
                    </div>
                    <div className="pt-0.5 text-[13px] leading-4 text-[#697691]">{dayMonth(leg.segments[0].departureDateTime)}</div>
                  </button>
                );
              })}
            </div>
          )}

          {tab === 'rules' ? (
            <div className="px-4 pt-[18px] pb-6">
              <FareRulesPanelWeb legs={legs.map((leg, i) => toFareRulesLeg(leg, labelFor(i), perLegFares[i]))} />
            </div>
          ) : (
            <>
              <div className="px-5 py-[18px] border-b border-[#ECEEF3] flex flex-col items-start">
                {showItinerary &&
                  activeOffer.segments.map((segment, index) => (
                    <React.Fragment key={`${segment.flightNumber}-${index}`}>
                      <SegmentCard segment={segment} airlineName={activeOffer.airlineName} cityFor={cityFor} nameFor={nameFor} />
                      {index < activeOffer.segments.length - 1 && (
                        <div className="flex items-start gap-2 pl-[84px] py-3">
                          <span className="w-6 h-6 rounded-full bg-[#ECEEF3] flex items-center justify-center">
                            <Clock size={16} className="text-[#3E4B64]" />
                          </span>
                          <span className="pt-1 text-[13px] leading-4 text-[#3E4B64]">
                            {formatTotalDuration(segment.arrivalDateTime, activeOffer.segments[index + 1].departureDateTime)} layover at{' '}
                            {cityFor(segment.destination)}
                          </span>
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                <button
                  type="button"
                  onClick={() => setShowItinerary((v) => !v)}
                  className="w-[331px] mt-2 p-2 rounded-lg text-[15px] leading-5 font-medium text-[#7C1AEE]"
                >
                  {showItinerary ? 'Hide Flight Details' : 'View Flight Details'}
                </button>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <div className="px-5 flex flex-col gap-2">
                  <span className="text-[15px] leading-5 font-medium text-[#3E4B64]">Select Your Fare</span>
                  <span className="flex items-center gap-2 text-[13px] leading-4 text-[#697691]">
                    <AirlineLogoWeb airlineCode={activeOffer.airlineCode} size={16} />
                    {activeOffer.airlineName} · {cityFor(first.origin)} - {cityFor(last.destination)}
                  </span>
                </div>

                {tierSummaries.length > 0 && (
                  <div className="px-5 flex items-center gap-2">
                    {tierSummaries.map(({ tier, cheapest }) => {
                      const isActive = tier === activeSelection.tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setActiveSelection({ tier, fareId: cheapest?.fareId ?? null })}
                          className={`h-10 flex flex-col items-start justify-center gap-0.5 px-1 py-0.5 rounded ${
                            isActive ? 'bg-[#F3E8FF]' : 'bg-white border border-[#CCD3E0]'
                          }`}
                        >
                          <span className={`text-[13px] leading-4 font-bold ${isActive ? 'text-[#7C1AEE]' : 'text-[#3E4B64]'}`}>{CABIN_TIER_LABELS[tier]}</span>
                          <span className="text-[13px] leading-4 text-[#697691] whitespace-nowrap">
                            From {formatPrice(cheapest!.totalAmount, cheapest!.currencyCode)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-start gap-[11px] px-[18px] py-3 overflow-x-auto">
                  {faresInTier.map((fare, index) => {
                    const style = CARD_STYLES[index % CARD_STYLES.length];
                    const isSelected = fare.fareId === perLegFares[activeLegIndex]?.fareId;
                    const hasCheckIn = /[1-9]/.test(fare.checkInBaggage ?? '');
                    return (
                      <div
                        key={fare.fareId}
                        onClick={() => setActiveSelection({ ...activeSelection, fareId: fare.fareId })}
                        className="w-[254px] shrink-0 rounded border cursor-pointer flex flex-col overflow-hidden"
                        style={{ borderColor: isSelected ? '#7C1AEE' : style.border }}
                      >
                        <div className="h-12 flex flex-col justify-center px-2 py-1 rounded" style={{ background: style.header }}>
                          <span className="py-0.5 text-[15px] leading-5 font-medium text-[#182339] whitespace-nowrap">
                            {fareDisplayName(fare)} | {formatPrice(fare.totalAmount, fare.currencyCode)}/adult
                          </span>
                          <span className="text-[13px] leading-4 text-[#3E4B64]">
                            {fare.refundable ? 'Flexible, refundable fare' : 'Fly smart, pay less'}
                          </span>
                        </div>
                        <div className="flex flex-col gap-4 p-4 bg-white rounded-b">
                          <ul className="flex flex-col gap-2">
                            <Feature
                              tone={fare.handBaggage ? 'included' : 'na'}
                              text={fare.handBaggage ? `Cabin bag: ${baggageText(fare.handBaggage)}` : 'Cabin bag: not stated'}
                            />
                            <Feature tone={fare.refundable ? 'included' : 'na'} text={fare.refundable ? 'Cancellation: refundable' : 'Cancellation: non-refundable'} />
                            <Feature tone="pay" text="Date change: as per fare rules" />
                            <Feature
                              tone={hasCheckIn ? 'included' : 'na'}
                              text={hasCheckIn ? `Check-in Baggage: ${baggageText(fare.checkInBaggage!)} / Adult` : 'No check-in baggage'}
                            />
                          </ul>
                          {!isMultiLeg && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAction([fare]);
                              }}
                              className="h-8 w-full flex items-center justify-center p-2 rounded-lg bg-[#7C1AEE] text-[13px] leading-4 font-medium text-white"
                            >
                              {actionLabel}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {faresInTier.length === 0 && <p className="text-[13px] text-[#3E4B64]">No fares available for this flight.</p>}
                </div>
              </div>
            </>
          )}
        </div>

        {isMultiLeg && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-[#ECEEF3]">
            <div>
              <div className="text-[18px] leading-6 font-bold text-[#182339]">
                {ready ? formatPrice(totalPerAdult, currency) : '--'}
                <span className="text-[13px] font-normal text-[#697691]"> /adult</span>
              </div>
              <div className="text-[13px] leading-4 text-[#697691]">
                for {passengerCount} traveller{passengerCount > 1 ? 's' : ''}
              </div>
            </div>
            <button
              type="button"
              disabled={!ready}
              onClick={() => onAction(perLegFares)}
              className="h-11 px-8 rounded-xl bg-[#7C1AEE] text-white text-[15px] leading-5 font-medium disabled:opacity-50"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
