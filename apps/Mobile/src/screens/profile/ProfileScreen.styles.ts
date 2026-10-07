import { StyleSheet } from 'react-native';

// Values follow the Figma "Profile" frame (Phone Dev page).
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  banner: {
    height: 150,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    overflow: 'hidden',
  },
  avatarWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F59E0B',
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
    fontSize: 16,
    fontWeight: '600',
  },
  bannerMeta: {
    flex: 1,
    gap: 2,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bannerEmail: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  bannerPhone: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
  },
  verifiedMark: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#319246',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 15,
    lineHeight: 20,
    color: '#000000',
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
  },
  listItem: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 32,
  },
  listItemLabel: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#182339',
  },
  domainText: {
    fontSize: 15,
    lineHeight: 20,
    color: '#000000',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 8,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#980018',
    fontSize: 15,
    lineHeight: 20,
  },
});
