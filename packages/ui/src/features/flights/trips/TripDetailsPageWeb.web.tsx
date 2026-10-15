import React, { useState } from 'react';
import { Check, CircleAlert, CircleCheck, CircleX, Clock, Download, Info, Loader2, Plane, X } from 'lucide-react';
import {
  useCancelTripBookingMobile,
  useCancellationQuoteMobile,
  useTripBookingDetailsMobile,
  type CancellationQuote,
  type TripBooking,
} from '../useMyTripsMobile';
import {
  REFUND_DESTINATION,
  STATUS_ID_FAILED,
  STATUS_ID_HELD,
  STATUS_ID_TICKETING,
  canCancel,
  eTicketUnavailableReason,
  flightLines,
  formatCurrency,
  formatShortDate,
  isExpiredHold,
  routeTitle,
} from '../logic/myTrips';
import { tripFareRows } from '../logic/booking';
import { downloadETicketWeb } from './downloadETicket.web';
import { NoticeDialogWeb } from './NoticeDialogWeb.web';
import { useEscapeKey } from '../useEscapeKey.web';
import { TripsTitleBlockWeb } from './TripsTitleBlockWeb.web';
import { showComingSoon } from '../../../components/comingSoon.web';

const RED = '#C8102E';
const GREEN = '#15803D';

function bookingStatus(booking: TripBooking): { title: string; color: string; background: string; icon: 'check' | 'x' | 'clock' } {
  if (booking.localStatus === 'Cancelled') return { title: 'Booking Cancelled', color: RED, background: '#FDECEE', icon: 'x' };
  if (booking.localStatus === 'Released') return { title: 'Hold Released', color: '#4C5973', background: '#F1F3F7', icon: 'x' };
  if (booking.statusId === STATUS_ID_FAILED) return { title: 'Booking Failed', color: RED, background: '#FDECEE', icon: 'x' };
  if (isExpiredHold(booking)) return { title: 'Hold Expired', color: '#4C5973', background: '#F1F3F7', icon: 'x' };
  if (booking.statusId === STATUS_ID_HELD) return { title: 'Booking On Hold', color: '#B45309', background: '#FEF3C7', icon: 'clock' };
  if (booking.statusId === STATUS_ID_TICKETING) return { title: 'Ticketing in progress', color: '#1D4ED8', background: '#E6EEFF', icon: 'clock' };
  return { title: 'Booking confirmed', color: '#006219', background: '#E8FFEE', icon: 'check' };
}

function initials(first: string, last: string): string {
  return `${first.trim()[0] ?? ''}${last.trim()[0] ?? ''}`.toUpperCase() || '?';
}

// The four "Cancel your booking?" variants, picked by the backend's quote:
// FreeCancellation, NonRefundable (taxes only), PartialRefund and Estimated —
// Web Dev "CancellationCard" (568px, 12px radius, #ECEEF3 breakdown box).
const CANCEL_SHADOW =
  '0 8px 24px -5px rgba(79,94,113,0.1), 0 5px 16px -3px rgba(79,94,113,0.12), 0 1px 4px rgba(79,94,113,0.12), 0 0 1px rgba(41,47,55,0.3)';

const CancelBookingDialogWeb: React.FC<{
  booking: TripBooking;
  onClose: () => void;
  onCancelled: (refundAmount: number | null) => void;
}> = ({ booking, onClose, onCancelled }) => {
  const quote = useCancellationQuoteMobile(booking.id, true);
  const cancel = useCancelTripBookingMobile();
  const [error, setError] = useState('');
  const money = (amount: number) => formatCurrency(amount, booking.currencyCode);
  const first = [...booking.legs].sort((a, b) => a.legIndex - b.legIndex)[0];
  useEscapeKey(onClose, !cancel.isPending);

  // Coloured notice box (non-refundable / free cancellation), or the plain line.
  const notice = (q: CancellationQuote) => {
    if (q.variant === 'NonRefundable') {
      return (
        <div className="mt-4 min-h-[85px] flex gap-3 rounded-[8px] bg-[#FFF3E8] pl-[15px] pr-4 py-[14px] text-[15px] leading-5 text-[#9F4D00]">
          <CircleAlert size={16} strokeWidth={1.33} className="shrink-0 mt-[2px]" />
          <span>The base fare won't be refunded. You'll only get back airport taxes and government fees.</span>
        </div>
      );
    }
    if (q.variant === 'FreeCancellation') {
      return (
        <div className="mt-4 min-h-[85px] flex gap-3 rounded-[8px] bg-[#E8FFEE] pl-[15px] pr-4 py-[14px] text-[15px] leading-5 text-[#006219]">
          <CircleCheck size={16} strokeWidth={1.33} className="shrink-0 mt-[2px]" />
          <span>
            <strong>Free cancellation.</strong> Cancel now to get your full amount back, no fees.
          </span>
        </div>
      );
    }
    return (
      <p className="mt-[15px] text-[15px] leading-5 text-[#697691]">
        {q.variant === 'Estimated'
          ? "This action can't be undone. The airline sets the final refund, so this is our best estimate."
          : "This action can't be undone. Based on your fare rules, here's what you'll get back."}
      </p>
    );
  };

  const breakdown = (q: CancellationQuote) => {
    const feeLabel =
      q.variant === 'NonRefundable'
        ? 'Base fare (non-refundable)'
        : q.variant === 'FreeCancellation'
          ? 'Cancellation fees'
          : q.variant === 'Estimated'
            ? 'Est. airline cancellation fee'
            : 'Cancellation fees';
    const refundLabel =
      q.variant === 'NonRefundable'
        ? 'Taxes refunded to you'
        : q.variant === 'FreeCancellation'
          ? 'Full refund to you'
          : q.variant === 'Estimated'
            ? 'Estimated refund'
            : 'Refund to you';
    // Whatever is neither refunded nor the airline's fee (add-ons, fees).
    const other = q.amountPaid - q.cancellationCharges - q.refundAmount;
    const line = (label: string, value: React.ReactNode) => (
      <div className="flex items-center justify-between text-[13px] leading-4 text-[#182339]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
    );
    return (
      <div className="mt-[17px] rounded-[8px] bg-[#ECEEF3] px-4 pt-4 pb-4">
        <div className="flex flex-col gap-4">
          {line('Amount paid', money(q.amountPaid))}
          {line(
            feeLabel,
            q.cancellationCharges > 0 ? `${q.isEstimate ? '~ ' : ''}−${money(q.cancellationCharges)}` : money(0)
          )}
          {other >= 1 && line('Add-ons & other charges (non-refundable)', `−${money(other)}`)}
        </div>
        <div className="mt-2 h-[1.5px] bg-[#98A5BF]" />
        <div className="mt-[9px] h-[30px] flex items-center justify-between">
          <span className="text-[15px] leading-5 font-bold text-[#182339]">{refundLabel}</span>
          <span className="text-[24px] leading-[30px] font-bold text-[#007F20]">
            {q.isEstimate ? '~ ' : ''}
            {money(q.refundAmount)}
          </span>
        </div>
        <p className="mt-[9px] flex gap-1.5 text-[13px] leading-4 text-[#697691]">
          {q.isEstimate && <Info size={13} className="shrink-0 mt-px" />}
          {q.isEstimate
            ? "We'll confirm the final amount once the airline processes the cancellation. Refund goes to your original payment method."
            : REFUND_DESTINATION}
        </p>
      </div>
    );
  };

  const confirm = () => {
    setError('');
    cancel.mutate(
      { tripBookingId: booking.id },
      {
        onSuccess: (result) => onCancelled(result.refundAmount),
        onError: (err) => setError((err as Error)?.message || 'Could not cancel this booking. Please try again.'),
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(24,35,57,0.4)] font-['Inter',sans-serif]"
      onClick={() => !cancel.isPending && onClose()}
    >
      <div
        className="relative w-[568px] max-w-[calc(100%-32px)] bg-white rounded-[12px] border border-[#98A5BF] px-[17px] pt-[18px] pb-[18px]"
        style={{ boxShadow: CANCEL_SHADOW }}
        role="dialog"
        aria-label="Cancel your booking?"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={cancel.isPending}
          aria-label="Close"
          className="absolute right-[17px] top-[17px] w-5 h-5 flex items-center justify-center text-[#182339]"
        >
          <X size={20} strokeWidth={1.67} />
        </button>
        <h3 className="mt-[35.7px] text-[18px] leading-6 font-bold text-[#182339]">Cancel your booking?</h3>
        {first && (
          <p className="mt-4 h-5 flex items-center gap-[9px] text-[13px] leading-5">
            <span>
              <span className="font-bold text-[#182339]">{routeTitle(booking)}</span>
              <span className="text-[#3E4B64]"> · {formatShortDate(first.travelDate)}</span>
            </span>
          </p>
        )}
        {quote.data?.variant === 'NonRefundable' && (
          <span className="mt-4 inline-flex h-[22px] items-center px-[11px] rounded-[11px] bg-[#FFE8EC] text-[12px] leading-4 font-medium text-[#C5001F]">
            Non-refundable fare
          </span>
        )}
        {quote.isLoading ? (
          <div className="flex flex-col items-center py-8 text-[13px] text-[#697691]">
            <Loader2 size={28} className="animate-spin text-[#7C1AEE] mb-3" />
            Checking your refund with the airline…
          </div>
        ) : quote.isError || !quote.data ? (
          <div className="mt-4 flex gap-3 rounded-[8px] bg-[#FFF3E8] pl-[15px] pr-4 py-[14px] text-[15px] leading-5 text-[#9F4D00]">
            <CircleAlert size={16} strokeWidth={1.33} className="shrink-0 mt-[2px]" />
            <span>
              {(quote.error as Error)?.message || "We couldn't get the refund amount right now."} You can still cancel — the refund
              will follow the airline's fare rules.
            </span>
          </div>
        ) : (
          <>
            {notice(quote.data)}
            {breakdown(quote.data)}
          </>
        )}
        {error && <p className="mt-3 text-[13px] text-[#C5001F]">{error}</p>}
        <button
          type="button"
          onClick={() => showComingSoon('Fare rules after booking')}
          className="mt-4 text-[13px] leading-4 font-medium text-[#114BFF] underline underline-offset-[3px]"
        >
          View fare rules
        </button>
        <div className="mt-[15px] flex gap-[7px]">
          <button
            type="button"
            onClick={onClose}
            disabled={cancel.isPending}
            className="w-[263px] h-11 rounded-[8px] bg-[#CCD3E0] text-[15px] leading-5 text-[#182339]"
          >
            Keep Booking
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={cancel.isPending || quote.isLoading}
            className="flex-1 h-11 flex items-center justify-center gap-2 rounded-[8px] bg-[#C5001F] text-white text-[14px] leading-5 font-bold disabled:opacity-60"
          >
            {cancel.isPending && <Loader2 size={16} className="animate-spin" />}
            Cancel booking
          </button>
        </div>
      </div>
    </div>
  );
};

// One booking — Web Dev Desktop-29 "Flight Details": the My Trips title block,
// then one 1001px "Booking details" card: flight rows, status banner,
// passengers, fare details, e-ticket download and cancel / release.
export const TripDetailsPageWeb: React.FC<{ tripBookingId: string; onBack: () => void; onHome?: () => void }> = ({
  tripBookingId,
  onBack,
  onHome,
}) => {
  const { data, isLoading, isError, refetch } = useTripBookingDetailsMobile(tripBookingId);
  const releaseHold = useCancelTripBookingMobile();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState<{ title: string; text: string } | null>(null);

  const titleBlock = (
    <TripsTitleBlockWeb onHome={onHome ?? onBack} onBookings={onBack} current="Flight Details" heading="Flight Details" />
  );

  if (isLoading || isError || !data) {
    return (
      <div className="pb-16 font-['Inter',sans-serif]">
        {titleBlock}
        <div className="flex justify-center py-20 text-[#4C5973]">
          {isLoading ? (
            <Loader2 size={28} className="animate-spin text-[#7C1AEE]" />
          ) : (
            <span>
              We couldn't load this booking.{' '}
              <button type="button" onClick={() => refetch()} className="text-[#7C1AEE] font-medium hover:underline">
                Try again
              </button>
            </span>
          )}
        </div>
      </div>
    );
  }

  const { booking } = data;
  const convenienceFee = booking.convenienceFee ?? 0;
  const status = bookingStatus(booking);
  const StatusIcon = status.icon === 'check' ? Check : status.icon === 'clock' ? Clock : X;
  const lines = flightLines(data);
  const passengers =
    data.passengers.length > 0
      ? data.passengers.map((p) => ({ name: `${p.firstName} ${p.lastName}`.trim(), type: p.paxType as string, ini: initials(p.firstName, p.lastName) }))
      : booking.passengerNames
          .split(',')
          .map((n) => n.trim())
          .filter(Boolean)
          .map((name) => {
            const parts = name.split(/\s+/);
            return { name, type: '', ini: initials(parts[0] ?? '', parts[parts.length - 1] ?? '') };
          });
  const isHeld = booking.statusId === STATUS_ID_HELD;
  const showCancel = canCancel(booking);
  const showTicket = !isHeld && booking.localStatus === 'Active' && booking.statusId !== STATUS_ID_FAILED && !isExpiredHold(booking);
  const money = (amount: number) => formatCurrency(amount, booking.currencyCode);

  const handleDownload = async () => {
    const reason = eTicketUnavailableReason(booking);
    if (reason) return setNotice({ title: 'E-ticket not ready', text: reason });
    setDownloading(true);
    try {
      await downloadETicketWeb(booking.id, booking.bookingRefNo);
    } catch (err) {
      setNotice({ title: 'Could not download the e-ticket', text: (err as Error)?.message || 'Please try again.' });
    } finally {
      setDownloading(false);
    }
  };

  const release = () => {
    setConfirmRelease(false);
    releaseHold.mutate(
      { tripBookingId: booking.id },
      { onError: (err) => setNotice({ title: 'Could not release the hold', text: (err as Error)?.message || 'Please try again.' }) }
    );
  };

  const row = (label: string, value: React.ReactNode, strong = false) => (
    <div className="flex items-center justify-between">
      <span className={strong ? 'text-[15px] leading-5 font-bold text-[#182339]' : 'text-[13px] leading-4 text-[#182339]'}>{label}</span>
      <span className={strong ? 'text-[16px] leading-5 font-bold text-[#182339]' : 'text-[13px] leading-4 text-[#182339]'}>{value}</span>
    </div>
  );
  const fareRows = tripFareRows(data);

  return (
    <div className="pb-16 font-['Inter',sans-serif]">
      {titleBlock}

      <div className="max-w-[1440px] mx-auto">
        <section className="relative mt-16 ml-[35px] w-[1001px] max-w-[calc(100%-70px)] bg-white rounded-[12px] border border-[#98A5BF] px-4 pt-[15px] pb-[15px]">
          <button
            type="button"
            onClick={onBack}
            aria-label="Close"
            className="absolute right-4 top-[17px] w-[39px] h-[39px] rounded-full border border-[#98A5BF] flex items-center justify-center text-[#182339]"
          >
            <CircleX size={20} strokeWidth={2} />
          </button>
          <h3 className="pl-px text-[18px] leading-6 font-bold text-[#182339]">Booking details</h3>
          <p className="mt-[3px] pl-px text-[13px] leading-4 text-[#697691]">Flight · {booking.bookingRefNo}</p>

          {/* Flights: one bordered row per flight. */}
          <div className="mt-[16.5px] flex flex-col gap-2">
            {lines.map((line) => (
              <div key={line.key} className="h-[85px] flex items-center gap-3 pl-3 pr-4 rounded-[8px] border border-[#98A5BF]">
                <span className="w-10 h-10 shrink-0 rounded-[8px] bg-[#182339] flex items-center justify-center text-white">
                  <Plane size={18} strokeWidth={2} />
                </span>
                <div className="min-w-0">
                  <div className="text-[12.5px] leading-4 text-[#697691]">
                    {lines.length > 1 && <span className="font-semibold text-[#7C1AEE]">{line.legIndex === 0 ? 'Onward · ' : 'Return · '}</span>}
                    {line.airlineName} · {line.airlineCode} {line.flightNumber}
                  </div>
                  <div className="mt-[3px] text-[16px] leading-5 font-bold text-[#182339]">{line.title}</div>
                  {line.meta && <div className="mt-[3px] text-[13px] leading-4 text-[#697691]">{line.meta}</div>}
                </div>
              </div>
            ))}
          </div>

          {/* Status banner. */}
          <div className="mt-4 h-16 flex items-center gap-3 pl-3 rounded-[8px]" style={{ backgroundColor: status.background }}>
            <span className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center" style={{ backgroundColor: status.color === '#006219' ? '#007F20' : status.color }}>
              <StatusIcon size={18} color="#FFFFFF" strokeWidth={2} />
            </span>
            <div style={{ color: status.color }}>
              <div className="text-[15px] leading-5 font-bold">{status.title}</div>
              <div className="mt-[2px] text-[13px] leading-4 font-bold">
                Booking ID · {booking.bookingRefNo}
                {booking.airlinePnr && <> · PNR {booking.airlinePnr}</>}
              </div>
            </div>
          </div>

          {/* Passengers. */}
          <h4 className="mt-[16px] pl-px text-[16px] leading-6 font-bold text-[#182339]">Passengers ({passengers.length})</h4>
          <div className="mt-[6px] flex flex-col gap-2">
            {passengers.map((p, index) => (
              <div key={`${p.name}-${index}`} className="h-10 flex items-center gap-3">
                <span className="w-10 h-10 shrink-0 rounded-full bg-[#F3E8FF] text-[#7C1AEE] text-[13px] leading-4 font-semibold flex items-center justify-center">
                  {p.ini}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[15px] leading-5 font-medium text-[#182339]">{p.name}</div>
                  {p.type && <div className="text-[13px] leading-4 text-[#697691]">{p.type}</div>}
                </div>
                {booking.localStatus === 'Active' && !isHeld && booking.statusId !== STATUS_ID_FAILED && (
                  <Check size={20} strokeWidth={2} className="mr-[-1px] text-[#007F20]" />
                )}
              </div>
            ))}
          </div>

          {/* Fare details. */}
          <h4 className="mt-[18px] pl-px text-[16px] leading-6 font-bold text-[#182339]">Fare details</h4>
          <div className="mt-[11px] flex flex-col gap-3">
            {fareRows.baseFare != null && row('Base fare', money(fareRows.baseFare))}
            {fareRows.taxesAndFees != null && row('Taxes & fees', money(fareRows.taxesAndFees))}
            {fareRows.addOns >= 1 && row('Add-ons & other charges', money(fareRows.addOns))}
            {convenienceFee > 0 && row('Convenience fee', money(convenienceFee))}
            {fareRows.discount > 0 && row('Discount', `−${money(fareRows.discount)}`)}
          </div>
          <div className="mt-[11px] h-px bg-[#98A5BF]" />
          <div className="mt-[11px]">{row(isHeld ? 'Amount due' : 'Total paid', money(data.totalPaid), true)}</div>
          {booking.localStatus === 'Cancelled' && (
            <div className="mt-3">
              {row(
                'Refund',
                booking.refundAmount != null ? (
                  <span className="font-semibold text-[#007F20]">{money(booking.refundAmount)}</span>
                ) : (
                  <span className="font-semibold text-[#B45309]">Being processed</span>
                )
              )}
            </div>
          )}

          {!data.supplierDetailsAvailable && booking.statusId !== STATUS_ID_FAILED && (
            <p className="mt-3 flex items-center gap-2 text-[12px] leading-4 text-[#697691]">
              <CircleAlert size={14} /> Live flight details from the airline are unavailable right now.
            </p>
          )}

          {(showTicket || showCancel) && (
            <div className="mt-[16px] flex gap-4">
              {showTicket && (
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-[466px] h-11 flex items-center justify-center gap-[10px] rounded-[8px] bg-[#7C1AEE] text-white text-[16px] leading-5 font-semibold disabled:opacity-60"
                >
                  {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} strokeWidth={2} />}
                  Download e-ticket
                </button>
              )}
              {showCancel && (
                <button
                  type="button"
                  onClick={() => (isHeld ? setConfirmRelease(true) : setCancelOpen(true))}
                  disabled={releaseHold.isPending}
                  className="flex-1 h-11 flex items-center justify-center gap-2 rounded-[8px] bg-[#FFE8EC] text-[#C5001F] text-[15px] leading-5 font-medium disabled:opacity-60"
                >
                  {releaseHold.isPending && <Loader2 size={16} className="animate-spin" />}
                  {isHeld ? 'Release Hold' : 'Cancel Booking'}
                </button>
              )}
            </div>
          )}
        </section>
      </div>

      {cancelOpen && (
        <CancelBookingDialogWeb
          booking={booking}
          onClose={() => setCancelOpen(false)}
          onCancelled={(refundAmount) => {
            setCancelOpen(false);
            setNotice({
              title: 'Booking cancelled',
              text:
                refundAmount != null
                  ? `${money(refundAmount)} will be refunded to your original payment method within 5–7 working days.`
                  : 'Your refund will be processed to your original payment method within 5–7 working days.',
            });
          }}
        />
      )}
      {confirmRelease && (
        <NoticeDialogWeb
          title="Release this hold?"
          text="This will release the flight hold with the airline. This cannot be undone."
          cancelLabel="Keep it"
          confirmLabel="Release"
          destructive
          onConfirm={release}
          onClose={() => setConfirmRelease(false)}
        />
      )}
      {notice && <NoticeDialogWeb title={notice.title} text={notice.text} onClose={() => setNotice(null)} />}
    </div>
  );
};
