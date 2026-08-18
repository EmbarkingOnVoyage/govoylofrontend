import { describe, test, expect } from 'vitest';
// 1. Import your newly defined explicit exports directly from the main index file
import * as UI from './index';

describe('UI Workspace Package Contract', () => {
  
  test('should export a valid production version string', () => {
    expect(UI.UI_VERSION).toBe('1.0.0');
    expect(UI.UI_VERSION).not.toBeNull();
  });

  test('should successfully export foundational design tokens and themes', () => {
    expect(UI.getThemeStyles).toBeTypeOf('function');
    expect(UI.GlobalDesignTokens).toBeTypeOf('object');
    
    // Execute theme engine to verify it returns structured design configurations
    const lightTheme = UI.getThemeStyles('light');
    expect(lightTheme.colors.primary).toBe('#0F62FE');
  });

  test('should successfully export core base component styles without runtime errors', () => {
    expect(UI.BaseButtonMobileStyles).toBeDefined();
    expect(UI.BaseButtonMobileStyles.buttonContainer).toBeTypeOf('object');
    expect(UI.getBaseInputMobileProperties).toBeTypeOf('function');
  });

  test('should successfully export feature component composite styles', () => {
    expect(UI.SearchWidgetMobileStyles).toBeDefined();
    expect(UI.getSearchWidgetStyles).toBeTypeOf('function');
    expect(UI.AutoCompleteMobileStyles).toBeDefined();
  });

  test('should successfully export cross-platform explicit login layouts', () => {
    // Verifying both platforms coexist on different styling layers cleanly
    expect(UI.LoginMobileStyles).toBeTypeOf('object');
    expect(UI.LoginWebStyles).toBeTypeOf('object');
    
    // Ensure the web variant has its dynamic functional style evaluator intact
    expect(UI.LoginWebStyles.inputField).toBeTypeOf('function');
    expect(UI.LoginWebStyles.backdrop).toContain('fixed inset-0'); // Tailwind contract validation
  });

});
