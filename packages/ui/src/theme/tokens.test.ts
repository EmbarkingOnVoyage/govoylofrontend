import { describe, test, expect } from 'vitest';
import { getThemeStyles } from './tokens';

describe('Global Theme Token Engine', () => {
  test('should return light palette color configurations when light mode is selected', () => {
    const theme = getThemeStyles('light');
    
    // Core structural contracts
    expect(theme.colors.background).toBe('#FFFFFF');
    expect(theme.colors.text).toBe('#161616');
    expect(theme.colors.primary).toBe('#0F62FE'); // Brand immutable color
  });

  test('should return dark palette color configurations when dark mode is selected', () => {
    const theme = getThemeStyles('dark');
    
    // Core structural contracts
    expect(theme.colors.background).toBe('#161616');
    expect(theme.colors.text).toBe('#F4F4F4');
    expect(theme.colors.primary).toBe('#0F62FE'); // Brand immutable color
  });

  test('should maintain identical structure keys across both theme states', () => {
    const lightTheme = getThemeStyles('light');
    const darkTheme = getThemeStyles('dark');

    // Ensure object contracts match identically to avoid runtime undefined errors
    expect(Object.keys(lightTheme.colors)).toEqual(Object.keys(darkTheme.colors));
    expect(lightTheme.spacing).toEqual(darkTheme.spacing);
  });
});
