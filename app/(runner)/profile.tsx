import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import { router } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import type { TrainingType } from '../../lib/database.types'

const GOAL_OPTIONS = ['fitness', 'social', 'long-run', 'race training']

const TRAINING_OPTIONS: { value: TrainingType; label: string }[] = [
  { value: '5k', label: '5K' },
  { value: '10k', label: '10K' },
  { value: 'half', label: 'Half Marathon' },
  { value: 'marathon', label: 'Marathon' },
]

function formatPace(seconds: number | null): string {
  if (seconds == null) return ''
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

function parsePace(str: string): number | null {
  const trimmed = str.trim()
  if (!trimmed) return null
  const [minStr, secStr = '0'] = trimmed.split(':')
  const min = parseInt(minStr, 10)
  const sec = parseInt(secStr, 10)
  if (isNaN(min) || isNaN(sec) || min < 0 || sec < 0 || sec >= 60) return null
  return min * 60 + sec
}

function parseNumOrNull(str: string): number | null {
  const trimmed = str.trim()
  if (!trimmed) return null
  const n = parseFloat(trimmed)
  return isNaN(n) ? null : n
}

function trainingLabel(value: string | null | undefined): string {
  if (!value) return 'None'
  return TRAINING_OPTIONS.find((t) => t.value === value)?.label ?? value
}

export default function Profile() {
  const theme = useTheme()
  const { dbUser, updateUser } = useApp()
  const { signOut } = useAuth()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [paceMin, setPaceMin] = useState('')
  const [paceMax, setPaceMax] = useState('')
  const [distanceMin, setDistanceMin] = useState('')
  const [distanceMax, setDistanceMax] = useState('')
  const [trainingType, setTrainingType] = useState<TrainingType | null>(null)
  const [goals, setGoals] = useState<string[]>([])
  const [destinationRuns, setDestinationRuns] = useState<string[]>([])
  const [newRoute, setNewRoute] = useState('')
  const [saving, setSaving] = useState(false)
  const [switchingRole, setSwitchingRole] = useState(false)

  function startEditing() {
    if (!dbUser) return
    setName(dbUser.name ?? '')
    setLocation(dbUser.location ?? '')
    setPaceMin(formatPace(dbUser.pace_min))
    setPaceMax(formatPace(dbUser.pace_max))
    setDistanceMin(dbUser.distance_min != null ? String(dbUser.distance_min) : '')
    setDistanceMax(dbUser.distance_max != null ? String(dbUser.distance_max) : '')
    setTrainingType(dbUser.training_type)
    setGoals(dbUser.goals ?? [])
    setDestinationRuns(dbUser.destination_runs ?? [])
    setNewRoute('')
    setEditing(true)
  }

  function cancelEditing() {
    setEditing(false)
    setNewRoute('')
  }

  function toggleGoal(g: string) {
    setGoals((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  function addRoute() {
    const v = newRoute.trim()
    if (!v || destinationRuns.includes(v)) return
    setDestinationRuns((prev) => [...prev, v])
    setNewRoute('')
  }

  function removeRoute(r: string) {
    setDestinationRuns((prev) => prev.filter((x) => x !== r))
  }

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
    const pMin = parsePace(paceMin)
    const pMax = parsePace(paceMax)
    if ((paceMin && pMin == null) || (paceMax && pMax == null)) {
      Alert.alert('Invalid pace', 'Use m:ss format (e.g., 8:30).')
      return
    }
    if (pMin != null && pMax != null && pMin > pMax) {
      Alert.alert('Invalid pace', 'Fast (min) pace should be less than slow (max) pace.')
      return
    }
    const dMin = parseNumOrNull(distanceMin)
    const dMax = parseNumOrNull(distanceMax)
    if ((distanceMin && dMin == null) || (distanceMax && dMax == null)) {
      Alert.alert('Invalid distance', 'Enter numeric miles (e.g., 3).')
      return
    }
    if (dMin != null && dMax != null && dMin > dMax) {
      Alert.alert('Invalid distance', 'Min distance should be less than max distance.')
      return
    }

    setSaving(true)
    try {
      await updateUser({
        name: name.trim(),
        location: location.trim() || null,
        pace_min: pMin,
        pace_max: pMax,
        distance_min: dMin,
        distance_max: dMax,
        training_type: trainingType,
        goals,
        destination_runs: destinationRuns,
      })
      setEditing(false)
    } catch (e: any) {
      Alert.alert('Save failed', e.message ?? 'Could not save profile.')
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
              {editing ? (location || 'No location set') : (user.location ?? 'No location set')}
            </Text>
          </View>
          <View style={styles.editActions}>
            {editing && (
              <Pressable
                style={[styles.editBtn, { borderColor: theme.border }]}
                onPress={cancelEditing}
                accessibilityLabel="Cancel edit"
                accessibilityRole="button"
              >
                <Ionicons name="close-outline" size={16} color={theme.textSecondary} />
                <Text style={[styles.editBtnText, { color: theme.textSecondary }]}>Cancel</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.editBtn, { borderColor: theme.brand }]}
              onPress={editing ? handleSave : startEditing}
              disabled={saving}
              accessibilityLabel={editing ? 'Save profile' : 'Edit profile'}
              accessibilityRole="button"
            >
              <Ionicons name={editing ? 'checkmark-outline' : 'create-outline'} size={16} color={theme.brand} />
              <Text style={[styles.editBtnText, { color: theme.brand }]}>
                {saving ? 'Saving…' : editing ? 'Save' : 'Edit Profile'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Basic fields (edit only) */}
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
              placeholder="City or neighborhood"
              placeholderTextColor={theme.placeholder}
              accessibilityLabel="Location"
            />
          </View>
        )}

        {/* Running stats */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Running Profile</Text>

          {editing ? (
            <>
              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Pace (min/mi)</Text>
              <View style={styles.rangeRow}>
                <TextInput
                  style={[styles.input, styles.rangeInput, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  value={paceMin}
                  onChangeText={setPaceMin}
                  placeholder="8:30"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numbers-and-punctuation"
                  accessibilityLabel="Fastest pace"
                />
                <Text style={{ color: theme.textSecondary }}>to</Text>
                <TextInput
                  style={[styles.input, styles.rangeInput, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  value={paceMax}
                  onChangeText={setPaceMax}
                  placeholder="10:00"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="numbers-and-punctuation"
                  accessibilityLabel="Slowest pace"
                />
              </View>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Distance (mi)</Text>
              <View style={styles.rangeRow}>
                <TextInput
                  style={[styles.input, styles.rangeInput, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  value={distanceMin}
                  onChangeText={setDistanceMin}
                  placeholder="3"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Min distance"
                />
                <Text style={{ color: theme.textSecondary }}>to</Text>
                <TextInput
                  style={[styles.input, styles.rangeInput, { color: theme.text, backgroundColor: theme.inputBackground }]}
                  value={distanceMax}
                  onChangeText={setDistanceMax}
                  placeholder="8"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="decimal-pad"
                  accessibilityLabel="Max distance"
                />
              </View>

              <Text style={[styles.fieldLabel, { color: theme.textSecondary }]}>Training</Text>
              <View style={styles.tagsRow}>
                <Pressable
                  style={[styles.chip, { backgroundColor: trainingType == null ? theme.brand : theme.inputBackground }]}
                  onPress={() => setTrainingType(null)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: trainingType == null }}
                >
                  <Text style={[styles.chipText, { color: trainingType == null ? '#fff' : theme.text }]}>None</Text>
                </Pressable>
                {TRAINING_OPTIONS.map((t) => (
                  <Pressable
                    key={t.value}
                    style={[styles.chip, { backgroundColor: trainingType === t.value ? theme.brand : theme.inputBackground }]}
                    onPress={() => setTrainingType(t.value)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: trainingType === t.value }}
                  >
                    <Text style={[styles.chipText, { color: trainingType === t.value ? '#fff' : theme.text }]}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : (
            <>
              <View style={styles.statRow}>
                <Ionicons name="timer-outline" size={16} color={theme.brand} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pace</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>
                  {user.pace_min && user.pace_max
                    ? `${formatPace(user.pace_min)}–${formatPace(user.pace_max)} /mi`
                    : 'Not set'}
                </Text>
              </View>

              <View style={styles.statRow}>
                <Ionicons name="flag-outline" size={16} color={theme.brand} />
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Training</Text>
                <Text style={[styles.statValue, { color: theme.text }]}>{trainingLabel(user.training_type)}</Text>
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
            </>
          )}
        </View>

        {/* Goals */}
        {(editing || user.goals.length > 0) && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Goals</Text>
            {editing ? (
              <View style={styles.tagsRow}>
                {GOAL_OPTIONS.map((g) => {
                  const selected = goals.includes(g)
                  return (
                    <Pressable
                      key={g}
                      style={[styles.chip, { backgroundColor: selected ? theme.brand : theme.inputBackground }]}
                      onPress={() => toggleGoal(g)}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                    >
                      <Text style={[styles.chipText, { color: selected ? '#fff' : theme.text }]}>{g}</Text>
                    </Pressable>
                  )
                })}
              </View>
            ) : (
              <View style={styles.tagsRow}>
                {user.goals.map((g: string) => (
                  <View key={g} style={[styles.tag, { backgroundColor: theme.brandLight }]}>
                    <Text style={[styles.tagText, { color: theme.brand }]}>{g}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Destination runs */}
        {(editing || user.destination_runs.length > 0) && (
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Favorite Routes</Text>
            {editing ? (
              <>
                <View style={styles.tagsRow}>
                  {destinationRuns.map((r) => (
                    <Pressable
                      key={r}
                      style={[styles.tag, { backgroundColor: theme.brandLight }]}
                      onPress={() => removeRoute(r)}
                      accessibilityLabel={`Remove ${r}`}
                    >
                      <Text style={[styles.tagText, { color: theme.brand }]}>{r}</Text>
                      <Ionicons name="close" size={12} color={theme.brand} />
                    </Pressable>
                  ))}
                </View>
                <View style={styles.addRouteRow}>
                  <TextInput
                    style={[styles.input, { flex: 1, color: theme.text, backgroundColor: theme.inputBackground }]}
                    value={newRoute}
                    onChangeText={setNewRoute}
                    placeholder="Add a favorite route"
                    placeholderTextColor={theme.placeholder}
                    onSubmitEditing={addRoute}
                    returnKeyType="done"
                    accessibilityLabel="New route"
                  />
                  <Pressable
                    style={[styles.addBtn, { backgroundColor: theme.brand }]}
                    onPress={addRoute}
                    accessibilityLabel="Add route"
                    accessibilityRole="button"
                  >
                    <Ionicons name="add" size={18} color="#fff" />
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.tagsRow}>
                {user.destination_runs.map((d: string) => (
                  <View key={d} style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
                    <Ionicons name="navigate-outline" size={12} color={theme.textSecondary} />
                    <Text style={[styles.tagText, { color: theme.textSecondary }]}>{d}</Text>
                  </View>
                ))}
              </View>
            )}
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
  editActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1.5,
    gap: 5,
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
  rangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rangeInput: {
    flex: 1,
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
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  addRouteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
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
