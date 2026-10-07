import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 16,
    color: '#697691',
    marginBottom: 12,
  },
  tabScroll: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#98A5BF',
  },
  tab: {
    width: 95,
    paddingTop: 4,
    paddingBottom: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#7C1AEE',
  },
  tabLabel: {
    fontSize: 13,
    lineHeight: 16,
    color: '#182339',
  },
  tabLabelActive: {
    color: '#7C1AEE',
  },
  tabRoute: {
    fontSize: 11,
    lineHeight: 16,
    color: '#697691',
  },
  tabRouteActive: {
    color: '#697691',
  },
  categoryTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
    color: '#3E4B64',
  },
  categorySubtitle: {
    fontSize: 13,
    lineHeight: 16,
    color: '#697691',
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 7,
    paddingBottom: 12,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#CCD3E0',
    borderStyle: 'dashed',
  },
  cardRowLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  infoCard: {
    width: 110,
    height: 86,
    borderWidth: 1,
    borderColor: '#697691',
    borderRadius: 6,
    padding: 8,
  },
  infoCardLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    color: '#3E4B64',
  },
  infoCardSublabel: {
    fontSize: 13,
    lineHeight: 16,
    color: '#697691',
    marginTop: 2,
  },
  infoCardPrice: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#007F20',
  },
  ctaCard: {
    width: 110,
    height: 86,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#697691',
    backgroundColor: '#7C1AEE',
    paddingLeft: 8,
    paddingRight: 6,
  },
  ctaCardText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ctaCardDisabled: {
    backgroundColor: '#CEAAFF',
  },

  // Add-on modal
  modalScreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    height: 56,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#CCD3E0',
  },
  modalBackButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#182339',
    fontSize: 16,
    fontWeight: '700',
  },
  modalHeaderSpacer: {
    width: 44,
  },
  modalScrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  travelerBlock: {
    marginBottom: 20,
  },
  travelerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182339',
  },
  includedLabel: {
    fontSize: 12,
    color: '#697691',
    marginTop: 2,
    marginBottom: 10,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ECEEF3',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#F7F8FA',
  },
  optionCardSelected: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#182339',
  },
  optionSublabel: {
    fontSize: 11,
    color: '#697691',
    marginTop: 2,
  },
  optionPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7C1AEE',
    marginTop: 8,
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
  },
  totalLabel: {
    fontSize: 12,
    color: '#697691',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#182339',
  },
  saveButton: {
    height: 48,
    paddingHorizontal: 40,
    borderRadius: 8,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
