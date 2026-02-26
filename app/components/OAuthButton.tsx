import { Button } from "./Button"
import { useTheme } from "../hooks/useTheme"

interface OAuthButtonProps {
  provider: "google" | "apple"
  onPress: () => void
}

export const OAuthButton = ({ provider, onPress }: OAuthButtonProps) => {
  const theme = useTheme()
  const label = provider === "google" ? "Sign in with Google" : "Sign in with Apple"

  return (
    <Button
      onPress={onPress}
      style={{ backgroundColor: theme.button, marginVertical: 4 }}
      textStyle={{ color: theme.buttonText }}
    >
      {label}
    </Button>
  )
}