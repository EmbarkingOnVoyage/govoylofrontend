import React from 'react';
import { Check } from 'lucide-react';
import { formatPrice } from '../logic/flightResults';
import { FareSummaryWeb, type FareBreakdown } from './BookingLayoutWeb.web';

export interface BookingConfirmation {
  bookingRefNo: string;
  airlinePnr: string | null;
  amount: number;
  currencyCode: string;
  // "Paris (CDG) → Rome (FCO)"
  route?: string;
  breakdown?: FareBreakdown;
}

const ReceiptRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-center justify-between gap-4">
    <span className="text-[14px] leading-5 text-[#697691]">{label}</span>
    {children}
  </div>
);

// Web Dev "Desktop - 21" Payment Successful: the purple tick, a receipt card
// with the trip and booking reference, then View Booking / Back to Home. The
// fare summary keeps its place on the left, as on the other booking pages.
export const BookingConfirmedWeb: React.FC<{
  confirmation: BookingConfirmation;
  onViewBooking: () => void;
  onBackToHome: () => void;
}> = ({ confirmation, onViewBooking, onBackToHome }) => (
  <div className="relative max-w-[1440px] mx-auto px-8 pb-16">
    {confirmation.breakdown && (
      <div className="hidden xl:block absolute left-8 top-[31px]">
        <FareSummaryWeb breakdown={confirmation.breakdown} />
      </div>
    )}
    <div className="mx-auto w-[354px] pt-[74px] flex flex-col items-center">
      <div className="w-[120px] h-[120px] rounded-full bg-[#7C1AEE] flex items-center justify-center shadow-[0px_10px_30px_rgba(124,26,238,0.25)]">
        <Check size={44} color="#FFFFFF" strokeWidth={2.5} />
      </div>
      <h1 className="mt-6 text-[28px] leading-[34px] font-bold text-[#182339] whitespace-nowrap">Payment Successful</h1>
      <p className="mt-2 w-[340px] text-center text-[16px] leading-5 text-[#3E4B64]">
        Your trip is booked and your payment has been confirmed.
      </p>

      <div className="mt-[26px] w-full flex flex-col p-5 bg-white border border-[#E1E5ED] rounded-2xl shadow-[0px_4px_14px_rgba(27,50,73,0.10)]">
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E1E5ED]">
          <div className="min-w-0 flex flex-col">
            <span className="text-[12px] leading-4 font-semibold uppercase text-[#697691]">Trip details</span>
            <span className="text-[16px] leading-6 font-bold text-[#182339]">{confirmation.route ?? 'Your flight'}</span>
          </div>
          <span className="shrink-0 px-2 py-1 rounded-full bg-[#E6F4EA] text-[11px] leading-4 font-bold uppercase text-[#007F20]">
            Confirmed
          </span>
        </div>
        <div className="flex flex-col gap-2 pt-4">
          <ReceiptRow label="Booking Reference">
            <span className="text-[14px] leading-5 font-medium text-[#182339]">#{confirmation.bookingRefNo}</span>
          </ReceiptRow>
          {confirmation.airlinePnr && (
            <ReceiptRow label="Airline PNR">
              <span className="text-[14px] leading-5 font-medium text-[#182339]">{confirmation.airlinePnr}</span>
            </ReceiptRow>
          )}
          <ReceiptRow label="Payment Method">
            <span className="text-[14px] leading-5 font-medium text-[#182339]">Razorpay</span>
          </ReceiptRow>
          <ReceiptRow label="Total Paid">
            <span className="text-[16px] leading-6 font-semibold text-[#7C1AEE]">
              {formatPrice(confirmation.amount, confirmation.currencyCode)}
            </span>
          </ReceiptRow>
        </div>
      </div>

      <button
        type="button"
        onClick={onViewBooking}
        className="mt-9 w-full h-11 flex items-center justify-center rounded-lg bg-[#7C1AEE] text-[16px] leading-5 font-medium text-white hover:opacity-90"
      >
        View Booking
      </button>
      <button type="button" onClick={onBackToHome} className="mt-[29px] text-[16px] leading-5 font-medium text-[#7C1AEE]">
        Back to Home
      </button>
    </div>
  </div>
);
