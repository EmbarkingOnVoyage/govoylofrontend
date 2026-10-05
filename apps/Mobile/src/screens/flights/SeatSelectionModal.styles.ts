import { StyleSheet } from 'react-native';

// Matches the Figma "Seat selection" modal (Product → Phone Dev).
const PURPLE = '#7C1AEE';
const SEAT_SIZE = 36;

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
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#182339',
  },
  subtitle: {
    fontSize: 15,
    color: '#182339',
    marginTop: 2,
  },
  headerSpacer: {
    width: 44,
  },
  segmentTabs: {
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  segmentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCD3E0',
  },
  segmentChipActive: {
    borderColor: PURPLE,
    backgroundColor: '#F4ECFE',
  },
  segmentChipText: {
    fontSize: 12,
    color: '#697691',
  },
  segmentChipTextActive: {
    color: PURPLE,
    fontWeight: '600',
  },
  travelerTabs: {
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },
  // Horizontal tab strips keep their natural height; only the seat map flexes.
  tabStrip: {
    flexGrow: 0,
    flexShrink: 0,
  },
  travelerTab: {
    minHeight: 52,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  travelerTabActive: {
    borderBottomColor: PURPLE,
  },
  travelerTabName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#182339',
  },
  travelerTabNameActive: {
    color: PURPLE,
  },
  travelerTabSeat: {
    fontSize: 12,
    fontWeight: '700',
    color: '#114BFF',
    marginTop: 2,
  },
  travelerTabRandom: {
    fontSize: 12,
    color: '#697691',
    marginTop: 2,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF4E8',
    marginHorizontal: 16,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSeat: {
    width: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendText: {
    fontSize: 12,
    color: '#182339',
  },
  stateBox: {
    marginTop: 32,
    marginHorizontal: 24,
  },
  stateText: {
    fontSize: 14,
    color: '#697691',
    textAlign: 'center',
  },
  // Takes the space between the tabs and the footer, so Total / Save stay on screen.
  map: {
    flex: 1,
  },
  mapContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D5DAE3',
  },
  sectionHeading: {
    fontSize: 12,
    color: '#697691',
  },
  seatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 10,
  },
  exitSlot: {
    width: 14,
    alignItems: 'center',
  },
  aisle: {
    width: 24,
    alignItems: 'center',
  },
  rowNumber: {
    fontSize: 13,
    color: '#697691',
  },
  seat: {
    width: SEAT_SIZE,
    height: SEAT_SIZE,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatAvailable: {
    backgroundColor: '#F4ECFE',
    borderColor: '#C9A8F7',
  },
  seatLegroom: {
    backgroundColor: '#EAF0FF',
    borderColor: '#A9BEF5',
  },
  seatUnavailable: {
    backgroundColor: '#E9ECF1',
    borderColor: '#D5DAE3',
  },
  seatSelected: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  seatTaken: {
    backgroundColor: '#B48AF0',
    borderColor: '#B48AF0',
  },
  seatText: {
    fontSize: 13,
    fontWeight: '600',
    color: PURPLE,
  },
  seatTextLegroom: {
    color: '#114BFF',
  },
  seatTextSelected: {
    color: '#FFFFFF',
  },
  legroomDot: {
    position: 'absolute',
    top: -3,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#114BFF',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
  },
  totalLabel: {
    fontSize: 14,
    color: '#182339',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: PURPLE,
  },
  saveButton: {
    height: 48,
    paddingHorizontal: 56,
    borderRadius: 8,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
