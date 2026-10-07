import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, IndianRupee, Loader2, Sparkles } from 'lucide-react';
import type { FlightOffer, FlightSearchSummary } from '../useSearchFlightsMobile';
import { useFareCalendarMobile } from '../useFareCalendarMobile';
import {
  CABIN_CLASS_LABELS,
  dateKey,
  formatPrice,
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
import { OffersStripWeb, PromoColumnWeb } from './ResultsExtrasWeb.web';

const PAGE_SIZE = 25;

const SORT_TABS: { id: SortOptionId; title: string; description: string }[] = [
  { id: 'priceLowToHigh', title: 'Price', description: 'Low to High' },
  { id: 'totalJourneyTime', title: 'Fastest', description: 'Shortest First' },
  { id: 'departureTime', title: 'Departure', description: 'Earliest First' },
  { id: 'best', title: 'Smart', description: 'Recommended' },
];

function pairDuration(pair: CombinedRoundTripOffer): number {
  return getTotalDurationMinutes(pair.onward) + (pair.returnOffer ? getTotalDurationMinutes(pair.returnOffer) : 0);
}

const STRIP_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
const STRIP_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// "Fri, Sept 11" — the date slider's own format.
function stripLabel(d: Date): string {
  return `${STRIP_WEEKDAYS[d.getDay()]}, ${STRIP_MONTHS[d.getMonth()]} ${d.getDate()}`;
}

// Web Dev "date slider" row: 8 days around the searched date with the fare
// calendar's lowest price. The searched day has a blue border; prices at or
// below it are green, dearer ones red. Picking a day re-runs the search.
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
    const map = new Map<string, number>();
    for (const day of data?.days ?? []) {
      const parsed = new Date(day.date);
      if (!isNaN(parsed.getTime())) map.set(dateKey(parsed), day.amount);
    }
    return map;
  }, [data]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from(
    { length: 8 },
    (_, i) => new Date(selected.getUTCFullYear(), selected.getUTCMonth(), selected.getUTCDate() + i - 3)
  );
  const selectedFare = fareByDate.get(dateKey(days[3]));
  // The search sends each travel date as midnight UTC of the picked day.
  const toIso = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())).toISOString();
  const shift = (offset: number) => {
    const d = new Date(selected.getUTCFullYear(), selected.getUTCMonth(), selected.getUTCDate() + offset);
    if (d >= today) onSelectDate(toIso(d));
  };
  const arrow = (dir: -1 | 1) => (
    <button
      type="button"
      onClick={() => shift(dir)}
      className="w-9 h-[57px] shrink-0 flex items-center justify-center text-[#182339]"
      aria-label={dir < 0 ? 'Previous day' : 'Next day'}
    >
      {dir < 0 ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
    </button>
  );

  return (
    <div className="flex items-center gap-2 h-[59px]">
      {arrow(-1)}
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {days.map((d, index) => {
          const fare = fareByDate.get(dateKey(d));
          const isSelected = index === 3;
          const isPast = d < today;
          const priceColor =
            fare === undefined || isPast
              ? '#697691'
              : selectedFare === undefined || fare <= selectedFare
                ? '#007F20'
                : '#C5001F';
          return (
            <button
              key={dateKey(d)}
              type="button"
              disabled={isSelected || isPast}
              onClick={() => onSelectDate(toIso(d))}
              className="flex-1 min-w-0 h-[47px] p-[2.7px] bg-white rounded-[2.7px] flex flex-col items-center justify-center disabled:cursor-default"
              style={{ border: `1.35px solid ${isSelected ? '#114BFF' : '#D7DCE7'}` }}
            >
              <span className="text-[14.86px] leading-[22px] font-medium text-[#182339] whitespace-nowrap">{stripLabel(d)}</span>
              <span className="flex items-end gap-0.5 text-[16.2px] leading-5" style={{ color: priceColor }}>
                <IndianRupee size={17} className="mb-px" />
                {fare !== undefined ? Math.round(fare).toLocaleString('en-IN') : '—'}
              </span>
            </button>
          );
        })}
      </div>
      {arrow(1)}
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
  // The page header (site header with the search bar), rendered above the offers strip.
  header?: React.ReactNode;
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
  header,
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
      <div className="flex flex-col gap-3">
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
            className="w-full py-3 rounded border border-[#7C1AEE] text-[13px] font-medium text-[#7C1AEE] bg-white hover:bg-[#F3E8FF]"
          >
            Show more flights ({listLength - visibleCount} more)
          </button>
        )}
      </div>
    );
  };

  // Desktop-15 geometry (1440 frame): sidebar at x=35 (295 wide) straight
  // under the offers strip; the content column starts at x=345 with the date
  // strip (1038), the sort bar (960, x=354) and the 673px card list (x=356)
  // beside the 355px promo column (x=1039).
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {header}
      <OffersStripWeb />
      <div className="max-w-[1440px] mx-auto pl-[35px] pr-[45px] flex items-start gap-[15px]">
        <FlightFiltersWeb
          offers={flow.listOffers}
          filters={flow.filters}
          onChange={flow.setFilters}
          airlines={flow.availableAirlines}
          layoverCities={flow.availableLayoverCities}
          originCity={cityFor(legSegment.origin)}
          destinationCity={cityFor(legSegment.destination)}
          cityFor={cityFor}
        />

        <div className="flex-1 min-w-0 max-w-[1050px] pt-3 pb-10">
          {request.tripType !== 'MultiCity' && (
            <DateFareStripWeb
              originCode={summary.originCode}
              destinationCode={summary.destinationCode}
              selectedDate={summary.departureDate}
              onSelectDate={onSelectDate}
            />
          )}

          {(flow.isMultiLeg || flow.usingSequentialFlow) && (
            <div className="mt-3 ml-[9px] max-w-[960px] flex flex-col gap-2">
              {flow.isMultiLeg && (
                <div className="inline-flex self-start p-1 rounded-lg bg-[#ECEEF3]">
                  {(['individual', 'combine'] as const).map((view) => (
                    <button
                      key={view}
                      type="button"
                      onClick={() => flow.changeRoundTripView(view)}
                      className={`px-4 py-1.5 rounded-lg text-[12.5px] leading-[19px] font-bold ${
                        flow.roundTripView === view ? 'bg-[#F3E8FF] text-[#7C1AEE] border border-[#7C1AEE]' : 'text-[#182339] border border-transparent'
                      }`}
                    >
                      {view === 'individual' ? 'Individual Flights' : 'Combine Flights'}
                    </button>
                  ))}
                </div>
              )}
              {flow.usingSequentialFlow &&
                flow.selectedLegOffers.map((offer, index) => (
                  <LegSelectionBarWeb
                    key={`${offer.offerId}-${index}`}
                    offer={offer}
                    label={flow.legBarLabel(index)}
                    onChange={() => flow.changeLegAt(index)}
                  />
                ))}
              {flow.usingSequentialFlow && (
                <h2 className="flex items-center gap-2 text-[15px] leading-5 font-medium text-[#182339]">
                  {flow.isRoundTrip
                    ? flow.currentLegIndex === 0
                      ? 'Select onward flight'
                      : 'Select return flight'
                    : `Select flight ${flow.currentLegIndex + 1}`}
                  <span className="flex items-center gap-1 text-[13px] text-[#697691]">
                    {legSegment.origin} <ArrowRight size={12} /> {legSegment.destination}
                  </span>
                </h2>
              )}
            </div>
          )}

          <div className="mt-3 ml-[9px] max-w-[960px] min-h-[73px] flex items-center gap-2.5 px-4 py-2.5 bg-[#ECEEF3] border-b border-[#CCD3E0]">
            <span className="text-[12px] leading-[18px] text-[#697691] shrink-0">Sort by</span>
            <div className="flex-1 flex items-start gap-1">
              {SORT_TABS.map((tab) => {
                const active = flow.sortId === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => flow.setSortId(tab.id)}
                    className={`flex-1 h-[52px] flex flex-col items-center justify-center gap-px px-2 py-[7px] rounded-lg border ${
                      active ? 'bg-[#F3E8FF] border-[#7C1AEE]' : 'bg-white border-[#CCD3E0]'
                    }`}
                  >
                    <span
                      className={`flex items-center gap-[3px] text-[12.5px] leading-[19px] font-bold ${active ? 'text-[#7C1AEE]' : 'text-[#182339]'}`}
                    >
                      {tab.id === 'best' && <Sparkles size={12} />}
                      {tab.title}
                    </span>
                    <span className={`text-[10.5px] leading-4 ${active ? 'text-[#7C1AEE]' : 'text-[#697691]'}`}>{tab.description}</span>
                  </button>
                );
              })}
            </div>
            {!isLoading && !error && (
              <span className="text-[12px] leading-[18px] font-semibold text-[#697691] whitespace-nowrap">
                {listLength} Flights Available
              </span>
            )}
          </div>

          <div className="mt-3 ml-[11px] flex items-start gap-2.5">
            <div className="flex-1 min-w-0 max-w-[673px]">{renderList()}</div>
            <div className="hidden xl:block -mt-2.5">
              <PromoColumnWeb />
            </div>
          </div>
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
