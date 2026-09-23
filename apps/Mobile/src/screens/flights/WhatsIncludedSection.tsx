import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import {
  useFlightAncillariesMobile,
  useSeatMapMobile,
  SSR_TYPE_BAGGAGE,
  SSR_TYPE_MEALS,
  SSR_TYPE_COMPLIMENTARY_MEALS,
  SSR_STATUS_AVAILABLE,
  type AncillaryOption,
} from '@workspace/ui';
import { styles } from './WhatsIncludedSection.styles';

interface AddOnTraveler {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  travelerType: string;
}

function formatCurrency(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN')}`;
}

type AddOnCategory = 'baggage' | 'seat' | 'meal';

// A traveller's choice per leg/category, or absent entirely for "no add-on
// selected" — storing the price alongside the ssrKey means the running total
// never needs to look up options for a leg the user has since tabbed away
// from (whose fetched data may no longer be in local state).
interface Selection {
  ssrKey: string;
  label: string;
  amount: number;
}

// selections: `${legIndex}:${category}:${travelerId}` -> Selection
type SelectionMap = Record<string, Selection>;

function selectionKey(legIndex: number, category: AddOnCategory, travelerId: string): string {
  return `${legIndex}:${category}:${travelerId}`;
}

// Flyshop prices individual seats, not seat "classes" — there's no semantic
// tier name in the data. We dedupe available seats by price into at most a
// couple of selectable tiers (cheapest = Standard, anything pricier =
// Preferred) so the UI matches the Baggage/Meal pattern instead of listing
// dozens of individual seat numbers. A real seat-picker (choosing an exact
// seat on a visual map) is a separate, larger UI task.
function buildSeatTierOptions(seats: AncillaryOption[]): AncillaryOption[] {
  const available = seats.filter((s) => s.ssrStatus === SSR_STATUS_AVAILABLE);
  const cheapestPerPrice = new Map<number, AncillaryOption>();
  for (const seat of available) {
    if (!cheapestPerPrice.has(seat.totalAmount)) {
      cheapestPerPrice.set(seat.totalAmount, seat);
    }
  }
  const tiers = [...cheapestPerPrice.values()].sort((a, b) => a.totalAmount - b.totalAmount);
  return tiers.map((tier, index) => ({
    ...tier,
    ssrTypeDesc: tiers.length > 1 ? (index === 0 ? 'Standard Seat' : 'Preferred Seat') : 'Select Seat',
  }));
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
}

export const WhatsIncludedSection: React.FC<WhatsIncludedSectionProps> = ({
  legRoutes,
  travelers,
  currencyCode,
  onTotalChange,
}) => {
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [selections, setSelections] = useState<SelectionMap>({});
  const [openModal, setOpenModal] = useState<AddOnCategory | null>(null);
  const activeLegRoute = legRoutes[activeLegIndex];

  const ancillaries = useFlightAncillariesMobile(activeLegRoute?.offerId);
  const seatMap = useSeatMapMobile(activeLegRoute?.offerId);

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
  const seatOptions = useMemo(() => {
    const segment = seatMap.data?.segments.find((s) => s.legIndex === activeLegIndex);
    const seats = segment?.rows.flatMap((r) => r.seats) ?? [];
    return buildSeatTierOptions(seats);
  }, [seatMap.data, activeLegIndex]);

  const applyTotal = (next: SelectionMap) => {
    const grandTotal = Object.values(next).reduce((sum, selection) => sum + selection.amount, 0);
    onTotalChange(grandTotal);
  };

  const handleSelect = (category: AddOnCategory, travelerId: string, option: AncillaryOption | null) => {
    setSelections((prev) => {
      const next = { ...prev };
      const key = selectionKey(activeLegIndex, category, travelerId);
      if (option) {
        next[key] = { ssrKey: option.ssrKey, label: option.ssrTypeDesc, amount: option.totalAmount };
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
  const categoryOptions = (category: AddOnCategory) =>
    category === 'baggage' ? baggageOptions : category === 'seat' ? seatOptions : mealOptions;
  const categoryLoading = (category: AddOnCategory) =>
    category === 'seat' ? seatMap.isPending : ancillaries.isLoading;
  const categoryError = (category: AddOnCategory) =>
    category === 'seat' ? seatMap.isError : ancillaries.isError;

  const hasSelection = (category: AddOnCategory, travelerId: string) =>
    !!selections[selectionKey(activeLegIndex, category, travelerId)];
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
          style={[styles.ctaCard, travelers.length === 0 && styles.ctaCardDisabled]}
          onPress={() => travelers.length > 0 && setOpenModal('baggage')}
          activeOpacity={0.8}
          disabled={travelers.length === 0}
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
          style={[styles.ctaCard, travelers.length === 0 && styles.ctaCardDisabled]}
          onPress={() => travelers.length > 0 && setOpenModal('seat')}
          activeOpacity={0.8}
          disabled={travelers.length === 0}
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

      {openModal && (
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
