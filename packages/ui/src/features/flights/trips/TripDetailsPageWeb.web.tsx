import React, { useState } from 'react';
import { ArrowLeft, Check, CircleAlert, CircleCheck, Clock, Download, Info, Loader2, X } from 'lucide-react';
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
import { AirlineLogoWeb } from '../results/AirlineLogoWeb.web';
import { downloadETicketWeb } from './downloadETicket.web';
import { NoticeDialogWeb } from './NoticeDialogWeb.web';
import { useEscapeKey } from '../useEscapeKey.web';

const RED = '#C8102E';
const GREEN = '#15803D';

function bookingStatus(booking: TripBooking): { title: string; color: string; background: string; icon: 'check' | 'x' | 'clock' } {
  if (booking.localStatus === 'Cancelled') return { title: 'Booking Cancelled', color: RED, background: '#FDECEE', icon: 'x' };
  if (booking.localStatus === 'Released') return { title: 'Hold Released', color: '#4C5973', background: '#F1F3F7', icon: 'x' };
  if (booking.statusId === STATUS_ID_FAILED) return { title: 'Booking Failed', color: RED, background: '#FDECEE', icon: 'x' };
  if (isExpiredHold(booking)) return { title: 'Hold Expired', color: '#4C5973', background: '#F1F3F7', icon: 'x' };
  if (booking.statusId === STATUS_ID_HELD) return { title: 'Booking On Hold', color: '#B45309', background: '#FEF3C7', icon: 'clock' };
  if (booking.statusId === STATUS_ID_TICKETING) return { title: 'Ticketing in progress', color: '#1D4ED8', background: '#E6EEFF', icon: 'clock' };
  return { title: 'Booking Confirmed', color: GREEN, background: '#E7F8EE', icon: 'check' };
}

function initials(first: string, last: string): string {
  return `${first.trim()[0] ?? ''}${last.trim()[0] ?? ''}`.toUpperCase() || '?';
}

const Card: React.FC<{ title?: string; action?: React.ReactNode; children: React.ReactNode }> = ({ title, action, children }) => (
  <section className="bg-white rounded-xl border border-[#E4E7EC] p-5">
    {title && (
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-[#182339]">{title}</h2>
        {action}
      </div>
    )}
    {children}
  </section>
);

// The four "Cancel your booking?" variants, picked by the backend's quote:
// FreeCancellation, NonRefundable (taxes only), PartialRefund and Estimated.
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

  const notice = (q: CancellationQuote) => {
    if (q.variant === 'NonRefundable') {
      return (
        <div className="flex gap-2 rounded-lg bg-[#FEF3E7] p-3 text-sm text-[#C2410C]">
          <CircleAlert size={18} className="shrink-0" />
          The base fare won't be refunded. You'll only get back airport taxes and government fees.
        </div>
      );
    }
    if (q.variant === 'FreeCancellation') {
      return (
        <div className="flex gap-2 rounded-lg bg-[#E7F8EE] p-3 text-sm text-[#15803D]">
          <CircleCheck size={18} className="shrink-0" />
          <span>
            <strong>Free cancellation.</strong> Cancel now to get your full amount back, no fees.
          </span>
        </div>
      );
    }
    return (
      <p className="text-sm text-[#4C5973]">
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
            : 'Airline cancellation fee';
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
    return (
      <div className="rounded-xl bg-[#F8F9FB] p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[#4C5973]">Amount paid</span>
          <span className="text-[#182339]">{money(q.amountPaid)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#4C5973]">{feeLabel}</span>
          {q.cancellationCharges > 0 ? (
            <span className="text-[#182339]">
              {q.isEstimate ? '~ ' : ''}−{money(q.cancellationCharges)}
            </span>
          ) : (
            <span className="text-[#15803D]">{money(0)}</span>
          )}
        </div>
        {other >= 1 && (
          <div className="flex justify-between">
            <span className="text-[#4C5973]">Add-ons &amp; other charges (non-refundable)</span>
            <span className="text-[#182339]">−{money(other)}</span>
          </div>
        )}
        <div className="flex justify-between pt-2 border-t border-[#D3DAE5] font-semibold">
          <span className="text-[#182339]">{refundLabel}</span>
          <span className="text-[#15803D] text-base">
            {q.isEstimate ? '~ ' : ''}
            {money(q.refundAmount)}
          </span>
        </div>
        <p className="flex gap-1.5 text-xs text-[#697691]">
          {q.isEstimate && <Info size={13} className="shrink-0 mt-0.5" />}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => !cancel.isPending && onClose()}>
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md space-y-4" role="dialog" aria-label="Cancel your booking?" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} disabled={cancel.isPending} aria-label="Close" className="absolute right-4 top-4 p-1 rounded hover:bg-[#F1F3F7]">
          <X size={20} />
        </button>
        <div>
          <h3 className="text-lg font-semibold text-[#182339]">Cancel your booking?</h3>
          {first && (
            <p className="flex items-center gap-2 text-sm text-[#4C5973]">
              {routeTitle(booking)} · {formatShortDate(first.travelDate)}
              {quote.data?.variant === 'NonRefundable' && (
                <span className="px-2 py-0.5 rounded-full bg-[#FDECEE] text-[11px] font-semibold text-[#C8102E]">Non-refundable fare</span>
              )}
            </p>
          )}
        </div>
        {quote.isLoading ? (
          <div className="flex flex-col items-center py-6 text-sm text-[#697691]">
            <Loader2 size={28} className="animate-spin text-[#7C1AEE] mb-3" />
            Checking your refund with the airline…
          </div>
        ) : quote.isError || !quote.data ? (
          <div className="flex gap-2 rounded-lg bg-[#FEF3E7] p-3 text-sm text-[#C2410C]">
            <CircleAlert size={18} className="shrink-0" />
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
        {error && <p className="text-sm text-[#C8102E]">{error}</p>}
        <div className="flex gap-3">
          <button type="button" onClick={onClose} disabled={cancel.isPending} className="flex-1 py-2.5 rounded-lg border border-[#D5DAE3] text-sm font-medium text-[#182339]">
            Keep booking
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={cancel.isPending || quote.isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#C8102E] text-white text-sm font-medium disabled:opacity-60"
          >
            {cancel.isPending && <Loader2 size={16} className="animate-spin" />}
            Cancel Booking
          </button>
        </div>
      </div>
    </div>
  );
};

// One booking (adapted from the mobile Flight Details screen): flights,
// status, passengers, fare paid, e-ticket download and cancel / release.
export const TripDetailsPageWeb: React.FC<{ tripBookingId: string; onBack: () => void }> = ({ tripBookingId, onBack }) => {
  const { data, isLoading, isError, refetch } = useTripBookingDetailsMobile(tripBookingId);
  const releaseHold = useCancelTripBookingMobile();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [confirmRelease, setConfirmRelease] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [notice, setNotice] = useState<{ title: string; text: string } | null>(null);

  const back = (
    <button type="button" onClick={onBack} className="flex items-center gap-2 text-sm font-medium text-[#4C5973] hover:text-[#7C1AEE]">
      <ArrowLeft size={18} /> My Trips
    </button>
  );

  if (isLoading || isError || !data) {
    return (
      <div className="max-w-[880px] mx-auto px-6 py-8 space-y-5">
        {back}
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

  return (
    <div className="max-w-[880px] mx-auto px-6 py-8 space-y-4">
      {back}

      <div className="flex items-center gap-3 rounded-xl p-4" style={{ backgroundColor: status.background }}>
        <span className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: status.color }}>
          <StatusIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
        </span>
        <div style={{ color: status.color }}>
          <div className="text-base font-semibold">{status.title}</div>
          <div className="text-sm">
            Booking ID · <strong>{booking.bookingRefNo}</strong>
            {booking.airlinePnr && (
              <>
                {'  ·  PNR '}
                <strong>{booking.airlinePnr}</strong>
              </>
            )}
          </div>
        </div>
      </div>

      <Card title={routeTitle(booking)}>
        <div className="divide-y divide-[#E4E7EC]">
          {lines.map((line) => (
            <div key={line.key} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              <AirlineLogoWeb airlineCode={line.airlineCode} size={36} />
              <div className="flex-1">
                {lines.length > 1 && (
                  <div className="text-[11px] font-semibold text-[#7C1AEE]">{line.legIndex === 0 ? 'ONWARD' : 'RETURN'}</div>
                )}
                <div className="text-xs text-[#697691]">
                  {line.airlineName} · {line.airlineCode} · {line.flightNumber}
                </div>
                <div className="text-sm font-semibold text-[#182339]">{line.title}</div>
                {line.meta && <div className="text-xs text-[#697691]">{line.meta}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4 items-start">
        <Card title={`Passengers (${passengers.length})`}>
          <div className="space-y-3">
            {passengers.map((p, index) => (
              <div key={`${p.name}-${index}`} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-full bg-[#F5F0FF] text-[#7C1AEE] text-sm font-semibold flex items-center justify-center">{p.ini}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-[#182339]">{p.name}</div>
                  {p.type && <div className="text-xs text-[#697691]">{p.type}</div>}
                </div>
                {booking.localStatus === 'Active' && !isHeld && booking.statusId !== STATUS_ID_FAILED && <Check size={18} className="text-[#15803D]" />}
              </div>
            ))}
          </div>
        </Card>

        <Card title="Fare details" action={<span className="text-sm text-[#99A6C0]">View invoice</span>}>
          <div className="space-y-2 text-sm">
            {data.baseFare != null && (
              <div className="flex justify-between">
                <span className="text-[#4C5973]">Base fare</span>
                <span className="text-[#182339]">{money(data.baseFare)}</span>
              </div>
            )}
            {data.taxesAndFees != null && (
              <div className="flex justify-between">
                <span className="text-[#4C5973]">Taxes &amp; fees</span>
                <span className="text-[#182339]">{money(data.taxesAndFees)}</span>
              </div>
            )}
            {data.baseFare != null && data.taxesAndFees != null && data.totalPaid - data.baseFare - data.taxesAndFees >= 1 && (
              <div className="flex justify-between">
                <span className="text-[#4C5973]">Add-ons &amp; other charges</span>
                <span className="text-[#182339]">{money(data.totalPaid - data.baseFare - data.taxesAndFees)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-[#E4E7EC] font-semibold">
              <span className="text-[#182339]">{isHeld ? 'Amount due' : 'Total paid'}</span>
              <span className="text-[#182339]">{money(data.totalPaid)}</span>
            </div>
            {booking.localStatus === 'Cancelled' && (
              <div className="flex justify-between">
                <span className="text-[#4C5973]">Refund</span>
                {booking.refundAmount != null ? (
                  <span className="font-semibold text-[#15803D]">{money(booking.refundAmount)}</span>
                ) : (
                  <span className="font-semibold text-[#B45309]">Being processed</span>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {!data.supplierDetailsAvailable && booking.statusId !== STATUS_ID_FAILED && (
        <p className="flex items-center gap-2 text-xs text-[#697691]">
          <CircleAlert size={14} /> Live flight details from the airline are unavailable right now.
        </p>
      )}

      {(showTicket || showCancel) && (
        <div className="flex gap-3">
          {showTicket && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium disabled:opacity-60"
            >
              {downloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              Download E-Ticket
            </button>
          )}
          {showCancel && (
            <button
              type="button"
              onClick={() => (isHeld ? setConfirmRelease(true) : setCancelOpen(true))}
              disabled={releaseHold.isPending}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-[#C8102E] text-[#C8102E] text-sm font-medium disabled:opacity-60"
            >
              {releaseHold.isPending && <Loader2 size={16} className="animate-spin" />}
              {isHeld ? 'Release Hold' : 'Cancel Booking'}
            </button>
          )}
        </div>
      )}

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
