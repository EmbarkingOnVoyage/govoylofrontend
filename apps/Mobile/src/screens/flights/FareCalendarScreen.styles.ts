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
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#182339',
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C8CAD',
  },
  monthBlock: {
    marginBottom: 20,
  },
  monthHeadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  monthHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#182339',
  },
  holidayCountBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 2,
    borderRadius: 8,
    paddingVertical: 4,
  },
  dayNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  holidayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#16A34A',
  },
  holidayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  priceText: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 1,
  },
  priceTextCheap: {
    color: '#16A34A',
  },
  priceTextRegular: {
    color: '#D97706',
  },
  priceTextSelected: {
    color: '#FFFFFF',
  },
  holidayNotesBlock: {
    paddingHorizontal: 16,
    marginTop: 4,
  },
  holidayNoteText: {
    fontSize: 12,
    color: '#4C5973',
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#7C1AEE',
  },
  dayCellDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    color: '#182339',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
  },
  footerLabel: {
    fontSize: 12,
    color: '#7C8CAD',
  },
  footerValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#182339',
    marginTop: 2,
  },
  confirmButton: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    height: 48,
    borderRadius: 8,
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
    fontWeight: '700',
  },
});
