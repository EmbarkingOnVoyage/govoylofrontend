import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import type { AncillaryOption } from '@workspace/ui';
import { SelectField } from '../../components/SelectField';
import { styles } from './MealSelectionModal.styles';

export interface MealTraveler {
  id: string;
  firstName: string;
  lastName: string;
}

function formatPrice(amount: number, currencyCode: string): string {
  return `${currencyCode === 'INR' ? '₹' : currencyCode + ' '}${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
}

// Airlines return named meals ("VEG BIRYANI Combo", "Chicken Junglee Sandwich",
// "Hindu Veg Meal" / AVML) rather than a veg / non-veg flag, so the quick-pick
// cards classify by name and code. Non-veg is checked first so "Non Veg" isn't
// read as veg.
const NON_VEG_PATTERN = /non[\s-]?veg|chicken|mutton|lamb|fish|prawn|seafood|egg|meat|beef|pork|NVML|MOML|SFML/i;
const VEG_PATTERN = /\bveg|paneer|vegetarian|vegan|VGML|AVML|VLML|VJML|VOML|RVML|JNML/i;

function mealKind(option: AncillaryOption): 'veg' | 'nonveg' | null {
  const text = `${option.ssrTypeDesc} ${option.ssrCode ?? ''}`;
  if (NON_VEG_PATTERN.test(text)) return 'nonveg';
  if (VEG_PATTERN.test(text)) return 'veg';
  return null;
}

function mealLabel(option: AncillaryOption, currencyCode: string): string {
  return option.totalAmount > 0
    ? `${option.ssrTypeDesc} · ${formatPrice(option.totalAmount, currencyCode)}`
    : option.ssrTypeDesc;
}

interface MealSelectionModalProps {
  visible: boolean;
  origin: string;
  destination: string;
  options: AncillaryOption[];
  isLoading: boolean;
  loadError: boolean;
  travelers: MealTraveler[];
  // travelerId → the meal already chosen for them.
  initialSelections: Record<string, AncillaryOption>;
  currencyCode: string;
  onSave: (selections: Record<string, AncillaryOption>) => void;
  onClose: () => void;
}

export const MealSelectionModal: React.FC<MealSelectionModalProps> = ({
  visible,
  origin,
  destination,
  options,
  isLoading,
  loadError,
  travelers,
  initialSelections,
  currencyCode,
  onSave,
  onClose,
}) => {
  const [picks, setPicks] = useState<Record<string, AncillaryOption>>({});

  useEffect(() => {
    if (visible) setPicks({ ...initialSelections });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // One entry per meal (a connecting leg offers the same menu per segment),
  // cheapest first.
  const meals = useMemo(() => {
    const seen = new Set<string>();
    return options
      .filter((o) => {
        const key = `${o.ssrTypeDesc}|${o.totalAmount}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.totalAmount - b.totalAmount);
  }, [options]);

  // The Veg / Non-veg cards stand for the cheapest meal of each kind.
  const vegMeal = meals.find((m) => mealKind(m) === 'veg') ?? null;
  const nonVegMeal = meals.find((m) => mealKind(m) === 'nonveg') ?? null;
  const otherMeals = meals.filter((m) => m !== vegMeal && m !== nonVegMeal);
  const mealByLabel = useMemo(
    () => new Map(meals.map((m) => [mealLabel(m, currencyCode), m])),
    [meals, currencyCode]
  );
  // A fare whose meals are all free comes with a meal — the choice is a preference.
  const included = meals.length > 0 && meals.every((m) => m.totalAmount === 0);

  const total = Object.values(picks).reduce((sum, o) => sum + o.totalAmount, 0);

  const select = (travelerId: string, option: AncillaryOption | null) => {
    setPicks((prev) => {
      const next = { ...prev };
      if (option) next[travelerId] = option;
      else delete next[travelerId];
      return next;
    });
  };

  const renderQuickCard = (travelerId: string, label: string, meal: AncillaryOption | null) => {
    if (!meal) return null;
    const selected = picks[travelerId]?.ssrKey === meal.ssrKey;
    return (
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        onPress={() => select(travelerId, meal)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardText}>{label}</Text>
        {meal.totalAmount > 0 && <Text style={styles.cardPrice}>{formatPrice(meal.totalAmount, currencyCode)}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={22} color="#182339" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Meal</Text>
            <Text style={styles.subtitle}>
              {origin} → {destination}
            </Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        {isLoading ? (
          <View style={styles.body}>
            <ActivityIndicator size="small" color="#7C1AEE" style={styles.stateBox} />
          </View>
        ) : loadError ? (
          <View style={styles.body}>
            <Text style={[styles.stateBox, styles.stateText]}>Couldn't load meals right now. Please try again.</Text>
          </View>
        ) : (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {meals.length === 0 && (
              <Text style={[styles.stateBox, styles.stateText]}>Meals can't be pre-booked on this flight online.</Text>
            )}
            {meals.length > 0 &&
              travelers.map((traveler, index) => {
                const picked = picks[traveler.id] ?? null;
                const pickedOther =
                  !!picked && picked.ssrKey !== vegMeal?.ssrKey && picked.ssrKey !== nonVegMeal?.ssrKey;
                return (
                  <View key={traveler.id} style={[styles.travelerBlock, index > 0 && styles.travelerBlockDivided]}>
                    <Text style={styles.travelerName}>
                      {traveler.firstName} {traveler.lastName}
                      {included && <Text style={styles.included}> - Included</Text>}
                    </Text>
                    <View style={styles.cardRow}>
                      <TouchableOpacity
                        style={[styles.card, styles.noneCard, !picked && styles.cardSelected]}
                        onPress={() => select(traveler.id, null)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cardText}>None{'\n'}Added</Text>
                      </TouchableOpacity>
                      {renderQuickCard(traveler.id, 'Veg', vegMeal)}
                      {renderQuickCard(traveler.id, 'Non-veg', nonVegMeal)}
                    </View>
                    {otherMeals.length > 0 && (
                      <>
                        <Text style={styles.otherLabel}>Other meal</Text>
                        <SelectField
                          value={pickedOther && picked ? mealLabel(picked, currencyCode) : ''}
                          options={otherMeals.map((m) => mealLabel(m, currencyCode))}
                          onSelect={(label) => select(traveler.id, mealByLabel.get(label) ?? null)}
                          title="Select a meal"
                        />
                      </>
                    )}
                  </View>
                );
              })}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(total, currencyCode)}</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={() => onSave(picks)} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
