/**
 * Theme colors and styles for the app
 */
export const theme = {
  colors: {
    primary: '#FF5A5F', // Airbnb-inspired red
    primaryDark: '#E04146',
    primaryLight: '#FF8A8F',
    secondary: '#00A699', // Teal
    background: '#FFFFFF',
    backgroundDark: '#121212',
    surface: '#FFFFFF',
    surfaceDark: '#1E1E1E',
    error: '#F44336',
    warning: '#FF9800',
    success: '#4CAF50',
    info: '#2196F3',
    
    // Gray scale
    grey1: '#212121',
    grey2: '#424242',
    grey3: '#757575',
    grey4: '#BDBDBD',
    grey5: '#E0E0E0',
    grey6: '#F5F5F5',
    
    // Text colors
    text: '#212121',
    textSecondary: '#757575',
    textDark: '#FFFFFF',
    textSecondaryDark: '#BDBDBD',
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
    },
    body1: {
      fontSize: 16,
    },
    body2: {
      fontSize: 14,
    },
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  
  // Radius
  radius: {
    sm: 4,
    md: 8,
    lg: 16,
    round: 9999,
  },
};

/**
 * Get theme based on mode
 * @param mode 'light' or 'dark'
 */
export const getTheme = (mode: 'light' | 'dark') => {
  const baseTheme = { ...theme };
  
  if (mode === 'dark') {
    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: baseTheme.colors.backgroundDark,
        surface: baseTheme.colors.surfaceDark,
        text: baseTheme.colors.textDark,
        textSecondary: baseTheme.colors.textSecondaryDark,
      },
    };
  }
  
  return baseTheme;
};
