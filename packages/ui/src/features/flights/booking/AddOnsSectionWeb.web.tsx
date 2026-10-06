import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Loader2, X } from 'lucide-react';
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
import { buildSeatSections, describeBaggage, layoutSeatRow, mealKind, seatLabelParts, uniqueOptions } from '../logic/addOns';
import type { AddOnCategory, AddOnSelection } from '../logic/booking';

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
}

function rupees(amount: number, currencyCode: string): string {
  return amount > 0
    ? `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
    : 'Free';
}

const PanelShell: React.FC<{
  title: string;
  subtitle: string;
  total: number;
  currencyCode: string;
  onSave: () => void;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, subtitle, total, currencyCode, onSave, onClose, children }) => (
  <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={onClose}>
    <div className="w-full max-w-[560px] h-full bg-white flex flex-col shadow-2xl" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC]">
        <div>
          <h3 className="text-base font-semibold text-[#182339]">{title}</h3>
          <p className="text-xs text-[#697691]">{subtitle}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close" className="p-2 rounded hover:bg-[#F1F3F7]">
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">{children}</div>
      <div className="flex items-center justify-between px-6 py-4 border-t border-[#E4E7EC]">
        <div>
          <div className="text-xs text-[#697691]">Total</div>
          <div className="text-lg font-bold text-[#7C1AEE]">{total > 0 ? rupees(total, currencyCode) : '₹0'}</div>
        </div>
        <button type="button" onClick={onSave} className="px-10 py-2.5 rounded-lg bg-[#7C1AEE] text-white font-medium hover:opacity-90">
          Save
        </button>
      </div>
    </div>
  </div>
);

const OptionCard: React.FC<{ selected: boolean; onClick: () => void; children: React.ReactNode }> = ({ selected, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`min-w-[96px] px-3 py-2 rounded-lg border text-left text-xs ${
      selected ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-[#D5DAE3] bg-white hover:border-[#7C1AEE]'
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
    <p className="text-sm text-[#4C5973]">Couldn't load the options right now. Please try again.</p>
  ) : empty ? (
    <p className="text-sm text-[#4C5973]">{emptyText}</p>
  ) : null;

type Picks = Record<string, AncillaryOption>;

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

  return (
    <PanelShell
      title={kind === 'baggage' ? 'Extra baggage' : 'Meals'}
      subtitle={`${route.origin} → ${route.destination}${kind === 'baggage' && route.checkInBaggage ? ` · Included: ${route.checkInBaggage}` : ''}`}
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
      {!isLoading &&
        !error &&
        cards.length > 0 &&
        travellers.map((t) => (
          <div key={t.id}>
            <div className="text-sm font-semibold text-[#182339] mb-2">
              {t.firstName} {t.lastName}
            </div>
            <div className="flex flex-wrap gap-2">
              <OptionCard selected={!picks[t.id]} onClick={() => set(t.id, null)}>
                <div className="font-medium text-[#182339]">None added</div>
              </OptionCard>
              {cards.map((option) => {
                const label =
                  kind === 'baggage'
                    ? (() => {
                        const { pieces, weight } = describeBaggage(option);
                        return pieces ? `${pieces} pc · ${weight}` : `Extra ${weight}`;
                      })()
                    : option.ssrTypeDesc;
                const tag = kind === 'meal' ? mealKind(option) : null;
                return (
                  <OptionCard
                    key={option.ssrKey}
                    selected={picks[t.id]?.ssrKey === option.ssrKey || (picks[t.id] && picks[t.id].ssrTypeDesc === option.ssrTypeDesc && picks[t.id].totalAmount === option.totalAmount) || false}
                    onClick={() => set(t.id, option)}
                  >
                    <div className="font-medium text-[#182339] max-w-[180px]">{label}</div>
                    {tag && (
                      <div className={`text-[10px] font-semibold ${tag === 'veg' ? 'text-[#15803D]' : 'text-[#C8102E]'}`}>
                        {tag === 'veg' ? 'VEG' : 'NON-VEG'}
                      </div>
                    )}
                    <div className="text-[#7C1AEE] font-semibold">{rupees(option.totalAmount, currencyCode)}</div>
                  </OptionCard>
                );
              })}
            </div>
          </div>
        ))}
    </PanelShell>
  );
};

export interface SeatPick {
  segmentIndex: number;
  travelerId: string;
  seat: AncillaryOption;
}

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
      title="Seat selection"
      subtitle={`${segment?.origin ?? route.origin} → ${segment?.destination ?? route.destination}`}
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
                <OptionCard key={i} selected={i === segmentIndex} onClick={() => setSegmentIndex(i)}>
                  <div className="font-medium text-[#182339]">
                    {s.origin} → {s.destination}
                  </div>
                </OptionCard>
              ))}
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {travellers.map((t) => {
              const seat = picks[key(segmentIndex, t.id)];
              return (
                <OptionCard key={t.id} selected={t.id === activeId} onClick={() => setActiveId(t.id)}>
                  <div className="font-medium text-[#182339]">{t.firstName}</div>
                  <div className="text-[#697691]">{seat ? seat.ssrTypeDesc : 'No seat'}</div>
                </OptionCard>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 text-[11px] text-[#4C5973]">
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border border-[#C9B5F5] bg-white" /> Available</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded border border-[#7FB3FF] bg-[#EEF5FF]" /> Extra legroom</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#E4E7EC]" /> Unavailable</span>
            <span className="flex items-center gap-1"><span className="w-4 h-4 rounded bg-[#7C1AEE]" /> Selected</span>
          </div>
          <div className="mx-auto w-fit space-y-4">
            {sections.map((section, si) => (
              <div key={si}>
                <div className="text-center text-[11px] text-[#697691] mb-2">{section.heading}</div>
                <div className="space-y-1.5">
                  {section.rows.map((row, ri) => (
                    <div key={ri} className="flex items-center gap-1.5">
                      {layoutSeatRow(row.seats).map((cell, ci) => {
                        if (cell.kind === 'rowNumber') return <span key={ci} className="w-7 text-center text-[11px] text-[#697691]">{row.rowNumber}</span>;
                        if (cell.kind === 'gap') return <span key={ci} className="w-7" />;
                        const { seat } = cell;
                        const holder = holderBySeat.get(seat.ssrKey);
                        const available = seat.ssrStatus === SSR_STATUS_AVAILABLE;
                        if (!available && !holder) {
                          return <span key={ci} className="w-8 h-8 rounded bg-[#E4E7EC]" title="Unavailable" />;
                        }
                        const mine = holder === activeId;
                        const taken = !!holder && !mine;
                        return (
                          <button
                            key={ci}
                            type="button"
                            title={`${seat.ssrTypeDesc} · ${rupees(seat.totalAmount, currencyCode)}`}
                            onClick={() => pressSeat(seat)}
                            className={`w-8 h-8 rounded text-[11px] font-semibold border ${
                              mine
                                ? 'bg-[#7C1AEE] border-[#7C1AEE] text-white'
                                : taken
                                  ? 'bg-[#B794F4] border-[#B794F4] text-white'
                                  : seat.isExtraLegroom
                                    ? 'bg-[#EEF5FF] border-[#7FB3FF] text-[#1D4ED8]'
                                    : 'bg-white border-[#C9B5F5] text-[#7C1AEE] hover:bg-[#F5F0FF]'
                            }`}
                          >
                            {taken ? travellers.find((t) => t.id === holder)?.firstName.charAt(0).toUpperCase() : seatLabelParts(seat).letter}
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

  const summary = (category: AddOnCategory) => {
    const list = legSelections(category);
    if (list.length === 0) return null;
    return `${list.length} added · ${rupees(list.reduce((sum, s) => sum + s.amount, 0), currencyCode)}`;
  };

  const Category: React.FC<{
    title: string;
    subtitle: string;
    included: { label: string; value: string }[];
    cta: string;
    category: AddOnCategory;
    disabled: boolean;
  }> = ({ title, subtitle, included, cta, category, disabled }) => (
    <div>
      <div className="text-sm font-semibold text-[#182339]">{title}</div>
      <div className="text-xs text-[#697691] mb-2">{subtitle}</div>
      <div className="flex flex-wrap gap-2">
        {included.map((item) => (
          <div key={item.label} className="w-[120px] px-3 py-2 rounded-lg border border-[#D5DAE3] bg-white">
            <div className="text-xs font-medium text-[#182339]">{item.label}</div>
            <div className="text-[11px] text-[#697691]">{item.value}</div>
            <div className="text-xs font-semibold text-[#15803D]">Free</div>
          </div>
        ))}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(category)}
          className="w-[150px] px-3 py-2 rounded-lg bg-[#7C1AEE] text-white text-left disabled:opacity-40 flex items-center justify-between"
        >
          <span className="text-xs font-medium">{summary(category) ?? cta}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  if (!route) return null;
  const noTravellers = travellers.length === 0;

  return (
    <section className="bg-white rounded-xl border border-[#E4E7EC] p-5 space-y-4">
      <div>
        <h3 className="text-base font-semibold text-[#182339]">What's included</h3>
        <p className="text-xs text-[#697691]">
          Check your included benefits and add the extras you need. Add-on prices are estimates and may change at checkout.
          {noTravellers && ' Select travellers first to add extras.'}
        </p>
      </div>
      {legRoutes.length > 1 && (
        <div className="flex gap-2 border-b border-[#E4E7EC]">
          {legRoutes.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActiveLeg(i)}
              className={`px-3 py-2 text-left border-b-2 -mb-px ${i === activeLeg ? 'border-[#7C1AEE]' : 'border-transparent'}`}
            >
              <div className={`text-xs font-semibold ${i === activeLeg ? 'text-[#7C1AEE]' : 'text-[#4C5973]'}`}>{r.label}</div>
              <div className="text-[11px] text-[#697691]">
                {r.origin} • {r.destination}
              </div>
            </button>
          ))}
        </div>
      )}
      <Category
        title="Baggage"
        subtitle="Adding baggage now is cheaper than at the airport."
        included={[
          { label: 'Carry-on bag', value: route.handBaggage ?? 'Airline dependent' },
          { label: 'Checked bag', value: route.checkInBaggage ?? 'Airline dependent' },
        ]}
        cta="Add extra baggage"
        category="baggage"
        disabled={seatTravellers.length === 0}
      />
      <Category
        title="Seat"
        subtitle="Select your seat now and travel your way."
        included={[{ label: 'Random', value: 'Assigned at check-in' }]}
        cta="Pick a seat"
        category="seat"
        disabled={seatTravellers.length === 0}
      />
      <Category
        title="Meal"
        subtitle="Pick your preferred meal before takeoff."
        included={[{ label: 'Meal', value: 'As per airline' }]}
        cta="Explore available meals"
        category="meal"
        disabled={noTravellers}
      />

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
