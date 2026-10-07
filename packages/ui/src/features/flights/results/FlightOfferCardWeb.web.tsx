import React from 'react';
import { ChevronRight, Info } from 'lucide-react';
import type { FlightOffer, FlightOfferSegment, FlightSearchSegment } from '../useSearchFlightsMobile';
import {
  airlinesForSegments,
  dayOffset,
  formatPrice,
  formatTime24,
  formatTotalDuration,
  splitOfferByTrip,
  splitSegmentsByLegs,
  stopsLabel,
  type CombinedRoundTripOffer,
} from '../logic/flightResults';
import { AirlineLogoWeb } from './AirlineLogoWeb.web';

export type FeaturedVariant = 'bestValue' | 'cheapest' | 'fastest';

// Strip colours from the "Serach card" component (Best Value is the Web Dev one).
const VARIANT_CONFIG: Record<FeaturedVariant, { color: string; label: string }> = {
  bestValue: { color: '#7C1AEE', label: 'Best Value' },
  cheapest: { color: '#007F20', label: 'Cheapest' },
  fastest: { color: '#114BFF', label: 'Fastest' },
};

// Web Dev Desktop-15 "Serach card": 673 wide, white, 1px border, 4px radius;
// a 16px coloured side strip with the rotated label for featured flights.
const CardShell: React.FC<{ variant?: FeaturedVariant; children: React.ReactNode }> = ({ variant, children }) => {
  const config = variant ? VARIANT_CONFIG[variant] : null;
  return (
    <div
      className="relative w-full bg-white rounded border overflow-hidden"
      style={{ borderColor: config?.color ?? '#CCD3E0' }}
    >
      {config && (
        <div className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center" style={{ backgroundColor: config.color }}>
          <span className="-rotate-90 whitespace-nowrap text-[11px] leading-4 font-medium text-white">{config.label}</span>
        </div>
      )}
      {children}
    </div>
  );
};

// Departure / duration+stops / arrival — the card's "Frame 323" (gap 82px).
const Journey: React.FC<{ segments: FlightOfferSegment[] }> = ({ segments }) => {
  const first = segments[0];
  const last = segments[segments.length - 1];
  const offset = dayOffset(first.departureDateTime, last.arrivalDateTime);
  return (
    <div className="flex items-end gap-[82px] w-[328px] h-[42px]">
      <div className="w-[50px]">
        <div className="text-[13px] leading-[24px] font-bold text-[#182339]">{formatTime24(first.departureDateTime)}</div>
        <div className="pt-0.5 text-[13px] leading-4 text-[#697691]">{first.origin}</div>
      </div>
      <div className="w-16 flex flex-col items-center gap-0.5">
        <div className="pt-0.5 text-[13px] leading-[15px] text-[#697691] whitespace-nowrap">
          {formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}
        </div>
        <div className="w-[60px] border-t border-dashed border-[#697691]" />
        <div className="pt-0.5 text-[13px] leading-[15px] text-[#697691] whitespace-nowrap">{stopsLabel(segments.length - 1)}</div>
      </div>
      <div className="w-[50px] text-right">
        <div className="text-[13px] leading-[24px] font-bold text-[#182339] whitespace-nowrap">
          {formatTime24(last.arrivalDateTime)}
          {offset > 0 && <sup className="text-[9px] font-bold">+{offset}</sup>}
        </div>
        <div className="pt-0.5 text-[13px] leading-4 text-[#697691]">{last.destination}</div>
      </div>
    </div>
  );
};

const LayoverNote: React.FC<{ segments: FlightOfferSegment[]; cityFor: (code: string) => string }> = ({ segments, cityFor }) =>
  segments.length < 2 ? null : (
    <span className="flex items-end gap-1 text-[10px] leading-4 text-[#697691] whitespace-nowrap">
      {formatTotalDuration(segments[0].arrivalDateTime, segments[1].departureDateTime)} Layover at {cityFor(segments[0].destination)}
      {segments.length > 2 && ` +${segments.length - 2}`}
      <Info size={13} />
    </span>
  );

const Price: React.FC<{ amount: number; currency: string }> = ({ amount, currency }) => (
  <div className="text-right text-[13px] leading-5 font-bold text-[#FF8011] whitespace-nowrap">{formatPrice(amount, currency)}</div>
);

// "Flight Details >" link and the small "Book >" button (Frame 424).
const Actions: React.FC<{ onDetails: () => void; onBook: () => void; bookLabel: string }> = ({ onDetails, onBook, bookLabel }) => (
  <div className="flex items-center justify-end gap-6">
    <button type="button" onClick={onDetails} className="flex items-center gap-1 p-2 rounded-lg text-[13px] leading-4 font-medium text-[#7C1AEE]">
      Flight Details <ChevronRight size={16} />
    </button>
    <button
      type="button"
      onClick={onBook}
      className="h-[26px] min-w-[76px] flex items-center justify-center gap-1 px-2 rounded-lg bg-[#7C1AEE] text-[13px] leading-4 font-medium text-white"
    >
      {bookLabel} <ChevronRight size={16} />
    </button>
  </div>
);

export const FlightOfferCardWeb: React.FC<{
  offer: FlightOffer;
  variant?: FeaturedVariant;
  cityFor: (code: string) => string;
  bookLabel: string;
  onDetails: () => void;
  onBook: () => void;
}> = ({ offer, variant, cityFor, bookLabel, onDetails, onBook }) => {
  const flightNumbers = offer.segments.map((s) => `${s.airlineCode}${s.flightNumber}`).join(', ');
  return (
    <CardShell variant={variant}>
      <div className="relative h-[103px]">
        <div className="absolute left-[29px] top-[25px]">
          <AirlineLogoWeb airlineCode={offer.airlineCode} size={24} />
        </div>
        <div className="absolute left-[60px] top-5 max-w-[90px] text-[13px] leading-5 font-medium text-[#182339] truncate">
          {offer.airlineName}
        </div>
        <div className="absolute left-[59px] top-[41px] max-w-[92px] pt-px text-[12px] leading-4 text-[#697691] truncate">
          {flightNumbers}
        </div>
        <div className="absolute left-[155px] top-4">
          <Journey segments={offer.segments} />
        </div>
        <div className="absolute right-[23px] top-[30px]">
          <Price amount={offer.totalAmount} currency={offer.currencyCode} />
        </div>
        <div className="absolute left-2 right-2 top-[66px] border-t border-dashed border-[#E1E5ED]" />
        <div className="absolute left-[29px] top-[75px]">
          <LayoverNote segments={offer.segments} cityFor={cityFor} />
        </div>
        <div className="absolute right-[23px] top-[71px]">
          <Actions onDetails={onDetails} onBook={onBook} bookLabel={bookLabel} />
        </div>
      </div>
    </CardShell>
  );
};

// A leg row inside a multi-leg card: same journey layout, airline on the left.
const LegRow: React.FC<{ label: string; segments: FlightOfferSegment[]; airlineCode?: string }> = ({ label, segments, airlineCode }) => (
  <div className="relative h-[66px]">
    {airlineCode && (
      <div className="absolute left-[29px] top-[21px]">
        <AirlineLogoWeb airlineCode={airlineCode} size={24} />
      </div>
    )}
    <div className="absolute left-[60px] top-3 text-[11px] leading-4 font-semibold text-[#7C1AEE] uppercase">{label}</div>
    <div className="absolute left-[60px] top-[30px] max-w-[90px] text-[13px] leading-5 font-medium text-[#182339] truncate">
      {airlinesForSegments(segments)}
    </div>
    <div className="absolute left-[155px] top-3">
      <Journey segments={segments} />
    </div>
  </div>
);

const MultiLegCard: React.FC<{
  rows: { label: string; segments: FlightOfferSegment[]; airlineCode?: string }[];
  amount: number;
  currency: string;
  variant?: FeaturedVariant;
  onDetails: () => void;
  onBook: () => void;
}> = ({ rows, amount, currency, variant, onDetails, onBook }) => (
  <CardShell variant={variant}>
    <div className="relative">
      {rows.map((row, index) => (
        <div key={index} className={index > 0 ? 'border-t border-dashed border-[#E1E5ED] mx-2 [&>div]:-mx-2' : ''}>
          <LegRow {...row} />
        </div>
      ))}
      <div className="absolute right-[23px] top-[30px]">
        <Price amount={amount} currency={currency} />
      </div>
      <div className="relative h-[39px] mx-2 border-t border-dashed border-[#E1E5ED]">
        <div className="absolute right-[15px] top-[4px]">
          <Actions onDetails={onDetails} onBook={onBook} bookLabel="Book" />
        </div>
      </div>
    </div>
  </CardShell>
);

// Round-trip "Combine Flights" package: onward + return under one price.
export const CombinedOfferCardWeb: React.FC<{
  pair: CombinedRoundTripOffer;
  variant?: FeaturedVariant;
  onDetails: () => void;
  onBook: () => void;
}> = ({ pair, variant, onDetails, onBook }) => {
  const parts = pair.returnOffer ? [pair.onward, pair.returnOffer] : splitOfferByTrip(pair.onward);
  const legs = parts.length > 1 ? parts : [pair.onward];
  return (
    <MultiLegCard
      rows={legs.map((leg, index) => ({
        label: legs.length === 1 ? 'Round trip' : index === 0 ? 'Onward' : 'Return',
        segments: leg.segments,
        airlineCode: leg.airlineCode,
      }))}
      amount={pair.totalAmount}
      currency={pair.currencyCode}
      variant={variant}
      onDetails={onDetails}
      onBook={onBook}
    />
  );
};

// Multi-city "Combine Flights" bundle: one row per requested leg.
export const MultiCityOfferCardWeb: React.FC<{
  offer: FlightOffer;
  legs: FlightSearchSegment[];
  variant?: FeaturedVariant;
  onDetails: () => void;
  onBook: () => void;
}> = ({ offer, legs, variant, onDetails, onBook }) => (
  <MultiLegCard
    rows={splitSegmentsByLegs(offer.segments, legs).map((segments, index) => ({
      label: `Trip ${index + 1}`,
      segments,
      airlineCode: segments[0]?.airlineCode,
    }))}
    amount={offer.totalAmount}
    currency={offer.currencyCode}
    variant={variant}
    onDetails={onDetails}
    onBook={onBook}
  />
);
