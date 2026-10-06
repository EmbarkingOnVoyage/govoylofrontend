import React, { useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, ChevronRight, Info, Loader2, Plus, X } from 'lucide-react';
import type { FlightOffer } from '../useSearchFlightsMobile';
import type { FlightBookingSelection } from '../flightBookingSession';
import { useCreateBookingMobile, BOOKING_STATUS_FAILED, type CreateBookingResponse } from '../useCreateBookingMobile';
import { useReleaseHoldMobile } from '../useReleaseHoldMobile';
import { useTravellersMobile, type Traveler } from '../../profile/useTravellersMobile';
import { useCustomerProfileMobile } from '../../profile/useCustomerProfileMobile';
import { useCreateRazorpayOrderMobile, useVerifyRazorpayPaymentMobile } from '../../payments/useRazorpayPaymentMobile';
import { openRazorpayCheckout } from '../../payments/razorpayCheckout.web';
import {
  CABIN_CLASS_LABELS,
  formatPrice,
  formatTime24,
  formatTotalDuration,
  stopsLabel,
} from '../logic/flightResults';
import {
  GSTIN_PATTERN,
  PAX_API_TYPES,
  PAX_LABELS,
  PAX_TYPES,
  checkTravelerAge,
  formatTravelerDob,
  paxCountText,
  savedPaxType,
  type PaxType,
} from '../logic/travellers';
import {
  ADD_ON_LABELS,
  buildBookingLegs,
  buildBookingTravelers,
  legBaseFare,
  type AddOnCategory,
  type AddOnSelection,
} from '../logic/booking';
import type { FareRulesLeg } from '../logic/fareRules';
import { AirlineLogoWeb } from '../results/AirlineLogoWeb.web';
import { FareRulesPanelWeb } from '../results/FareRulesPanelWeb.web';
import { useAirportLookup } from '../results/useAirportLookup';
import { TravellerFormWeb } from './TravellerFormWeb.web';
import { AddOnsSectionWeb, type AddOnLegRoute, type AddOnTraveller } from './AddOnsSectionWeb.web';

const inputClass =
  'w-full px-3 py-2 rounded-lg border border-[#D5DAE3] text-sm text-[#182339] bg-white focus:outline-none focus:border-[#7C1AEE]';

// "Sat, 28 Nov"
function formatDay(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/^(\w+)/, '$1,');
}

export interface BookingConfirmation {
  bookingRefNo: string;
  airlinePnr: string | null;
  amount: number;
  currencyCode: string;
}

type PayState = 'idle' | 'holding' | 'paying' | 'verifying';

const PAY_STATE_TEXT: Record<Exclude<PayState, 'idle'>, string> = {
  holding: 'Holding your seats…',
  paying: 'Waiting for payment…',
  verifying: 'Confirming your payment…',
};

const Section: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }> = ({
  title,
  subtitle,
  children,
  action,
}) => (
  <section className="bg-white rounded-xl border border-[#E4E7EC] p-5">
    <div className="flex items-start justify-between gap-4 mb-3">
      <div>
        <h3 className="text-base font-semibold text-[#182339]">{title}</h3>
        {subtitle && <p className="text-xs text-[#697691]">{subtitle}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

const LegCard: React.FC<{ leg: FlightOffer; label?: string; cityFor: (c: string) => string; cabin: string }> = ({
  leg,
  label,
  cityFor,
  cabin,
}) => {
  const first = leg.segments[0];
  const last = leg.segments[leg.segments.length - 1];
  return (
    <div className="rounded-xl border border-[#E4E7EC] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-[#182339]">
          {label && <span className="text-[#7C1AEE] uppercase text-xs mr-2">{label}</span>}
          {cityFor(first.origin)} → {cityFor(last.destination)}
        </div>
        <div className="text-xs text-[#697691]">
          {formatDay(first.departureDateTime)} · {stopsLabel(leg.segments.length - 1)} ·{' '}
          {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)} · {cabin}
        </div>
      </div>
      {leg.segments.map((segment, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center gap-4 text-sm">
            <AirlineLogoWeb airlineCode={segment.airlineCode} size={24} />
            <div className="w-36 text-xs text-[#4C5973]">
              {segment.airlineName || leg.airlineName} · {segment.airlineCode} {segment.flightNumber}
            </div>
            <div className="w-24">
              <div className="font-semibold text-[#182339]">{formatTime24(segment.departureDateTime)}</div>
              <div className="text-xs text-[#697691]">{segment.origin}</div>
            </div>
            <div className="flex-1 text-center text-xs text-[#697691]">
              {formatTotalDuration(segment.departureDateTime, segment.arrivalDateTime)}
              <div className="border-t border-dashed border-[#99A6C0] my-1" />
            </div>
            <div className="w-24 text-right">
              <div className="font-semibold text-[#182339]">{formatTime24(segment.arrivalDateTime)}</div>
              <div className="text-xs text-[#697691]">{segment.destination}</div>
            </div>
          </div>
          {index < leg.segments.length - 1 && (
            <div className="flex items-center gap-1 my-2 ml-10 text-xs text-[#697691]">
              <Info size={12} />
              {formatTotalDuration(segment.arrivalDateTime, leg.segments[index + 1].departureDateTime)} layover at{' '}
              {cityFor(segment.destination)}
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

// Web Dev "Desktop - 17": traveller details with the fare summary alongside,
// and Pay Now on this page (no separate payment step on web). Pay runs the
// same flow as mobile: hold with the supplier -> Razorpay order -> Checkout.js
// -> verify; a hold that doesn't end in a payment is released.
export const FlightReviewPageWeb: React.FC<{
  selection: FlightBookingSelection;
  onBackToResults: () => void;
  onBooked: (confirmation: BookingConfirmation) => void;
}> = ({ selection, onBackToResults, onBooked }) => {
  const { legs, legLabels, passengerCounts, summary } = selection;
  const codes = useMemo(() => legs.flatMap((l) => l.segments.flatMap((s) => [s.origin, s.destination])), [legs]);
  const { cityFor } = useAirportLookup(codes);
  const { data: travellers, isLoading: travellersLoading } = useTravellersMobile();
  const { data: profile } = useCustomerProfileMobile();
  const createBooking = useCreateBookingMobile();
  const releaseHold = useReleaseHoldMobile();
  const createOrder = useCreateRazorpayOrderMobile();
  const verifyPayment = useVerifyRazorpayPaymentMobile();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // A traveller just added through the form, selected once the list reloads.
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null);
  const [hint, setHint] = useState('');
  const [form, setForm] = useState<{ heading: string; traveller: Traveler | null } | null>(null);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [addOns, setAddOns] = useState<AddOnSelection[]>([]);
  const [useGst, setUseGst] = useState(false);
  const [gstNumber, setGstNumber] = useState('');
  const [gstName, setGstName] = useState('');
  const [gstAddress, setGstAddress] = useState('');
  const [showRules, setShowRules] = useState(false);
  const [payState, setPayState] = useState<PayState>('idle');
  const [error, setError] = useState('');
  const [priceChange, setPriceChange] = useState<{ from: number; to: number; resolve: (ok: boolean) => void } | null>(null);

  // Contact details start from the profile.
  useEffect(() => {
    if (profile?.email && !email) setEmail(profile.email);
    if (profile?.phone && !mobile) setMobile(profile.phone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const currencyCode = legs[0]?.currencyCode ?? 'INR';
  const flightTotal = legs.reduce((sum, leg) => sum + leg.totalAmount, 0);
  const baseFare = legs.reduce((sum, leg) => sum + legBaseFare(leg), 0);
  const baseKnown = legs.every((leg) => legBaseFare(leg) > 0);
  const addOnTotal = addOns.reduce((sum, s) => sum + s.amount, 0);
  const totalAmount = flightTotal + addOnTotal;
  const money = (amount: number) => formatPrice(amount, currencyCode);

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

  const addOnTravellers: AddOnTraveller[] = selectedTravellers.map((t) => ({
    id: t.id,
    firstName: t.firstName,
    lastName: t.lastName,
    gender: t.gender ?? 'Male',
    travelerType: PAX_API_TYPES[paxTypeOf(t)],
  }));

  const legRoutes: AddOnLegRoute[] = legs.map((leg, index) => {
    const first = leg.segments[0];
    // A whole-trip offer is labelled by its turnaround point, not DEL • DEL.
    const firstTrip = leg.segments.filter((s) => (s.tripIndex ?? 0) === (first?.tripIndex ?? 0));
    const last = firstTrip.length < leg.segments.length ? firstTrip[firstTrip.length - 1] : leg.segments[leg.segments.length - 1];
    const fare = leg.fares.find((f) => f.fareId === leg.selectedFareId) ?? leg.fares[0];
    return {
      offerId: leg.offerId,
      fareId: leg.selectedFareId ?? null,
      label: legLabels?.[index] ?? `Flight ${index + 1}`,
      origin: first?.origin ?? '',
      destination: last?.destination ?? '',
      handBaggage: fare?.handBaggage ?? null,
      checkInBaggage: fare?.checkInBaggage ?? null,
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

  const problem = (): string => {
    const missing = visibleTypes.filter((type) => selectedCount(type) !== required[type]);
    if (missing.length > 0) {
      return `Please select ${missing.map((type) => paxCountText(type, required[type])).join(', ')} for this booking.`;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return 'Please enter a valid email for the booking.';
    if (!/^\+?\d{10,13}$/.test(mobile.replace(/[\s-]/g, ''))) return 'Please enter a valid mobile number for the booking.';
    if (useGst && (!GSTIN_PATTERN.test(gstNumber.trim().toUpperCase()) || !gstName.trim() || !gstAddress.trim())) {
      return 'Please enter a valid 15-character GSTIN, company name and company address.';
    }
    return '';
  };

  const releaseSilently = async (held: CreateBookingResponse | null) => {
    if (!held?.bookingRefNo || !held.airlinePnr) return;
    try {
      await releaseHold.mutateAsync({ bookingRefNo: held.bookingRefNo, airlinePnr: held.airlinePnr });
    } catch {
      // A failed release must never hide the payment error itself.
    }
  };

  const handlePay = async () => {
    const issue = problem();
    setError(issue);
    if (issue) return;

    let held: CreateBookingResponse | null = null;
    try {
      // Hold first, so nobody is charged for a seat that couldn't be held.
      setPayState('holding');
      const booking = await createBooking.mutateAsync({
        legs: buildBookingLegs(legs, addOns, selectedTravellers),
        travelers: buildBookingTravelers(selectedTravellers, paxTypeOf),
        passengerMobile: mobile.replace(/[\s-]/g, ''),
        passengerEmail: email.trim(),
        ...(useGst && {
          gstNumber: gstNumber.trim().toUpperCase(),
          gstHolderName: gstName.trim(),
          gstAddress: gstAddress.trim(),
        }),
      });
      if (booking.statusId === BOOKING_STATUS_FAILED) {
        throw new Error(booking.failureRemark || 'Could not hold your flight. Please try again.');
      }
      held = booking;

      // The supplier re-prices at booking time; charge what it will charge,
      // once the customer has accepted any change.
      const chargeAmount = booking.confirmedTotalAmount ?? totalAmount;
      if (Math.round(chargeAmount) !== Math.round(totalAmount)) {
        const accepted = await new Promise<boolean>((resolve) =>
          setPriceChange({ from: totalAmount, to: chargeAmount, resolve })
        );
        setPriceChange(null);
        if (!accepted) throw new Error('Booking cancelled — the fare changed.');
      }

      setPayState('paying');
      const order = await createOrder.mutateAsync({
        bookingReference: booking.bookingRefNo,
        amount: chargeAmount,
        currency: currencyCode,
        sourceClient: 'Web',
      });
      const result = await openRazorpayCheckout({
        key: order.keyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        description: 'Flight booking payment',
        prefill: { email: email.trim(), contact: mobile.replace(/[\s-]/g, '') },
      });

      setPayState('verifying');
      const verified = await verifyPayment.mutateAsync({
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      });
      if (verified.status !== 'Succeeded') throw new Error('Payment could not be verified. Please try again.');

      onBooked({
        bookingRefNo: booking.bookingRefNo,
        airlinePnr: booking.airlinePnr,
        amount: chargeAmount,
        currencyCode,
      });
    } catch (err) {
      setPayState('idle');
      setError((err as Error)?.message || 'Payment was not completed.');
      await releaseSilently(held);
    }
  };

  const busy = payState !== 'idle';
  const addOnGroups = (['seat', 'meal', 'baggage'] as AddOnCategory[])
    .map((category) => ({ category, amount: addOns.filter((s) => s.category === category).reduce((sum, s) => sum + s.amount, 0) }))
    .filter((g) => g.amount > 0);

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-[300px_1fr] gap-5 items-start">
      <aside className="bg-white rounded-xl border border-[#E4E7EC] p-5 sticky top-4 space-y-2 text-sm">
        <h3 className="text-base font-semibold text-[#182339] mb-2">Fare summary</h3>
        {baseKnown ? (
          <>
            <div className="flex justify-between text-[#4C5973]">
              <span>Base fare</span>
              <span className="text-[#182339]">{money(baseFare)}</span>
            </div>
            <div className="flex justify-between text-[#4C5973]">
              <span>Taxes &amp; fees</span>
              <span className="text-[#182339]">{money(flightTotal - baseFare)}</span>
            </div>
          </>
        ) : (
          <div className="flex justify-between text-[#4C5973]">
            <span>Flight fare (incl. taxes)</span>
            <span className="text-[#182339]">{money(flightTotal)}</span>
          </div>
        )}
        {addOnGroups.map((g) => (
          <div key={g.category} className="flex justify-between text-[#4C5973]">
            <span>{ADD_ON_LABELS[g.category]}</span>
            <span className="text-[#182339]">{money(g.amount)}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-2 border-t border-[#E4E7EC] font-semibold text-[#182339]">
          <span>Total amount</span>
          <span className="text-[#7C1AEE] text-base">{money(totalAmount)}</span>
        </div>
        <p className="text-[11px] text-[#697691]">
          For {paxCountText('adult', passengerCounts.adult)}
          {passengerCounts.child > 0 && `, ${paxCountText('child', passengerCounts.child)}`}
          {passengerCounts.infant > 0 && `, ${paxCountText('infant', passengerCounts.infant)}`}. The airline confirms the
          final fare when your seats are held.
        </p>
      </aside>

      <div className="space-y-4 min-w-0">
        <Section
          title="Flight details"
          subtitle="Please ensure your visa is valid, passport has 6+ months validity, and the name matches your passport."
          action={
            <button type="button" onClick={onBackToResults} className="text-sm font-medium text-[#7C1AEE] hover:underline whitespace-nowrap">
              Change flight
            </button>
          }
        >
          <div className="space-y-3">
            {legs.map((leg, index) => (
              <LegCard
                key={`${leg.offerId}-${index}`}
                leg={leg}
                label={legs.length > 1 ? legLabels?.[index] ?? `Flight ${index + 1}` : undefined}
                cityFor={cityFor}
                cabin={CABIN_CLASS_LABELS[summary.cabinClass]}
              />
            ))}
          </div>
        </Section>

        <button
          type="button"
          onClick={() => setShowRules(true)}
          className="w-full flex items-center justify-between bg-[#F1F3F7] rounded-xl px-5 py-3 text-left"
        >
          <span>
            <span className="block text-sm font-semibold text-[#182339]">Fare policy</span>
            <span className="block text-xs text-[#4C5973]">View cancellation and rescheduling charges</span>
          </span>
          <ChevronRight size={18} className="text-[#4C5973]" />
        </button>

        <Section title="Traveller details" subtitle="Choose from your saved travellers or add a new one.">
          {travellersLoading ? (
            <Loader2 className="animate-spin text-[#7C1AEE]" />
          ) : (
            <div className="space-y-4">
              {visibleTypes.map((type) => (
                <div key={type}>
                  <div className="flex items-center gap-2 text-sm mb-2">
                    <span className="font-semibold text-[#182339]">{PAX_LABELS[type].block}</span>
                    <span className="text-xs text-[#697691]">
                      {selectedCount(type)}/{required[type]} selected
                    </span>
                  </div>
                  {byType[type].length === 0 ? (
                    <p className="text-xs text-[#697691]">No saved {PAX_LABELS[type].plural} yet. Add one below.</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-3">
                      {byType[type].map((t) => {
                        const selected = selectedIds.has(t.id);
                        const note = ageChecks.get(t.id)?.note;
                        return (
                          <div
                            key={t.id}
                            className={`flex items-start gap-2 rounded-lg border p-3 ${selected ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-[#D5DAE3]'}`}
                          >
                            <button
                              type="button"
                              onClick={() => toggle(t)}
                              aria-pressed={selected}
                              aria-label={`Select ${t.firstName} ${t.lastName}`}
                              className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                selected ? 'bg-[#7C1AEE] border-[#7C1AEE]' : 'border-[#99A6C0] bg-white'
                              }`}
                            >
                              {selected && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                            </button>
                            <button type="button" onClick={() => toggle(t)} className="flex-1 min-w-0 text-left">
                              <div className="text-sm font-medium text-[#182339] truncate">
                                {t.firstName} {t.lastName}
                              </div>
                              <div className="text-[11px] text-[#697691]">
                                {[t.gender, formatTravelerDob(t.dateOfBirth)].filter(Boolean).join(', ')}
                              </div>
                              {note && <div className="text-[11px] text-[#B45309]">{note}</div>}
                            </button>
                            <button
                              type="button"
                              onClick={() => setForm({ heading: `Edit ${t.firstName}`, traveller: t })}
                              className="text-xs font-medium text-[#7C1AEE] hover:underline"
                            >
                              Edit
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {hint && <p className="text-sm text-[#B45309]">{hint}</p>}

              {form ? (
                <TravellerFormWeb
                  key={form.traveller?.id ?? 'new'}
                  heading={form.heading}
                  traveller={form.traveller}
                  onCancel={() => setForm(null)}
                  onSaved={(id) => {
                    setForm(null);
                    // A new traveller is selected straight away when there's room.
                    if (id && !form.traveller) setPendingSelectId(id);
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setForm({ heading: 'New traveller', traveller: null })}
                  className="flex items-center gap-1 text-sm font-medium text-[#7C1AEE] hover:underline"
                >
                  Add new traveller <Plus size={16} />
                </button>
              )}
            </div>
          )}
        </Section>

        <Section title="Contact details" subtitle="Your booking confirmation and e-ticket are sent here.">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="block text-xs font-medium text-[#4C5973] mb-1">Email address</span>
              <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-[#4C5973] mb-1">Mobile number</span>
              <input type="tel" className={inputClass} value={mobile} onChange={(e) => setMobile(e.target.value)} />
            </label>
          </div>
        </Section>

        <AddOnsSectionWeb
          legRoutes={legRoutes}
          travellers={addOnTravellers}
          currencyCode={currencyCode}
          selections={addOns}
          onChange={setAddOns}
        />

        <section className="bg-white rounded-xl border border-[#E4E7EC] p-5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={useGst} onChange={(e) => setUseGst(e.target.checked)} className="accent-[#7C1AEE] w-4 h-4" />
            <span className="text-sm font-semibold text-[#182339]">GST number</span>
            <span className="text-xs text-[#697691]">Add GST to claim a tax credit</span>
          </label>
          {useGst && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              <input className={inputClass} placeholder="GSTIN" maxLength={15} value={gstNumber} onChange={(e) => setGstNumber(e.target.value.toUpperCase())} />
              <input className={inputClass} placeholder="Company name" maxLength={35} value={gstName} onChange={(e) => setGstName(e.target.value)} />
              <input className={inputClass} placeholder="Company address" value={gstAddress} onChange={(e) => setGstAddress(e.target.value)} />
            </div>
          )}
        </section>

        <div className="bg-white rounded-xl border border-[#E4E7EC] p-5 flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-[#697691]">Total</div>
            <div className="text-xl font-bold text-[#7C1AEE]">{money(totalAmount)}</div>
          </div>
          <div className="flex items-center gap-4 min-w-0">
            {error && <p className="text-sm text-[#C8102E] max-w-[420px]">{error}</p>}
            {busy && <span className="text-sm text-[#4C5973] whitespace-nowrap">{PAY_STATE_TEXT[payState as Exclude<PayState, 'idle'>]}</span>}
            <button
              type="button"
              onClick={handlePay}
              disabled={busy}
              className="flex items-center gap-2 px-10 py-3 rounded-lg bg-[#7C1AEE] text-white font-semibold hover:opacity-90 disabled:opacity-60 whitespace-nowrap"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              Pay Now
            </button>
          </div>
        </div>
      </div>

      {showRules && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40" onClick={() => setShowRules(false)}>
          <div className="w-full max-w-[880px] h-full bg-white flex flex-col" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Fare rules">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E4E7EC]">
              <div>
                <h3 className="text-base font-semibold text-[#182339]">Fare rules</h3>
                <p className="text-xs text-[#697691]">All charges are per passenger</p>
              </div>
              <button type="button" onClick={() => setShowRules(false)} aria-label="Close" className="p-2 rounded hover:bg-[#F1F3F7]">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <FareRulesPanelWeb legs={fareRuleLegs} />
            </div>
          </div>
        </div>
      )}

      {priceChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" role="alertdialog" aria-label="Price updated">
            <h3 className="text-lg font-semibold text-[#182339] mb-2">Price updated</h3>
            <p className="text-sm text-[#4C5973] mb-5">
              The airline has updated the fare for this booking from {money(priceChange.from)} to{' '}
              <strong className="text-[#182339]">{money(priceChange.to)}</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => priceChange.resolve(false)} className="px-4 py-2 rounded-lg border border-[#D5DAE3] text-sm">
                Cancel
              </button>
              <button type="button" onClick={() => priceChange.resolve(true)} className="px-5 py-2 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// After payment: the booking reference and where to find the trip.
export const BookingConfirmedWeb: React.FC<{
  confirmation: BookingConfirmation;
  onViewTrips: () => void;
  onNewSearch: () => void;
}> = ({ confirmation, onViewTrips, onNewSearch }) => (
  <div className="max-w-[640px] mx-auto px-6 py-16">
    <div className="bg-white rounded-2xl border border-[#E4E7EC] p-8 text-center">
      <CheckCircle2 size={48} className="text-[#1E9E5A] mx-auto mb-3" />
      <h1 className="text-2xl font-semibold text-[#182339] mb-2">Payment successful</h1>
      <p className="text-sm text-[#4C5973] mb-6">
        We received {formatPrice(confirmation.amount, confirmation.currencyCode)}. Your booking is confirmed and the e-ticket
        will be emailed to you once the airline issues it.
      </p>
      <div className="inline-grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-left mb-8">
        <span className="text-[#697691]">Booking reference</span>
        <span className="font-semibold text-[#182339]">{confirmation.bookingRefNo}</span>
        {confirmation.airlinePnr && (
          <>
            <span className="text-[#697691]">Airline PNR</span>
            <span className="font-semibold text-[#182339]">{confirmation.airlinePnr}</span>
          </>
        )}
      </div>
      <div className="flex justify-center gap-3">
        <button type="button" onClick={onNewSearch} className="px-5 py-2.5 rounded-lg border border-[#D5DAE3] text-sm font-medium text-[#182339]">
          Book another flight
        </button>
        <button type="button" onClick={onViewTrips} className="px-6 py-2.5 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium">
          View My Trips
        </button>
      </div>
    </div>
  </div>
);
