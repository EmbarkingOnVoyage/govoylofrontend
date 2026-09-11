import { StyleSheet } from 'react-native';

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
    // Switch to flex-end so all text and UI clusters sit comfortably down in the dark zone
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  headerVisualBlock: {
    marginBottom: 20,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  badgeText: {
    color: '#38BDF8', 
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  heroText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
    marginBottom: 12,
  },
  subHeroText: {
    color: '#94A3B8', 
    fontSize: 15,
    lineHeight: 22,
  },
  perksContainer: {
    marginBottom: 32,
    gap: 14, 
  },
  perkRow: {
    flexDirection: 'row', 
    alignItems: 'center',
    gap: 12,
  },
  checkmarkBadge: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    color: '#FFFFFF', // High-contrast crisp white text
    fontSize: 15,
    fontWeight: '500',
    flex: 1, 
  },
  actionContainer: {
    gap: 16,
    width: '100%',
  },
  primaryButton: {
    height: 44,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C1AEE', // Product Normal — the app's established primary purple token
    borderRadius: 12,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  guestLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  guestLinkText: {
    color: '#A78BFA',
    fontSize: 14,
    fontWeight: '700',
  },
});
