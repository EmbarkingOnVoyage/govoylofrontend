import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 96,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
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
    borderWidth: 1,
    borderColor: '#ECEEF3',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  airlineName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182339',
  },
  refundableTag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  refundableTagYes: {
    color: '#16A34A',
    backgroundColor: '#DCFCE7',
  },
  refundableTagNo: {
    color: '#7C8CAD',
    backgroundColor: '#ECEEF3',
  },
  segmentRow: {
    marginBottom: 8,
  },
  segmentRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeBlock: {
    alignItems: 'flex-start',
  },
  timeBlockEnd: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#182339',
  },
  codeText: {
    fontSize: 12,
    color: '#7C8CAD',
    marginTop: 2,
  },
  durationBlock: {
    alignItems: 'center',
  },
  durationText: {
    fontSize: 12,
    color: '#7C8CAD',
  },
  durationLine: {
    width: 60,
    height: 1,
    backgroundColor: '#ADB8CD',
    marginVertical: 4,
  },
  flightNumberText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  divider: {
    height: 1,
    backgroundColor: '#ECEEF3',
    marginVertical: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seatsText: {
    fontSize: 12,
    color: '#7C8CAD',
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#7C1AEE',
  },
});
