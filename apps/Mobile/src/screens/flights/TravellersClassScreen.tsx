import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { ArrowLeft, Minus, Plus } from 'lucide-react-native';
import type { CabinClass } from '@workspace/ui';
import { styles } from './TravellersClassScreen.styles';

const CABIN_CLASS_OPTIONS: { label: string; value: CabinClass }[] = [
  { label: 'Economy', value: 'Economy' },
  { label: 'Premium Economy', value: 'PremiumEconomy' },
  { label: 'Business Class', value: 'Business' },
  { label: 'First', value: 'First' },
];

interface TravellersClassScreenProps {
  adultCount: number;
  childCount: number;
  infantCount: number;
  cabinClass: CabinClass;
  onConfirm: (values: { adultCount: number; childCount: number; infantCount: number; cabinClass: CabinClass }) => void;
  onBack: () => void;
}

export const TravellersClassScreen: React.FC<TravellersClassScreenProps> = ({
  adultCount: initialAdults,
  childCount: initialChildren,
  infantCount: initialInfants,
  cabinClass: initialCabinClass,
  onConfirm,
  onBack,
}) => {
  const [adultCount, setAdultCount] = useState(initialAdults);
  const [childCount, setChildCount] = useState(initialChildren);
  const [infantCount, setInfantCount] = useState(initialInfants);
  const [cabinClass, setCabinClass] = useState(initialCabinClass);

  return (
    <View style={styles.screen}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowLeft size={22} color="#182339" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Travellers and Class</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Add number of travellers</Text>

        <View style={styles.stepperRow}>
          <View>
            <Text style={styles.stepperLabel}>Adult</Text>
            <Text style={styles.stepperSubLabel}>12 yrs and above</Text>
          </View>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={[styles.stepperButton, adultCount <= 1 && styles.stepperButtonDisabled]}
              onPress={() => setAdultCount((c) => Math.max(1, c - 1))}
              disabled={adultCount <= 1}
            >
              <Minus size={16} color={adultCount <= 1 ? '#ADB8CD' : '#7C1AEE'} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{adultCount}</Text>
            <TouchableOpacity style={styles.stepperButton} onPress={() => setAdultCount((c) => Math.min(9, c + 1))}>
              <Plus size={16} color="#7C1AEE" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepperRow}>
          <View>
            <Text style={styles.stepperLabel}>Children</Text>
            <Text style={styles.stepperSubLabel}>2-12 yrs</Text>
          </View>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={[styles.stepperButton, childCount <= 0 && styles.stepperButtonDisabled]}
              onPress={() => setChildCount((c) => Math.max(0, c - 1))}
              disabled={childCount <= 0}
            >
              <Minus size={16} color={childCount <= 0 ? '#ADB8CD' : '#7C1AEE'} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{childCount}</Text>
            <TouchableOpacity style={styles.stepperButton} onPress={() => setChildCount((c) => Math.min(9, c + 1))}>
              <Plus size={16} color="#7C1AEE" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.stepperRow}>
          <View>
            <Text style={styles.stepperLabel}>Infant</Text>
            <Text style={styles.stepperSubLabel}>Under 2 yrs</Text>
          </View>
          <View style={styles.stepperControls}>
            <TouchableOpacity
              style={[styles.stepperButton, infantCount <= 0 && styles.stepperButtonDisabled]}
              onPress={() => setInfantCount((c) => Math.max(0, c - 1))}
              disabled={infantCount <= 0}
            >
              <Minus size={16} color={infantCount <= 0 ? '#ADB8CD' : '#7C1AEE'} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{infantCount}</Text>
            <TouchableOpacity style={styles.stepperButton} onPress={() => setInfantCount((c) => Math.min(9, c + 1))}>
              <Plus size={16} color="#7C1AEE" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Select class</Text>
        <View style={styles.classGrid}>
          {CABIN_CLASS_OPTIONS.map((option) => {
            const isSelected = cabinClass === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.classButton, isSelected && styles.classButtonSelected]}
                onPress={() => setCabinClass(option.value)}
              >
                <Text style={[styles.classButtonText, isSelected && styles.classButtonTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => onConfirm({ adultCount, childCount, infantCount, cabinClass })}
      >
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
};
