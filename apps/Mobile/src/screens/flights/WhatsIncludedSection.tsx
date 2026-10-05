import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
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

const AddOnModal: React.FC<{
  visible: boolean;
  title: string;
  travelers: AddOnTraveler[];
  options: AncillaryOption[];
  isLoading: boolean;
  loadError: boolean;
  selections: SelectionMap;
  legIndex: number;
  category: AddOnCategory;
  currencyCode: string;
  onSelect: (travelerId: string, option: AncillaryOption | null) => void;
  onClose: () => void;
  onSave: () => void;
}> = ({
  visible,
  title,
  travelers,
  options,
  isLoading,
  loadError,
  selections,
  legIndex,
  category,
  currencyCode,
  onSelect,
  onClose,
  onSave,
}) => {
  const total = travelers.reduce(
    (sum, traveler) => sum + (selections[selectionKey(legIndex, category, traveler.id)]?.amount ?? 0),
    0
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.modalScreen}>
        <View style={styles.modalHeader}>
          <TouchableOpacity style={styles.modalBackButton} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={22} color="#182339" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{title}</Text>
          <View style={styles.modalHeaderSpacer} />
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color="#7C1AEE" style={{ marginTop: 24 }} />
        ) : loadError ? (
          <Text style={[styles.categorySubtitle, { margin: 16 }]}>
            Couldn't load add-on options right now. Please try again.
          </Text>
        ) : (
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            {travelers.map((traveler) => {
              const selected = selections[selectionKey(legIndex, category, traveler.id)];
              return (
                <View key={traveler.id} style={styles.travelerBlock}>
                  <Text style={styles.travelerName}>
                    {traveler.firstName} {traveler.lastName}
                  </Text>
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      style={[styles.optionCard, !selected && styles.optionCardSelected]}
                      onPress={() => onSelect(traveler.id, null)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.optionLabel}>None Added</Text>
                      <Text style={styles.optionPrice}>Free</Text>
                    </TouchableOpacity>
                    {options.map((option) => {
                      const isSelected = selected?.ssrKey === option.ssrKey;
                      return (
                        <TouchableOpacity
                          key={option.ssrKey}
                          style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                          onPress={() => onSelect(traveler.id, option)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.optionLabel}>{option.ssrTypeDesc}</Text>
                          <Text style={styles.optionPrice}>
                            {option.totalAmount > 0 ? formatCurrency(option.totalAmount, currencyCode) : 'Free'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                    {options.length === 0 && (
                      <Text style={styles.optionSublabel}>No paid options available for this flight.</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}

        <View style={styles.modalFooter}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(total, currencyCode)}</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={onSave} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

interface LegRoute {
  offerId: string;
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
  const ancillaries = useFlightAncillariesMobile(activeLegRoute?.offerId, itineraryOfferIds);
  const seatMap = useSeatMapMobile(activeLegRoute?.offerId, itineraryOfferIds);

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

  // Baggage already added on this leg, per traveller, as the full option.
  const baggagePicksForLeg = (): Record<string, AncillaryOption> => {
    const picks: Record<string, AncillaryOption> = {};
    seatTravelers.forEach((t) => {
      const selection = selections[selectionKey(activeLegIndex, 'baggage', t.id)];
      const option = selection && baggageOptions.find((o) => o.ssrKey === selection.ssrKey);
      if (option) picks[t.id] = option;
    });
    return picks;
  };

  const handleBaggageSave = (picks: Record<string, AncillaryOption>) => {
    const next: SelectionMap = {};
    Object.entries(selections).forEach(([key, selection]) => {
      if (!key.startsWith(`${activeLegIndex}:baggage:`)) next[key] = selection;
    });
    Object.entries(picks).forEach(([travelerId, option]) => {
      next[selectionKey(activeLegIndex, 'baggage', travelerId)] = {
        legIndex: activeLegIndex,
        category: 'baggage',
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

  const handleSelect = (category: AddOnCategory, travelerId: string, option: AncillaryOption | null) => {
    setSelections((prev) => {
      const next = { ...prev };
      const key = selectionKey(activeLegIndex, category, travelerId);
      if (option) {
        next[key] = {
          legIndex: activeLegIndex,
          category,
          travelerId,
          ssrKey: option.ssrKey,
          label: option.ssrTypeDesc,
          amount: option.totalAmount,
        };
      } else {
        delete next[key];
      }
      return next;
    });
  };

  const handleSave = () => {
    applyTotal(selections);
    setOpenModal(null);
  };

  const categoryLabel = (category: AddOnCategory) =>
    category === 'baggage' ? 'Checked baggage' : category === 'seat' ? 'Seat selection' : 'Meal selection';
  const categoryOptions = (category: AddOnCategory) => (category === 'baggage' ? baggageOptions : mealOptions);
  const categoryLoading = (category: AddOnCategory) =>
    category === 'seat' ? seatMap.isPending : ancillaries.isLoading;
  const categoryError = (category: AddOnCategory) =>
    category === 'seat' ? seatMap.isError : ancillaries.isError;

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
          initialSelections={baggagePicksForLeg()}
          currencyCode={currencyCode}
          onSave={handleBaggageSave}
          onClose={() => setOpenModal(null)}
        />
      )}
      {openModal === 'meal' && (
        <AddOnModal
          visible
          title={categoryLabel(openModal)}
          travelers={travelers}
          options={categoryOptions(openModal)}
          isLoading={categoryLoading(openModal)}
          loadError={categoryError(openModal)}
          selections={selections}
          legIndex={activeLegIndex}
          category={openModal}
          currencyCode={currencyCode}
          onSelect={(travelerId, option) => handleSelect(openModal, travelerId, option)}
          onClose={() => setOpenModal(null)}
          onSave={handleSave}
        />
      )}
    </View>
  );
};
