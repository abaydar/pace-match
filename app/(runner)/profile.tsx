import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import { router } from 'expo-router'

const GOAL_OPTIONS = ['fitness', 'social', 'long-run', 'race training']
const DISTANCE_OPTIONS = ['3–5 mi', '6–8 mi', '9–12 mi', '12+ mi']
const TRAINING_OPTIONS = ['5K', '10K', 'Half Marathon', 'Marathon', 'None']

export default function Profile() {
  const theme = useTheme()
  const { currentUser, setRole } = useApp()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(currentUser?.name ?? '')
  const [location, setLocation] = useState(currentUser?.location ?? '')
  const [paceRange, setPaceRange] = useState(currentUser?.paceRange ?? '')
  const [bio, setBio] = useState(currentUser?.bio ?? '')

  const user = currentUser
  if (!user) return null

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar + name */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, { backgroundColor: theme.brand }]}>
            <Text style={styles.avatarText}>
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.text }]}>{editing ? name : user.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.locationText, { color: theme.textSecondary }]}>
              {editing ? location : user.location}
            </Text>
          </View>
          <Pressable
            style={[styles.editBtn, { borderColor: theme.brand }]}
            onPress={() => setEditing((v) => !v)}
            accessibilityLabel={editing ? 'Save profile' : 'Edit profile'}
            accessibilityRole="button"
          >
            <Ionicons name={editing ? 'checkmark-outline' : 'create-outline'} size={16} color={theme.brand} />
            <Text style={[styles.editBtnText, { color: theme.brand }]}>
              {editing ? 'Save' : 'Edit Profile'}
            </Text>
          </Pressable>
        </View>

        {/* Edit fields */}
        {editing && (
          <View style={[styles.editSection, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
              value={name}
              onChangeText={setName}
              accessibilityLabel="Name"
            />
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Location</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
              value={location}
              onChangeText={setLocation}
              accessibilityLabel="Location"
            />
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Pace Range</Text>
            <TextInput
              style={[styles.input, { color: theme.text, backgroundColor: theme.inputBackground }]}
              value={paceRange}
              onChangeText={setPaceRange}
              placeholder="e.g. 8:30–9:00 /mi"
              placeholderTextColor={theme.placeholder}
              accessibilityLabel="Pace range"
            />
            <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, { color: theme.text, backgroundColor: theme.inputBackground }]}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              accessibilityLabel="Bio"
            />
          </View>
        )}

        {/* Bio */}
        {!editing && user.bio && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>About</Text>
            <Text style={[styles.bioText, { color: theme.textSecondary }]}>{user.bio}</Text>
          </View>
        )}

        {/* Running stats */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Running Profile</Text>

          <View style={styles.statRow}>
            <Ionicons name="timer-outline" size={16} color={theme.brand} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pace</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{user.paceRange}</Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="flag-outline" size={16} color={theme.brand} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Training</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{user.training ?? 'None'}</Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="map-outline" size={16} color={theme.brand} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Distances</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{user.distances.join(', ')}</Text>
          </View>
        </View>

        {/* Goals */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Goals</Text>
          <View style={styles.tagsRow}>
            {user.goals.map((g) => (
              <View key={g} style={[styles.tag, { backgroundColor: theme.brandLight }]}>
                <Text style={[styles.tagText, { color: theme.brand }]}>{g}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Destination runs */}
        {user.destinationRuns.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Favorite Routes</Text>
            <View style={styles.tagsRow}>
              {user.destinationRuns.map((d) => (
                <View key={d} style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
                  <Ionicons name="navigate-outline" size={12} color={theme.textSecondary} />
                  <Text style={[styles.tagText, { color: theme.textSecondary }]}>{d}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Switch role */}
        <Pressable
          style={({ pressed }) => [
            styles.switchRoleBtn,
            { borderColor: theme.danger, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={() => {
            setRole('leader')
            router.replace('/(leader)/dashboard')
          }}
          accessibilityLabel="Switch to Club Leader view"
          accessibilityRole="button"
        >
          <Ionicons name="swap-horizontal-outline" size={18} color={theme.danger} />
          <Text style={[styles.switchRoleText, { color: theme.danger }]}>Switch to Club Leader View</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  avatarText: {
    color: '#fff',
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: fontSize.md,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    gap: 5,
    marginTop: spacing.xs,
  },
  editBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  editSection: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  input: {
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: fontSize.md,
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statLabel: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  statValue: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  bioText: {
    fontSize: fontSize.md,
    lineHeight: 22,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 4,
  },
  tagText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  switchRoleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  switchRoleText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
})
