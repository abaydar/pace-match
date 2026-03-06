import { Stack } from "expo-router";
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ThemeProvider, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { Pressable, useColorScheme, Text } from "react-native";
import { useTheme } from "./hooks/useTheme";
import { router } from "expo-router"

function LoginButton() {
  const { isSignedIn } = useAuth();
  const theme = useTheme();

  if (isSignedIn) return null;

  return (
    <Pressable onPress={() => router.push("/login")}>
      <Text style={{ color: theme.text, paddingRight: 16 }}>Log in</Text>
    </Pressable>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <ClerkProvider publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Pace Match",
          headerRight: () => <LoginButton />,
        }}
      />
      <Stack.Screen name="login" options={{ title: "Sign in" }} />
      <Stack.Screen name="signup" options={{ title: "Create account" }} />
    </Stack>
    </ClerkProvider>
  </ThemeProvider>
);
}
