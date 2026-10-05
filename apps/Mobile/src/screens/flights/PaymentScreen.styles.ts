import { StyleSheet } from 'react-native';

// Matches the Figma "Booking details" (Payment) frame and its Trip Summary /
// Fare Summary modals (Product → Phone Dev).
export const PURPLE = '#7C1AEE';
const INK = '#182339';
const MUTED = '#697691';
const BORDER = '#B9C3D3';
const LINE = '#D9E1EC';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
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
  content: {
    padding: 16,
  },

  // --- Trip + amount card
  summaryCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
  },
  tripBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  tripLogo: {
    borderRadius: 6,
  },
  tripRoute: {
    fontSize: 20,
    fontWeight: '700',
    color: INK,
  },
  tripMeta: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  amountBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  amountLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: INK,
  },
  amountSub: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '700',
    color: INK,
  },
  divider: {
    height: 1,
    backgroundColor: LINE,
    marginVertical: 16,
  },
  payUsing: {
    fontSize: 15,
    color: INK,
    marginBottom: 12,
  },
  methodsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  methodBadge: {
    width: 56,
    height: 34,
    borderRadius: 6,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  methodText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  payButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '500',
  },
  errorText: {
    fontSize: 13,
    color: '#C8102E',
    marginBottom: 12,
  },
  successBox: {
    alignItems: 'center',
    gap: 6,
    padding: 20,
    borderRadius: 12,
    backgroundColor: '#E7F8EE',
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#15803D',
  },
  successText: {
    fontSize: 14,
    color: '#3E4B64',
    textAlign: 'center',
  },

  // --- Bottom-sheet modals
  sheetBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(24, 35, 57, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3E4B64',
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  closeButton: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginHorizontal: 16,
  },
  closeButtonText: {
    fontSize: 17,
    fontWeight: '500',
    color: PURPLE,
  },

  // Trip Summary
  segmentsCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    overflow: 'hidden',
  },
  segmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
  },
  segmentRowDivided: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  segmentCarrier: {
    fontSize: 13,
    color: MUTED,
  },
  segmentTimes: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    marginTop: 1,
  },
  segmentMeta: {
    fontSize: 12,
    color: MUTED,
    marginTop: 2,
  },
  legCaption: {
    fontSize: 11,
    fontWeight: '700',
    color: PURPLE,
    letterSpacing: 0.6,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  travellersCaption: {
    fontSize: 12,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 8,
  },
  travellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ECEFF4',
    marginBottom: 6,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#D9DEE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3E4B64',
  },
  travellerName: {
    fontSize: 16,
    color: INK,
  },

  // Fare Summary
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  fareLabel: {
    fontSize: 16,
    color: '#3E4B64',
  },
  fareValue: {
    fontSize: 16,
    color: '#3E4B64',
  },
  addOnToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addOnList: {
    backgroundColor: '#ECEFF4',
    paddingHorizontal: 16,
  },
  addOnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: LINE,
  },
  addOnRowLast: {
    borderBottomWidth: 0,
  },
  addOnLabel: {
    fontSize: 14,
    color: MUTED,
  },
  addOnValue: {
    fontSize: 14,
    color: MUTED,
  },
  doubleRule: {
    height: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: LINE,
    marginTop: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: INK,
  },
  fareNote: {
    fontSize: 12,
    color: MUTED,
  },
});
