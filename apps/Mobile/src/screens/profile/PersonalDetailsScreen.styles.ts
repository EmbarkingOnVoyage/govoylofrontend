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
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    marginTop: 20,
  },
  firstSectionHeading: {
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldWrapperFull: {
    marginBottom: 12,
  },
  fieldWrapperHalf: {
    flex: 1,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#182339',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#182339',
    backgroundColor: '#FFFFFF',
  },
  inputDisplay: {
    height: 44,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  inputDisplayText: {
    fontSize: 14,
    color: '#182339',
  },
  inputDisplayPlaceholder: {
    color: '#9CA3AF',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#ADB8CD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7C1AEE',
    borderColor: '#7C1AEE',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#182339',
    flex: 1,
  },
  saveButton: {
    height: 44,
    borderRadius: 8,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  saveButtonDisabled: {
    backgroundColor: '#CEAAFF',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  saveFeedback: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 13,
  },
  saveSuccess: {
    color: '#16A34A',
  },
  saveError: {
    color: '#EF4444',
  },
});
