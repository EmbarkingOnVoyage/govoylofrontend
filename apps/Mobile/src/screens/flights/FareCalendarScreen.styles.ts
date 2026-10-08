import { StyleSheet } from 'react-native';

// Values follow the Figma "ROUND TRIP no border" date picker frame.
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  grabber: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ADB8CD',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 17,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CCD3E0',
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#182339',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    height: 41,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CCD3E0',
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    color: '#3E4B64',
  },
  monthBlock: {
    paddingTop: 20,
    paddingBottom: 6,
  },
  monthHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  monthHeadingLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCD3E0',
  },
  monthHeading: {
    fontSize: 13.5,
    lineHeight: 18,
    fontWeight: '500',
    color: '#182339',
    marginLeft: 3,
  },
  holidayCountBadge: {
    height: 18,
    paddingHorizontal: 8.7,
    borderRadius: 9,
    backgroundColor: '#E8FFEE',
    justifyContent: 'center',
    marginRight: 3,
  },
  holidayCountBadgeText: {
    fontSize: 10.5,
    lineHeight: 12,
    color: '#006219',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
  },
  dayCell: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  dayNumberRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  holidayDot: {
    position: 'absolute',
    right: -14,
    top: -3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007F20',
  },
  holidayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  priceText: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  priceTextCheap: {
    color: '#007F20',
  },
  priceTextMid: {
    color: '#CE6400',
  },
  priceTextHigh: {
    color: '#C5001F',
  },
  priceTextSelected: {
    color: '#FFFFFF',
  },
  holidayNotesBlock: {
    paddingHorizontal: 16,
    marginTop: 14,
    gap: 6,
  },
  holidayNoteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holidayNoteBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#007F20',
  },
  holidayNoteText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#3E4B64',
  },
  dayCellSelected: {
    backgroundColor: '#7C1AEE',
  },
  dayCellDisabled: {},
  dayText: {
    fontSize: 16,
    lineHeight: 20,
    color: '#182339',
    fontWeight: '500',
  },
  dayTextDisabled: {
    color: '#ADB8CD',
    fontWeight: '400',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  footerRow: {
    marginBottom: 12,
  },
  footerLabel: {
    fontSize: 13,
    lineHeight: 16,
    color: '#3E4B64',
  },
  footerValue: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '700',
    color: '#182339',
  },
  confirmButton: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CEAAFF',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },

  dayCellInRange: {
  backgroundColor: '#E8F1FF',
},

dayCellRangeStart: {
  backgroundColor: '#7C1AEE',
  borderTopLeftRadius: 8,
  borderBottomLeftRadius: 8,
},

dayCellRangeEnd: {
  backgroundColor: '#7C1AEE',
  borderTopRightRadius: 8,
  borderBottomRightRadius: 8,
},

});
