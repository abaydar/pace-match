export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
}

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
}

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 32,
}

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

export const lightColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  border: '#E2E8F0',
  text: '#1A202C',
  textSecondary: '#4A5568',
  placeholder: '#A0ADB8',
  brand: '#2563EB',
  brandLight: '#DBEAFE',
  brandDark: '#1E40AF',
  success: '#059669',
  successLight: '#D1FAE5',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  danger: '#DC2626',
  dangerLight: '#FEE2E2',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  inputBackground: '#F1F5F9',
  button: '#2563EB',
  buttonText: '#FFFFFF',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.5)',
}

export const darkColors = {
  background: '#0F172A',
  surface: '#1E293B',
  card: '#1E293B',
  border: '#334155',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  placeholder: '#64748B',
  brand: '#3B82F6',
  brandLight: '#1E3A5F',
  brandDark: '#93C5FD',
  success: '#10B981',
  successLight: '#064E3B',
  warning: '#F59E0B',
  warningLight: '#451A03',
  danger: '#EF4444',
  dangerLight: '#450A0A',
  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  inputBackground: '#334155',
  button: '#3B82F6',
  buttonText: '#FFFFFF',
  shadow: '#000000',
  overlay: 'rgba(0,0,0,0.7)',
}

export type ColorTokens = typeof lightColors
