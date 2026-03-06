import { TextInput, StyleProp, TextStyle } from "react-native"

interface InputProps {
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  style?: StyleProp<TextStyle>
  textStyle?: StyleProp<TextStyle>
  secureTextEntry?: boolean
  keyboardType?: "default" | "email-address" | "numeric"
  placeholderTextColor?: string
}

export const Input = ({
  value,
  onChangeText,
  placeholder,
  style,
  secureTextEntry,
  keyboardType,
  placeholderTextColor,
}: InputProps) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    style={[{ padding: 12, borderRadius: 8, fontSize: 16 }, style]}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    placeholderTextColor={placeholderTextColor}
  />
)