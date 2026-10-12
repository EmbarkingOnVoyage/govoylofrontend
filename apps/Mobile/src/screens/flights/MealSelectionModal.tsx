import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { ModalSafeArea } from '../../components/ModalSafeArea';
import { ArrowLeft, Check } from 'lucide-react-native';
import type { AncillaryOption } from '@workspace/ui';
import { SelectField } from '../../components/SelectField';
import { styles } from './MealSelectionModal.styles';
import { formatPrice as formatMoney } from '@workspace/ui/src/features/flights/logic/flightResults';

export interface MealTraveler {
  id: string;
  firstName: string;
  lastName: string;
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
    ? `${option.ssrTypeDesc} · ${formatMoney(option.totalAmount, currencyCode)}`
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
  // travelerId → the meals already chosen for them.
  initialSelections: Record<string, AncillaryOption[]>;
  // Flyshop takes several meals per traveller per flight; Tripjack only one.
  multiple: boolean;
  currencyCode: string;
  onSave: (selections: Record<string, AncillaryOption[]>) => void;
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
  multiple,
  currencyCode,
  onSave,
  onClose,
}) => {
  const [picks, setPicks] = useState<Record<string, AncillaryOption[]>>({});

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

  const total = Object.values(picks).flat().reduce((sum, o) => sum + o.totalAmount, 0);

  const mealsOf = (travelerId: string) => picks[travelerId] ?? [];
  const has = (travelerId: string, meal: AncillaryOption) => mealsOf(travelerId).some((m) => m.ssrKey === meal.ssrKey);
  const setMeals = (travelerId: string, list: AncillaryOption[]) => {
    setPicks((prev) => {
      const next = { ...prev };
      if (list.length > 0) next[travelerId] = list;
      else delete next[travelerId];
      return next;
    });
  };
  // With several meals allowed every card and list row adds or removes one;
  // otherwise picking a meal replaces the traveller's meal.
  const toggle = (travelerId: string, meal: AncillaryOption) => {
    if (has(travelerId, meal)) setMeals(travelerId, mealsOf(travelerId).filter((m) => m.ssrKey !== meal.ssrKey));
    else setMeals(travelerId, multiple ? [...mealsOf(travelerId), meal] : [meal]);
  };

  const renderQuickCard = (travelerId: string, label: string, meal: AncillaryOption | null) => {
    if (!meal) return null;
    const selected = has(travelerId, meal);
    return (
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        onPress={() => toggle(travelerId, meal)}
        activeOpacity={0.7}
      >
        <Text style={styles.cardText}>{label}</Text>
        {meal.totalAmount > 0 && <Text style={styles.cardPrice}>{formatMoney(meal.totalAmount, currencyCode)}</Text>}
      </TouchableOpacity>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ModalSafeArea style={styles.screen}>
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
            {meals.length > 0 && !multiple && (
              <Text style={styles.singleNote}>This airline allows one meal per traveller on this flight.</Text>
            )}
            {meals.length > 0 &&
              travelers.map((traveler, index) => {
                const picked = mealsOf(traveler.id)[0] ?? null;
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
                        onPress={() => setMeals(traveler.id, [])}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cardText}>None{'\n'}Added</Text>
                      </TouchableOpacity>
                      {renderQuickCard(traveler.id, 'Veg', vegMeal)}
                      {renderQuickCard(traveler.id, 'Non-veg', nonVegMeal)}
                    </View>
                    {otherMeals.length > 0 && multiple && (
                      <>
                        <Text style={styles.otherLabel}>Other meals</Text>
                        {otherMeals.map((meal) => {
                          const checked = has(traveler.id, meal);
                          return (
                            <TouchableOpacity
                              key={meal.ssrKey}
                              style={styles.checkRow}
                              onPress={() => toggle(traveler.id, meal)}
                              activeOpacity={0.7}
                              accessibilityRole="checkbox"
                              accessibilityState={{ checked }}
                            >
                              <View style={[styles.checkBox, checked && styles.checkBoxOn]}>
                                {checked && <Check size={12} color="#FFFFFF" strokeWidth={3} />}
                              </View>
                              <Text style={styles.checkLabel}>{meal.ssrTypeDesc}</Text>
                              {meal.totalAmount > 0 && (
                                <Text style={styles.checkPrice}>{formatMoney(meal.totalAmount, currencyCode)}</Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </>
                    )}
                    {otherMeals.length > 0 && !multiple && (
                      <>
                        <Text style={styles.otherLabel}>Other meal</Text>
                        <SelectField
                          value={pickedOther && picked ? mealLabel(picked, currencyCode) : ''}
                          options={otherMeals.map((m) => mealLabel(m, currencyCode))}
                          onSelect={(label) => {
                            const meal = mealByLabel.get(label);
                            setMeals(traveler.id, meal ? [meal] : []);
                          }}
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
            <Text style={styles.totalValue}>{formatMoney(total, currencyCode)}</Text>
          </View>
          <TouchableOpacity style={styles.saveButton} onPress={() => onSave(picks)} activeOpacity={0.8}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ModalSafeArea>
    </Modal>
  );
};
