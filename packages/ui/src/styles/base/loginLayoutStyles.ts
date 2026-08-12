// packages/styles/base/loginLayoutStyles.ts
import { ViewStyle, TextStyle, ImageStyle } from "react-native";

export interface ILoginLayoutStyles {
  backdrop: ViewStyle;
  container: ViewStyle;
  closeButton: TextStyle;
  logoWrapper: ViewStyle;
  logoText: TextStyle;
  title: TextStyle;
  formWrapper: ViewStyle;
  inputField: ViewStyle;
  inputFieldError: ViewStyle;
  errorText: TextStyle;
  submitButtonMargin: ViewStyle;
  dividerRow: ViewStyle;
  dividerLine: ViewStyle;
  dividerText: TextStyle;
  socialRow: ViewStyle;
  socialFlexItem: ViewStyle;
  footerText: TextStyle;
  footerLink: TextStyle;
}

export class LoginLayoutStyles implements ILoginLayoutStyles {
  // Modal Backdrop Mask Screen Overlay
  public backdrop: ViewStyle = {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(107, 114, 128, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    zIndex: 999,
  };

  // Main Floating Center Box Container White Modal
  public container: ViewStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#FFFFFF',
    borderRadius: 24, // High curving radius spec matched from figma design
    padding: 32,
    alignItems: 'center',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' as any, // Cross-platform web shadow compatibility drop
  };

  public closeButton: TextStyle = {
    position: 'absolute',
    top: 20,
    right: 24,
    fontSize: 26,
    color: '#9CA3AF',
    fontWeight: '400',
  };

  public logoWrapper: ViewStyle = {
    width: 44,
    height: 44,
    backgroundColor: '#7F1DFF', // Your core brand purple token hex color
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  };

  public logoText: TextStyle = {
    fontSize: 20,
    color: '#FFFFFF',
  };

  public title: TextStyle = {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 24,
    letterSpacing: -0.5,
  };

  public formWrapper: ViewStyle = {
    width: '100%',
  };

  public inputField: ViewStyle = {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFA',
    marginBottom: 4,
  };

  // State Override: Applies dynamic border color shifts upon invalid input formatting triggers
  public inputFieldError: ViewStyle = {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  };

  public errorText: TextStyle = {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  };

  public submitButtonMargin: ViewStyle = {
    marginTop: 12,
  };

  public dividerRow: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 24,
    marginBottom: 24,
  };

  public dividerLine: ViewStyle = {
    flex: 1,
    height: 1,
    backgroundColor: '#F3F4F6',
  };

  public dividerText: TextStyle = {
    paddingHorizontal: 16,
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  };

  public socialRow: ViewStyle = {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginBottom: 32,
  };

  public socialFlexItem: ViewStyle = {
    flex: 1,
    marginHorizontal: 4,
  };

  public footerText: TextStyle = {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 290,
  };

  public footerLink: TextStyle = {
    textDecorationLine: 'underline',
    color: '#7F1DFF',
    fontWeight: '500',
  };
}

// Instantiate and export your active class token schema configuration sheet cleanly
export const loginLayoutStyles = new LoginLayoutStyles();
