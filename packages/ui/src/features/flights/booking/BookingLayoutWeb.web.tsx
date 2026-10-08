import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp } from 'lucide-react';
import type { FlightOffer } from '../useSearchFlightsMobile';
import { formatPrice } from '../logic/flightResults';
import { ADD_ON_LABELS, legBaseFare, type AddOnCategory, type AddOnSelection } from '../logic/booking';

// Shared pieces of the Web Dev booking pages (Desktop-17 traveller details,
// Desktop-19/20 payment, Desktop-21 payment successful).

export interface FareBreakdown {
  currencyCode: string;
  // null when the supplier didn't split the fare into base and taxes.
  baseFare: number | null;
  taxes: number | null;
  flightTotal: number;
  addOns: { label: string; amount: number }[];
  // GoVoylo's convenience fee, included in total.
  convenienceFee: number;
  total: number;
  // "For 2 adults, 1 child"
  paxText: string;
}

export function buildFareBreakdown(
  legs: FlightOffer[],
  addOns: AddOnSelection[],
  paxText: string,
  convenienceFee = 0
): FareBreakdown {
  const currencyCode = legs[0]?.currencyCode ?? 'INR';
  const flightTotal = legs.reduce((sum, leg) => sum + leg.totalAmount, 0);
  const baseKnown = legs.length > 0 && legs.every((leg) => legBaseFare(leg) > 0);
  const baseFare = baseKnown ? legs.reduce((sum, leg) => sum + legBaseFare(leg), 0) : null;
  const groups = (['seat', 'meal', 'baggage'] as AddOnCategory[])
    .map((category) => ({
      label: ADD_ON_LABELS[category],
      amount: addOns.filter((s) => s.category === category).reduce((sum, s) => sum + s.amount, 0),
    }))
    .filter((g) => g.amount > 0);
  const addOnTotal = groups.reduce((sum, g) => sum + g.amount, 0);
  return {
    currencyCode,
    baseFare,
    taxes: baseFare != null ? flightTotal - baseFare : null,
    flightTotal,
    addOns: groups,
    convenienceFee,
    total: flightTotal + addOnTotal + convenienceFee,
    paxText,
  };
}

const LineRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-[13px] border-b border-[#98A5BF] text-[13px] leading-4 text-[#182339]">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

// Fare summary sidebar ("Container:margin", 295 wide at x=32): line rows,
// an expandable Add-Ons row with grey sub-rows, then Net Payable Amount.
export const FareSummaryWeb: React.FC<{ breakdown: FareBreakdown }> = ({ breakdown }) => {
  const [addOnsOpen, setAddOnsOpen] = useState(true);
  const money = (amount: number) => formatPrice(amount, breakdown.currencyCode);
  const addOnTotal = breakdown.addOns.reduce((sum, g) => sum + g.amount, 0);
  return (
    <aside className="w-[295px] shrink-0 p-[2px] bg-white">
      <div className="min-h-[485px] flex flex-col px-[18px] border border-[#98A5BF] rounded-[2px]">
        {breakdown.baseFare != null && breakdown.taxes != null ? (
          <>
            <LineRow label="Base Fare" value={money(breakdown.baseFare)} />
            <LineRow label="Total Tax" value={money(breakdown.taxes)} />
          </>
        ) : (
          <LineRow label="Flight Fare (incl. taxes)" value={money(breakdown.flightTotal)} />
        )}
        {breakdown.addOns.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setAddOnsOpen((v) => !v)}
              aria-expanded={addOnsOpen}
              className="flex items-center gap-1 py-[13px] border-b border-[#98A5BF] text-[13px] leading-4 text-[#182339] text-left"
            >
              <span className="flex-1">Add-Ons</span>
              {addOnsOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              <span>{money(addOnTotal)}</span>
            </button>
            {addOnsOpen && (
              <div className="px-[18px] py-1 bg-[#ECEEF3] border-b border-[#98A5BF]">
                {breakdown.addOns.map((g, index) => (
                  <div
                    key={g.label}
                    className={`flex items-center justify-between py-[9px] text-[13px] leading-4 text-[#3E4B64] ${
                      index < breakdown.addOns.length - 1 ? 'border-b border-[#98A5BF]' : ''
                    }`}
                  >
                    <span>{g.label}</span>
                    <span>{money(g.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {breakdown.convenienceFee > 0 && <LineRow label="Convenience Fee" value={money(breakdown.convenienceFee)} />}
        <div className="pt-[2px]">
          <div className="flex items-center justify-between pt-4 pb-2 border-t border-[#7C8CAD]">
            <span className="text-[13px] leading-4 font-bold text-[#182339]">Net Payable Amount</span>
            <span className="text-[15px] leading-5 font-bold text-[#182339]">{money(breakdown.total)}</span>
          </div>
        </div>
        <p className="pt-2 pb-[14px] text-[11px] leading-4 text-[#697691]">
          {breakdown.paxText}. The airline confirms the final fare when your seats are held.
        </p>
      </div>
    </aside>
  );
};

// Page frame: fare summary at x=32 (31px under the header), the 1055px main
// column at x=353 (26px under the header).
export const BookingPageWeb: React.FC<{ sidebar?: React.ReactNode; children: React.ReactNode }> = ({ sidebar, children }) => (
  <div className="max-w-[1440px] mx-auto px-8 pt-[22px] pb-16 flex items-start gap-[26px]">
    {sidebar && <div className="mt-[5px] sticky top-4">{sidebar}</div>}
    <div className="flex-1 min-w-0 max-w-[1055px]">{children}</div>
  </div>
);

export const Separator: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`py-px ${className}`}>
    <div className="h-px bg-[#CCD3E0]" />
  </div>
);

// "Frame 166": 18/24 bold title, 15/20 medium subtitle, then a separator.
export const SectionHeading: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <div className="w-full flex flex-col gap-2">
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-[3px]">
        <h2 className="text-[18px] leading-6 font-bold text-black">{title}</h2>
        {subtitle && <p className="text-[15px] leading-5 font-medium text-black">{subtitle}</p>}
      </div>
      {action}
    </div>
    <Separator />
  </div>
);

// 24px checkbox with the 20px #ADB8CD rounded shape.
export const CheckboxWeb: React.FC<{ checked: boolean; onChange?: () => void; label: string; disabled?: boolean }> = ({
  checked,
  onChange,
  label,
  disabled,
}) => (
  <button
    type="button"
    role="checkbox"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={onChange}
    className="w-6 h-6 shrink-0 flex items-center justify-center disabled:cursor-default"
  >
    <span
      className={`w-5 h-5 rounded-md border flex items-center justify-center ${
        checked ? 'bg-[#7C1AEE] border-[#7C1AEE]' : 'bg-white border-[#ADB8CD]'
      }`}
    >
      {checked && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
    </span>
  </button>
);

// Inputs from the form frames: 40px high, 1px #ADB8CD, 8px radius, 16px text.
export const fieldInputClass =
  'w-full h-10 px-3 rounded-lg border border-[#ADB8CD] bg-white text-[16px] leading-5 text-[#182339] placeholder:text-[#697691] focus:outline-none focus:border-[#7C1AEE]';

export const FieldWeb: React.FC<{ label: string; className?: string; children: React.ReactNode }> = ({ label, className = '', children }) => (
  <label className={`flex flex-col gap-1 ${className}`}>
    <span className="text-[15px] leading-5 font-medium text-[#182339]">{label}</span>
    {children}
  </label>
);

export const SubHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="text-[18px] leading-6 font-bold text-black">{children}</h3>
);
