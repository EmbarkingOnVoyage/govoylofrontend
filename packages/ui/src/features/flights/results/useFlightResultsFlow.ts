import { useEffect, useState } from 'react';
import { searchFlights, type FareOption, type FlightOffer, type FlightSearchSummary, type PassengerCounts } from '../useSearchFlightsMobile';
import {
  applyCombinedFilters,
  buildRoundTripPackages,
  getLayoverCities,
  initialFilters,
  pickFeaturedCombined,
  pickFeaturedFlights,
  pinFare,
  type CityForCode,
  type CombinedFilterState,
  type CombinedRoundTripOffer,
  type SortOptionId,
} from '../logic/flightResults';

export type RoundTripView = 'individual' | 'combine';

// What the results step hands on once every leg has a chosen, fare-pinned offer.
export interface FlightResultsChoice {
  legs: FlightOffer[];
  legLabels: string[] | undefined;
  passengerCounts: PassengerCounts;
}

// The results step's state machine, shared by the web results page (the
// mobile screen still carries its own copy of the same logic):
// - one-way: one list;
// - round trip: "Individual Flights" picks onward then return from the
//   search's per-leg lists, or "Combine Flights" shows supplier-priced packages;
// - multi-city: "Individual Flights" picks each leg in turn (Flyshop legs come
//   from a one-way search per leg, fired lazily), "Combine Flights" shows the
//   supplier's bundled itineraries.
// Picking a leg always goes through the details view first (detailsLegs).
export function useFlightResultsFlow(
  offers: FlightOffer[],
  summary: FlightSearchSummary | null,
  cityForCode: CityForCode,
  defaultSortId: SortOptionId | null = null
) {
  const [roundTripView, setRoundTripView] = useState<RoundTripView>('individual');
  const [selectedLegOffers, setSelectedLegOffers] = useState<FlightOffer[]>([]);
  // Multi-city "Individual Flights" per-leg one-way results.
  // undefined = not fetched yet; an array (possibly empty) = fetched.
  const [individualLegOffers, setIndividualLegOffers] = useState<(FlightOffer[] | undefined)[]>([]);
  const [filters, setFilters] = useState<CombinedFilterState>(() => initialFilters(summary));
  const [sortId, setSortId] = useState<SortOptionId | null>(defaultSortId);
  // legs.length === 1 is a single-offer preview; 2+ shows per-leg tabs.
  const [detailsLegs, setDetailsLegs] = useState<FlightOffer[]>([]);
  const [detailsLegLabels, setDetailsLegLabels] = useState<string[] | undefined>(undefined);

  // A new search (new offers/summary) starts the whole flow over.
  useEffect(() => {
    setRoundTripView('individual');
    setSelectedLegOffers([]);
    setIndividualLegOffers([]);
    setFilters(initialFilters(summary));
    setSortId(defaultSortId);
    setDetailsLegs([]);
    setDetailsLegLabels(undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers, summary]);

  const isRoundTrip = summary?.request.tripType === 'RoundTrip';
  const isMultiCity = summary?.request.tripType === 'MultiCity';
  const isMultiLeg = isRoundTrip || isMultiCity;
  const legCount = isMultiCity ? summary?.request.segments.length ?? 1 : isRoundTrip ? 2 : 1;

  // A supplier package covering the whole trip as ONE offer (Tripjack's
  // combined international return, or a multi-city bundle): starts at the
  // trip's origin and ends at its final destination. These belong in
  // "Combine Flights" only.
  const finalDestination = isRoundTrip
    ? summary?.originCode
    : summary?.request.segments[summary.request.segments.length - 1]?.destination;
  const isWholeTripOffer = (offer: FlightOffer) =>
    isMultiLeg &&
    offer.segments.length > 1 &&
    offer.segments[0]?.origin === summary?.originCode &&
    offer.segments[offer.segments.length - 1]?.destination === finalDestination;

  // Per-leg options, each from a search the supplier will book that leg from.
  const perLegFromSearch = (index: number) => offers.filter((o) => o.tripLegIndex === index && !isWholeTripOffer(o));
  const legOffers = isRoundTrip
    ? Array.from({ length: legCount }, (_, i) => perLegFromSearch(i))
    : isMultiCity
      ? Array.from({ length: legCount }, (_, i) => [
          ...perLegFromSearch(i).filter((o) => o.supplierCode !== 'flyshop'),
          ...(individualLegOffers[i] ?? []).filter((o) => o.supplierCode === 'flyshop'),
        ])
      : [offers];
  const onwardOffers = legOffers[0] ?? [];
  const returnOffers = legOffers[1] ?? [];

  const currentLegIndex = Math.min(selectedLegOffers.length, legCount - 1);
  const isLastLeg = currentLegIndex >= legCount - 1;
  const currentLegLoading =
    isMultiCity && roundTripView === 'individual' && individualLegOffers[currentLegIndex] === undefined;
  const legTabLabel = (index: number) => (isRoundTrip ? (index === 0 ? 'Onward' : 'Return') : `Flight ${index + 1}`);
  const legBarLabel = (index: number) => (isRoundTrip ? 'Onward flight' : `Flight ${index + 1}`);
  const usingSequentialFlow = isMultiLeg && roundTripView === 'individual';

  // Multi-city: fire the one-way search for the leg being picked, once.
  useEffect(() => {
    if (!isMultiCity || roundTripView !== 'individual' || !summary) return;
    if (individualLegOffers[currentLegIndex] !== undefined) return;
    const segment = summary.request.segments[currentLegIndex];
    if (!segment) return;

    let cancelled = false;
    const store = (legResults: FlightOffer[]) => {
      if (cancelled) return;
      setIndividualLegOffers((prev) => {
        const next = [...prev];
        next[currentLegIndex] = legResults;
        return next;
      });
    };
    searchFlights({
      tripType: 'OneWay',
      cabinClass: summary.request.cabinClass,
      segments: [segment],
      adultCount: summary.request.adultCount,
      childCount: summary.request.childCount,
      infantCount: summary.request.infantCount,
    })
      .then((response) => store(response.offers))
      .catch(() => store([]));

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMultiCity, roundTripView, currentLegIndex, summary]);

  // Once a leg is picked, the remaining legs must come from the same supplier.
  const lockedSupplier = selectedLegOffers[0]?.supplierCode;
  const listOffers = usingSequentialFlow
    ? (legOffers[currentLegIndex] ?? []).filter((o) => !lockedSupplier || o.supplierCode === lockedSupplier)
    : isMultiCity
      ? offers.filter(isWholeTripOffer)
      : offers;

  // Filter options always list everything in the current list, so narrowing
  // a filter never removes its own other choices.
  const availableAirlines = Array.from(new Set(listOffers.map((o) => o.airlineName))).sort();
  const availableLayoverCities = Array.from(
    new Set(listOffers.flatMap((o) => getLayoverCities(o, cityForCode)))
  ).sort();

  const visibleOffers = applyCombinedFilters(listOffers, filters, cityForCode);
  const featured = pickFeaturedFlights(visibleOffers);

  const combinedPairs: CombinedRoundTripOffer[] = isRoundTrip
    ? buildRoundTripPackages(
        applyCombinedFilters(offers.filter(isWholeTripOffer), filters, cityForCode),
        applyCombinedFilters(onwardOffers, filters, cityForCode),
        applyCombinedFilters(returnOffers, filters, cityForCode)
      )
    : [];
  const combinedFeatured = pickFeaturedCombined(combinedPairs);

  const resetListState = () => {
    setFilters(initialFilters(summary));
    setSortId(defaultSortId);
  };

  const changeRoundTripView = (view: RoundTripView) => {
    setRoundTripView(view);
    setSelectedLegOffers([]);
    resetListState();
  };

  // Re-picking a leg drops it and every leg picked after it.
  const changeLegAt = (index: number) => {
    setSelectedLegOffers((prev) => prev.slice(0, index));
    resetListState();
  };

  // Every leg but the last in the sequential flow opens as a single-offer
  // preview; the last opens with every leg picked so far, one tab each.
  const openOffer = (offer: FlightOffer) => {
    if (usingSequentialFlow && isLastLeg) {
      setDetailsLegs([...selectedLegOffers, offer]);
      setDetailsLegLabels(Array.from({ length: legCount }, (_, i) => legTabLabel(i)));
      return;
    }
    setDetailsLegs([offer]);
    setDetailsLegLabels(undefined);
  };

  const openCombined = (pair: CombinedRoundTripOffer) => {
    if (pair.returnOffer) {
      setDetailsLegs([pair.onward, pair.returnOffer]);
      setDetailsLegLabels(['Onward', 'Return']);
    } else {
      setDetailsLegs([pair.onward]);
      setDetailsLegLabels(undefined);
    }
  };

  const closeDetails = () => {
    setDetailsLegs([]);
    setDetailsLegLabels(undefined);
  };

  // True while the details view previews a leg that isn't the last one —
  // its action selects that leg and moves on to the next leg's list.
  const isPreviewingLegCandidate = usingSequentialFlow && !isLastLeg && detailsLegs.length === 1;
  const nextLegLabel = isRoundTrip ? 'Select Return Flight' : `Select Flight ${currentLegIndex + 2}`;

  const selectLegCandidate = (fare: FareOption | undefined) => {
    if (detailsLegs[0]) {
      const chosen = fare ? pinFare(detailsLegs[0], fare) : detailsLegs[0];
      setSelectedLegOffers((prev) => [...prev, chosen]);
      resetListState();
    }
    closeDetails();
  };

  // The final choice: every leg in the details view, each pinned to its fare.
  const finalChoice = (selectedFares: (FareOption | undefined)[]): FlightResultsChoice => {
    const request = summary?.request;
    return {
      legs: detailsLegs.map((leg, i) => (selectedFares[i] ? pinFare(leg, selectedFares[i]!) : leg)),
      legLabels: detailsLegLabels,
      passengerCounts: {
        adult: request?.adultCount ?? 1,
        child: request?.childCount ?? 0,
        infant: request?.infantCount ?? 0,
      },
    };
  };

  return {
    isRoundTrip,
    isMultiCity,
    isMultiLeg,
    legCount,
    roundTripView,
    changeRoundTripView,
    selectedLegOffers,
    currentLegIndex,
    currentLegLoading,
    usingSequentialFlow,
    legBarLabel,
    changeLegAt,
    listOffers,
    visibleOffers,
    featured,
    availableAirlines,
    availableLayoverCities,
    combinedPairs,
    combinedFeatured,
    filters,
    setFilters,
    sortId,
    setSortId,
    detailsLegs,
    detailsLegLabels,
    openOffer,
    openCombined,
    closeDetails,
    isPreviewingLegCandidate,
    nextLegLabel,
    selectLegCandidate,
    finalChoice,
  };
}
