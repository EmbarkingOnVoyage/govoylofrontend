import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { ArrowLeft, Luggage } from 'lucide-react-native';
import type { AncillaryOption } from '@workspace/ui';
import { styles } from './BaggageSelectionModal.styles';
import { formatPrice as formatMoney } from '@workspace/ui/src/features/flights/logic/flightResults';

export interface BaggageTraveler {
  id: string;
  firstName: string;
  lastName: string;
}


// Supplier descriptions vary ("Excess Baggage - 5 Kg", "+ 10 kg Xcess Baggage",
// "1 Piece 15 Kg"); the card shows pieces (with a bag icon) when the option is
// sold by the piece, otherwise as extra weight.
function describeBaggage(option: AncillaryOption): { pieces: number | null; weight: string } {
  const desc = option.ssrTypeDesc;
  const kg = /(\d+(?:\.\d+)?)\s*kg/i.exec(desc);
  const pieces = /(\d+)\s*(?:pieces?|pcs?|bags?)\b/i.exec(desc);
  return {
    pieces: pieces ? Number(pieces[1]) : null,
    weight: kg ? `${kg[1]} kg` : desc,
  };
}

interface BaggageSelectionModalProps {
  visible: boolean;
  origin: string;
  destination: string;
  // The fare's own allowance, e.g. "15 Kg (01 Piece only)".
  includedBaggage: string | null;
  options: AncillaryOption[];
  isLoading: boolean;
  loadError: boolean;
  travelers: BaggageTraveler[];
  // travelerId → the option already added for them.
  initialSelections: Record<string, AncillaryOption>;
  currencyCode: string;
  onSave: (selections: Record<string, AncillaryOption>) => void;
  onClose: () => void;
}

export const BaggageSelectionModal: React.FC<BaggageSelectionModalProps> = ({
  visible,
  origin,
  destination,
  includedBaggage,
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

  // The same option can be offered on every segment of a connecting leg; one
  // card per description is enough (the first segment's key is used).
  const cards = useMemo(() => {
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

  const total = Object.values(picks).reduce((sum, o) => sum + o.totalAmount, 0);

  const select = (travelerId: string, option: AncillaryOption | null) => {
    setPicks((prev) => {
      const next = { ...prev };
      if (option) next[travelerId] = option;
      else delete next[travelerId];
      return next;
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <ArrowLeft size={22} color="#182339" strokeWidth={2} />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>Checked baggage</Text>
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
            <Text style={[styles.stateBox, styles.stateText]}>Couldn't load baggage options right now. Please try again.</Text>
          </View>
        ) : (
          <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
            {cards.length === 0 && (
              <Text style={[styles.stateBox, styles.stateText]}>
                Extra baggage can't be added to this flight online.
              </Text>
            )}
            {cards.length > 0 &&
              travelers.map((traveler, index) => {
                const picked = picks[traveler.id];
                return (
                  <View key={traveler.id} style={[styles.travelerBlock, index > 0 && styles.travelerBlockDivided]}>
                    <Text style={styles.travelerName}>
                      {traveler.firstName} {traveler.lastName}
                    </Text>
                    {!!includedBaggage && <Text style={styles.included}>Included: {includedBaggage}</Text>}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardRow}>
                      <TouchableOpacity
                        style={[styles.card, styles.noneCard, !picked && styles.cardSelected]}
                        onPress={() => select(traveler.id, null)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.noneText}>None{'\n'}Added</Text>
                      </TouchableOpacity>
                      {cards.map((option) => {
                        const { pieces, weight } = describeBaggage(option);
                        const selected = picked?.ssrKey === option.ssrKey;
                        return (
                          <TouchableOpacity
                            key={option.ssrKey}
                            style={[styles.card, selected && styles.cardSelected]}
                            onPress={() => select(traveler.id, option)}
                            activeOpacity={0.7}
                          >
                            {pieces != null ? (
                              <View style={styles.pieceRow}>
                                <Luggage size={16} color="#182339" strokeWidth={1.8} />
                                <Text style={styles.cardHeading}>x{pieces}</Text>
                              </View>
                            ) : (
                              <Text style={styles.cardLabel}>Extra weight</Text>
                            )}
                            <Text style={styles.cardWeight}>{weight}</Text>
                            <Text style={styles.cardPrice}>
                              {option.totalAmount > 0 ? formatMoney(option.totalAmount, currencyCode) : 'Free'}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
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
      </SafeAreaView>
    </Modal>
  );
};
