import { StyleSheet } from 'react-native';

// Matches the Figma "Fare rules" frames (Product → Phone Dev: Frame 463/467
// single flight, 468 onward/return, 469 multi-city, 470 airline-policy cards).
export const PURPLE = '#7C1AEE';
const INK = '#182339';
const MUTED = '#697691';
const BORDER = '#D9E1EC';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // --- Single flight card
  flightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  flightCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  flightLogo: {
    borderRadius: 8,
  },
  flightRoute: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  flightMeta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  flightTimeCol: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  flightTime: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  flightDate: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },

  // --- Flight strip (onward/return, multi-city)
  legPillScroll: {
    marginHorizontal: -16,
    marginBottom: 12,
  },
  legPillRow: {
    gap: 8,
    paddingHorizontal: 16,
  },
  legPill: {
    width: 150,
    borderWidth: 1,
    borderColor: '#B9C3D3',
    borderRadius: 12,
    padding: 12,
  },
  legPillActive: {
    borderWidth: 2,
    borderColor: PURPLE,
    padding: 11,
  },
  legPillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  legPillLabelActive: {
    color: PURPLE,
  },
  legPillRoute: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    marginTop: 4,
  },
  legPillMeta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },

  // --- Cancellation / Date change switch
  tabRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  tabActive: {
    backgroundColor: '#F3E8FF',
    borderColor: '#C9A0F5',
  },
  tabLabel: {
    fontSize: 14,
    color: '#3E4B64',
  },
  tabLabelActive: {
    color: INK,
    fontWeight: '500',
  },
  loadingIndicator: {
    marginVertical: 32,
  },
  emptyStateText: {
    fontSize: 13,
    color: MUTED,
    textAlign: 'center',
    marginVertical: 24,
  },

  // --- Banded rules (Frames 463–469)
  rulesCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  rulesCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 52,
  },
  timeline: {
    width: 18,
    alignItems: 'center',
    alignSelf: 'stretch',
    paddingTop: 4,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#C9CFF0',
    marginVertical: 3,
  },
  ruleBody: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 10,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  ruleWindow: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  ruleRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  ruleAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  ruleAmountLabel: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  chipRed: {
    backgroundColor: '#FDECEE',
  },
  chipGrey: {
    backgroundColor: '#E6EAF1',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextRed: {
    color: '#C8102E',
  },
  chipTextGrey: {
    color: '#4C5973',
  },

  // --- Airline-policy cards (Frame 470)
  policyCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },
  policyIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  policyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: INK,
  },
  policySection: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  policyNote: {
    fontSize: 13,
    color: '#3E4B64',
    lineHeight: 19,
    marginTop: 8,
  },
  policyFeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  policyFeeLabel: {
    fontSize: 13,
    color: MUTED,
  },
  policyFeeValue: {
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },

  // --- Notices
  noticeBox: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  noticeBlue: {
    backgroundColor: '#EEF3FF',
  },
  noticeOrange: {
    backgroundColor: '#FEF3E7',
  },
  noticeIcon: {
    marginTop: 2,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#3E4B64',
    lineHeight: 19,
  },
  noticeStrong: {
    fontWeight: '700',
    color: INK,
  },

  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
  },
  gotItButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gotItButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
