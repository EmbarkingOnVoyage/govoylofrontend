import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Loader2, Pencil } from 'lucide-react';
import type { FlightOffer, FlightSearchSummary } from '../useSearchFlightsMobile';
import { useFareCalendarMobile } from '../useFareCalendarMobile';
import {
  CABIN_CLASS_LABELS,
  dateKey,
  formatPrice,
  formatStripDate,
  formatTime24,
  getTotalDurationMinutes,
  initialFilters,
  sortOffers,
  type CombinedRoundTripOffer,
  type SortOptionId,
} from '../logic/flightResults';
import { useFlightResultsFlow, type FlightResultsChoice } from './useFlightResultsFlow';
import { useAirportLookup } from './useAirportLookup';
import { AirlineLogoWeb } from './AirlineLogoWeb.web';
import {
  CombinedOfferCardWeb,
  FlightOfferCardWeb,
  MultiCityOfferCardWeb,
  type FeaturedVariant,
} from './FlightOfferCardWeb.web';
import { FlightFiltersWeb } from './FlightFiltersWeb.web';
import { FlightDetailsDrawerWeb } from './FlightDetailsDrawerWeb.web';

const PAGE_SIZE = 25;

const SORT_TABS: { id: SortOptionId; title: string; description: string }[] = [
  { id: 'priceLowToHigh', title: 'Price', description: 'Low to High' },
  { id: 'totalJourneyTime', title: 'Fastest', description: 'Shortest First' },
  { id: 'departureTime', title: 'Departure', description: 'Earliest First' },
  { id: 'best', title: '✦ Smart', description: 'Recommended' },
];

function pairDuration(pair: CombinedRoundTripOffer): number {
  return getTotalDurationMinutes(pair.onward) + (pair.returnOffer ? getTotalDurationMinutes(pair.returnOffer) : 0);
}

// Seven days around the searched date with the fare calendar's lowest price
// for each; picking one re-runs the search for that date.
const DateFareStripWeb: React.FC<{
  originCode: string;
  destinationCode: string;
  selectedDate: string;
  onSelectDate: (iso: string) => void;
}> = ({ originCode, destinationCode, selectedDate, onSelectDate }) => {
  const selected = new Date(selectedDate);
  const { data } = useFareCalendarMobile({
    origin: originCode,
    destination: destinationCode,
    month: selected.getUTCMonth() + 1,
    year: selected.getUTCFullYear(),
  });

  const fareByDate = useMemo(() => {
    const map = new Map<string, { amount: number; currencyCode: string }>();
    for (const day of data?.days ?? []) {
      const parsed = new Date(day.date);
      if (!isNaN(parsed.getTime())) map.set(dateKey(parsed), { amount: day.amount, currencyCode: day.currencyCode });
    }
    return map;
  }, [data]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(selected.getUTCFullYear(), selected.getUTCMonth(), selected.getUTCDate() + i - 3);
    return d;
  });
  const cheapest = Math.min(...days.map((d) => fareByDate.get(dateKey(d))?.amount ?? Infinity));
  // The search sends each travel date as midnight UTC of the picked day.
  const toIso = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
  const shift = (offset: number) => {
    const d = new Date(selected.getUTCFullYear(), selected.getUTCMonth(), selected.getUTCDate() + offset);
    if (d >= today) onSelectDate(toIso(d));
  };

  return (
    <div className="flex items-center gap-2">
      <button type="button" onClick={() => shift(-1)} className="p-1 text-[#4C5973] hover:text-[#7C1AEE]" aria-label="Previous day">
        <ChevronLeft size={18} />
      </button>
      <div className="flex-1 grid grid-cols-7 gap-2">
        {days.map((d, index) => {
          const fare = fareByDate.get(dateKey(d));
          const isSelected = index === 3;
          const isPast = d < today;
          return (
            <button
              key={dateKey(d)}
              type="button"
              disabled={isSelected || isPast}
              onClick={() => onSelectDate(toIso(d))}
              className={`px-2 py-1.5 rounded-lg border text-center bg-white disabled:cursor-default ${
                isSelected ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-[#D5DAE3] hover:border-[#7C1AEE]'
              } ${isPast ? 'opacity-40' : ''}`}
            >
              <div className="text-xs font-medium text-[#182339]">{formatStripDate(d)}</div>
              <div className={`text-xs font-semibold ${fare && fare.amount === cheapest ? 'text-[#15803D]' : 'text-[#4C5973]'}`}>
                {fare ? formatPrice(fare.amount, fare.currencyCode) : '—'}
              </div>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={() => shift(1)} className="p-1 text-[#4C5973] hover:text-[#7C1AEE]" aria-label="Next day">
        <ChevronRight size={18} />
      </button>
    </div>
  );
};

const LegSelectionBarWeb: React.FC<{ offer: FlightOffer; label: string; onChange: () => void }> = ({
  offer,
  label,
  onChange,
}) => {
  const first = offer.segments[0];
  const last = offer.segments[offer.segments.length - 1];
  return (
    <div className="flex items-center justify-between bg-[#F5F0FF] border border-[#C9B5F5] rounded-xl px-4 py-3">
      <div className="flex items-center gap-3">
        <AirlineLogoWeb airlineCode={offer.airlineCode} size={24} />
        <div>
          <div className="text-xs font-semibold text-[#7C1AEE] uppercase">
            {label}: {first.origin} → {last.destination}
          </div>
          <div className="text-sm text-[#182339]">
            {offer.airlineName} · {formatTime24(first.departureDateTime)} – {formatTime24(last.arrivalDateTime)} ·{' '}
            {formatPrice(offer.totalAmount, offer.currencyCode)}
          </div>
        </div>
      </div>
      <button type="button" onClick={onChange} className="text-sm font-medium text-[#7C1AEE] hover:underline">
        Change
      </button>
    </div>
  );
};

export interface FlightResultsPageWebProps {
  summary: FlightSearchSummary;
  offers: FlightOffer[];
  isLoading: boolean;
  error: Error | null;
  onRetry: () => void;
  onSelectDate: (iso: string) => void;
  onModifySearch: () => void;
  onChoose: (choice: FlightResultsChoice) => void;
}

// Web Dev "Desktop - 15": search summary, date-fare strip, filters, sort tabs
// and the result cards; Book / Flight Details open the details popup, whose
// action picks a leg (multi-leg trips) or finishes with every leg chosen.
export const FlightResultsPageWeb: React.FC<FlightResultsPageWebProps> = ({
  summary,
  offers,
  isLoading,
  error,
  onRetry,
  onSelectDate,
  onModifySearch,
  onChoose,
}) => {
  const codes = useMemo(() => {
    const set = new Set<string>(summary.request.segments.flatMap((s) => [s.origin, s.destination]));
    for (const offer of offers) for (const s of offer.segments) set.add(s.origin).add(s.destination);
    return [...set];
  }, [offers, summary]);
  const { cityFor, nameFor } = useAirportLookup(codes);
  const flow = useFlightResultsFlow(offers, summary, cityFor, 'best');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => setVisibleCount(PAGE_SIZE), [flow.filters, flow.sortId, flow.roundTripView, flow.currentLegIndex, offers]);

  const { request } = summary;
  const isCombineView = flow.isMultiLeg && flow.roundTripView === 'combine';
  const legSegment = request.segments[flow.usingSequentialFlow ? flow.currentLegIndex : 0] ?? request.segments[0];

  const featuredIds = new Map<string, FeaturedVariant>();
  if (flow.featured.best) featuredIds.set(flow.featured.best.offerId, 'bestValue');
  if (flow.featured.cheapest) featuredIds.set(flow.featured.cheapest.offerId, 'cheapest');
  if (flow.featured.fastest) featuredIds.set(flow.featured.fastest.offerId, 'fastest');

  const sortedOffers = sortOffers(flow.visibleOffers, flow.sortId, summary.passengerCount);

  const pairVariant = new Map<string, FeaturedVariant>();
  if (flow.combinedFeatured.best) pairVariant.set(flow.combinedFeatured.best.id, 'bestValue');
  if (flow.combinedFeatured.cheapest) pairVariant.set(flow.combinedFeatured.cheapest.id, 'cheapest');
  if (flow.combinedFeatured.fastest) pairVariant.set(flow.combinedFeatured.fastest.id, 'fastest');
  const sortedPairs = useMemo(() => {
    const pairs = [...flow.combinedPairs];
    switch (flow.sortId) {
      case 'priceLowToHigh':
        return pairs.sort((a, b) => a.totalAmount - b.totalAmount);
      case 'totalJourneyTime':
        return pairs.sort((a, b) => pairDuration(a) - pairDuration(b));
      case 'departureTime':
        return pairs.sort(
          (a, b) =>
            new Date(a.onward.segments[0].departureDateTime).getTime() -
            new Date(b.onward.segments[0].departureDateTime).getTime()
        );
      default: {
        const { best, fastest, cheapest, rest } = flow.combinedFeatured;
        const top = [best, fastest, cheapest].filter((p, i, all): p is CombinedRoundTripOffer => !!p && all.indexOf(p) === i);
        return [...top, ...rest];
      }
    }
  }, [flow.combinedPairs, flow.combinedFeatured, flow.sortId]);

  const isRoundTripCombine = flow.isRoundTrip && flow.roundTripView === 'combine';
  const listLength = isRoundTripCombine ? sortedPairs.length : sortedOffers.length;
  const cardAction = flow.usingSequentialFlow && flow.currentLegIndex < flow.legCount - 1 ? 'Select' : 'Book';

  const routeTitle =
    request.tripType === 'MultiCity'
      ? request.segments.map((s) => `${cityFor(s.origin)} → ${cityFor(s.destination)}`).join('  |  ')
      : `${cityFor(summary.originCode)} ${request.tripType === 'RoundTrip' ? '⇄' : '→'} ${cityFor(summary.destinationCode)}`;
  const dateText = request.segments
    .slice(0, request.tripType === 'MultiCity' ? undefined : 2)
    .map((s) => formatStripDate(new Date(s.travelDate)))
    .join(' – ');

  const renderList = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20 text-[#4C5973]">
          <Loader2 className="animate-spin text-[#7C1AEE] mb-3" size={28} />
          Searching the best fares for you…
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-white rounded-xl border border-[#E4E7EC] p-8 text-center">
          <p className="text-[#C8102E] mb-4">{error.message}</p>
          <button type="button" onClick={onRetry} className="px-5 py-2 rounded-lg bg-[#7C1AEE] text-white text-sm font-medium">
            Try again
          </button>
        </div>
      );
    }
    if (flow.currentLegLoading) {
      return (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[#7C1AEE]" />
        </div>
      );
    }
    if (listLength === 0) {
      const filtered = flow.listOffers.length > 0 || flow.combinedPairs.length > 0;
      return (
        <div className="bg-white rounded-xl border border-[#E4E7EC] p-8 text-center text-[#4C5973]">
          {filtered ? (
            <>
              No flights match these filters.{' '}
              <button
                type="button"
                onClick={() => flow.setFilters(initialFilters(null))}
                className="text-[#7C1AEE] font-medium hover:underline"
              >
                Clear filters
              </button>
            </>
          ) : isCombineView ? (
            'No combined options for this search. Try Individual Flights.'
          ) : (
            'No flights found for this search. Try another date.'
          )}
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {isRoundTripCombine
          ? sortedPairs.slice(0, visibleCount).map((pair) => (
              <CombinedOfferCardWeb
                key={pair.id}
                pair={pair}
                variant={pairVariant.get(pair.id)}
                onDetails={() => flow.openCombined(pair)}
                onBook={() => flow.openCombined(pair)}
              />
            ))
          : flow.isMultiCity && isCombineView
            ? sortedOffers.slice(0, visibleCount).map((offer) => (
                <MultiCityOfferCardWeb
                  key={offer.offerId}
                  offer={offer}
                  legs={request.segments}
                  variant={featuredIds.get(offer.offerId)}
                  onDetails={() => flow.openOffer(offer)}
                  onBook={() => flow.openOffer(offer)}
                />
              ))
            : sortedOffers.slice(0, visibleCount).map((offer) => (
                <FlightOfferCardWeb
                  key={offer.offerId}
                  offer={offer}
                  variant={featuredIds.get(offer.offerId)}
                  cityFor={cityFor}
                  bookLabel={cardAction}
                  onDetails={() => flow.openOffer(offer)}
                  onBook={() => flow.openOffer(offer)}
                />
              ))}
        {listLength > visibleCount && (
          <button
            type="button"
            onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
            className="w-full py-3 rounded-xl border border-[#C9B5F5] text-[#7C1AEE] font-medium bg-white hover:bg-[#F5F0FF]"
          >
            Show more flights ({listLength - visibleCount} more)
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6 space-y-4">
      <div className="bg-white rounded-xl border border-[#E4E7EC] px-5 py-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[#182339] truncate">{routeTitle}</h1>
          <p className="text-sm text-[#4C5973]">
            {dateText} · {summary.passengerCount} traveller{summary.passengerCount > 1 ? 's' : ''} ·{' '}
            {CABIN_CLASS_LABELS[summary.cabinClass]}
          </p>
        </div>
        <button
          type="button"
          onClick={onModifySearch}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#7C1AEE] text-[#7C1AEE] text-sm font-medium hover:bg-[#F5F0FF]"
        >
          <Pencil size={14} /> Modify search
        </button>
      </div>

      {request.tripType !== 'MultiCity' && (
        <DateFareStripWeb
          originCode={summary.originCode}
          destinationCode={summary.destinationCode}
          selectedDate={summary.departureDate}
          onSelectDate={onSelectDate}
        />
      )}

      <div className="grid grid-cols-[280px_1fr] gap-5 items-start">
        <FlightFiltersWeb
          offers={flow.listOffers}
          filters={flow.filters}
          onChange={flow.setFilters}
          onClear={() => flow.setFilters(initialFilters(summary))}
          airlines={flow.availableAirlines}
          layoverCities={flow.availableLayoverCities}
          originCity={cityFor(legSegment.origin)}
          destinationCity={cityFor(legSegment.destination)}
        />

        <div className="space-y-3 min-w-0">
          {flow.isMultiLeg && (
            <div className="inline-flex p-1 rounded-full bg-[#EEF0F5]">
              {(['individual', 'combine'] as const).map((view) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => flow.changeRoundTripView(view)}
                  className={`px-5 py-1.5 rounded-full text-sm font-medium ${
                    flow.roundTripView === view ? 'bg-white text-[#7C1AEE] shadow-sm' : 'text-[#4C5973]'
                  }`}
                >
                  {view === 'individual' ? 'Individual Flights' : 'Combine Flights'}
                </button>
              ))}
            </div>
          )}

          {flow.usingSequentialFlow && (
            <>
              {flow.selectedLegOffers.map((offer, index) => (
                <LegSelectionBarWeb
                  key={`${offer.offerId}-${index}`}
                  offer={offer}
                  label={flow.legBarLabel(index)}
                  onChange={() => flow.changeLegAt(index)}
                />
              ))}
              <h2 className="flex items-center gap-2 text-base font-semibold text-[#182339]">
                {flow.isRoundTrip ? (flow.currentLegIndex === 0 ? 'Select onward flight' : 'Select return flight') : `Select flight ${flow.currentLegIndex + 1}`}
                <span className="flex items-center gap-1 text-sm font-normal text-[#4C5973]">
                  {legSegment.origin} <ArrowRight size={12} /> {legSegment.destination}
                </span>
              </h2>
            </>
          )}

          <div className="flex items-center gap-2 bg-[#EEF0F5] rounded-xl p-2">
            <span className="text-xs text-[#4C5973] px-2">Sort by</span>
            {SORT_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => flow.setSortId(tab.id)}
                className={`flex-1 px-3 py-1.5 rounded-lg border text-center ${
                  flow.sortId === tab.id ? 'border-[#7C1AEE] bg-[#F5F0FF]' : 'border-transparent bg-white'
                }`}
              >
                <div className="text-sm font-semibold text-[#182339]">{tab.title}</div>
                <div className="text-[11px] text-[#697691]">{tab.description}</div>
              </button>
            ))}
            {!isLoading && !error && (
              <span className="text-xs text-[#4C5973] px-2 whitespace-nowrap">{listLength} flights</span>
            )}
          </div>

          {renderList()}
        </div>
      </div>

      {flow.detailsLegs.length > 0 && (
        <FlightDetailsDrawerWeb
          key={flow.detailsLegs.map((l) => l.offerId).join('|')}
          legs={flow.detailsLegs}
          legLabels={flow.detailsLegLabels}
          initialLegIndex={flow.usingSequentialFlow ? flow.detailsLegs.length - 1 : 0}
          passengerCount={summary.passengerCount}
          cabinLabel={CABIN_CLASS_LABELS[summary.cabinClass]}
          cityFor={cityFor}
          nameFor={nameFor}
          actionLabel={flow.isPreviewingLegCandidate ? flow.nextLegLabel : 'Book Now'}
          onClose={flow.closeDetails}
          onAction={(fares) => {
            if (flow.isPreviewingLegCandidate) flow.selectLegCandidate(fares[0]);
            else onChoose(flow.finalChoice(fares));
          }}
        />
      )}
    </div>
  );
};
