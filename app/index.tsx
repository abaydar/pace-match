import { Text, useColorScheme, View } from "react-native";

export default function Index() {
  const colorScheme = useColorScheme();

  const isDark = colorScheme === "dark";
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text
        style={{
          color: isDark ? "#fff" : "#000",
        }}
      >Pace Match Landing Page</Text>
    </View>
  );
}
