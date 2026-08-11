// Strict Contract Union for Theme Modes
export type ThemeMode = 'light' | 'dark';

// Immutable Global Design Tokens
export const tokens = {
  colors: {
    brand: {
      primary: '#0F62FE',    // Govoylo Main Brand Blue
      secondary: '#111B24',  // Deep Slate Accent
      success: '#24A148',
      danger: '#DA1E28',
    },
    light: {
      background: '#FFFFFF',
      surface: '#F4F4F4',
      text: '#161616',
      textMuted: '#525252',
    },
    dark: {
      background: '#161616',
      surface: '#262626',
      text: '#F4F4F4',
      textMuted: '#A8A8A8',
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    sizes: {
      caption: 12,
      body: 14,
      heading: 20,
      title: 28,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      bold: '700' as const,
    }
  }
};

/**
 * Functional Utility Engine to resolve themes dynamically 
 * but predictably based on a mode token input.
 */
export function getThemeStyles(mode: ThemeMode) {
  const activeColors = mode === 'light' ? tokens.colors.light : tokens.colors.dark;
  
  return {
    colors: {
      ...tokens.colors.brand,
      ...activeColors,
    },
    spacing: tokens.spacing,
    typography: tokens.typography,
  };
}

// Inferred structural contract type for our unified themes
export type ThemeStyles = ReturnType<typeof getThemeStyles>;
