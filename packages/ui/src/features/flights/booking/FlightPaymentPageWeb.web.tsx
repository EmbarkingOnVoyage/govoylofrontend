import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import type { FlightOffer } from '../useSearchFlightsMobile';
import type { FlightBookingSelection, FlightCheckoutDetails } from '../flightBookingSession';
import { useCreateBookingMobile, BOOKING_STATUS_FAILED, type CreateBookingResponse } from '../useCreateBookingMobile';
import { useReleaseHoldMobile } from '../useReleaseHoldMobile';
import type { Traveler } from '../../profile/useTravellersMobile';
import { useCreateRazorpayOrderMobile, useVerifyRazorpayPaymentMobile } from '../../payments/useRazorpayPaymentMobile';
import { RazorpayCheckoutError, openRazorpayCheckout } from '../../payments/razorpayCheckout.web';
import { CABIN_CLASS_LABELS, formatPrice, formatTime24, formatTotalDuration, stopsLabel } from '../logic/flightResults';
import { PAX_TYPES, type PaxType } from '../logic/travellers';
import { buildBookingLegs, buildBookingTravelers } from '../logic/booking';
import { convenienceFeeFor } from '../logic/convenienceFee';
import { useConvenienceFeeRules } from '../useConvenienceFeeRules';
import { AirlineLogoWeb } from '../results/AirlineLogoWeb.web';
import { useAirportLookup } from '../results/useAirportLookup';
import { BookingPageWeb, FareSummaryWeb, SectionHeading, Separator, buildFareBreakdown } from './BookingLayoutWeb.web';
import { SelectedTravellersWeb, paxSummaryText } from './FlightReviewPageWeb.web';
import type { BookingConfirmation } from './BookingConfirmedWeb.web';
import upiLogo from '../../../assets/images/payments/upi.png';
import applePayLogo from '../../../assets/images/payments/apple-pay.png';
import googlePayLogo from '../../../assets/images/payments/google-pay.png';
import visaLogo from '../../../assets/images/payments/visa.png';
import mastercardLogo from '../../../assets/images/payments/mastercard.png';

const VISA_NOTE = 'Please ensure your visa is valid. passport has 6+ months validity, and name matches your passport.';
const PAYMENT_LOGOS = [
  { src: upiLogo, alt: 'UPI' },
  { src: applePayLogo, alt: 'Apple Pay' },
  { src: googlePayLogo, alt: 'Google Pay' },
  { src: visaLogo, alt: 'Visa' },
  { src: mastercardLogo, alt: 'Mastercard' },
];

type PayState = 'idle' | 'holding' | 'paying' | 'verifying';

const PAY_STATE_TEXT: Record<Exclude<PayState, 'idle'>, string> = {
  holding: 'Holding your seats…',
  paying: 'Waiting for payment…',
  verifying: 'Confirming your payment…',
};

// "Thu, 22 Oct"
function dayText(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/^(\w+)/, '$1,');
}

// "Thu, 22 Oct · 1 Stop · 21h 10m · Economy"
// (dated by one of its segments in the open card).
function legLine(leg: FlightOffer, cabin: string, dateIso?: string): string {
  const first = leg.segments[0];
  const last = leg.segments[leg.segments.length - 1];
  const stops = stopsLabel(leg.segments.length - 1).replace(/stops?/, (m) => m[0].toUpperCase() + m.slice(1));
  return `${dayText(dateIso ?? first.departureDateTime)} · ${stops} · ${formatTotalDuration(first.departureDateTime, last.arrivalDateTime)} · ${cabin}`;
}

// "BOM ⇌ JFK" for a return trip, "DEL → BOM → GOI" for multi-city.
function tripTitle(selection: FlightBookingSelection): string {
  const { legs, summary } = selection;
  const first = legs[0]?.segments[0];
  if (!first) return '';
  if (summary.request.tripType === 'RoundTrip') {
    return `${first.origin} ⇌ ${summary.destinationCode || legs[0].segments[legs[0].segments.length - 1].destination}`;
  }
  const stops = [first.origin, ...legs.map((l) => l.segments[l.segments.length - 1].destination)];
  return stops.join(' → ');
}

// Web Dev "Desktop - 19" (flight card collapsed) / "Desktop - 20" (open):
// the trip, who's flying and where the booking goes, then "Securely pay".
// Paying holds the seats with the supplier, opens Razorpay Checkout for the
// held amount and verifies the payment; a hold that isn't paid is released.
export const FlightPaymentPageWeb: React.FC<{
  selection: FlightBookingSelection;
  checkout: FlightCheckoutDetails;
  onEditTravellers: () => void;
  onBooked: (confirmation: BookingConfirmation) => void;
}> = ({ selection, checkout, onEditTravellers, onBooked }) => {
  const { legs, passengerCounts, summary } = selection;
  const codes = useMemo(() => legs.flatMap((l) => l.segments.flatMap((s) => [s.origin, s.destination])), [legs]);
  const { cityFor } = useAirportLookup(codes);
  const createBooking = useCreateBookingMobile();
  const releaseHold = useReleaseHoldMobile();
  const createOrder = useCreateRazorpayOrderMobile();
  const verifyPayment = useVerifyRazorpayPaymentMobile();

  const [expanded, setExpanded] = useState(false);
  const [payState, setPayState] = useState<PayState>('idle');
  const [error, setError] = useState('');
  const [priceChange, setPriceChange] = useState<{ from: number; to: number; resolve: (ok: boolean) => void } | null>(null);

  const cabin = CABIN_CLASS_LABELS[summary.cabinClass];
  // The app's estimate of the convenience fee; the server's own figure from the
  // hold is what's charged.
  const { data: convenienceFeeRules } = useConvenienceFeeRules();
  const convenienceFee = convenienceFeeFor(convenienceFeeRules, legs, passengerCounts, summary.request.tripType);
  const breakdown = buildFareBreakdown(legs, checkout.addOns, paxSummaryText(passengerCounts), convenienceFee);
  const totalAmount = breakdown.total;
  const currencyCode = breakdown.currencyCode;
  const money = (amount: number) => formatPrice(amount, currencyCode);
  const paxTypeOf = (t: Traveler): PaxType => checkout.paxTypes[t.id] ?? 'adult';
  const allSegments = legs.flatMap((leg) => leg.segments.map((segment) => ({ leg, segment })));

  const primary = checkout.travellers[0];
  const others = checkout.travellers.length - 1;
  const sentTo = `Booking Details will be sent to : ${primary ? `${primary.firstName} ${primary.lastName} ( primary)` : ''}${
    others > 0 ? `, +${others} Traveller${others > 1 ? 's' : ''}` : ''
  }  ${checkout.email} , +91 ${checkout.mobile}`;

  const travellerGroups = PAX_TYPES.filter((type) => passengerCounts[type] > 0).map((type) => ({
    type,
    required: passengerCounts[type],
    travellers: checkout.travellers.filter((t) => paxTypeOf(t) === type),
  }));

  const releaseSilently = async (held: CreateBookingResponse | null) => {
    if (!held?.bookingRefNo || !held.airlinePnr) return;
    try {
      await releaseHold.mutateAsync({ bookingRefNo: held.bookingRefNo, airlinePnr: held.airlinePnr });
    } catch {
      // A failed release must never hide the payment error itself.
    }
  };

  const handlePay = async () => {
    setError('');
    let held: CreateBookingResponse | null = null;
    try {
      // Hold first, so nobody is charged for a seat that couldn't be held.
      setPayState('holding');
      const booking = await createBooking.mutateAsync({
        legs: buildBookingLegs(legs, checkout.addOns, checkout.travellers),
        travelers: buildBookingTravelers(checkout.travellers, paxTypeOf),
        passengerMobile: checkout.mobile,
        passengerEmail: checkout.email,
        ...(checkout.gst && {
          gstNumber: checkout.gst.number,
          gstHolderName: checkout.gst.holderName,
          gstAddress: checkout.gst.address,
        }),
      });
      if (booking.statusId === BOOKING_STATUS_FAILED) {
        throw new Error(booking.failureRemark || 'Could not hold your flight. Please try again.');
      }
      held = booking;

      // The supplier re-prices at booking time; charge what it will charge,
      // once the customer has accepted any change.
      const chargedConvenienceFee = booking.convenienceFee ?? convenienceFee;
      const chargeAmount = (booking.confirmedTotalAmount ?? totalAmount - convenienceFee) + chargedConvenienceFee;
      if (Math.round(chargeAmount) !== Math.round(totalAmount)) {
        const accepted = await new Promise<boolean>((resolve) => setPriceChange({ from: totalAmount, to: chargeAmount, resolve }));
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
        prefill: { email: checkout.email, contact: checkout.mobile },
      });

      setPayState('verifying');
      const verified = await verifyPayment.mutateAsync({
        razorpayOrderId: result.razorpay_order_id,
        razorpayPaymentId: result.razorpay_payment_id,
        razorpaySignature: result.razorpay_signature,
      });
      if (verified.status !== 'Succeeded') throw new Error('Payment could not be verified. Please try again.');

      const first = legs[0].segments[0];
      const lastLeg = legs[legs.length - 1];
      const end = summary.request.tripType === 'RoundTrip' ? legs[0].segments[legs[0].segments.length - 1] : lastLeg.segments[lastLeg.segments.length - 1];
      const destination = summary.request.tripType === 'RoundTrip' && summary.destinationCode ? summary.destinationCode : end.destination;
      onBooked({
        bookingRefNo: booking.bookingRefNo,
        airlinePnr: booking.airlinePnr,
        amount: chargeAmount,
        currencyCode,
        route: `${cityFor(first.origin)} (${first.origin}) → ${cityFor(destination)} (${destination})`,
        breakdown: { ...breakdown, convenienceFee: chargedConvenienceFee, total: chargeAmount },
      });
    } catch (err) {
      setPayState('idle');
      // Razorpay's own failure text ("Please use another method") reads oddly
      // here once its checkout has closed, so checkout outcomes get our wording.
      setError(
        err instanceof RazorpayCheckoutError
          ? err.dismissed
            ? 'Payment cancelled. Your booking was not completed — you can pay again.'
            : "The payment didn't go through. Please try again or use another payment method."
          : (err as Error)?.message || 'Payment was not completed.'
      );
      await releaseSilently(held);
    }
  };

  const busy = payState !== 'idle';

  return (
    <BookingPageWeb sidebar={<FareSummaryWeb breakdown={breakdown} />}>
      <div className="flex flex-col gap-[19px]">
        <div className="max-w-[988px] flex flex-col gap-4">
          <SectionHeading title="Flight details" subtitle={VISA_NOTE} />

          <div className="flex flex-col gap-[17px]">
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="w-full flex items-center gap-3 p-4 bg-white border border-[#98A5BF] rounded-xl text-left"
            >
              <span className="w-9 h-9 shrink-0 rounded overflow-hidden flex items-center justify-center">
                <AirlineLogoWeb airlineCode={legs[0]?.airlineCode ?? ''} size={36} />
              </span>
              <span className="flex-1 min-w-0 flex flex-col">
                <span className="text-[18px] leading-6 font-bold text-[#182339]">{tripTitle(selection)}</span>
                <span className="pt-0.5 max-w-[244px] text-[13px] leading-4 text-[#697691]">{legs[0] ? legLine(legs[0], cabin) : ''}</span>
              </span>
              {expanded ? <ChevronUp size={18} className="text-[#3E4B64]" /> : <ChevronDown size={18} className="text-[#3E4B64]" />}
            </button>

            {expanded ? (
              <div className="bg-white border border-[#98A5BF] rounded-xl">
                {allSegments.map(({ leg, segment }, index) => (
                  <div key={index} className="flex items-start gap-3 p-3.5 border-b border-[#98A5BF]">
                    <span className="w-9 h-9 shrink-0 rounded overflow-hidden flex items-center justify-center">
                      <AirlineLogoWeb airlineCode={segment.airlineCode} size={36} />
                    </span>
                    <span className="flex flex-col">
                      <span className="text-[13px] leading-4 text-[#697691]">
                        {segment.airlineName || leg.airlineName} · {segment.airlineCode} · {segment.flightNumber}
                      </span>
                      <span className="pt-0.5 text-[16px] leading-6 font-bold text-[#182339]">
                        {segment.origin} {formatTime24(segment.departureDateTime)} – {segment.destination} {formatTime24(segment.arrivalDateTime)}
                      </span>
                      <span className="pt-[3px] text-[12px] leading-4 text-[#697691]">{legLine(leg, cabin, segment.departureDateTime)}</span>
                    </span>
                  </div>
                ))}
                <div className="flex flex-col items-end gap-4 px-4 pt-4 pb-4">
                  <div className="w-full flex flex-col gap-2">
                    <div className="flex items-end justify-between">
                      <h2 className="text-[18px] leading-6 font-bold text-black">Traveller details</h2>
                      <button type="button" onClick={onEditTravellers} disabled={busy} className="text-[15px] leading-5 font-medium text-[#7C1AEE]">
                        Edit
                      </button>
                    </div>
                    <Separator />
                  </div>
                  <div className="w-full">
                    <SelectedTravellersWeb groups={travellerGroups} isSelected={() => true} />
                  </div>
                  <Separator className="w-full" />
                  <p className="w-full text-[13px] leading-4 font-medium text-black">{sentTo}</p>
                </div>
              </div>
            ) : (
              <p className="px-[5px] text-[13px] leading-4 font-medium text-black">{sentTo}</p>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex flex-col items-center gap-5">
          <span className="text-[15px] leading-5 font-bold text-[#182339]">Pay using UPI, Cards, or Net Banking.</span>
          <div className="flex items-start gap-4">
            {PAYMENT_LOGOS.map((logo) => (
              <img key={logo.alt} src={logo.src} alt={logo.alt} className="w-[60px] h-9 rounded-md" />
            ))}
          </div>
          <button
            type="button"
            onClick={handlePay}
            disabled={busy}
            className="w-[363px] h-11 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#7C1AEE] text-[15px] leading-5 font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Securely pay {money(totalAmount)}
          </button>
          {busy && <span className="text-[13px] leading-4 text-[#3E4B64]">{PAY_STATE_TEXT[payState as Exclude<PayState, 'idle'>]}</span>}
          {error && <p className="max-w-[460px] text-center text-[13px] leading-4 text-[#C5001F]">{error}</p>}
        </div>
      </div>

      {priceChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full" role="alertdialog" aria-label="Price updated">
            <h3 className="text-[18px] leading-6 font-bold text-[#182339] mb-2">Price updated</h3>
            <p className="text-[15px] leading-5 text-[#3E4B64] mb-5">
              The airline has updated the fare for this booking from {money(priceChange.from)} to{' '}
              <strong className="text-[#182339]">{money(priceChange.to)}</strong>.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => priceChange.resolve(false)} className="h-10 px-4 rounded-lg border border-[#ADB8CD] text-[15px] text-[#3E4B64]">
                Cancel
              </button>
              <button type="button" onClick={() => priceChange.resolve(true)} className="h-10 px-5 rounded-lg bg-[#7C1AEE] text-white text-[15px] font-medium">
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </BookingPageWeb>
  );
};
