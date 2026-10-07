import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Loader2, Luggage, X } from 'lucide-react';
import {
  SSR_STATUS_AVAILABLE,
  SSR_TYPE_BAGGAGE,
  SSR_TYPE_COMPLIMENTARY_MEALS,
  SSR_TYPE_MEALS,
  useFlightAncillariesMobile,
  useSeatMapMobile,
  type AncillaryOption,
  type SeatMapSegment,
} from '../useFlightAncillariesMobile';
import { baggageText, buildSeatSections, describeBaggage, layoutSeatRow, mealKind, seatLabelParts, uniqueOptions } from '../logic/addOns';
import type { AddOnCategory, AddOnSelection } from '../logic/booking';
import { useEscapeKey } from '../useEscapeKey.web';
import { formatTime24 } from '../logic/flightResults';
import { AirlineLogoWeb } from '../results/AirlineLogoWeb.web';
import { FieldWeb, fieldInputClass } from './BookingLayoutWeb.web';

export interface AddOnTraveller {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  // 'Adult' | 'Child' | 'Infant' — the type the traveller flies as.
  travelerType: string;
}

export interface AddOnLegRoute {
  offerId: string;
  fareId: string | null;
  label: string;
  origin: string;
  destination: string;
  handBaggage: string | null;
  checkInBaggage: string | null;
  // For the flight card at the top of each popup.
  airlineCode?: string;
  airlineName?: string;
  flightNumbers?: string[];
  departureDateTime?: string;
}

function rupees(amount: number, currencyCode: string): string {
  return amount > 0
    ? `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : 'Free';
}

// Popup shell from the Web Dev add-on popups: a right drawer with a single
// title tab and close button, the flight card, the content, then Total + Save.
const PanelShell: React.FC<{
  title: string;
  width: number;
  route: AddOnLegRoute;
  total: number;
  currencyCode: string;
  onSave: () => void;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, width, route, total, currencyCode, onSave, onClose, children }) => {
  useEscapeKey(onClose);
  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="w-full h-full bg-white flex flex-col shadow-[-4px_0px_32px_rgba(24,35,57,0.14)]"
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label={title}
      >
        <div className="flex items-start justify-between px-4 border-b border-[#CCD3E0]">
          <div className="h-11 flex items-center pl-4 pr-3 text-[16px] leading-6 font-medium text-[#182339]">{title}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="mt-1 w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#ECEEF3]">
            <X size={18} className="text-[#3E4B64]" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
          <FlightCard route={route} />
          {children}
        </div>
        <div className="flex items-center justify-between gap-4 px-3 py-4">
          <div className="flex flex-col">
            <span className="text-[16px] leading-5 text-[#182339]">Total</span>
            <span className="text-[20px] leading-7 font-bold text-[#6A16CB]">{total > 0 ? rupees(total, currencyCode) : '₹0'}</span>
          </div>
          <button
            type="button"
            onClick={onSave}
            className="w-[333px] max-w-[60%] h-11 rounded-[10px] bg-[#7C1AEE] text-[16px] leading-5 font-medium text-white hover:opacity-90"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// "DEL → BOM · IndiGo · 6E 882 · 23:15 Wed, 23 Sep" card at the top of each popup.
const FlightCard: React.FC<{ route: AddOnLegRoute }> = ({ route }) => {
  const when = route.departureDateTime ? new Date(route.departureDateTime) : null;
  const valid = !!when && !isNaN(when.getTime());
  return (
    <div className="w-fit min-w-[340px] flex items-center gap-3 px-4 py-3.5 bg-white border border-[#98A5BF] rounded-xl">
      {route.airlineCode && (
        <span className="w-11 h-11 shrink-0 rounded-md overflow-hidden flex items-center justify-center">
          <AirlineLogoWeb airlineCode={route.airlineCode} size={44} />
        </span>
      )}
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="text-[22px] leading-7 font-bold text-[#182339] whitespace-nowrap">
          {route.origin} → {route.destination}
        </span>
        {route.airlineName && (
          <span className="text-[14px] leading-5 text-[#697691] whitespace-nowrap">
            {route.airlineName}
            {route.flightNumbers?.length ? ` · ${route.flightNumbers.join(', ')}` : ''}
          </span>
        )}
      </div>
      {valid && when && (
        <div className="flex flex-col items-end pl-4">
          <span className="text-[20px] leading-7 font-bold text-[#182339]">{formatTime24(route.departureDateTime as string)}</span>
          <span className="text-[14px] leading-5 text-[#697691] whitespace-nowrap">
            {when.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/^(\w+)/, '$1,')}
          </span>
        </div>
      )}
    </div>
  );
};

// "Baggage selection" option: 96x88, 1px border, 4px radius.
const OptionCard: React.FC<{ selected: boolean; none?: boolean; onClick: () => void; children: React.ReactNode; className?: string }> = ({
  selected,
  none,
  onClick,
  children,
  className = 'w-24 h-[88px]',
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={selected}
    className={`${className} shrink-0 flex flex-col justify-between p-2 rounded border text-left ${
      none
        ? selected
          ? 'bg-[#ECEEF3] border-[#697691]'
          : 'bg-white border-[#697691]'
        : selected
          ? 'bg-white border-[#7C1AEE] ring-1 ring-[#7C1AEE]'
          : 'bg-white border-[#697691] hover:border-[#7C1AEE]'
    }`}
  >
    {children}
  </button>
);

const PanelStatus: React.FC<{ isLoading: boolean; error: boolean; empty: boolean; emptyText: string }> = ({
  isLoading,
  error,
  empty,
  emptyText,
}) =>
  isLoading ? (
    <div className="flex justify-center py-10">
      <Loader2 className="animate-spin text-[#7C1AEE]" />
    </div>
  ) : error ? (
    <p className="text-[13px] leading-4 text-[#3E4B64]">Couldn't load the options right now. Please try again.</p>
  ) : empty ? (
    <p className="text-[13px] leading-4 text-[#3E4B64]">{emptyText}</p>
  ) : null;

type Picks = Record<string, AncillaryOption>;

const samePick = (a: AncillaryOption | undefined, b: AncillaryOption) =>
  !!a && (a.ssrKey === b.ssrKey || (a.ssrTypeDesc === b.ssrTypeDesc && a.totalAmount === b.totalAmount));

const TravellerDivider = () => <div className="w-[334px] h-px bg-[#CCD3E0]" />;

// Baggage or meals: one option (or none) per traveller.
const PerTravellerPanel: React.FC<{
  kind: 'baggage' | 'meal';
  route: AddOnLegRoute;
  options: AncillaryOption[];
  isLoading: boolean;
  error: boolean;
  travellers: AddOnTraveller[];
  initial: Picks;
  currencyCode: string;
  onSave: (picks: Picks) => void;
  onClose: () => void;
}> = ({ kind, route, options, isLoading, error, travellers, initial, currencyCode, onSave, onClose }) => {
  const [picks, setPicks] = useState<Picks>(initial);
  const cards = useMemo(() => uniqueOptions(options), [options]);
  const total = Object.values(picks).reduce((sum, o) => sum + o.totalAmount, 0);
  const set = (travellerId: string, option: AncillaryOption | null) =>
    setPicks((prev) => {
      const next = { ...prev };
      if (option) next[travellerId] = option;
      else delete next[travellerId];
      return next;
    });

  // Meals: the Veg / Non-veg chips pick the cheapest of each kind; every
  // meal is also in the "Other meal" list.
  const cheapest = (wanted: 'veg' | 'nonveg') =>
    cards.filter((o) => mealKind(o) === wanted).sort((a, b) => a.totalAmount - b.totalAmount)[0];
  const vegMeal = kind === 'meal' ? cheapest('veg') : undefined;
  const nonVegMeal = kind === 'meal' ? cheapest('nonveg') : undefined;
  const complimentary = cards.some((o) => o.ssrType === SSR_TYPE_COMPLIMENTARY_MEALS);

  const ready = !isLoading && !error && cards.length > 0;

  return (
    <PanelShell
      title={kind === 'baggage' ? 'Checked baggage' : 'Meal'}
      width={kind === 'baggage' ? 682 : 521}
      route={route}
      total={total}
      currencyCode={currencyCode}
      onSave={() => onSave(picks)}
      onClose={onClose}
    >
      <PanelStatus
        isLoading={isLoading}
        error={error}
        empty={cards.length === 0}
        emptyText={kind === 'baggage' ? 'No extra baggage is sold for this flight.' : 'No meals are offered on this flight.'}
      />
      {ready &&
        travellers.map((t, index) => (
          <React.Fragment key={t.id}>
            {index > 0 && <TravellerDivider />}
            {kind === 'baggage' ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col">
                  <span className="text-[15px] leading-5 font-bold text-[#3E4B64]">
                    {t.firstName} {t.lastName}
                  </span>
                  <span className="text-[13px] leading-4 text-[#697691]">
                    Included: {route.checkInBaggage ? `1 X ${baggageText(route.checkInBaggage).replace(' ', '')}` : 'as per airline'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 px-1">
                  <OptionCard none selected={!picks[t.id]} onClick={() => set(t.id, null)}>
                    <span className="my-auto text-[13px] leading-4 font-bold text-[#3E4B64]">
                      None
                      <br />
                      Added
                    </span>
                  </OptionCard>
                  {cards.map((option) => {
                    const { pieces, weight } = describeBaggage(option);
                    return (
                      <OptionCard key={option.ssrKey} selected={samePick(picks[t.id], option)} onClick={() => set(t.id, option)}>
                        <span className="flex flex-col min-w-0">
                          {pieces ? (
                            <span className="flex items-center gap-1 text-[16px] leading-6 font-medium text-black">
                              <Luggage size={16} /> x{pieces}
                            </span>
                          ) : (
                            <span className="text-[13px] leading-4 font-bold text-[#3E4B64]">Extra weight</span>
                          )}
                          <span className="text-[15px] leading-5 font-medium text-black truncate">{weight}</span>
                        </span>
                        <span className="text-[16px] leading-[22px] font-bold text-[#6A16CB]">{rupees(option.totalAmount, currencyCode)}</span>
                      </OptionCard>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <span className="text-[15px] leading-5 font-bold text-[#3E4B64]">
                  {t.firstName} {t.lastName}
                  {complimentary && <span className="text-[#007F20]"> - Included</span>}
                </span>
                <div className="flex items-stretch gap-4">
                  <OptionCard none className="w-[83px] h-[68px]" selected={!picks[t.id]} onClick={() => set(t.id, null)}>
                    <span className="my-auto text-[15px] leading-5 font-bold text-black">
                      None
                      <br />
                      Added
                    </span>
                  </OptionCard>
                  {[
                    { label: 'Veg', option: vegMeal, width: 'w-[63px]' },
                    { label: 'Non-veg', option: nonVegMeal, width: 'w-[102px]' },
                  ].map(({ label, option, width }) =>
                    option ? (
                      <OptionCard
                        key={label}
                        className={`${width} h-[68px] items-center`}
                        selected={samePick(picks[t.id], option)}
                        onClick={() => set(t.id, option)}
                      >
                        <span className="my-auto flex flex-col items-center">
                          <span className="text-[15px] leading-5 font-bold text-black">{label}</span>
                          {option.totalAmount > 0 && (
                            <span className="text-[12px] leading-4 font-bold text-[#6A16CB]">{rupees(option.totalAmount, currencyCode)}</span>
                          )}
                        </span>
                      </OptionCard>
                    ) : null
                  )}
                </div>
                <FieldWeb label="Other meal" className="w-[335px]">
                  <select
                    className={fieldInputClass}
                    value={picks[t.id] ? cards.find((o) => samePick(picks[t.id], o))?.ssrKey ?? '' : ''}
                    onChange={(e) => set(t.id, cards.find((o) => o.ssrKey === e.target.value) ?? null)}
                  >
                    <option value="">Select</option>
                    {cards.map((o) => (
                      <option key={o.ssrKey} value={o.ssrKey}>
                        {o.ssrTypeDesc} · {rupees(o.totalAmount, currencyCode)}
                      </option>
                    ))}
                  </select>
                </FieldWeb>
              </div>
            )}
          </React.Fragment>
        ))}
    </PanelShell>
  );
};

export interface SeatPick {
  segmentIndex: number;
  travelerId: string;
  seat: AncillaryOption;
}

// 30px seat chips: available (purple), extra legroom (blue, starred),
// unavailable (grey cross), selected (solid purple).
const SEAT_BASE = 'relative w-[30px] h-[30px] shrink-0 rounded-md border flex items-center justify-center text-[14px] leading-5';
const SEAT_AVAILABLE = 'bg-[#F3E8FF] border-[#C9A8F5] text-[#7C1AEE]';
const SEAT_LEGROOM = 'bg-[#E8EEFF] border-[#9DB5FF] text-[#114BFF]';
const SEAT_UNAVAILABLE = 'bg-[#ECEEF3] border-[#CCD3E0] text-[#98A5BF]';
const SEAT_SELECTED = 'bg-[#7C1AEE] border-[#7C1AEE] text-white font-bold';

const LegroomStar = () => <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[12px] leading-3 text-[#114BFF]">*</span>;

const SeatPanel: React.FC<{
  route: AddOnLegRoute;
  segments: SeatMapSegment[];
  isLoading: boolean;
  error: boolean;
  travellers: AddOnTraveller[];
  initial: SeatPick[];
  currencyCode: string;
  onSave: (picks: SeatPick[]) => void;
  onClose: () => void;
}> = ({ route, segments, isLoading, error, travellers, initial, currencyCode, onSave, onClose }) => {
  const key = (segmentIndex: number, travellerId: string) => `${segmentIndex}:${travellerId}`;
  const [segmentIndex, setSegmentIndex] = useState(0);
  const [activeId, setActiveId] = useState(travellers[0]?.id ?? '');
  const [picks, setPicks] = useState<Record<string, AncillaryOption>>(() =>
    Object.fromEntries(initial.map((p) => [key(p.segmentIndex, p.travelerId), p.seat]))
  );

  const segment = segments[segmentIndex];
  const sections = useMemo(() => buildSeatSections(segment, currencyCode), [segment, currencyCode]);
  const holderBySeat = new Map<string, string>();
  travellers.forEach((t) => {
    const seat = picks[key(segmentIndex, t.id)];
    if (seat) holderBySeat.set(seat.ssrKey, t.id);
  });
  const total = Object.values(picks).reduce((sum, seat) => sum + seat.totalAmount, 0);

  const pressSeat = (seat: AncillaryOption) => {
    const holder = holderBySeat.get(seat.ssrKey);
    if (holder && holder !== activeId) return setActiveId(holder);
    const next = { ...picks };
    if (holder === activeId) delete next[key(segmentIndex, activeId)];
    else next[key(segmentIndex, activeId)] = seat;
    setPicks(next);
    if (holder !== activeId) {
      const start = travellers.findIndex((t) => t.id === activeId);
      const after = [...travellers.slice(start + 1), ...travellers.slice(0, start)].find((t) => !next[key(segmentIndex, t.id)]);
      if (after) setActiveId(after.id);
    }
  };

  return (
    <PanelShell
      title="Seat"
      width={521}
      route={segment ? { ...route, origin: segment.origin ?? route.origin, destination: segment.destination ?? route.destination } : route}
      total={total}
      currencyCode={currencyCode}
      onSave={() =>
        onSave(
          Object.entries(picks).map(([k, seat]) => {
            const [seg, ...rest] = k.split(':');
            return { segmentIndex: Number(seg), travelerId: rest.join(':'), seat };
          })
        )
      }
      onClose={onClose}
    >
      <PanelStatus isLoading={isLoading} error={error} empty={segments.length === 0} emptyText="Seat selection isn't available for this flight." />
      {!isLoading && !error && segment && (
        <>
          {segments.length > 1 && (
            <div className="flex gap-2">
              {segments.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSegmentIndex(i)}
                  className={`h-8 px-3 rounded border text-[13px] leading-4 font-medium ${
                    i === segmentIndex ? 'bg-[#F3E8FF] border-[#7C1AEE] text-[#7C1AEE]' : 'bg-white border-[#ADB8CD] text-[#182339]'
                  }`}
                >
                  {s.origin} → {s.destination}
                </button>
              ))}
            </div>
          )}
          <div className="flex overflow-x-auto border-b border-[#CCD3E0]">
            {travellers.map((t) => {
              const seat = picks[key(segmentIndex, t.id)];
              const active = t.id === activeId;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={`shrink-0 min-w-[80px] flex flex-col items-start px-4 pt-1 pb-1.5 border-b-2 ${active ? 'border-[#7C1AEE]' : 'border-transparent'}`}
                >
                  <span className={`text-[15px] leading-5 font-medium ${active ? 'text-[#7C1AEE]' : 'text-[#182339]'}`}>{t.firstName}</span>
                  {seat ? (
                    <span className="text-[12px] leading-4 font-bold text-[#114BFF]">{seat.ssrTypeDesc}</span>
                  ) : (
                    <span className="text-[12px] leading-4 text-[#697691]">Random</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-1 py-1 rounded bg-[#FFF3E8] text-[15px] leading-5 text-[#182339]">
            <span className="flex items-center gap-2">
              <span className={`${SEAT_BASE} ${SEAT_AVAILABLE}`}>A</span>Available
            </span>
            <span className="flex items-center gap-2">
              <span className={`${SEAT_BASE} ${SEAT_LEGROOM}`}>
                A<LegroomStar />
              </span>
              Extra legroom
            </span>
            <span className="flex items-center gap-2">
              <span className={`${SEAT_BASE} ${SEAT_UNAVAILABLE}`}>
                <X size={14} />
              </span>
              Unavailable
            </span>
            <span className="flex items-center gap-2">
              <span className={`${SEAT_BASE} ${SEAT_SELECTED}`}>A</span>selected
            </span>
          </div>
          <div className="mx-auto w-fit flex flex-col gap-4 px-3 py-2 border-x-2 border-[#ADB8CD]">
            {sections.map((section, si) => (
              <div key={si} className="flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[13px] leading-4 text-[#3E4B64] whitespace-nowrap">
                  <span className="flex-1 h-px bg-[#CCD3E0]" />
                  {section.heading}
                  <span className="flex-1 h-px bg-[#CCD3E0]" />
                </div>
                <div className="flex flex-col gap-3">
                  {section.rows.map((row, ri) => (
                    <div key={ri} className="flex items-center gap-[15px]">
                      {layoutSeatRow(row.seats).map((cell, ci) => {
                        if (cell.kind === 'rowNumber')
                          return (
                            <span key={ci} className="w-[30px] text-center text-[13px] leading-4 text-[#182339]">
                              {row.rowNumber}
                            </span>
                          );
                        if (cell.kind === 'gap') return <span key={ci} className="w-[30px]" />;
                        const { seat } = cell;
                        const holder = holderBySeat.get(seat.ssrKey);
                        const available = seat.ssrStatus === SSR_STATUS_AVAILABLE;
                        if (!available && !holder) {
                          return (
                            <span key={ci} className={`${SEAT_BASE} ${SEAT_UNAVAILABLE}`} title="Unavailable">
                              <X size={14} />
                            </span>
                          );
                        }
                        const mine = holder === activeId;
                        const taken = !!holder && !mine;
                        return (
                          <button
                            key={ci}
                            type="button"
                            title={`${seat.ssrTypeDesc} · ${rupees(seat.totalAmount, currencyCode)}`}
                            onClick={() => pressSeat(seat)}
                            className={`${SEAT_BASE} ${
                              mine
                                ? SEAT_SELECTED
                                : taken
                                  ? 'bg-[#B794F4] border-[#B794F4] text-white font-bold'
                                  : seat.isExtraLegroom
                                    ? SEAT_LEGROOM
                                    : SEAT_AVAILABLE
                            }`}
                          >
                            {taken ? travellers.find((t) => t.id === holder)?.firstName.charAt(0).toUpperCase() : seatLabelParts(seat).letter}
                            {seat.isExtraLegroom && !mine && !taken && <LegroomStar />}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </PanelShell>
  );
};

// Web Dev "Whats included": per leg, what the fare includes plus paid
// baggage, seats and meals. Same selection model as the mobile section;
// picks are reported up as AddOnSelection[] for the hold request.
export const AddOnsSectionWeb: React.FC<{
  legRoutes: AddOnLegRoute[];
  travellers: AddOnTraveller[];
  currencyCode: string;
  selections: AddOnSelection[];
  onChange: (selections: AddOnSelection[]) => void;
}> = ({ legRoutes, travellers, currencyCode, selections, onChange }) => {
  const [activeLeg, setActiveLeg] = useState(0);
  const [open, setOpen] = useState<AddOnCategory | null>(null);
  const route = legRoutes[activeLeg];

  const offerIds = legRoutes.map((r) => r.offerId);
  const fareIds = legRoutes.map((r) => r.fareId ?? '');
  const ancillaries = useFlightAncillariesMobile(route?.offerId, offerIds, fareIds);
  const seatMap = useSeatMapMobile(route?.offerId, offerIds, fareIds);

  // Seat prices need passenger details, so the map is fetched per leg and
  // traveller list (a POST, like mobile).
  const travellerKey = travellers.map((t) => t.id).join(',');
  useEffect(() => {
    if (!route?.offerId || travellers.length === 0) return;
    seatMap.mutate(
      travellers.map((t) => ({
        title: t.gender === 'Female' ? 'Ms' : 'Mr',
        firstName: t.firstName,
        lastName: t.lastName,
        gender: t.gender === 'Female' ? 'Female' : 'Male',
        paxType: t.travelerType === 'Child' || t.travelerType === 'Infant' ? t.travelerType : 'Adult',
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route?.offerId, travellerKey]);

  // Picks for travellers no longer on the booking are dropped.
  useEffect(() => {
    const ids = new Set(travellers.map((t) => t.id));
    if (selections.some((s) => !ids.has(s.travelerId))) onChange(selections.filter((s) => ids.has(s.travelerId)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [travellerKey]);

  const options = ancillaries.data?.options ?? [];
  const baggageOptions = options.filter((o) => o.ssrType === SSR_TYPE_BAGGAGE);
  const mealOptions = options.filter((o) => o.ssrType === SSR_TYPE_MEALS || o.ssrType === SSR_TYPE_COMPLIMENTARY_MEALS);
  const seatSegments = (() => {
    const all = seatMap.data?.segments ?? [];
    const forLeg = all.filter((s) => s.legIndex === activeLeg);
    return forLeg.length > 0 ? forLeg : all;
  })();
  // Infants travel on a lap: no seat and no extra checked baggage.
  const seatTravellers = travellers.filter((t) => t.travelerType !== 'Infant');

  const legSelections = (category: AddOnCategory) =>
    selections.filter((s) => s.legIndex === activeLeg && s.category === category);
  const replace = (category: AddOnCategory, next: AddOnSelection[]) => {
    onChange([...selections.filter((s) => !(s.legIndex === activeLeg && s.category === category)), ...next]);
    setOpen(null);
  };

  const picksFor = (category: 'baggage' | 'meal', list: AncillaryOption[]): Picks =>
    Object.fromEntries(
      legSelections(category).flatMap((s) => {
        const option = list.find((o) => o.ssrKey === s.ssrKey);
        return option ? [[s.travelerId, option]] : [];
      })
    );

  const seatPicks: SeatPick[] = selections.flatMap((s) => {
    if (s.legIndex !== activeLeg || s.category !== 'seat') return [];
    for (let segmentIndex = 0; segmentIndex < seatSegments.length; segmentIndex++) {
      const seat = seatSegments[segmentIndex].rows.flatMap((r) => r.seats).find((o) => o.ssrKey === s.ssrKey);
      if (seat) return [{ segmentIndex, travelerId: s.travelerId, seat }];
    }
    return [];
  });

  const added = (category: AddOnCategory) => {
    const list = legSelections(category);
    if (list.length === 0) return null;
    return { count: list.length, amount: list.reduce((sum, s) => sum + s.amount, 0) };
  };

  // "Baggage selection" card: 108x84, 1px #697691, 4px radius.
  const IncludedCard: React.FC<{ title: string; value: string; small?: boolean; price: string; priceColor?: string }> = ({
    title,
    value,
    small,
    price,
    priceColor = '#007F20',
  }) => (
    <div className="w-[108px] h-[84px] shrink-0 flex flex-col justify-between p-2 bg-white border border-[#697691] rounded">
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] leading-4 font-bold text-[#3E4B64] truncate">{title}</span>
        <span className={`font-medium text-[#697691] ${small ? 'text-[10px] leading-[14px]' : 'text-[13px] leading-4 truncate'}`}>{value}</span>
      </div>
      <span className="text-[16px] leading-[22px] font-bold" style={{ color: priceColor }}>
        {price}
      </span>
    </div>
  );

  const Category: React.FC<{
    title: string;
    subtitle: string;
    included: { label: string; value: string }[];
    small?: boolean;
    cta: string;
    category: AddOnCategory;
    disabled: boolean;
  }> = ({ title, subtitle, included, small, cta, category, disabled }) => {
    const picked = added(category);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-col">
          <span className="text-[15px] leading-5 font-bold text-[#3E4B64]">{title}</span>
          <span className="pt-0.5 text-[12px] leading-4 text-[#697691]">{subtitle}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {included.map((item) => (
            <IncludedCard key={item.label} title={item.label} value={item.value} small={small} price="Free" />
          ))}
          {picked && (
            <IncludedCard
              title="Added"
              value={`${picked.count} selected`}
              small={small}
              price={rupees(picked.amount, currencyCode)}
              priceColor="#7C1AEE"
            />
          )}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setOpen(category)}
            title={disabled ? 'Select travellers first' : undefined}
            className="w-[108px] h-[84px] shrink-0 flex items-center justify-center p-2 bg-[#7C1AEE] border border-[#697691] rounded text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="w-[92px] flex items-center justify-between">
              <span className="text-[13px] leading-4 font-bold text-[#ECEEF3]">{picked ? 'Change' : cta}</span>
              <ChevronRight size={24} className="text-white shrink-0" />
            </span>
          </button>
        </div>
      </div>
    );
  };

  if (!route) return null;
  const noTravellers = travellers.length === 0;
  const dashed = <div className="border-t border-dashed border-[#CCD3E0]" />;

  return (
    <section className="flex flex-col gap-1">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[18px] leading-6 font-bold text-black">Whats included</h2>
        <p className="text-[13px] leading-4 text-[#697691]">
          Check your included benefits and add the extras you need for a more comfortable trip.
          {noTravellers && ' Select travellers first to add extras.'}
        </p>
      </div>
      {legRoutes.length > 1 && (
        <div className="flex bg-white border-b border-[#98A5BF] overflow-x-auto">
          {legRoutes.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveLeg(i)}
              className={`shrink-0 flex flex-col items-start gap-px px-4 pt-2.5 pb-2 border-b-2 ${
                i === activeLeg ? 'border-[#7C1AEE]' : 'border-transparent'
              }`}
            >
              <span className={`text-[13px] leading-4 font-medium ${i === activeLeg ? 'text-[#7C1AEE]' : 'text-[#182339]'}`}>{r.label}</span>
              <span className="text-[11px] leading-4 text-[#697691] whitespace-nowrap">
                {r.origin} → {r.destination}
              </span>
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-3 pt-2">
        <Category
          title="Baggage"
          subtitle="Adding baggage now is cheaper than at the airport!"
          included={[
            { label: 'Carry on bag', value: route.handBaggage ? baggageText(route.handBaggage) : 'As per airline' },
            { label: 'Checked bag', value: route.checkInBaggage ? baggageText(route.checkInBaggage) : 'As per airline' },
          ]}
          cta="Add extra Baggage"
          category="baggage"
          disabled={seatTravellers.length === 0}
        />
        {dashed}
        <Category
          title="Seat"
          subtitle="Select your seat now and travel your way!"
          included={[{ label: 'Random', value: 'Assigned at checked-in' }]}
          small
          cta="Pick exact seat on map"
          category="seat"
          disabled={seatTravellers.length === 0}
        />
        {dashed}
        <Category
          title="Meal"
          subtitle="Pick your preferred meal before takeoff!"
          included={[{ label: 'Meal', value: 'Buy on board' }]}
          small
          cta="Explore available meals"
          category="meal"
          disabled={noTravellers}
        />
      </div>

      {open === 'baggage' && (
        <PerTravellerPanel
          kind="baggage"
          route={route}
          options={baggageOptions}
          isLoading={ancillaries.isLoading}
          error={ancillaries.isError}
          travellers={seatTravellers}
          initial={picksFor('baggage', baggageOptions)}
          currencyCode={currencyCode}
          onClose={() => setOpen(null)}
          onSave={(picks) =>
            replace(
              'baggage',
              Object.entries(picks).map(([travelerId, o]) => ({
                legIndex: activeLeg,
                category: 'baggage',
                travelerId,
                ssrKey: o.ssrKey,
                label: o.ssrTypeDesc,
                amount: o.totalAmount,
              }))
            )
          }
        />
      )}
      {open === 'meal' && (
        <PerTravellerPanel
          kind="meal"
          route={route}
          options={mealOptions}
          isLoading={ancillaries.isLoading}
          error={ancillaries.isError}
          travellers={travellers}
          initial={picksFor('meal', mealOptions)}
          currencyCode={currencyCode}
          onClose={() => setOpen(null)}
          onSave={(picks) =>
            replace(
              'meal',
              Object.entries(picks).map(([travelerId, o]) => ({
                legIndex: activeLeg,
                category: 'meal',
                travelerId,
                ssrKey: o.ssrKey,
                label: o.ssrTypeDesc,
                amount: o.totalAmount,
              }))
            )
          }
        />
      )}
      {open === 'seat' && (
        <SeatPanel
          route={route}
          segments={seatSegments}
          isLoading={seatMap.isPending}
          error={seatMap.isError}
          travellers={seatTravellers}
          initial={seatPicks}
          currencyCode={currencyCode}
          onClose={() => setOpen(null)}
          onSave={(picks) =>
            replace(
              'seat',
              picks.map((p) => ({
                legIndex: activeLeg,
                category: 'seat',
                travelerId: p.travelerId,
                ssrKey: p.seat.ssrKey,
                label: p.seat.ssrTypeDesc,
                amount: p.seat.totalAmount,
              }))
            )
          }
        />
      )}
    </section>
  );
};
