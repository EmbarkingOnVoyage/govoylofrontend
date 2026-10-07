import { StyleSheet } from 'react-native';

// Values follow the Figma "Select Travellers and class" sheet.
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
    paddingBottom: 12,
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
  content: {
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    color: '#3E4B64',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#CCD3E0',
    marginTop: 12,
    marginBottom: 12,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 62,
    paddingLeft: 34,
    paddingRight: 25,
  },
  stepperLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#182339',
  },
  stepperSubLabel: {
    fontSize: 13,
    lineHeight: 16,
    color: '#3E4B64',
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CCD3E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: '#ECEEF3',
  },
  stepperValue: {
    fontSize: 16,
    lineHeight: 24,
    color: '#182339',
    minWidth: 16,
    textAlign: 'center',
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginHorizontal: 16,
  },
  classButton: {
    height: 28,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#697691',
    borderRadius: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  classButtonSelected: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  classButtonText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#697691',
  },
  classButtonTextSelected: {
    color: '#7C1AEE',
    fontWeight: '500',
  },
  confirmButton: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
});
