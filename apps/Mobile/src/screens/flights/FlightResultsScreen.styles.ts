import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Edit-search popup (Figma "Round Trip" overlay): the form sizes itself to
  // its own content and sits at the top; this backdrop fills whatever screen
  // space is left below it and dismisses the popup on tap, like a dropdown.
  editOverlayRoot: {
    flex: 1,
  },
  editOverlayBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 11, 31, 0.5)',
  },
  // Shared bottom-sheet shell for the filter-bar's dropdown modals (Sort by,
  // Airline, Time, etc.) — matches Figma's "Modal (Mobile)" component: a
  // white sheet with only the top corners rounded, pinned to the bottom.
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(4, 11, 31, 0.5)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '700',
    color: '#182339',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  modalListRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },
  modalListRowIcon: {
    width: 16,
    alignItems: 'center',
  },
  modalListRowTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#182339',
  },
  modalListRowTitleSelected: {
    color: '#114BFF',
  },
  modalListRowDescription: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '400',
    color: '#3E4B64',
    marginTop: 8,
  },
  modalCloseButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  modalCloseButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#6014B7',
  },
  modalSectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#697691',
    marginBottom: 8,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  checkRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkRowLogoBadge: {
    width: 20,
    height: 20,
    borderRadius: 2,
    backgroundColor: '#F2F3F8',
    borderWidth: 1,
    borderColor: '#DFE3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkRowLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#182339',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7C1AEE',
    borderColor: '#7C1AEE',
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalActionButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalActionButtonClose: {
    backgroundColor: '#F3E8FF',
  },
  modalActionButtonSave: {
    backgroundColor: '#7C1AEE',
  },
  modalSaveButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  timeSectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#182339',
    marginBottom: 8,
  },
  timeSectionLabelSpaced: {
    marginTop: 16,
  },
  timeBucketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  timeBucketCard: {
    width: '45%',
    minWidth: 0,
  },
  filterScreenSheet: {
    height: '85%',
  },
  filterScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterScreenResultCount: {
    fontSize: 12,
    color: '#697691',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  filterTabBar: {
    flexGrow: 0,
    marginBottom: 12,
  },
  filterTabChip: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CCD3E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  filterTabChipActive: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  filterTabChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3E4B64',
  },
  filterTabChipTextActive: {
    color: '#7C1AEE',
  },
  filterScreenBody: {
    flex: 1,
  },
  filterBaggageNote: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  baggageStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  baggageStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  baggageStepperButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  baggageStepperValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#182339',
    minWidth: 16,
    textAlign: 'center',
  },
  filterSliderValue: {
    fontSize: 13,
    color: '#697691',
    textAlign: 'center',
    marginTop: 4,
  },
  headerSafeArea: {
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 56,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CCD3E0',
    shadowColor: '#1B3249',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    marginHorizontal: 5,
  },
  // Multi-city's header can have several origin/destination pairs chained
  // together — smaller and allowed to wrap, unlike the single large
  // "origin ⇋ destination" round-trip/one-way row above.
  multiCityRouteRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
  },
  multiCityRouteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#182339',
  },
  multiCityRouteIcon: {
    marginHorizontal: 4,
  },
  multiCityRouteSeparator: {
    fontSize: 13,
    fontWeight: '400',
    color: '#ADB8CD',
    marginHorizontal: 6,
  },
  routeText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#182339',
  },
  routeSubtitle: {
    fontSize: 13,
    lineHeight: 16,
    color: '#3E4B64',
  },
  headerTitle: {
    color: '#182339',
    fontSize: 16,
    fontWeight: '700',
  },
  dateStripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  dateStrip: {
    flexGrow: 0,
  },
  dateStripContent: {
    paddingLeft: 16,
    paddingRight: 16,
    paddingVertical: 6,
    gap: 4,
  },
  dateStripLoader: {
    marginRight: 16,
  },
  filterBar: {
    flexGrow: 0,
  },
  filterBarContent: {
    paddingHorizontal: 16,
    paddingTop: 3,
    paddingBottom: 10,
    gap: 4,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCD3E0',
    borderRadius: 8,
    paddingHorizontal: 12.5,
  },
  filterChipActive: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  filterChipText: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: '#3E4B64',
  },
  filterChipTextActive: {
    color: '#7C1AEE',
  },
  dateCard: {
    width: 82,
    height: 37,
    borderWidth: 1,
    borderColor: '#D7DCE7',
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  dateCardSelected: {
    borderColor: '#114BFF',
  },
  dateCardLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600',
    color: '#182339',
  },
  dateCardLabelSelected: {
    color: '#182339',
  },
  dateCardPrice: {
    fontSize: 12,
    lineHeight: 16,
    color: '#697691',
  },
  dateCardPriceSelected: {
    color: '#697691',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingTop: 0,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182339',
    marginBottom: 10,
    marginTop: 4,
  },
  promoBanner: {
    width: '100%',
    height: 52,
    borderRadius: 4,
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateText: {
    fontSize: 15,
    color: '#4C5973',
  },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  strip: {
    flex: 1,
    marginTop: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stripText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#FFFFFF',
    letterSpacing: 1.1,
    transform: [{ rotate: '-90deg' }],
    width: 70,
    textAlign: 'center',
  },
  cardBody: {
    flex: 1,
    paddingLeft: 16.7,
    paddingRight: 7.7,
    paddingTop: 2.9,
    paddingBottom: 5.7,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 18,
    marginBottom: 14.25,
  },
  airlineNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  airlineLogoBadge: {
    width: 24,
    height: 24,
    borderRadius: 2,
    backgroundColor: '#3A469D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  airlineName: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#182339',
  },
  flightNumbersText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#697691',
  },
  journeyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  timeBlock: {
    width: 59.3,
    marginTop: 4.35,
  },
  timeBlockEnd: {
    width: undefined,
    marginLeft: 25.7,
  },
  timeText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '500',
    color: '#182339',
  },
  dayOffsetText: {
    fontSize: 8,
    fontWeight: '500',
    color: '#C5001F',
  },
  codeText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#697691',
    marginTop: 1.6,
  },
  durationBlock: {
    width: 60,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#697691',
  },
  durationLine: {
    width: 60,
    height: 0,
    borderTopWidth: 1,
    borderColor: '#697691',
    marginTop: 2.85,
    marginBottom: 2.3,
  },
  stopsText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#697691',
  },
  dashedDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#E1E5ED',
    marginTop: 9,
    marginBottom: 4.3,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  layoverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexShrink: 1,
  },
  layoverText: {
    fontSize: 10,
    lineHeight: 16,
    color: '#697691',
  },
  moreLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8.5,
  },
  moreLinkText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#7C1AEE',
  },
  priceText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    color: '#FF8011',
  },
  detailsRouteCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ECEEF3',
    overflow: 'hidden',
    marginBottom: 20,
  },
  detailsRouteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#6014B7',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailsRouteHeaderText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsRouteHeaderDuration: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  detailsSegmentBlock: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  detailsSegmentLeftCol: {
    width: 72,
    alignItems: 'flex-end',
  },
  detailsSegmentTimeSlot: {
    alignItems: 'flex-end',
  },
  detailsSegmentTime: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#182339',
  },
  detailsSegmentDate: {
    fontSize: 11,
    lineHeight: 14,
    color: '#697691',
  },
  detailsDurationSlot: {
    height: 32,
  },
  detailsDurationSlotCentered: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  detailsRailCol: {
    width: 24,
    alignItems: 'center',
  },
  detailsRailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#182339',
  },
  detailsRailLineHalf: {
    flex: 1,
    width: 1,
    backgroundColor: '#ADB8CD',
  },
  detailsRailPlaneIcon: {
    transform: [{ rotate: '180deg' }],
  },
  detailsSegmentRightCol: {
    flex: 1,
  },
  detailsSegmentCitySlot: {
    minHeight: 20,
  },
  detailsSegmentCity: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    color: '#182339',
  },
  detailsSegmentAirportName: {
    fontSize: 12,
    lineHeight: 16,
    color: '#697691',
  },
  detailsDurationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    gap: 6,
  },
  detailsDurationText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#697691',
  },
  detailsCarrierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 15,
    backgroundColor: '#ECEEF3',
    paddingVertical: 3,
    paddingRight: 8,
    paddingLeft: 3,
  },
  detailsCarrierLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F2F3F8',
    borderWidth: 1,
    borderColor: '#DFE3EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsCarrierName: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#182339',
  },
  detailsLayoverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F7F8FA',
  },
  detailsLayoverText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#3E4B64',
  },
  detailsFareSectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#182339',
    marginBottom: 12,
  },
  cabinTierRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  cabinTierCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CCD3E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  cabinTierCardSelected: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  cabinTierLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182339',
  },
  cabinTierLabelSelected: {
    color: '#6014B7',
  },
  cabinTierPrice: {
    fontSize: 12,
    lineHeight: 16,
    color: '#697691',
    marginTop: 2,
  },
  fareCard: {
    borderWidth: 1,
    borderColor: '#ECEEF3',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  fareCardSelected: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  fareCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: '#7C1AEE',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#7C1AEE',
  },
  fareCardPrice: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#182339',
  },
  fareCardRefundable: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#007F20',
  },
  fareCardNonRefundable: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: '#697691',
  },
  fareCardBaggage: {
    fontSize: 12,
    lineHeight: 16,
    color: '#697691',
    marginTop: 8,
    marginLeft: 30,
  },
  detailsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingTop: 14,
    paddingHorizontal: 4,
    marginTop: 4,
    // Figma shows this as a distinct elevated strip sitting above the
    // scrollable fare list, not just a plain top border.
    shadowColor: '#040B1F',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  detailsFooterPrice: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#182339',
  },
  detailsFooterTravellerCount: {
    fontSize: 12,
    lineHeight: 16,
    color: '#697691',
    marginTop: 2,
  },
  detailsContinueButton: {
    height: 44,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContinueButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // "Individual Flights" / "Combine Flights" pill toggle, shown only for a
  // round-trip search, right below the date strip.
  roundTripTabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#ECEEF3',
    borderRadius: 8,
    padding: 3,
  },
  roundTripTab: {
    flex: 1,
    height: 34,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundTripTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#040B1F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  roundTripTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#697691',
  },
  roundTripTabTextActive: {
    color: '#7C1AEE',
  },
  // "Individual Flights" step 2: the onward flight already picked, summarized
  // above the return list with a way back to step 1.
  onwardSelectionBar: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E3CCFB',
  },
  onwardSelectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onwardSelectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#182339',
    flexShrink: 1,
  },
  onwardSelectionChangeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C1AEE',
  },
  onwardSelectionSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  onwardSelectionAirline: {
    fontSize: 13,
    fontWeight: '600',
    color: '#182339',
    flexShrink: 1,
  },
  onwardSelectionTimes: {
    fontSize: 13,
    color: '#4C5973',
    marginLeft: 'auto',
  },
  // "Combine Flights" card: one onward CombinedLegRow + one return
  // CombinedLegRow stacked in a single FlightOfferCard-style shell.
  combinedLegRow: {
    marginBottom: 4,
  },
  combinedLegTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  combinedLegAirlineName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#182339',
  },
  combinedLegLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C1AEE',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  // Multi-city "Combine Flights" card's "Trip-N | <airlines>" row heading —
  // same weight/color as combinedLegAirlineName, just standing alone instead
  // of sharing combinedLegTopRow with an Onward/Return label.
  multiCityTripLabel: {
    marginBottom: 8,
  },
  combinedPriceRow: {
    height: 28,
    marginTop: 10,
    marginLeft: -15,
    marginRight: -8,
    marginBottom: -8,
    backgroundColor: '#F2E6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Flight-details modal's Onward/Return tabs — shown only when reviewing a
  // paired round-trip selection.
  detailsLegTabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#DFE3EC',
  },
  detailsLegTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  detailsLegTabActive: {
    borderBottomColor: '#7C1AEE',
  },
  detailsLegTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#697691',
  },
  detailsLegTabTextActive: {
    color: '#7C1AEE',
  },
  stripColumn: {
    width: 17,
  },
  // Combined/multi-city cards have no corner logo, so their strip runs the
  // card's full height.
  stripFull: {
    marginTop: 0,
  },
  cardLogo: {
    position: 'absolute',
    top: 3,
    left: 3,
  },
  journeyTimes: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  journeyTimesSpread: {
    flex: 1,
    justifyContent: 'space-between',
  },
  spreadBlock: {
    width: undefined,
    marginLeft: 0,
    marginTop: 0,
  },
  durationLineDashed: {
    borderStyle: 'dashed',
  },
  priceBlock: {
    alignItems: 'flex-end',
    marginTop: -1.25,
  },
  routeSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  routeSubtitleStrong: {
    fontSize: 13,
    lineHeight: 16,
    color: '#182339',
  },
  dateStripMonth: {
    width: 20,
    height: 37,
    borderRadius: 1,
    backgroundColor: '#3C0D74',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 1,
  },
  dateStripMonthText: {
    width: 37,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    transform: [{ rotate: '90deg' }],
  },
  dateCardPriceCheapest: {
    color: '#007F20',
  },
  dateCardPriceHigher: {
    color: '#C5001F',
  },
  dateCardPriceEmpty: {
    color: '#697691',
  },
  combinedBookText: {
    position: 'absolute',
    right: 24,
    fontSize: 13,
    lineHeight: 18,
    color: '#7C1AEE',
  },
});
