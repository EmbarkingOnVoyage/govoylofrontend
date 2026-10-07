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
  listContent: {
    flexGrow: 1,
    paddingLeft: 15,
    paddingRight: 13,
    paddingTop: 16,
    paddingBottom: 19,
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
    gap: 9.4,
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
    fontSize: 24,
    lineHeight: 30,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: 15,
    lineHeight: 24,
    color: '#182339',
  },
  rowMeta: {
    fontSize: 15,
    lineHeight: 24,
    color: '#182339',
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  actionButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginLeft: 1,
    marginRight: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
});
