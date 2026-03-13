import { useColorScheme } from 'react-native'
import { lightColors, darkColors, ColorTokens } from '../theme'

export function useTheme(): ColorTokens {
  const scheme = useColorScheme() ?? 'light'
  return scheme === 'dark' ? darkColors : lightColors
}

// Backward compat
export const colors = { light: lightColors, dark: darkColors }
