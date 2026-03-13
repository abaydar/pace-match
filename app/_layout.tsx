import "./polyfills"
import { Stack } from "expo-router"
import { ClerkProvider, useAuth } from "@clerk/clerk-expo"
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native"
import { useColorScheme } from "react-native"
import { AppProvider } from "./context/AppContext"

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
        <AppProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ title: "Sign in" }} />
            <Stack.Screen name="signup" options={{ title: "Create account" }} />
            <Stack.Screen name="role-select" options={{ headerShown: false }} />
            <Stack.Screen name="(runner)" options={{ headerShown: false }} />
            <Stack.Screen name="(leader)" options={{ headerShown: false }} />
          </Stack>
        </AppProvider>
      </ClerkProvider>
    </ThemeProvider>
  )
}
