import React from 'react';
import { ChevronRight, Info } from 'lucide-react';
import type { FlightOffer, FlightOfferSegment, FlightSearchSegment } from '../useSearchFlightsMobile';
import {
  SUPPLIER_DISPLAY_NAMES,
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

// Same variant colours as the mobile cards (Figma "Serach card").
const VARIANT_CONFIG: Record<FeaturedVariant, { color: string; label: string }> = {
  bestValue: { color: '#7C1AEE', label: 'Best Value' },
  cheapest: { color: '#007F20', label: 'Cheapest' },
  fastest: { color: '#114BFF', label: 'Fastest' },
};

const CardShell: React.FC<{ variant?: FeaturedVariant; children: React.ReactNode }> = ({ variant, children }) => {
  const config = variant ? VARIANT_CONFIG[variant] : null;
  return (
    <div
      className="flex bg-white rounded-xl border overflow-hidden"
      style={{ borderColor: config?.color ?? '#D5DAE3' }}
    >
      {config && (
        <div className="w-6 shrink-0 flex items-center justify-center" style={{ backgroundColor: config.color }}>
          <span className="text-white text-[10px] font-semibold whitespace-nowrap -rotate-90">{config.label}</span>
        </div>
      )}
      <div className="flex-1 min-w-0 px-5 py-4">{children}</div>
    </div>
  );
};

// Departure – duration/stops – arrival, the middle of every card.
const JourneyColumns: React.FC<{ segments: FlightOfferSegment[] }> = ({ segments }) => {
  const first = segments[0];
  const last = segments[segments.length - 1];
  const offset = dayOffset(first.departureDateTime, last.arrivalDateTime);
  return (
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className="w-16 text-left">
        <div className="text-lg font-semibold text-[#182339]">{formatTime24(first.departureDateTime)}</div>
        <div className="text-xs text-[#697691]">{first.origin}</div>
      </div>
      <div className="flex-1 min-w-[90px] text-center">
        <div className="text-xs text-[#697691]">{formatTotalDuration(first.departureDateTime, last.arrivalDateTime)}</div>
        <div className="border-t border-dashed border-[#99A6C0] my-1" />
        <div className="text-xs text-[#697691]">{stopsLabel(segments.length - 1)}</div>
      </div>
      <div className="w-16 text-right">
        <div className="text-lg font-semibold text-[#182339]">
          {formatTime24(last.arrivalDateTime)}
          {offset > 0 && <sup className="text-[10px] text-[#C8102E] ml-0.5">+{offset}</sup>}
        </div>
        <div className="text-xs text-[#697691]">{last.destination}</div>
      </div>
    </div>
  );
};

const LayoverNote: React.FC<{ segments: FlightOfferSegment[]; cityFor: (code: string) => string }> = ({
  segments,
  cityFor,
}) => {
  if (segments.length < 2) return <span />;
  return (
    <span className="flex items-center gap-1 text-xs text-[#697691]">
      {formatTotalDuration(segments[0].arrivalDateTime, segments[1].departureDateTime)} Layover at{' '}
      {cityFor(segments[0].destination)}
      {segments.length > 2 && ` +${segments.length - 2} more`}
      <Info size={12} />
    </span>
  );
};

const CardActions: React.FC<{ onDetails: () => void; onBook: () => void; bookLabel: string }> = ({
  onDetails,
  onBook,
  bookLabel,
}) => (
  <div className="flex items-center gap-6">
    <button type="button" onClick={onDetails} className="flex items-center text-sm font-medium text-[#7C1AEE] hover:underline">
      Flight Details <ChevronRight size={16} />
    </button>
    <button
      type="button"
      onClick={onBook}
      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium hover:opacity-90"
    >
      {bookLabel} <ChevronRight size={16} />
    </button>
  </div>
);

const SupplierTag: React.FC<{ supplierCode: string }> = ({ supplierCode }) =>
  supplierCode ? (
    <span className="ml-2 px-1.5 py-0.5 rounded bg-[#F1F3F7] text-[10px] text-[#4C5973]">
      {SUPPLIER_DISPLAY_NAMES[supplierCode] ?? supplierCode}
    </span>
  ) : null;

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
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 w-44 min-w-0">
          <AirlineLogoWeb airlineCode={offer.airlineCode} />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#182339] truncate">
              {offer.airlineName}
              <SupplierTag supplierCode={offer.supplierCode} />
            </div>
            <div className="text-xs text-[#697691] truncate">{flightNumbers}</div>
          </div>
        </div>
        <JourneyColumns segments={offer.segments} />
        <div className="w-28 text-right text-lg font-bold text-[#7C1AEE]">
          {formatPrice(offer.totalAmount, offer.currencyCode)}
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-dashed border-[#E4E7EC]">
        <LayoverNote segments={offer.segments} cityFor={cityFor} />
        <CardActions onDetails={onDetails} onBook={onBook} bookLabel={bookLabel} />
      </div>
    </CardShell>
  );
};

const LegRow: React.FC<{ label: string; segments: FlightOfferSegment[]; airlineCode?: string }> = ({
  label,
  segments,
  airlineCode,
}) => (
  <div className="flex items-center gap-6 py-2">
    <div className="flex items-center gap-3 w-44 min-w-0">
      {airlineCode && <AirlineLogoWeb airlineCode={airlineCode} size={24} />}
      <div className="min-w-0">
        <div className="text-xs font-semibold text-[#7C1AEE] uppercase">{label}</div>
        <div className="text-sm text-[#182339] truncate">{airlinesForSegments(segments)}</div>
      </div>
    </div>
    <JourneyColumns segments={segments} />
  </div>
);

// Round-trip "Combine Flights" package: onward + return under one price.
export const CombinedOfferCardWeb: React.FC<{
  pair: CombinedRoundTripOffer;
  variant?: FeaturedVariant;
  onDetails: () => void;
  onBook: () => void;
}> = ({ pair, variant, onDetails, onBook }) => {
  const parts = pair.returnOffer ? [pair.onward, pair.returnOffer] : splitOfferByTrip(pair.onward);
  const rows = parts.length > 1 ? parts : [pair.onward];
  return (
    <CardShell variant={variant}>
      <div className="flex items-center gap-6">
        <div className="flex-1 min-w-0 divide-y divide-dashed divide-[#E4E7EC]">
          {rows.map((leg, index) => (
            <LegRow
              key={index}
              label={rows.length === 1 ? 'Round trip' : index === 0 ? 'Onward' : 'Return'}
              segments={leg.segments}
              airlineCode={leg.airlineCode}
            />
          ))}
        </div>
        <div className="w-28 text-right text-lg font-bold text-[#7C1AEE]">
          {formatPrice(pair.totalAmount, pair.currencyCode)}
        </div>
      </div>
      <div className="flex items-center justify-end mt-3 pt-3 border-t border-dashed border-[#E4E7EC]">
        <CardActions onDetails={onDetails} onBook={onBook} bookLabel="Book" />
      </div>
    </CardShell>
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
  <CardShell variant={variant}>
    <div className="flex items-center gap-6">
      <div className="flex-1 min-w-0 divide-y divide-dashed divide-[#E4E7EC]">
        {splitSegmentsByLegs(offer.segments, legs).map((segments, index) => (
          <LegRow key={index} label={`Trip ${index + 1}`} segments={segments} airlineCode={segments[0]?.airlineCode} />
        ))}
      </div>
      <div className="w-28 text-right text-lg font-bold text-[#7C1AEE]">
        {formatPrice(offer.totalAmount, offer.currencyCode)}
      </div>
    </div>
    <div className="flex items-center justify-end mt-3 pt-3 border-t border-dashed border-[#E4E7EC]">
      <CardActions onDetails={onDetails} onBook={onBook} bookLabel="Book" />
    </div>
  </CardShell>
);
