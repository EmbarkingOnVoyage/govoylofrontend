import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, SafeAreaView, ActivityIndicator } from 'react-native';
import { Plane } from 'lucide-react-native';
import { useFareRulesMobile, type FareRule } from '@workspace/ui';
import { styles } from './FareRulesModal.styles';

export interface FareRulesLeg {
  offerId: string;
  label: string;
  origin: string;
  destination: string;
  airlineName: string;
  flightNumbers: string[];
  departureDateTime: string;
}

interface FareRulesModalProps {
  visible: boolean;
  legs: FareRulesLeg[];
  onClose: () => void;
}

function formatTime24(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatWeekdayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const weekday = date.toLocaleDateString([], { weekday: 'short' });
  return `${weekday}, ${date.getDate()} ${date.toLocaleDateString([], { month: 'short' })}`;
}

type FareRuleTab = 'cancellation' | 'dateChange';

// Flyshop's Air_FareRule returns free-text (FareRuleName + FareRuleDesc, HTML
// already stripped server-side) rather than the neatly tiered cancellation/
// date-change pricing a polished mock might show — there's no per-window
// rupee breakdown in the real data, so rules are grouped into these two tabs
// by keyword rather than displayed as fabricated numbers. A rule that reads
// as neither (e.g. a generic "Universal" disclaimer covering both) is shown
// under both tabs rather than dropped.
function categorizeRules(rules: FareRule[]): Record<FareRuleTab, FareRule[]> {
  const cancellation: FareRule[] = [];
  const dateChange: FareRule[] = [];

  for (const rule of rules) {
    const text = `${rule.fareRuleName} ${rule.fareRuleDesc}`.toLowerCase();
    const mentionsCancel = text.includes('cancel');
    const mentionsChange = text.includes('change') || text.includes('resched') || text.includes('reissue');

    if (mentionsCancel) cancellation.push(rule);
    if (mentionsChange) dateChange.push(rule);
    if (!mentionsCancel && !mentionsChange) {
      cancellation.push(rule);
      dateChange.push(rule);
    }
  }

  return { cancellation, dateChange };
}

export const FareRulesModal: React.FC<FareRulesModalProps> = ({ visible, legs, onClose }) => {
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<FareRuleTab>('cancellation');
  const offerIds = useMemo(() => legs.map((l) => l.offerId), [legs]);
  const { data, isLoading, isError } = useFareRulesMobile(offerIds);

  const activeLeg = legs[activeLegIndex];
  const isMultiLeg = legs.length > 1;

  const subtitle = isMultiLeg
    ? `${[...new Set(legs.map((l) => l.airlineName))].join(', ')} · ${legs
        .flatMap((l) => l.flightNumbers)
        .join(', ')} · per passenger`
    : 'All charges are per passenger';

  const activeLegRules = data?.legs.find((l) => l.offerId === activeLeg?.offerId)?.rules ?? [];
  const { cancellation, dateChange } = categorizeRules(activeLegRules);
  const visibleRules = activeTab === 'cancellation' ? cancellation : dateChange;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Fare rules</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isMultiLeg ? (
            <View style={styles.legPillRow}>
              {legs.map((leg, index) => {
                const isActive = index === activeLegIndex;
                return (
                  <TouchableOpacity
                    key={leg.offerId}
                    style={[styles.legPill, isActive && styles.legPillActive]}
                    onPress={() => setActiveLegIndex(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.legPillLabel, isActive && styles.legPillLabelActive]}>{leg.label}</Text>
                    <Text style={styles.legPillRoute}>
                      {leg.origin} → {leg.destination}
                    </Text>
                    <Text style={styles.legPillMeta}>
                      {formatWeekdayDate(leg.departureDateTime)} · {formatTime24(leg.departureDateTime)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : activeLeg ? (
            <View style={styles.flightCard}>
              <View style={styles.flightCardLeft}>
                <View style={styles.flightIconBadge}>
                  <Plane size={18} color="#FFFFFF" strokeWidth={2} />
                </View>
                <View>
                  <Text style={styles.flightRoute}>
                    {activeLeg.origin} → {activeLeg.destination}
                  </Text>
                  <Text style={styles.flightMeta}>
                    {activeLeg.airlineName} · {activeLeg.flightNumbers.join(', ')}
                  </Text>
                </View>
              </View>
              <View style={styles.flightTimeCol}>
                <Text style={styles.flightTime}>{formatTime24(activeLeg.departureDateTime)}</Text>
                <Text style={styles.flightDate}>{formatWeekdayDate(activeLeg.departureDateTime)}</Text>
              </View>
            </View>
          ) : null}

          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'cancellation' && styles.tabActive]}
              onPress={() => setActiveTab('cancellation')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activeTab === 'cancellation' && styles.tabLabelActive]}>
                Cancellation
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'dateChange' && styles.tabActive]}
              onPress={() => setActiveTab('dateChange')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabLabel, activeTab === 'dateChange' && styles.tabLabelActive]}>Date change</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color="#7C1AEE" style={styles.loadingIndicator} />
          ) : isError ? (
            <Text style={styles.emptyStateText}>Couldn't load fare rules right now. Please try again.</Text>
          ) : visibleRules.length === 0 ? (
            <Text style={styles.emptyStateText}>No specific {activeTab === 'cancellation' ? 'cancellation' : 'date change'} rule was provided for this fare.</Text>
          ) : (
            visibleRules.map((rule, index) => (
              <View key={`${rule.segmentId}-${index}`} style={styles.ruleCard}>
                <Text style={styles.ruleName}>{rule.fareRuleName}</Text>
                <Text style={styles.ruleDesc}>{rule.fareRuleDesc}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.gotItButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.gotItButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
