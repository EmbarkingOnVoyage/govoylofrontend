import { StyleSheet } from 'react-native';

// Positions and type measured from the Figma "Profile" frame (Phone Dev);
// y values are relative to the bottom of the status bar.
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: 14,
  },
  banner: {
    height: 151,
    marginHorizontal: 15,
    paddingLeft: 15.5,
    paddingRight: 12,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bannerImage: {
    borderRadius: 7.5,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FF8011',
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
    fontSize: 14,
    fontWeight: '600',
  },
  bannerMeta: {
    flex: 1,
    paddingTop: 2.2,
    gap: 3,
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8.5,
  },
  bannerEmail: {
    flexShrink: 1,
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
  },
  bannerPhone: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 16,
  },
  verifiedMark: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    backgroundColor: '#007F20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    lineHeight: 16,
    color: '#000000',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 7,
  },
  listItem: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 31,
    paddingRight: 32,
  },
  listItemLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#182339',
  },
  domainText: {
    fontSize: 13,
    lineHeight: 16,
    color: '#000000',
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 7,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 8,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFE8EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    color: '#980018',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
});
