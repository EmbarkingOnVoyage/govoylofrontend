import { StyleSheet } from 'react-native';

// Values follow the Figma "Onboarding_screen_Trust" frame (Phone Dev page).
export const styles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  safeAreaRoot: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  headerVisualBlock: {
    marginBottom: 16,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 24,
    backgroundColor: '#182339', // Ink Dark
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  heroText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -1.12, // -4%
    marginBottom: 12,
  },
  subHeroText: {
    color: '#99A6C0', // Cloud Dark
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '500',
  },
  perksContainer: {
    marginBottom: 24,
    gap: 8,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkmarkBadge: {
    width: 20,
    height: 20,
    margin: 2,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    flex: 1,
  },
  actionContainer: {
    gap: 10,
    width: '100%',
  },
  primaryButton: {
    height: 44,
    width: '100%',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C1AEE', // Product Normal
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  guestLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
  },
  guestLinkText: {
    color: '#7C1AEE',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
});
