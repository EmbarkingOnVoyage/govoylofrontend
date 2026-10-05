import { StyleSheet } from 'react-native';
import { styles as seatStyles } from './SeatSelectionModal.styles';

// Matches the Figma "Checked baggage" modal (Product → Phone Dev). Header and
// footer are shared with the seat selection modal.
const PURPLE = '#7C1AEE';

export const styles = StyleSheet.create({
  screen: seatStyles.screen,
  header: seatStyles.header,
  backButton: seatStyles.backButton,
  headerTitles: seatStyles.headerTitles,
  title: seatStyles.title,
  subtitle: seatStyles.subtitle,
  headerSpacer: seatStyles.headerSpacer,
  footer: seatStyles.footer,
  totalLabel: seatStyles.totalLabel,
  totalValue: seatStyles.totalValue,
  saveButton: seatStyles.saveButton,
  saveButtonText: seatStyles.saveButtonText,
  stateBox: seatStyles.stateBox,
  stateText: seatStyles.stateText,
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  travelerBlock: {
    paddingVertical: 12,
  },
  travelerBlockDivided: {
    borderTopWidth: 1,
    borderTopColor: '#D9E1EC',
  },
  travelerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#182339',
  },
  included: {
    fontSize: 13,
    color: '#8A94A6',
    marginTop: 4,
    marginBottom: 10,
  },
  cardRow: {
    gap: 10,
    paddingRight: 16,
  },
  card: {
    width: 104,
    minHeight: 92,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#8A94A6',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 8,
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: PURPLE,
    borderWidth: 2,
  },
  noneCard: {
    backgroundColor: '#E9ECF1',
    justifyContent: 'center',
  },
  noneText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475467',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475467',
  },
  pieceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardHeading: {
    fontSize: 16,
    color: '#182339',
  },
  cardWeight: {
    fontSize: 16,
    color: '#182339',
  },
  cardPrice: {
    fontSize: 17,
    fontWeight: '700',
    color: PURPLE,
    marginTop: 4,
  },
});
