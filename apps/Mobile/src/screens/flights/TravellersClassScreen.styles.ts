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
  content: {
    paddingHorizontal: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4C5973',
    marginTop: 8,
    marginBottom: 4,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF3',
  },
  stepperLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#182339',
  },
  stepperSubLabel: {
    fontSize: 12,
    color: '#7C8CAD',
    marginTop: 2,
  },
  stepperControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperButtonDisabled: {
    borderColor: '#ADB8CD',
  },
  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#182339',
    minWidth: 20,
    textAlign: 'center',
  },
  classGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  classButton: {
    width: '47%',
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  classButtonSelected: {
    borderColor: '#7C1AEE',
    backgroundColor: '#F3E8FF',
  },
  classButtonText: {
    fontSize: 14,
    color: '#182339',
    fontWeight: '500',
  },
  classButtonTextSelected: {
    color: '#7C1AEE',
    fontWeight: '700',
  },
  confirmButton: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
