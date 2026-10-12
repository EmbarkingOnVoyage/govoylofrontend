import React, { useState } from 'react';
import { Loader2, X } from 'lucide-react';
import type { FlightOffer } from '../useSearchFlightsMobile';
import { useTravellerDetailMobile, type Traveler } from '../../profile/useTravellersMobile';
import { formatTime24, formatTotalDuration, stopsLabel } from '../logic/flightResults';
import { formatTravelerDob, type PaxType } from '../logic/travellers';
import type { AddOnCategory, AddOnSelection } from '../logic/booking';
import { AirlineLogoWeb } from '../results/AirlineLogoWeb.web';
import { useEscapeKey } from '../useEscapeKey.web';

// "Thu, 22 Oct"
export function dayText(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/^(\w+)/, '$1,');
}

// "Thu, 22 Oct · 1 Stop · 21h 10m · Economy"
// (dated by one of its segments in the open card).
export function legLine(leg: FlightOffer, cabin: string, dateIso?: string): string {
  const first = leg.segments[0];
  const last = leg.segments[leg.segments.length - 1];
  const stops = stopsLabel(leg.segments.length - 1).replace(/stops?/, (m) => m[0].toUpperCase() + m.slice(1));
  return `${dayText(dateIso ?? first.departureDateTime)} · ${stops} · ${formatTotalDuration(first.departureDateTime, last.arrivalDateTime)} · ${cabin}`;
}

const PAX_BLOCK: Record<PaxType, string> = { adult: 'Adult', child: 'Child', infant: 'Infant' };

function slashDate(iso: string | null | undefined): string {
  const m = iso?.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : '';
}

const TravellerEntry: React.FC<{ traveller: Traveler; label: string }> = ({ traveller, label }) => {
  const { data: detail } = useTravellerDetailMobile(traveller.id);
  const passport = detail?.passport;
  return (
    <div className="flex flex-col">
      <span className="text-[15px] leading-5">
        <span className="font-medium text-[#182339]">{label}:</span>{' '}
        <span className="text-[#3E4B64]">
          {traveller.firstName} {traveller.lastName}
        </span>
      </span>
      <span className="mt-[2.8px] text-[13px] leading-4 text-[#3E4B64]">
        {passport ? (
          <>
            Passport No.: {passport.maskedPassportNumber},
            <br />
            Expiry Date: {slashDate(passport.expiryDate)}
          </>
        ) : (
          [traveller.gender, formatTravelerDob(traveller.dateOfBirth)].filter(Boolean).join(', ')
        )}
      </span>
    </div>
  );
};

const ADD_ON_ROWS: { category: AddOnCategory; label: string; none: string }[] = [
  { category: 'baggage', label: 'Bags', none: 'None' },
  { category: 'seat', label: 'Seat', none: 'Random' },
  { category: 'meal', label: 'Meal', none: 'None' },
];

// Web Dev "Trip Summary" side panel (521 wide), opened from the payment
// page's pay button: every flight, who's flying, each traveller's add-ons,
// then the total and Pay Now, which starts the payment.
export const TripSummaryPanelWeb: React.FC<{
  legs: FlightOffer[];
  cabin: string;
  travellers: Traveler[];
  paxTypeOf: (t: Traveler) => PaxType;
  addOns: AddOnSelection[];
  total: string;
  busy: boolean;
  status?: string;
  onPay: () => void;
  onClose: () => void;
}> = ({ legs, cabin, travellers, paxTypeOf, addOns, total, busy, status, onPay, onClose }) => {
  const [activeId, setActiveId] = useState(travellers[0]?.id ?? '');
  useEscapeKey(onClose, !busy);

  const segments = legs.flatMap((leg) => leg.segments.map((segment) => ({ leg, segment })));
  const counts: Record<PaxType, number> = { adult: 0, child: 0, infant: 0 };
  const entries = travellers.map((t) => {
    const type = paxTypeOf(t);
    counts[type] += 1;
    return { traveller: t, label: `${PAX_BLOCK[type]} ${counts[type]}` };
  });
  const labelsFor = (travelerId: string, category: AddOnCategory) =>
    addOns
      .filter((a) => a.travelerId === travelerId && a.category === category)
      .sort((a, b) => a.legIndex - b.legIndex)
      .map((a) => a.label)
      .join(',');

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[rgba(24,35,57,0.4)] font-['Inter',sans-serif]" onClick={() => !busy && onClose()}>
      <div
        role="dialog"
        aria-label="Trip Summary"
        className="w-[521px] max-w-full h-full bg-white flex flex-col shadow-[-4px_0px_32px_rgba(24,35,57,0.14)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 h-[54px] border-b border-[#CCD3E0] pl-[33px] pt-[13.8px] flex items-baseline gap-5">
          <h2 className="text-[16px] leading-5 text-[#182339]">Trip Summary</h2>
          <span className="text-[13px] leading-4 text-[#182339] whitespace-pre">
            {travellers.length}  Traveller{travellers.length === 1 ? '' : 's'}
          </span>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="absolute right-[24px] top-[17px] w-5 h-5 flex items-center justify-center text-[#182339]"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-6">
          <h3 className="mt-[16.7px] text-[13px] leading-4 text-[#697691]">Flight Details</h3>
          <div className="mt-[9.3px] border border-[#98A5BF] rounded-xl overflow-hidden">
            {segments.map(({ leg, segment }, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 px-[14px] pt-[13.7px] pb-[14.6px] ${index > 0 ? 'border-t border-[#98A5BF]' : ''}`}
              >
                <span className="mt-[0.3px] w-9 h-9 shrink-0 rounded overflow-hidden flex items-center justify-center">
                  <AirlineLogoWeb airlineCode={segment.airlineCode} size={36} />
                </span>
                <span className="min-w-0 flex flex-col">
                  <span className="text-[13px] leading-4 text-[#697691]">
                    {segment.airlineName || leg.airlineName} · {segment.airlineCode} · {segment.flightNumber}
                  </span>
                  <span className="mt-[2.1px] text-[16px] leading-6 font-bold text-[#182339]">
                    {segment.origin} {formatTime24(segment.departureDateTime)} – {segment.destination} {formatTime24(segment.arrivalDateTime)}
                  </span>
                  <span className="mt-[2.6px] text-[12px] leading-4 text-[#697691]">{legLine(leg, cabin, segment.departureDateTime)}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-[#CCD3E0]" />
          <h3 className="mt-[23.7px] text-[13px] leading-4 text-[#697691]">Traveller Details</h3>
          <div className="mt-[9.75px] flex flex-col gap-[21.25px]">
            {entries.map(({ traveller, label }) => (
              <TravellerEntry key={traveller.id} traveller={traveller} label={label} />
            ))}
          </div>

          <div className="mt-[16.75px] border-t border-[#CCD3E0]" />
          <h3 className="mt-[21.2px] text-[13px] leading-4 text-[#697691]">Add on</h3>
          <div className="mt-[19.5px] flex border-b border-[#98A5BF] overflow-x-auto [scrollbar-width:none]">
            {travellers.map((t) => {
              const active = t.id === activeId;
              const seat = labelsFor(t.id, 'seat');
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={`shrink-0 -mb-px px-[17px] pb-[7.5px] flex flex-col items-start border-b-[3px] text-left ${
                    active ? 'border-[#7C1AEE]' : 'border-transparent'
                  }`}
                >
                  <span className={`text-[13px] leading-4 ${active ? 'text-[#7C1AEE]' : 'text-[#182339]'}`}>{t.firstName}</span>
                  <span
                    className={`mt-[1.8px] text-[11px] leading-[14px] ${seat ? 'font-bold text-[#114BFF]' : 'text-[#697691]'}`}
                  >
                    {seat || 'Random'}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-[13.7px] -mr-[1px] pl-1 flex flex-col gap-4">
            {ADD_ON_ROWS.map((row) => (
              <div key={row.category} className="flex items-start justify-between gap-4 text-[13px] leading-4">
                <span className="text-[#697691]">{row.label}:</span>
                <span className="text-right text-[#182339]">{labelsFor(activeId, row.category) || row.none}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0 h-[84px] pl-[26px] pr-[26px] flex items-start justify-between shadow-[inset_0_4px_6px_rgba(0,0,0,0.25)]">
          <div className="pt-[19.45px] flex flex-col">
            <span className="text-[15px] leading-5 text-[#182339]">Total</span>
            <span className="mt-[0.5px] text-[18px] leading-6 font-bold text-[#7C1AEE]">{total}</span>
            {busy && status && <span className="sr-only">{status}</span>}
          </div>
          <button
            type="button"
            onClick={onPay}
            disabled={busy}
            className="mt-5 w-[242.5px] h-11 rounded-lg bg-[#7C1AEE] flex items-center justify-center gap-2 text-[15px] leading-5 text-white hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            {busy && status ? status : 'Pay Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
