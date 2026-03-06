import * as React from "react"
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native"
import { useTheme } from "./hooks/useTheme"
import { Input } from "./components/Input"

const RUN_CLUBS = [
  {
    id: "1",
    name: "Downtown Dashers",
    location: "Central Park, New York",
    distance: "0.3 mi away",
    pace: "8:30 / mi",
    members: 142,
    days: "Mon, Wed, Sat",
  },
  {
    id: "2",
    name: "Sunset Striders",
    location: "Riverside Park, New York",
    distance: "0.8 mi away",
    pace: "10:00 / mi",
    members: 87,
    days: "Tue, Thu, Sun",
  },
  {
    id: "3",
    name: "Brooklyn Bridge Runners",
    location: "Brooklyn Bridge Park, New York",
    distance: "1.2 mi away",
    pace: "7:45 / mi",
    members: 210,
    days: "Mon, Fri, Sun",
  },
  {
    id: "4",
    name: "Early Bird Run Crew",
    location: "Prospect Park, Brooklyn",
    distance: "2.1 mi away",
    pace: "9:15 / mi",
    members: 63,
    days: "Mon, Wed, Fri",
  },
  {
    id: "5",
    name: "Harlem Harriers",
    location: "Marcus Garvey Park, New York",
    distance: "2.5 mi away",
    pace: "8:00 / mi",
    members: 95,
    days: "Tue, Sat",
  },
  {
    id: "6",
    name: "East River Run Club",
    location: "East River Esplanade, New York",
    distance: "3.0 mi away",
    pace: "11:00 / mi",
    members: 51,
    days: "Wed, Sun",
  },
]

type Club = typeof RUN_CLUBS[number]

function ClubCard({ club, theme }: { club: Club; theme: ReturnType<typeof useTheme> }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.inputBackground, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.clubName, { color: theme.text }]}>{club.name}</Text>
        <Text style={[styles.distance, { color: theme.button }]}>{club.distance}</Text>
      </View>
      <Text style={[styles.location, { color: theme.placeholder }]}>{club.location}</Text>
      <View style={styles.cardFooter}>
        <Text style={[styles.tag, { color: theme.text }]}>Pace: {club.pace}</Text>
        <Text style={[styles.tag, { color: theme.text }]}>{club.members} members</Text>
        <Text style={[styles.tag, { color: theme.text }]}>{club.days}</Text>
      </View>
    </Pressable>
  )
}

export default function Index() {
  const theme = useTheme()
  const [query, setQuery] = React.useState("")

  const filtered = RUN_CLUBS.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.location.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Input
        value={query}
        onChangeText={setQuery}
        placeholder="Search run clubs near you..."
        placeholderTextColor={theme.placeholder}
        style={{ backgroundColor: theme.inputBackground, color: theme.text, marginBottom: 16 }}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ClubCard club={item} theme={theme} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: theme.placeholder }]}>No run clubs found.</Text>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  card: { borderRadius: 12, padding: 16, gap: 6 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  clubName: { fontSize: 16, fontWeight: "700", flexShrink: 1 },
  distance: { fontSize: 13, fontWeight: "600" },
  location: { fontSize: 13 },
  cardFooter: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  tag: { fontSize: 12, opacity: 0.8 },
  empty: { textAlign: "center", marginTop: 40, fontSize: 15 },
})
