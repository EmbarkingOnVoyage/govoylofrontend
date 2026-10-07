import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    height: 96,
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 16,
  },
  backButton: {
    paddingVertical: 2,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 28,
    fontWeight: '500',
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    color: '#4C5973',
  },
  row: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#3E4B64',
    fontSize: 22,
    fontWeight: '500',
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 16,
    lineHeight: 24,
    color: '#182339',
  },
  rowMeta: {
    fontSize: 16,
    lineHeight: 24,
    color: '#182339',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    paddingRight: 12,
  },
  footer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  addButton: {
    height: 32,
    borderRadius: 8,
    backgroundColor: '#7C1AEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
});
