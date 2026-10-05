import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import {
  useFlightAncillariesMobile,
  useSeatMapMobile,
  SSR_TYPE_BAGGAGE,
  SSR_TYPE_MEALS,
  SSR_TYPE_COMPLIMENTARY_MEALS,
  type AncillaryOption,
} from '@workspace/ui';
import { styles } from './WhatsIncludedSection.styles';
import { SeatSelectionModal, type SeatPick } from './SeatSelectionModal';
import { BaggageSelectionModal } from './BaggageSelectionModal';
import { MealSelectionModal } from './MealSelectionModal';

interface AddOnTraveler {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  // 'Adult' | 'Child' | 'Infant' — the type the traveller flies as.
  travelerType: string;
}

function formatCurrency(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN')}`;
}

type AddOnCategory = 'baggage' | 'seat' | 'meal';

// A traveller's choice per leg/category, or absent entirely for "no add-on
// selected" — storing the price alongside the ssrKey means the running total
// never needs to look up options for a leg the user has since tabbed away
// from (whose fetched data may no longer be in local state). legIndex/category/
// travelerId are duplicated from the map key so the parent (which needs to
// build a per-leg SSR list for the booking request) doesn't have to parse it
// back apart.
export interface AddOnSelection {
  legIndex: number;
  category: AddOnCategory;
  travelerId: string;
  ssrKey: string;
  label: string;
  amount: number;
}

type Selection = AddOnSelection;

// selections: `${legIndex}:${category}:${travelerId}` -> Selection
type SelectionMap = Record<string, Selection>;

function selectionKey(legIndex: number, category: AddOnCategory, travelerId: string): string {
  return `${legIndex}:${category}:${travelerId}`;
}

// Seats are picked per flight segment (a connecting leg has several), so their
// selection keys carry the segment: `${legIndex}:seat:${segmentIndex}:${travelerId}`.
function seatSelectionKey(legIndex: number, segmentIndex: number, travelerId: string): string {
  return `${legIndex}:seat:${segmentIndex}:${travelerId}`;
}

interface LegRoute {
  offerId: string;
  // The fare picked in the fare modal, if any — add-ons are fetched for it.
  fareId?: string | null;
  label: string;
  origin: string;
  destination: string;
  handBaggage: string | null;
  checkInBaggage: string | null;
}

interface WhatsIncludedSectionProps {
  legRoutes: LegRoute[];
  travelers: AddOnTraveler[];
  currencyCode: string;
  onTotalChange: (total: number) => void;
  // Fired alongside onTotalChange (same "Save" timing) so the parent can
  // build the booking request's per-leg SSR selections at Pay Now time.
  onSelectionsChange?: (selections: AddOnSelection[]) => void;
}

export const WhatsIncludedSection: React.FC<WhatsIncludedSectionProps> = ({
  legRoutes,
  travelers,
  currencyCode,
  onTotalChange,
  onSelectionsChange,
}) => {
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [selections, setSelections] = useState<SelectionMap>({});
  const [openModal, setOpenModal] = useState<AddOnCategory | null>(null);
  const activeLegRoute = legRoutes[activeLegIndex];

  const itineraryOfferIds = legRoutes.map((route) => route.offerId);
  // With a single leg the backend reads the first fareId for that offer;
  // otherwise one per leg, in the same order as itineraryOfferIds.
  const itineraryFareIds = legRoutes.map((route) => route.fareId ?? '');
  const ancillaries = useFlightAncillariesMobile(activeLegRoute?.offerId, itineraryOfferIds, itineraryFareIds);
  const seatMap = useSeatMapMobile(activeLegRoute?.offerId, itineraryOfferIds, itineraryFareIds);

  // Seat pricing needs real PAX details, so it's a POST — fetch it whenever the
  // active leg or the traveller list changes, same trigger a useQuery would use.
  useEffect(() => {
    if (!activeLegRoute?.offerId || travelers.length === 0) {
      return;
    }
    seatMap.mutate(
      travelers.map((t) => ({
        title: t.gender === 'Female' ? 'Ms' : 'Mr',
        firstName: t.firstName,
        lastName: t.lastName,
        gender: t.gender === 'Female' ? 'Female' : 'Male',
        paxType: t.travelerType === 'Child' || t.travelerType === 'Infant' ? t.travelerType : 'Adult',
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeLegRoute?.offerId, travelers.map((t) => t.id).join(',')]);

  const baggageOptions = useMemo(
    () => (ancillaries.data?.options ?? []).filter((o) => o.ssrType === SSR_TYPE_BAGGAGE),
    [ancillaries.data]
  );
  const mealOptions = useMemo(
    () =>
      (ancillaries.data?.options ?? []).filter(
        (o) => o.ssrType === SSR_TYPE_MEALS || o.ssrType === SSR_TYPE_COMPLIMENTARY_MEALS
      ),
    [ancillaries.data]
  );
  // This leg's seat maps, one per flight segment. A leg booked as its own offer
  // (e.g. Flyshop) reports its own legIndex as 0, so fall back to every map.
  const seatSegments = useMemo(() => {
    const all = seatMap.data?.segments ?? [];
    const forLeg = all.filter((s) => s.legIndex === activeLegIndex);
    return forLeg.length > 0 ? forLeg : all;
  }, [seatMap.data, activeLegIndex]);

  // Infants travel on a lap: airlines don't sell them a seat or extra
  // checked baggage, so they're left out of both pickers.
  const seatTravelers = useMemo(() => travelers.filter((t) => t.travelerType !== 'Infant'), [travelers]);

  const seatPicksForLeg = (): SeatPick[] =>
    Object.entries(selections).flatMap(([key, selection]) => {
      const match = new RegExp(`^${activeLegIndex}:seat:(\\d+):(.+)$`).exec(key);
      if (!match) return [];
      const segmentIndex = Number(match[1]);
      const seat = seatSegments[segmentIndex]?.rows
        .flatMap((r) => r.seats)
        .find((option) => option.ssrKey === selection.ssrKey);
      return seat ? [{ segmentIndex, travelerId: match[2], seat }] : [];
    });

  // Baggage or meal already added on this leg, per traveller, as the full option.
  const picksForLeg = (category: 'baggage' | 'meal', options: AncillaryOption[]): Record<string, AncillaryOption> => {
    const picks: Record<string, AncillaryOption> = {};
    travelers.forEach((t) => {
      const selection = selections[selectionKey(activeLegIndex, category, t.id)];
      const option = selection && options.find((o) => o.ssrKey === selection.ssrKey);
      if (option) picks[t.id] = option;
    });
    return picks;
  };

  const handleCategorySave = (category: 'baggage' | 'meal', picks: Record<string, AncillaryOption>) => {
    const next: SelectionMap = {};
    Object.entries(selections).forEach(([key, selection]) => {
      if (!key.startsWith(`${activeLegIndex}:${category}:`)) next[key] = selection;
    });
    Object.entries(picks).forEach(([travelerId, option]) => {
      next[selectionKey(activeLegIndex, category, travelerId)] = {
        legIndex: activeLegIndex,
        category,
        travelerId,
        ssrKey: option.ssrKey,
        label: option.ssrTypeDesc,
        amount: option.totalAmount,
      };
    });
    setSelections(next);
    applyTotal(next);
    setOpenModal(null);
  };

  const handleSeatSave = (picks: SeatPick[]) => {
    const next: SelectionMap = {};
    Object.entries(selections).forEach(([key, selection]) => {
      if (!key.startsWith(`${activeLegIndex}:seat:`)) next[key] = selection;
    });
    picks.forEach((pick) => {
      next[seatSelectionKey(activeLegIndex, pick.segmentIndex, pick.travelerId)] = {
        legIndex: activeLegIndex,
        category: 'seat',
        travelerId: pick.travelerId,
        ssrKey: pick.seat.ssrKey,
        label: pick.seat.ssrTypeDesc,
        amount: pick.seat.totalAmount,
      };
    });
    setSelections(next);
    applyTotal(next);
    setOpenModal(null);
  };

  const applyTotal = (next: SelectionMap) => {
    const values = Object.values(next);
    const grandTotal = values.reduce((sum, selection) => sum + selection.amount, 0);
    onTotalChange(grandTotal);
    onSelectionsChange?.(values);
  };




  const hasSelection = (category: AddOnCategory, travelerId: string) =>
    category === 'seat'
      ? Object.keys(selections).some((key) => key.startsWith(`${activeLegIndex}:seat:`) && key.endsWith(`:${travelerId}`))
      : !!selections[selectionKey(activeLegIndex, category, travelerId)];
  const anySelected = (category: AddOnCategory) => travelers.some((t) => hasSelection(category, t.id));

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Whats included</Text>
      <Text style={styles.sectionSubtitle}>
        Check your included benefits and add the extras you need for a more comfortable trip. Add-on
        prices shown are estimates and may change at checkout.
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {legRoutes.map((route, index) => {
          const isActive = index === activeLegIndex;
          return (
            <TouchableOpacity
              key={`${route.origin}-${route.destination}-${index}`}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveLegIndex(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>{route.label}</Text>
              <Text style={[styles.tabRoute, isActive && styles.tabRouteActive]}>
                {route.origin} • {route.destination}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.categoryTitle}>Baggage</Text>
      <Text style={styles.categorySubtitle}>Adding baggage now is cheaper than at the airport.</Text>
      <View style={styles.cardRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>Carry on bag</Text>
          <Text style={styles.infoCardSublabel}>{activeLegRoute?.handBaggage ?? 'Airline dependent'}</Text>
          <Text style={styles.infoCardPrice}>Free</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>Checked bag</Text>
          <Text style={styles.infoCardSublabel}>{activeLegRoute?.checkInBaggage ?? 'Airline dependent'}</Text>
          <Text style={styles.infoCardPrice}>Free</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaCard, seatTravelers.length === 0 && styles.ctaCardDisabled]}
          onPress={() => seatTravelers.length > 0 && setOpenModal('baggage')}
          activeOpacity={0.8}
          disabled={seatTravelers.length === 0}
        >
          <Text style={styles.ctaCardText}>
            {anySelected('baggage') ? 'Baggage added' : 'Add extra Baggage'}
          </Text>
          <ChevronRight size={16} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Text style={styles.categoryTitle}>Seat</Text>
      <Text style={styles.categorySubtitle}>Select your seat now and travel your way</Text>
      <View style={styles.cardRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>Random</Text>
          <Text style={styles.infoCardSublabel}>Assigned at check-in</Text>
          <Text style={styles.infoCardPrice}>Free</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaCard, seatTravelers.length === 0 && styles.ctaCardDisabled]}
          onPress={() => seatTravelers.length > 0 && setOpenModal('seat')}
          activeOpacity={0.8}
          disabled={seatTravelers.length === 0}
        >
          <Text style={styles.ctaCardText}>{anySelected('seat') ? 'Seat selected' : 'Pick a seat'}</Text>
          <ChevronRight size={16} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <Text style={styles.categoryTitle}>Meal</Text>
      <Text style={styles.categorySubtitle}>Pick your preferred meal before takeoff</Text>
      <View style={styles.cardRow}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>Meal</Text>
          <Text style={styles.infoCardSublabel}>No meal on board</Text>
          <Text style={styles.infoCardPrice}>Free</Text>
        </View>
        <TouchableOpacity
          style={[styles.ctaCard, travelers.length === 0 && styles.ctaCardDisabled]}
          onPress={() => travelers.length > 0 && setOpenModal('meal')}
          activeOpacity={0.8}
          disabled={travelers.length === 0}
        >
          <Text style={styles.ctaCardText}>{anySelected('meal') ? 'Meal added' : 'Explore available meals'}</Text>
          <ChevronRight size={16} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {openModal === 'seat' && (
        <SeatSelectionModal
          visible
          origin={activeLegRoute?.origin ?? ''}
          destination={activeLegRoute?.destination ?? ''}
          segments={seatSegments}
          isLoading={seatMap.isPending}
          loadError={seatMap.isError}
          travelers={seatTravelers}
          initialPicks={seatPicksForLeg()}
          currencyCode={currencyCode}
          onSave={handleSeatSave}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'baggage' && (
        <BaggageSelectionModal
          visible
          origin={activeLegRoute?.origin ?? ''}
          destination={activeLegRoute?.destination ?? ''}
          includedBaggage={activeLegRoute?.checkInBaggage ?? null}
          options={baggageOptions}
          isLoading={ancillaries.isLoading}
          loadError={ancillaries.isError}
          travelers={seatTravelers}
          initialSelections={picksForLeg('baggage', baggageOptions)}
          currencyCode={currencyCode}
          onSave={(picks) => handleCategorySave('baggage', picks)}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'meal' && (
        <MealSelectionModal
          visible
          origin={activeLegRoute?.origin ?? ''}
          destination={activeLegRoute?.destination ?? ''}
          options={mealOptions}
          isLoading={ancillaries.isLoading}
          loadError={ancillaries.isError}
          travelers={travelers}
          initialSelections={picksForLeg('meal', mealOptions)}
          currencyCode={currencyCode}
          onSave={(picks) => handleCategorySave('meal', picks)}
          onClose={() => setOpenModal(null)}
        />
      )}
    </View>
  );
};
