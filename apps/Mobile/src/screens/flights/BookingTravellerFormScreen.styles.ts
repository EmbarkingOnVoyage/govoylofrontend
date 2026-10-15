import { StyleSheet } from 'react-native';

// Figma "Co traveller" (Product → Phone Dev), 375 wide.
const PURPLE = '#7C1AEE';
const INK = '#182339';
const BORDER = '#ADB8CD';
const DIVIDER = '#CCD3E0';
const MUTED = '#697691';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  handle: {
    alignSelf: 'center',
    width: 32,
    height: 4,
    borderRadius: 2,
    backgroundColor: BORDER,
    marginTop: 4,
  },
  header: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    color: INK,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sectionHeading: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
    color: '#000000',
  },
  genderRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 40,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: PURPLE,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PURPLE,
  },
  radioLabel: {
    fontSize: 16,
    lineHeight: 20,
    color: INK,
  },
  notice: {
    marginTop: 18,
    paddingHorizontal: 11,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F8E5D1',
    backgroundColor: '#FFF3E8',
  },
  noticeText: {
    fontSize: 15,
    lineHeight: 20,
    color: INK,
  },
  field: {
    marginTop: 16,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: INK,
    marginBottom: 8,
  },
  required: {
    color: '#C5001F',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 0,
    fontSize: 16,
    color: INK,
    backgroundColor: '#FFFFFF',
  },
  dateField: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: INK,
  },
  datePlaceholder: {
    flex: 1,
    fontSize: 16,
    color: MUTED,
  },
  helpText: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 15,
    color: '#000000',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: PURPLE,
    borderColor: PURPLE,
  },
  checkboxBody: {
    flex: 1,
  },
  checkboxTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
    color: INK,
  },
  optional: {
    fontWeight: '400',
    color: MUTED,
  },
  checkboxDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 16,
    color: '#3E4B64',
  },
  divider: {
    height: 1,
    backgroundColor: DIVIDER,
    marginTop: 16,
  },
  documentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#ECEEF3',
    backgroundColor: '#FFFFFF',
  },
  error: {
    marginBottom: 10,
    fontSize: 13,
    lineHeight: 16,
    color: '#C5001F',
    textAlign: 'center',
  },
  saveButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  loadStateText: {
    fontSize: 14,
    color: INK,
    textAlign: 'center',
  },
});
