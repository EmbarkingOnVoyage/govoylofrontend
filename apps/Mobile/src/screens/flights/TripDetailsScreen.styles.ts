import { Platform, StatusBar, StyleSheet } from 'react-native';
import { PURPLE, INK, MUTED, BORDER, GREEN } from './MyTripsScreen.styles';

// Matches the Figma "View details" (Flight Details) frame and the four
// "Cancel your booking?" modal variants (Product → Phone Dev).
export const RED = '#C8102E';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0) + 8,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: INK,
  },
  headerSpacer: {
    width: 44,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
    gap: 12,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  stateText: {
    fontSize: 15,
    color: MUTED,
    textAlign: 'center',
  },
  retryText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: PURPLE,
  },
  card: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
  },
  flightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  flightRowDivided: {
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
    marginTop: 12,
    paddingTop: 12,
  },
  legLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: PURPLE,
    marginBottom: 6,
    letterSpacing: 0.4,
  },
  carrierText: {
    fontSize: 13,
    color: MUTED,
  },
  timesText: {
    fontSize: 17,
    fontWeight: '700',
    color: INK,
    marginTop: 2,
  },
  flightMeta: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 14,
    padding: 14,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  statusSub: {
    fontSize: 14,
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: INK,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
    color: PURPLE,
  },
  passengerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3EAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: PURPLE,
  },
  passengerName: {
    fontSize: 16,
    color: INK,
  },
  passengerType: {
    fontSize: 13,
    color: MUTED,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  fareLabel: {
    fontSize: 14,
    color: MUTED,
  },
  fareValue: {
    fontSize: 14,
    color: INK,
  },
  fareDivider: {
    height: 1,
    backgroundColor: '#ECEEF3',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  refundValue: {
    fontSize: 15,
    fontWeight: '700',
    color: GREEN,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
    backgroundColor: '#FFFFFF',
  },
  ticketButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#FDECEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: RED,
  },

  // --- Cancel modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 35, 57, 0.55)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    maxHeight: '92%',
  },
  modalClose: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: INK,
    marginRight: 28,
  },
  modalRouteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  modalRoute: {
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  modalDate: {
    fontSize: 15,
    color: MUTED,
  },
  fareChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  fareChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  modalIntro: {
    fontSize: 15,
    color: MUTED,
    lineHeight: 22,
    marginTop: 14,
  },
  noticeBox: {
    flexDirection: 'row',
    gap: 10,
    borderRadius: 10,
    padding: 12,
    marginTop: 14,
  },
  noticeText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  breakdown: {
    backgroundColor: '#EEF1F6',
    borderRadius: 12,
    padding: 14,
    marginTop: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 5,
  },
  breakdownLabel: {
    flex: 1,
    fontSize: 14,
    color: MUTED,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3E4B64',
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  refundLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: INK,
  },
  refundAmount: {
    fontSize: 26,
    fontWeight: '700',
    color: GREEN,
  },
  refundNote: {
    fontSize: 13,
    color: MUTED,
    marginTop: 6,
    lineHeight: 18,
  },
  fareRulesLink: {
    fontSize: 14,
    color: '#2563EB',
    textDecorationLine: 'underline',
    marginTop: 14,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 22,
  },
  modalKeepButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#D3DAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalKeepText: {
    fontSize: 16,
    fontWeight: '500',
    color: INK,
  },
  modalCancelButton: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.5,
  },
  modalState: {
    alignItems: 'center',
    paddingVertical: 28,
  },
});
