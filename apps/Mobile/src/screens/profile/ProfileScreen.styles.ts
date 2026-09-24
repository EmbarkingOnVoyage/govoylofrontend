import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  banner: {
    height: 160,
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  avatarWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C1AEE',
  },
  avatarPlaceholderText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  bannerMeta: {
    flex: 1,
    paddingBottom: 4,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerEmail: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  bannerPhone: {
    color: '#FFFFFF',
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#182339',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  listItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#182339',
  },
  separator: {
    height: 1,
    backgroundColor: '#ECEEF3',
    marginHorizontal: 16,
  },
  domainText: {
    fontSize: 13,
    color: '#4C5973',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 4,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 24,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '600',
  },
});
