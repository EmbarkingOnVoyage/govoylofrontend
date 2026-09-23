import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { styles } from './WhatsIncludedSection.styles';

export interface AddOnOption {
  id: string;
  label: string;
  sublabel?: string;
  price: number; // 0 = free/none
}

interface AddOnTraveler {
  id: string;
  name: string;
  includedLabel?: string;
}

// Every category always offers "None added" alongside its paid choices, so a
// traveler can back out of a selection instead of being stuck with one.
const NONE_OPTION: AddOnOption = { id: 'none', label: 'None Added', price: 0 };

// PLACEHOLDER PRICING. Flyshop does expose real priced ancillaries —
// Air_GetSSR (BAGGAGE/MEALS/SEAT, each with a real CurrencyCode+TotalAmount)
// and Air_GetSeatMap for per-seat pricing — but neither is wired into our
// backend yet (both need a Flight_Key from Air_Reprice threaded through the
// booking flow). These arrays mirror the values shown in the Figma "Checked
// baggage" modal purely so the selection/total/Save flow is interactive
// ahead of that integration; replace them wholesale once it lands.
const BAGGAGE_PAID_OPTIONS: AddOnOption[] = [
  { id: 'extra-5kg', label: 'Extra weight', sublabel: '5 kg', price: 4250 },
  { id: 'excess-15kg', label: 'x1', sublabel: '15 kg', price: 8250 },
];

const SEAT_PAID_OPTIONS: AddOnOption[] = [
  { id: 'standard', label: 'Standard Seat', price: 300 },
  { id: 'legroom', label: 'Extra Legroom', price: 800 },
];

const MEAL_PAID_OPTIONS: AddOnOption[] = [
  { id: 'veg', label: 'Veg Meal', price: 450 },
  { id: 'non-veg', label: 'Non-Veg Meal', price: 550 },
];

function formatCurrency(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN')}`;
}

type AddOnCategory = 'baggage' | 'seat' | 'meal';

// selections: `${legIndex}:${category}:${travelerId}` -> optionId
type SelectionMap = Record<string, string>;

function selectionKey(legIndex: number, category: AddOnCategory, travelerId: string): string {
  return `${legIndex}:${category}:${travelerId}`;
}

const AddOnModal: React.FC<{
  visible: boolean;
  title: string;
  travelers: AddOnTraveler[];
  options: AddOnOption[];
  selections: SelectionMap;
  legIndex: number;
  category: AddOnCategory;
  currencyCode: string;
  onSelect: (travelerId: string, optionId: string) => void;
  onClose: () => void;
  onSave: () => void;
}> = ({ visible, title, travelers, options, selections, legIndex, category, currencyCode, onSelect, onClose, onSave }) => {
  const total = travelers.reduce((sum, traveler) => {
    const optionId = selections[selectionKey(legIndex, category, traveler.id)] ?? 'none';
    const option = options.find((o) => o.id === optionId);
    return sum + (option?.price ?? 0);
  }, 0);

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

        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          {travelers.map((traveler) => {
            const selectedOptionId = selections[selectionKey(legIndex, category, traveler.id)] ?? 'none';
            return (
              <View key={traveler.id} style={styles.travelerBlock}>
                <Text style={styles.travelerName}>{traveler.name}</Text>
                {!!traveler.includedLabel && (
                  <Text style={styles.includedLabel}>Included: {traveler.includedLabel}</Text>
                )}
                <View style={styles.optionRow}>
                  {[NONE_OPTION, ...options].map((option) => {
                    const isSelected = option.id === selectedOptionId;
                    return (
                      <TouchableOpacity
                        key={option.id}
                        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
                        onPress={() => onSelect(traveler.id, option.id)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.optionLabel}>{option.label}</Text>
                        {!!option.sublabel && <Text style={styles.optionSublabel}>{option.sublabel}</Text>}
                        <Text style={styles.optionPrice}>
                          {option.price > 0 ? formatCurrency(option.price, currencyCode) : 'Free'}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </ScrollView>

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
  label: string;
  origin: string;
  destination: string;
  // Real allowance strings from the fare backing this leg's price (e.g.
  // "7 KG", "1 pcs (23kg)") — null when Flyshop didn't return one for this
  // fare, in which case we say so rather than guessing a number.
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

  const applyTotal = (next: SelectionMap) => {
    const grandTotal = Object.entries(next).reduce((sum, [key, optionId]) => {
      const category = key.split(':')[1] as AddOnCategory;
      const options = category === 'baggage' ? BAGGAGE_PAID_OPTIONS : category === 'seat' ? SEAT_PAID_OPTIONS : MEAL_PAID_OPTIONS;
      const option = options.find((o) => o.id === optionId);
      return sum + (option?.price ?? 0);
    }, 0);
    onTotalChange(grandTotal);
  };

  const handleSelect = (category: AddOnCategory, travelerId: string, optionId: string) => {
    setSelections((prev) => ({ ...prev, [selectionKey(activeLegIndex, category, travelerId)]: optionId }));
  };

  const handleSave = () => {
    applyTotal(selections);
    setOpenModal(null);
  };

  const categoryLabel = (category: AddOnCategory) =>
    category === 'baggage' ? 'Checked baggage' : category === 'seat' ? 'Seat selection' : 'Meal selection';
  const categoryOptions = (category: AddOnCategory) =>
    category === 'baggage' ? BAGGAGE_PAID_OPTIONS : category === 'seat' ? SEAT_PAID_OPTIONS : MEAL_PAID_OPTIONS;

  const hasSelection = (category: AddOnCategory, travelerId: string) => {
    const optionId = selections[selectionKey(activeLegIndex, category, travelerId)];
    return !!optionId && optionId !== 'none';
  };
  const anySelected = (category: AddOnCategory) => travelers.some((t) => hasSelection(category, t.id));
  const activeLegRoute = legRoutes[activeLegIndex];

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
          <Text style={styles.ctaCardText}>{anySelected('seat') ? 'Seat selected' : 'Pick exact seat on map'}</Text>
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
          selections={selections}
          legIndex={activeLegIndex}
          category={openModal}
          currencyCode={currencyCode}
          onSelect={(travelerId, optionId) => handleSelect(openModal, travelerId, optionId)}
          onClose={() => setOpenModal(null)}
          onSave={handleSave}
        />
      )}
    </View>
  );
};
