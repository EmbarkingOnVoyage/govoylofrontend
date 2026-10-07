import { StyleSheet } from 'react-native';

// Values follow the Figma "ROUND TRIP no border" date picker frame.
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CCD3E0',
  },
  backButton: {
    paddingVertical: 2,
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
    paddingTop: 22,
    paddingBottom: 6,
  },
  monthHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  monthHeadingLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#CCD3E0',
  },
  monthHeading: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
    color: '#182339',
    marginHorizontal: 4,
  },
  holidayCountBadge: {
    height: 18,
    paddingHorizontal: 8,
    borderRadius: 9,
    backgroundColor: '#E3F8E8',
    justifyContent: 'center',
  },
  holidayCountBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '500',
    color: '#1E7B34',
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
    right: -7,
    top: -1,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#138A36',
  },
  holidayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  priceText: {
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },
  priceTextCheap: {
    color: '#138A36',
  },
  priceTextMid: {
    color: '#D46B08',
  },
  priceTextHigh: {
    color: '#C8102E',
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
    backgroundColor: '#138A36',
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
    fontSize: 15,
    lineHeight: 20,
    color: '#182339',
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: '#ADB8CD',
    fontWeight: '400',
  },
  dayTextSelected: {
    color: '#FFFFFF',
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
});
