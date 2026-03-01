// Australian-themed color palette
export const Colors = {
  // Primary palette - Australian flag colors
  gold: '#FFD700',
  green: '#00843D',
  blue: '#002B7F',

  // Extended palette
  darkBlue: '#001A4E',
  lightBlue: '#E8F0FE',
  lightGreen: '#E8F5EC',
  lightGold: '#FFF8E0',
  darkGreen: '#005A2A',

  // Neutral
  white: '#FFFFFF',
  offWhite: '#F8F9FA',
  lightGray: '#E9ECEF',
  gray: '#ADB5BD',
  darkGray: '#495057',
  charcoal: '#212529',
  black: '#000000',

  // Status colors
  success: '#28A745',
  error: '#DC3545',
  warning: '#FFC107',
  info: '#17A2B8',

  // Quiz-specific
  correctAnswer: '#D4EDDA',
  correctBorder: '#28A745',
  incorrectAnswer: '#F8D7DA',
  incorrectBorder: '#DC3545',
  selectedAnswer: '#CCE5FF',
  selectedBorder: '#002B7F',

  // Category colors
  valuesColor: '#DC3545',
  australiaColor: '#002B7F',
  democraticColor: '#00843D',
  governmentColor: '#FFD700',
};

export const Fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 22,
    xxl: 28,
    hero: 36,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
};
