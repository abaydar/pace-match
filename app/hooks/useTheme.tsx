import { useColorScheme } from "react-native"

export const colors = {
  light: {
    background: "#fff",
    text: "#000",
    inputBackground: "#f0f0f0",
    placeholder: "#666",
    button: "#0a7ea4",
    buttonText: "#fff",
  },
  dark: {
    background: "#000",
    text: "#fff",
    inputBackground: "#222",
    placeholder: "#aaa",
    button: "#0a7ea4",
    buttonText: "#fff",
  },
}

export function useTheme() {
  const scheme = useColorScheme() ?? "light"
  return colors[scheme]
}