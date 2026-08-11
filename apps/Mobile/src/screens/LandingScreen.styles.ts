import { StyleSheet, Dimensions } from 'react-native';
import { mobileButtonStyles } from '@workspace/ui'; 

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    paddingHorizontal: 24,
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
  checkmarkIcon: {
    color: '#22C55E', // Bright solid green checkmark token matching Figma layout
    fontSize: 16,
    fontWeight: '700',
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
    ...mobileButtonStyles.buttonContainer,
    backgroundColor: '#7C3AED', // True vibrant figma violet shade
    borderRadius: 14,          // Exact rounded rectangle bevel matching your Figma bounding box
  },
  primaryButtonText: {
    ...mobileButtonStyles.buttonText,
    color: '#FFFFFF',
  },
  inlineLink: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  footerLinkText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  highlightText: {
    color: '#A78BFA', 
    fontWeight: '700',
  },
});
