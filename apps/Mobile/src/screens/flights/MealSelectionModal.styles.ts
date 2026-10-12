import { StyleSheet } from 'react-native';
import { styles as baggageStyles } from './BaggageSelectionModal.styles';

// Matches the Figma "Meal" modal (Product → Phone Dev). Header, footer and the
// card / traveller block look are shared with the checked baggage modal.
export const styles = StyleSheet.create({
  ...baggageStyles,
  travelerName: {
    ...baggageStyles.travelerName,
    marginBottom: 10,
  },
  included: {
    color: '#1E9E5A',
    fontWeight: '700',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
  },
  card: {
    ...baggageStyles.card,
    width: undefined,
    minWidth: 76,
    minHeight: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#182339',
    textAlign: 'center',
  },
  cardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7C1AEE',
    marginTop: 4,
  },
  otherLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#182339',
    marginTop: 14,
    marginBottom: 6,
  },
  singleNote: {
    marginBottom: 12,
    fontSize: 13,
    lineHeight: 16,
    color: '#697691',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#7C8CAD',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxOn: {
    backgroundColor: '#7C1AEE',
    borderColor: '#7C1AEE',
  },
  checkLabel: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#182339',
  },
  checkPrice: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#6A16CB',
  },
});
