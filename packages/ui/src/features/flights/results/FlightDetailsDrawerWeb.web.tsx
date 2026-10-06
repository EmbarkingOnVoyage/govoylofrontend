import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, Plane, X, XCircle } from 'lucide-react';
import type { FareOption, FlightOffer } from '../useSearchFlightsMobile';
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
import { AirlineLogoWeb } from './AirlineLogoWeb.web';
import { FareRulesPanelWeb } from './FareRulesPanelWeb.web';

type DrawerTab = 'details' | 'rules';

// "Sat, 28 Nov" — the Web Dev popup's date format.
function formatWeekdayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/^(\w+)/, '$1,');
}

// Suppliers sometimes send a bare number of kilos ("5") for baggage.
function baggageText(value: string): string {
  return /^\d+(\.\d+)?$/.test(value.trim()) ? `${value.trim()} kg` : value;
}

const EMPTY_SELECTION: FareSelection = { tier: null, fareId: null };

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

const FareFeature: React.FC<{ ok: boolean; text: string }> = ({ ok, text }) => (
  <li className="flex items-center gap-2 text-xs text-[#182339]">
    {ok ? <CheckCircle2 size={14} className="text-[#15803D]" /> : <XCircle size={14} className="text-[#C8102E]" />}
    {text}
  </li>
);

// The Web Dev "Flight Details | Fare Rule" popup: the itinerary of each leg,
// the fare picker, and the selected fare's rules. One leg = a preview whose
// fare cards act directly; several legs (Onward/Return, Flight 1..N) = tabs,
// one fare per leg, and the footer acts on all of them.
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
  const [selections, setSelections] = useState<FareSelection[]>(() => legs.map((leg) => cheapestFareSelection(leg)));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const isMultiLeg = legs.length > 1;
  const activeOffer = legs[Math.min(activeLegIndex, legs.length - 1)];
  const activeSelection = selections[activeLegIndex] ?? EMPTY_SELECTION;
  const setActiveSelection = (next: FareSelection) =>
    setSelections((prev) => prev.map((s, i) => (i === activeLegIndex ? next : s)));

  const first = activeOffer.segments[0];
  const last = activeOffer.segments[activeOffer.segments.length - 1];
  const allFares = selectableFares(activeOffer);
  const tierSummaries = CABIN_TIER_ORDER.map((tier) => {
    const inTier = allFares.filter((f) => cabinTierForFare(f) === tier);
    const cheapest = inTier.reduce<FareOption | null>((min, f) => (!min || f.totalAmount < min.totalAmount ? f : min), null);
    return { tier, cheapest };
  }).filter((t) => t.cheapest !== null);
  const faresInTier = allFares
    .filter((f) => cabinTierForFare(f) === activeSelection.tier)
    .sort((a, b) => a.totalAmount - b.totalAmount);

  const perLegFares = legs.map((leg, i) => resolveSelectedFare(leg, selections[i] ?? EMPTY_SELECTION));
  const ready = perLegFares.every((f) => f !== undefined);
  const totalPerAdult = perLegFares.reduce((sum, f) => sum + (f?.totalAmount ?? 0), 0);
  const currency = perLegFares[0]?.currencyCode ?? activeOffer.currencyCode;
  const labelFor = (i: number) => legLabels?.[i] ?? `Flight ${i + 1}`;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full max-w-[880px] h-full bg-white flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="Flight details"
      >
        <div className="flex items-center justify-between px-6 border-b border-[#E4E7EC]">
          <div className="flex gap-6">
            {(['details', 'rules'] as DrawerTab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`py-4 text-sm font-medium border-b-2 ${
                  tab === t ? 'border-[#7C1AEE] text-[#7C1AEE]' : 'border-transparent text-[#4C5973]'
                }`}
              >
                {t === 'details' ? 'Flight Details' : 'Fare Rule'}
              </button>
            ))}
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="p-2 text-[#182339] hover:bg-[#F1F3F7] rounded">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {isMultiLeg && (
            <div className="flex gap-3">
              {legs.map((leg, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveLegIndex(i)}
                  className={`text-left px-3 py-2 rounded-lg border min-w-[130px] ${
                    i === activeLegIndex ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-[#D5DAE3]'
                  }`}
                >
                  <div className="text-[11px] font-semibold text-[#7C1AEE] uppercase">{labelFor(i)}</div>
                  <div className="text-sm font-semibold text-[#182339]">
                    {leg.segments[0].origin} → {leg.segments[leg.segments.length - 1].destination}
                  </div>
                  <div className="text-[11px] text-[#697691]">{formatWeekdayDate(leg.segments[0].departureDateTime)}</div>
                </button>
              ))}
            </div>
          )}

          {tab === 'rules' ? (
            <FareRulesPanelWeb
              legs={legs.map((leg, i) => toFareRulesLeg(leg, labelFor(i), perLegFares[i]))}
            />
          ) : (
            <>
              <div>
                <h2 className="text-lg font-semibold text-[#182339]">
                  {cityFor(first.origin)} → {cityFor(last.destination)}
                </h2>
                <p className="text-xs text-[#697691]">
                  {formatWeekdayDate(first.departureDateTime)} · {stopsLabel(activeOffer.segments.length - 1)} ·{' '}
                  {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)} · {cabinLabel}
                </p>
              </div>

              <div className="rounded-xl border border-[#E4E7EC] p-4 max-w-[520px]">
                {activeOffer.segments.map((segment, index) => (
                  <React.Fragment key={`${segment.flightNumber}-${index}`}>
                    <div className="grid grid-cols-[72px_24px_1fr] gap-x-3">
                      <div>
                        <div className="text-sm font-semibold text-[#182339]">{formatTime24(segment.departureDateTime)}</div>
                        <div className="text-[11px] text-[#697691]">{formatWeekdayDate(segment.departureDateTime)}</div>
                      </div>
                      <div className="flex justify-center pt-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#182339]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#182339]">
                          {cityFor(segment.origin)} · {segment.origin}
                        </div>
                        <div className="text-[11px] text-[#697691]">{nameFor(segment.origin)}</div>
                      </div>

                      <div className="text-[11px] text-[#697691] py-3">
                        {formatTotalDuration(segment.departureDateTime, segment.arrivalDateTime)}
                      </div>
                      <div className="flex justify-center">
                        <span className="w-px bg-[#99A6C0]" />
                      </div>
                      <div className="py-3 flex items-center gap-2">
                        <AirlineLogoWeb airlineCode={segment.airlineCode} size={22} />
                        <span className="text-xs text-[#182339]">
                          {segment.airlineName || activeOffer.airlineName} · {segment.airlineCode} {segment.flightNumber}
                        </span>
                      </div>

                      <div>
                        <div className="text-sm font-semibold text-[#182339]">{formatTime24(segment.arrivalDateTime)}</div>
                        <div className="text-[11px] text-[#697691]">{formatWeekdayDate(segment.arrivalDateTime)}</div>
                      </div>
                      <div className="flex justify-center pt-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#182339]" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[#182339]">
                          {cityFor(segment.destination)} · {segment.destination}
                        </div>
                        <div className="text-[11px] text-[#697691]">{nameFor(segment.destination)}</div>
                      </div>
                    </div>
                    {index < activeOffer.segments.length - 1 && (
                      <div className="flex items-center gap-2 my-3 ml-[96px] text-xs text-[#697691]">
                        <Info size={12} />
                        {formatTotalDuration(segment.arrivalDateTime, activeOffer.segments[index + 1].departureDateTime)} layover
                        at {cityFor(segment.destination)}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div>
                <h3 className="text-base font-semibold text-[#182339] mb-1">Select Your Fare</h3>
                <p className="flex items-center gap-2 text-xs text-[#697691] mb-3">
                  <Plane size={12} /> {activeOffer.airlineName} · {cityFor(first.origin)} - {cityFor(last.destination)}
                </p>

                {tierSummaries.length > 1 && (
                  <div className="flex gap-2 mb-3">
                    {tierSummaries.map(({ tier, cheapest }) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setActiveSelection({ tier, fareId: cheapest?.fareId ?? null })}
                        className={`text-left px-3 py-1.5 rounded-lg border ${
                          tier === activeSelection.tier ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-[#D5DAE3]'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#182339]">{CABIN_TIER_LABELS[tier]}</div>
                        <div className="text-[11px] text-[#697691]">
                          From {formatPrice(cheapest!.totalAmount, cheapest!.currencyCode)}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {faresInTier.map((fare) => {
                    const isSelected = fare.fareId === perLegFares[activeLegIndex]?.fareId;
                    return (
                      <div
                        key={fare.fareId}
                        onClick={() => setActiveSelection({ ...activeSelection, fareId: fare.fareId })}
                        className={`w-[220px] shrink-0 rounded-xl border cursor-pointer flex flex-col ${
                          isSelected ? 'border-[#7C1AEE] shadow-[0_0_0_1px_#7C1AEE]' : 'border-[#D5DAE3]'
                        }`}
                      >
                        <div className={`px-3 py-2 rounded-t-xl ${isSelected ? 'bg-[#F5F0FF]' : 'bg-[#F8F9FB]'}`}>
                          <span className="text-sm font-semibold text-[#182339]">{fareDisplayName(fare)}</span>
                          <span className="text-sm text-[#182339]"> | {formatPrice(fare.totalAmount, fare.currencyCode)}</span>
                          <span className="text-[11px] text-[#697691]">/adult</span>
                        </div>
                        <ul className="px-3 py-3 space-y-1.5 flex-1">
                          <FareFeature ok={!!fare.handBaggage} text={fare.handBaggage ? `Cabin bag ${baggageText(fare.handBaggage)}` : 'No cabin bag info'} />
                          <FareFeature
                            ok={/[1-9]/.test(fare.checkInBaggage ?? '')}
                            text={fare.checkInBaggage ? `Check-in ${baggageText(fare.checkInBaggage)}` : 'No check-in baggage'}
                          />
                          <FareFeature ok={fare.refundable} text={fare.refundable ? 'Refundable' : 'Non-refundable'} />
                        </ul>
                        {!isMultiLeg && (
                          <div className="px-3 pb-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onAction([fare]);
                              }}
                              className="w-full py-2 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium hover:opacity-90"
                            >
                              {actionLabel}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {faresInTier.length === 0 && <p className="text-sm text-[#4C5973]">No fares available for this flight.</p>}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E4E7EC]">
          <div>
            <div className="text-lg font-bold text-[#182339]">
              {ready ? `${formatPrice(totalPerAdult, currency)}` : '--'}
              <span className="text-xs font-normal text-[#697691]"> /adult</span>
            </div>
            <div className="text-xs text-[#697691]">
              for {passengerCount} traveller{passengerCount > 1 ? 's' : ''}
            </div>
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={() => onAction(perLegFares)}
            className="px-8 py-2.5 rounded-lg bg-[#7C1AEE] text-white font-medium hover:opacity-90 disabled:opacity-50"
          >
            {actionLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
