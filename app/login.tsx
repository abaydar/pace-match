import * as React from "react"
import { View, Text, StyleSheet } from "react-native"
import { useTheme } from "./hooks/useTheme"
import { Input } from "./components/Input"
import { Button } from "./components/Button"
import { OAuthButton } from "./components/OAuthButton"
import { useSignIn } from "@clerk/clerk-expo"
import { useRouter } from "expo-router"
import * as Linking from "expo-linking"

type OAuthStrategy = "oauth_google" | "oauth_apple"

export default function LoginPage() {
  const theme = useTheme()
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [code, setCode] = React.useState("")
  const [showEmailCode, setShowEmailCode] = React.useState(false)

  const onSignInPress = React.useCallback(async () => {
    if (!isLoaded || !signIn) return
    try {
      const attempt = await signIn.create({ identifier: email, password })
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId })
        router.replace("/")
      } else if (attempt.status === "needs_second_factor") {
        setShowEmailCode(true)
      }
    } catch (err) {
      console.error(err)
    }
  }, [email, password, isLoaded, signIn, setActive, router])

  const onVerifyPress = React.useCallback(async () => {
    if (!isLoaded || !signIn) return
    try {
      const attempt = await signIn.attemptSecondFactor({ strategy: "email_code", code })
      if (attempt.status === "complete") {
        await setActive({ session: attempt.createdSessionId })
        router.replace("/")
      }
    } catch (err) {
      console.error(err)
    }
  }, [code, isLoaded, signIn, setActive, router])

  const oAuthSignIn = (strategy: OAuthStrategy) => {
    if (!isLoaded || !signIn) return
    signIn.create({ strategy, redirectUrl: Linking.createURL("/") })
  }

  if (showEmailCode) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Verify your email</Text>
        <Input
          value={code}
          onChangeText={setCode}
          placeholder="Enter verification code"
          placeholderTextColor={theme.placeholder}
        />
        <Button onPress={onVerifyPress} style={{ backgroundColor: theme.button }} textStyle={{ color: theme.buttonText }}>
          Verify
        </Button>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Sign in</Text>

      <Text style={[styles.label, { color: theme.text }]}>Email address</Text>
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="Enter email"
        placeholderTextColor={theme.placeholder}
        keyboardType="email-address"
      />

      <Text style={[styles.label, { color: theme.text }]}>Password</Text>
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder="Enter password"
        placeholderTextColor={theme.placeholder}
        secureTextEntry
      />

      <Button
        onPress={onSignInPress}
        disabled={!email || !password}
        style={{ backgroundColor: theme.button }}
        textStyle={{ color: theme.buttonText }}
      >
        Sign in
      </Button>

      <View style={styles.oauthContainer}>
        <OAuthButton provider="google" onPress={() => oAuthSignIn("oauth_google")} />
        <OAuthButton provider="apple" onPress={() => oAuthSignIn("oauth_apple")} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 8 },
  label: { fontSize: 14, fontWeight: "600" },
  oauthContainer: { marginTop: 16, gap: 8 },
})