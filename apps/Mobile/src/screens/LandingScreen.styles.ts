import { StyleSheet } from 'react-native';

// Measured from the Figma "Onboarding_screen_Trust" frame (Phone Dev). The
// block is bottom-anchored like the design, with the exact gaps between
// Figma's text boxes.
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 19,
  },
  badge: {
    alignSelf: 'flex-start',
    marginLeft: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    backgroundColor: '#182339',
    paddingLeft: 9.5,
    paddingRight: 8,
    borderRadius: 12,
    marginBottom: 10.5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
  },
  heroText: {
    marginHorizontal: 22,
    width: 337,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -1.12, // -4%
    marginBottom: 21,
  },
  subHeroText: {
    marginLeft: 22,
    width: 337,
    color: '#99A6C0',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 20.5,
  },
  perksContainer: {
    marginLeft: 22,
    gap: 8,
    marginBottom: 34,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8.7,
  },
  checkmarkBadge: {
    width: 20,
    height: 20,
    margin: 2,
    borderRadius: 6,
    backgroundColor: '#007F20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    width: 305,
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '500',
  },
  primaryButton: {
    marginHorizontal: 16,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C1AEE',
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  guestLink: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8.6,
    height: 44,
  },
  guestLinkText: {
    color: '#7C1AEE',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
});
