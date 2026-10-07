import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 47,
    paddingLeft: 24,
    paddingRight: 16,
    paddingBottom: 9,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  backButton: {
    height: 20,
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#ECEEF3',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  preferencesContent: {
    paddingHorizontal: 16,
    paddingTop: 19,
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 12,
    paddingTop: 3,
    paddingBottom: 32,
  },
  sectionHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: '#000000',
    paddingBottom: 20,
    marginBottom: 0,
    marginTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#CCD3E0',
  },
  firstSectionHeading: {
    marginTop: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  fieldWrapperFull: {
    marginBottom: 15,
  },
  fieldWrapperHalf: {
    flex: 1,
    marginBottom: 15,
  },
  fieldWrapperGender: {
    width: 124,
    marginBottom: 15,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#182339',
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ADB8CD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: 16,
    color: '#182339',
    backgroundColor: '#FFFFFF',
  },

  inputError: {
  borderColor: '#EF4444',
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
  loadState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  loadStateText: {
    fontSize: 14,
    color: '#697691',
    textAlign: 'center',
  },
  loadStateButton: {
    alignSelf: 'stretch',
    marginTop: 8,
  },

  panNote: {
  fontSize: 12,
  color: '#666666',
  marginTop: 6,
  lineHeight: 18,
},

panNoteHighlight: {
  color: '#F97316',
  fontWeight: '600',
},
});
