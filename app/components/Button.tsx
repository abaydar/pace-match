import { Pressable, Text, StyleProp, TextStyle, ViewStyle } from "react-native"

interface ButtonProps {
  onPress: () => void
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
  disabled?: boolean
}

export const Button = ({ onPress, children, style, textStyle, disabled }: ButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: "center",
        opacity: pressed ? 0.7 : 1,
      },
      style,
      disabled && { opacity: 0.5 },
    ]}
  >
    <Text style={textStyle}>{children}</Text>
  </Pressable>
)