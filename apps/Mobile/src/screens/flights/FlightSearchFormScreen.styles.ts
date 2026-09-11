import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  headerPills: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  pillActive: {
    backgroundColor: '#7C1AEE',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillActiveText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  pillInactive: {
    backgroundColor: '#ECEEF3',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pillInactiveText: {
    color: '#182339',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ECEEF3',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tabRow: {
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  tabButtonActive: {
    backgroundColor: '#040B1F',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#182339',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
  },
  cardBody: {
    padding: 16,
  },
  odRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  odField: {
    flex: 1,
  },
  odLabel: {
    fontSize: 12,
    color: '#7C8CAD',
    marginBottom: 4,
  },
  odValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#182339',
  },
  odPlaceholder: {
    fontSize: 15,
    fontWeight: '700',
    color: '#9CA3AF',
  },
  swapButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#ECEEF3',
    marginVertical: 14,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateField: {
    flex: 1,
  },
  segmentCard: {
    borderWidth: 1,
    borderColor: '#ECEEF3',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  segmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  segmentTag: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C1AEE',
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  addFlightButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    marginBottom: 4,
  },
  addFlightText: {
    color: '#7C1AEE',
    fontWeight: '700',
    fontSize: 14,
  },
  input: {
    height: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  passengerRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passengerRowText: {
    fontSize: 14,
    color: '#182339',
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182339',
    marginTop: 20,
    marginBottom: 10,
  },
  fareRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fareButton: {
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fareButtonSelected: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  fareButtonText: {
    fontSize: 13,
    color: '#182339',
    fontWeight: '500',
  },
  fareButtonTextSelected: {
    color: '#7C1AEE',
    fontWeight: '700',
  },
  nonStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  nonStopLabel: {
    fontSize: 14,
    color: '#182339',
    fontWeight: '500',
  },
  searchButton: {
    marginTop: 20,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#CEAAFF',
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
