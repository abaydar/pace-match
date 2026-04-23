import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import { router } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'

const GOAL_OPTIONS = ['fitness', 'social', 'long-run', 'race training']
const DISTANCE_OPTIONS = ['3–5 mi', '6–8 mi', '9–12 mi', '12+ mi']
const TRAINING_OPTIONS = ['5K', '10K', 'Half Marathon', 'Marathon', 'None']

export default function Profile() {
  const theme = useTheme()
  const { dbUser, updateUser } = useApp()
  const { signOut } = useAuth()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(dbUser?.name ?? '')
  const [location, setLocation] = useState(dbUser?.location ?? '')
  const [saving, setSaving] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)

  async function handleSwitchToLeader() {
    Alert.alert('Switch to Leader View', 'Switch to your run club leader dashboard?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Switch', onPress: async () => {
          setSwitchingRole(true)
          try {
            await updateUser({ role: 'leader' })
            router.replace('/(leader)/dashboard')
          } catch (e: any) {
            Alert.alert('Error', e.message)
          } finally {
            setSwitchingRole(false)
          }
        },
      },
    ])
  }

  const user = dbUser
  if (!user) return null

  async function handleSave() {
    setSaving(true)
    try {
      await updateUser({ name, location })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

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
              {editing ? location : (user.location ?? 'No location set')}
            </Text>
          </View>
          <Pressable
            style={[styles.editBtn, { borderColor: theme.brand }]}
            onPress={editing ? handleSave : () => setEditing(true)}
            accessibilityLabel={editing ? 'Save profile' : 'Edit profile'}
            accessibilityRole="button"
          >
            <Ionicons name={editing ? 'checkmark-outline' : 'create-outline'} size={16} color={theme.brand} />
            <Text style={[styles.editBtnText, { color: theme.brand }]}>
              {saving ? 'Saving…' : editing ? 'Save' : 'Edit Profile'}
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
          </View>
        )}

        {/* Running stats */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Running Profile</Text>

          <View style={styles.statRow}>
            <Ionicons name="timer-outline" size={16} color={theme.brand} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pace</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {user.pace_min && user.pace_max
                ? `${Math.floor(user.pace_min / 60)}:${String(user.pace_min % 60).padStart(2, '0')}–${Math.floor(user.pace_max / 60)}:${String(user.pace_max % 60).padStart(2, '0')} /mi`
                : 'Not set'}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="flag-outline" size={16} color={theme.brand} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Training</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{user.training_type ?? 'None'}</Text>
          </View>

          <View style={styles.statRow}>
            <Ionicons name="map-outline" size={16} color={theme.brand} />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Distances</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {user.distance_min && user.distance_max
                ? `${user.distance_min}–${user.distance_max} mi`
                : 'Not set'}
            </Text>
          </View>
        </View>

        {/* Goals */}
        {user.goals.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Goals</Text>
            <View style={styles.tagsRow}>
              {user.goals.map((g: string) => (
                <View key={g} style={[styles.tag, { backgroundColor: theme.brandLight }]}>
                  <Text style={[styles.tagText, { color: theme.brand }]}>{g}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Destination runs */}
        {user.destination_runs.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Favorite Routes</Text>
            <View style={styles.tagsRow}>
              {user.destination_runs.map((d: string) => (
                <View key={d} style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
                  <Ionicons name="navigate-outline" size={12} color={theme.textSecondary} />
                  <Text style={[styles.tagText, { color: theme.textSecondary }]}>{d}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Log out */}
        <Pressable
          style={({ pressed }) => [
            styles.switchRoleBtn,
            { borderColor: '#FCA5A5', opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={() => signOut().then(() => router.replace('/login'))}
          accessibilityLabel="Log out"
          accessibilityRole="button"
        >
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={[styles.switchRoleText, { color: '#EF4444' }]}>Log Out</Text>
        </Pressable>

        {/* Switch to leader */}
        <Pressable
          style={({ pressed }) => [
            styles.switchRoleBtn,
            { borderColor: theme.border, opacity: pressed || switchingRole ? 0.7 : 1 },
          ]}
          onPress={handleSwitchToLeader}
          disabled={switchingRole}
          accessibilityLabel="Switch to leader view"
          accessibilityRole="button"
        >
          <Ionicons name="people-outline" size={18} color={theme.textSecondary} />
          <Text style={[styles.switchRoleText, { color: theme.textSecondary }]}>
            {switchingRole ? 'Switching…' : 'Switch to Leader View'}
          </Text>
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
