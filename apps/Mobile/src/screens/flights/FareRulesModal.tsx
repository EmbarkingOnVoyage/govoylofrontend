import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { ModalSafeArea } from '../../components/ModalSafeArea';
import { Info, Clock, ArrowLeft, CalendarDays } from 'lucide-react-native';
import { useFareRulesMobile } from '@workspace/ui';
import { styles, PURPLE } from './FareRulesModal.styles';
import {
  buildRows,
  money,
  textRulesFor,
  type FareRuleTab,
  type RuleRow,
} from '@workspace/ui/src/features/flights/logic/fareRules';
import { AirlineLogo } from './FlightResultsScreen';

export interface FareRulesLeg {
  offerId: string;
  label: string;
  origin: string;
  destination: string;
  airlineName: string;
  airlineCode?: string;
  flightNumbers: string[];
  departureDateTime: string;
  // Every flight of the leg — a combined return/multi-city fare is one offer
  // whose rules come back per trip, and each trip gets its own tab.
  segments?: { origin: string; destination: string; departureDateTime: string }[];
  // The fare picked in the fare modal, if any.
  fareId?: string | null;
}

interface FareRulesModalProps {
  visible: boolean;
  legs: FareRulesLeg[];
  onClose: () => void;
}

// One tab in the flight strip: a leg, or one trip of a combined fare.
interface RuleTab {
  key: string;
  offerId: string;
  route: string | null;
  label: string;
  origin: string;
  destination: string;
  departureDateTime: string;
}

function formatTime24(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '--:--';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatWeekdayDate(iso: string): string {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  const weekday = date.toLocaleDateString('en-GB', { weekday: 'short' });
  return `${weekday}, ${date.getDate()} ${date.toLocaleDateString('en-GB', { month: 'short' })}`;
}

const TONE_COLOR: Record<RuleRow['tone'], string> = {
  green: '#15803D',
  orange: '#D97706',
  red: '#C8102E',
};

export const FareRulesModal: React.FC<FareRulesModalProps> = ({ visible, legs, onClose }) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<FareRuleTab>('Cancellation');
  const offerIds = useMemo(() => legs.map((l) => l.offerId), [legs]);
  const fareIds = useMemo(() => legs.map((l) => l.fareId ?? ''), [legs]);
  const { data, isLoading, isError } = useFareRulesMobile(offerIds, fareIds);

  // One tab per leg, or per trip when a single offer's rules come back for
  // several routes (a combined return or multi-city fare).
  const tabs = useMemo<RuleTab[]>(() => {
    const result: RuleTab[] = [];
    legs.forEach((leg) => {
      const routes = [
        ...new Set((data?.legs.find((l) => l.offerId === leg.offerId)?.policies ?? []).map((p) => p.route)),
      ];
      if (routes.length <= 1) {
        result.push({
          key: leg.offerId,
          offerId: leg.offerId,
          route: routes[0] ?? null,
          label: leg.label,
          origin: leg.origin,
          destination: leg.destination,
          departureDateTime: leg.departureDateTime,
        });
        return;
      }
      routes.forEach((route) => {
        const [origin, destination] = route.split('-');
        const segment = leg.segments?.find((s) => s.origin === origin);
        result.push({
          key: `${leg.offerId}-${route}`,
          offerId: leg.offerId,
          route,
          label: '',
          origin: origin ?? '',
          destination: destination ?? '',
          departureDateTime: segment?.departureDateTime ?? '',
        });
      });
    });
    // Leg labels (Onward/Return) only fit when each tab is a whole leg.
    const usesLegLabels = result.length === legs.length;
    return result.map((tab, index) => ({
      ...tab,
      label: usesLegLabels && tab.label ? tab.label : `Flight-${index + 1}`,
    }));
  }, [legs, data]);

  const active = tabs[Math.min(activeTabIndex, tabs.length - 1)];
  const activeLeg = legs.find((l) => l.offerId === active?.offerId) ?? legs[0];
  const legRules = data?.legs.find((l) => l.offerId === active?.offerId);
  const policies = (legRules?.policies ?? []).filter((p) => !active?.route || p.route === active.route);
  const rows = buildRows(policies, activeTab, activeLeg?.airlineName ?? '');
  const transactionFee = Math.max(
    0,
    ...policies.filter((p) => p.type === activeTab).map((p) => p.transactionFee ?? 0)
  );
  const textRules = textRulesFor(legRules?.rules ?? [], activeTab);
  const hasAmounts = rows.some((r) => r.amount != null);

  const isMultiTab = tabs.length > 1;
  const subtitle = isMultiTab
    ? `${[...new Set(legs.map((l) => l.airlineName))].join(', ')} · ${legs
        .flatMap((l) => l.flightNumbers)
        .join(', ')} · per passenger`
    : 'All charges are per passenger';

  const renderBanded = () => (
    <View style={styles.rulesCard}>
      <Text style={styles.rulesCaption}>
        {activeTab === 'Cancellation' ? 'IF YOU CANCEL…' : 'IF YOU CHANGE THE DATE…'}
      </Text>
      {rows.map((row, index) => {
        const isLast = index === rows.length - 1;
        return (
          <View key={`${row.title}-${index}`} style={styles.ruleRow}>
            <View style={styles.timeline}>
              <View style={[styles.dot, { backgroundColor: TONE_COLOR[row.tone] }]} />
              {!isLast ? <View style={styles.timelineLine} /> : null}
            </View>
            <View style={styles.ruleBody}>
              <Text style={styles.ruleTitle}>{row.title}</Text>
              <Text style={styles.ruleWindow}>{row.window}</Text>
            </View>
            <View style={styles.ruleRight}>
              {row.amount != null ? (
                <>
                  <Text style={styles.ruleAmount}>{money(row.amount)}</Text>
                  <Text style={styles.ruleAmountLabel}>
                    {activeTab === 'Cancellation' ? 'airline fee' : '+ fare difference'}
                  </Text>
                </>
              ) : row.chip ? (
                <View style={[styles.chip, row.tone === 'red' ? styles.chipRed : styles.chipGrey]}>
                  <Text style={[styles.chipText, row.tone === 'red' ? styles.chipTextRed : styles.chipTextGrey]}>
                    {row.chip}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );

  // Frame 470: no amounts to show — the airline sets the penalty at the time.
  const renderPolicyCard = () => {
    const Icon = activeTab === 'Cancellation' ? ArrowLeft : CalendarDays;
    const policyRows = rows.filter((r) => r.tone !== 'red');
    return (
      <View style={styles.policyCard}>
        <View style={styles.policyHeader}>
          <View
            style={[
              styles.policyIcon,
              { backgroundColor: activeTab === 'Cancellation' ? '#FEF3E7' : '#EEF3FF' },
            ]}
          >
            <Icon size={16} color={activeTab === 'Cancellation' ? '#C2410C' : '#2563EB'} strokeWidth={2} />
          </View>
          <Text style={styles.policyTitle}>{activeTab === 'Cancellation' ? 'Cancellation' : 'Date change'}</Text>
        </View>
        {policyRows.map((row, index) => (
          <View key={`p-${index}`} style={styles.policySection}>
            <View style={styles.policyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.ruleTitle}>{row.title}</Text>
                <Text style={styles.ruleWindow}>{row.window}</Text>
              </View>
              <View style={[styles.chip, styles.chipGrey]}>
                <Text style={[styles.chipText, styles.chipTextGrey]}>Airline policy</Text>
              </View>
            </View>
            {row.note ? <Text style={styles.policyNote}>{row.note}</Text> : null}
          </View>
        ))}
        {policyRows.length === 0
          ? textRules.map((rule, index) => (
              <View key={`${rule.segmentId}-${index}`} style={styles.policySection}>
                {rule.fareRuleName ? <Text style={styles.ruleTitle}>{rule.fareRuleName}</Text> : null}
                <Text style={styles.policyNote}>{rule.fareRuleDesc}</Text>
              </View>
            ))
          : null}
        {transactionFee > 0 ? (
          <View style={styles.policyFeeRow}>
            <Text style={styles.policyFeeLabel}>Transaction fee</Text>
            <Text style={styles.policyFeeValue}>+ {money(transactionFee)}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  const renderBody = () => {
    if (isLoading) {
      return <ActivityIndicator size="small" color={PURPLE} style={styles.loadingIndicator} />;
    }
    if (isError) {
      return <Text style={styles.emptyStateText}>Couldn't load fare rules right now. Please try again.</Text>;
    }
    if (hasAmounts) {
      return renderBanded();
    }
    if (rows.length > 0 || textRules.length > 0) {
      return renderPolicyCard();
    }
    return (
      <Text style={styles.emptyStateText}>
        No specific {activeTab === 'Cancellation' ? 'cancellation' : 'date change'} rule was provided for this fare.
      </Text>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <ModalSafeArea style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.title}>Fare rules</Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {isMultiTab ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.legPillRow}
              style={styles.legPillScroll}
            >
              {tabs.map((tab, index) => {
                const isActive = tab.key === active?.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    style={[styles.legPill, isActive && styles.legPillActive]}
                    onPress={() => setActiveTabIndex(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.legPillLabel, isActive && styles.legPillLabelActive]}>{tab.label}</Text>
                    <Text style={styles.legPillRoute}>
                      {tab.origin} → {tab.destination}
                    </Text>
                    {tab.departureDateTime ? (
                      <Text style={styles.legPillMeta}>
                        {formatWeekdayDate(tab.departureDateTime)} · {formatTime24(tab.departureDateTime)}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : activeLeg ? (
            <View style={styles.flightCard}>
              <View style={styles.flightCardLeft}>
                <AirlineLogo airlineCode={activeLeg.airlineCode ?? ''} size={40} style={styles.flightLogo} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.flightRoute}>
                    {activeLeg.origin} → {activeLeg.destination}
                  </Text>
                  <Text style={styles.flightMeta} numberOfLines={1}>
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
            {(['Cancellation', 'DateChange'] as FareRuleTab[]).map((tab) => {
              const isActive = tab === activeTab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.tab, isActive && styles.tabActive]}
                  onPress={() => setActiveTab(tab)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                    {tab === 'Cancellation' ? 'Cancellation' : 'Date change'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {renderBody()}

          {hasAmounts && transactionFee > 0 ? (
            <View style={[styles.noticeBox, styles.noticeBlue]}>
              <Info size={16} color="#2563EB" strokeWidth={2} style={styles.noticeIcon} />
              <Text style={styles.noticeText}>
                <Text style={styles.noticeStrong}>+ {money(transactionFee)} transaction fee</Text> per passenger on top
                of the airline fee.
              </Text>
            </View>
          ) : null}

          {!isLoading && !isError ? (
            <View style={[styles.noticeBox, styles.noticeOrange]}>
              <Clock size={16} color="#D97706" strokeWidth={2} style={styles.noticeIcon} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>Check-in closes 45 min before departure</Text>
                <Text style={styles.noticeText}>60 min for international flights. Fees are per passenger.</Text>
              </View>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.gotItButton} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.gotItButtonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </ModalSafeArea>
    </Modal>
  );
};
