import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#182339',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#697691',
    marginBottom: 16,
  },
  tabScroll: {
    marginBottom: 16,
  },
  tab: {
    minWidth: 84,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#F3E8FF',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#697691',
  },
  tabLabelActive: {
    color: '#7C1AEE',
  },
  tabRoute: {
    fontSize: 11,
    color: '#ADB8CD',
    marginTop: 2,
  },
  tabRouteActive: {
    color: '#7C1AEE',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#182339',
    marginTop: 8,
  },
  categorySubtitle: {
    fontSize: 12,
    color: '#697691',
    marginTop: 2,
    marginBottom: 10,
  },
  cardRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  infoCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ECEEF3',
    borderRadius: 10,
    padding: 10,
  },
  infoCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#182339',
  },
  infoCardSublabel: {
    fontSize: 11,
    color: '#697691',
    marginTop: 2,
  },
  infoCardPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E9E5A',
    marginTop: 6,
  },
  ctaCard: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#7C1AEE',
    padding: 10,
    justifyContent: 'space-between',
  },
  ctaCardText: {
    fontSize: 13,
    fontWeight: '600',
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
