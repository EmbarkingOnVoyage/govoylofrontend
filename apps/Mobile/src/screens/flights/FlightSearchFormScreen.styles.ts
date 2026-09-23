import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#ECEEF3',
  },
  overlayContainer: {
    backgroundColor: '#ECEEF3',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    overflow: 'hidden',
  },
  // Wraps header + trip-type tabs + the white fields card — the gradient
  // extends exactly this far (matches Figma's "Rectangle 1" fill), then the
  // plain #ECEEF3 screen background shows below it.
  gradientWrap: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    padding: 4,
    zIndex: 1,
  },
  // Matches Figma's "FLIGHT VOYLO AI" component: one gradient-bordered
  // capsule (136 Hug x 32 Hug, radius 20, border 2px) wrapping both pills,
  // centered in the header regardless of the back button's own width.
  pillGroupBorder: {
    borderRadius: 20,
    padding: 2,
  },
  pillGroupInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 2,
    gap: 2,
  },
  pillActive: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  pillActiveText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  pillInactive: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
  },
  pillInactiveText: {
    color: '#000000',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '400',
  },
  // Plain layout wrapper (no bg/border of its own) — each field group below
  // is its own independently bordered white box sitting on the gradient,
  // matching Figma's "Frame 284" (fields) + "ListChoice" (travellers) split
  // rather than one big card holding everything.
  contentWrap: {
    marginHorizontal: 16,
    marginTop: 6,
    gap: 10,
  },
  // Matches Figma's "Frame 263": the From/To + Departure/Return group.
  fieldsGroup: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 6,
    padding: 8,
  },
  // Its own separate white pill, distinct from the fields card below —
  // matches Figma's "one way" tab-bar component (radius 20, 2px gaps).
  tabBarWrap: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    gap: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  tabButtonActive: {
    backgroundColor: '#040B1F',
  },
  tabButtonText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '400',
    color: '#182339',
  },
  tabButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  odRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  odField: {
    flex: 1,
  },
  // Applied to the second field in a row (To / Return) — right-aligned to
  // mirror the first (From / Departure), matching Figma's layout.
  odFieldEnd: {
    alignItems: 'flex-end',
  },
  odLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#697691',
    marginBottom: 4,
  },
  odValue: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
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
    backgroundColor: '#99A6C0',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  multiCityDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  multiCityDateInput: {
    flex: 1,
  },
  flightTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 10,
  },
  flightTagText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: '#6014B7',
  },
  addFlightButton: {
    backgroundColor: '#FFFFFF',
    height: 32,
    borderRadius: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  addFlightText: {
    color: '#7C1AEE',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 16,
  },
  input: {
    height: 44,
    justifyContent: 'center',
  },
  // Matches Figma's "ListChoice" component — its own bordered white box,
  // separate from the fields group above it.
  passengerRow: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 44,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  passengerRowText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#182339',
    fontWeight: '500',
  },
  sectionHeading: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#182339',
    marginTop: 20,
    marginBottom: 10,
  },
  fareRow: {
    flexDirection: 'row',
    gap: 10,
  },
  fareButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#697691',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  fareButtonSelected: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  fareButtonText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#697691',
    fontWeight: '500',
  },
  fareButtonTextSelected: {
    color: '#7C1AEE',
    fontWeight: '700',
  },
  nonStopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  nonStopLabel: {
    fontSize: 15,
    lineHeight: 20,
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
  },
});
