import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { PaceBucket, Distance, TrainingType, GenderPreference, RunFilters } from '../../types'
import { DEFAULT_FILTERS } from '../../types'

const STORAGE_KEY = 'pacematch_filters'

const PACE_OPTIONS: PaceBucket[] = ['7:00-8:00', '8:00-9:30', '9:30-11:00']
const DISTANCE_OPTIONS: Distance[] = ['3', '5', '10', 'Half']
const TRAINING_OPTIONS: TrainingType[] = ['Easy run', 'Tempo', 'Long run', 'Track']
const GENDER_OPTIONS: GenderPreference[] = ['Any', 'Women only', 'Men only']
const RADIUS_OPTIONS = [2, 5, 10]

export default function FilterScreen() {
  const theme = useTheme()
  const [filters, setFilters] = useState<RunFilters>(DEFAULT_FILTERS)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try { setFilters(JSON.parse(raw)) } catch {}
      }
    })
  }, [])

  function update<K extends keyof RunFilters>(key: K, value: RunFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function toggle<K extends 'paceBucket' | 'distance' | 'trainingType'>(
    key: K, value: RunFilters[K]
  ) {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? null : value }))
  }

  async function handleFind() {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filters))
    router.push({ pathname: '/(runner)/runners', params: { filters: JSON.stringify(filters) } })
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Section label="Pace (min/mi)" theme={theme}>
          {PACE_OPTIONS.map((p) => (
            <Chip
              key={p} label={p}
              selected={filters.paceBucket === p}
              onPress={() => toggle('paceBucket', p)}
              theme={theme}
            />
          ))}
        </Section>

        <Section label="Distance (miles)" theme={theme}>
          {DISTANCE_OPTIONS.map((d) => (
            <Chip
              key={d} label={d === 'Half' ? 'Half marathon' : `${d} mi`}
              selected={filters.distance === d}
              onPress={() => toggle('distance', d)}
              theme={theme}
            />
          ))}
        </Section>

        <Section label="Training Type" theme={theme}>
          {TRAINING_OPTIONS.map((t) => (
            <Chip
              key={t} label={t}
              selected={filters.trainingType === t}
              onPress={() => toggle('trainingType', t)}
              theme={theme}
            />
          ))}
        </Section>

        <Section label="Gender Preference" theme={theme}>
          {GENDER_OPTIONS.map((g) => (
            <Chip
              key={g} label={g}
              selected={filters.genderPreference === g}
              onPress={() => update('genderPreference', g)}
              theme={theme}
            />
          ))}
        </Section>

        <Section label="Location Radius" theme={theme}>
          {RADIUS_OPTIONS.map((r) => (
            <Chip
              key={r} label={`${r} mi`}
              selected={filters.radiusMiles === r}
              onPress={() => update('radiusMiles', r)}
              theme={theme}
            />
          ))}
        </Section>

        <Pressable
          style={({ pressed }) => [
            styles.findBtn,
            { backgroundColor: theme.brand, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleFind}
          accessibilityLabel="Find runners"
          accessibilityRole="button"
        >
          <Ionicons name="search" size={18} color="#fff" />
          <Text style={styles.findBtnText}>Find Runners</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}

function Section({ label, children, theme }: {
  label: string
  children: React.ReactNode
  theme: any
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>{label.toUpperCase()}</Text>
      <View style={styles.chips}>{children}</View>
    </View>
  )
}

function Chip({ label, selected, onPress, theme }: {
  label: string
  selected: boolean
  onPress: () => void
  theme: any
}) {
  return (
    <Pressable
      style={[
        styles.chip,
        { backgroundColor: selected ? theme.brand : theme.surface, borderColor: selected ? theme.brand : theme.border },
      ]}
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, { color: selected ? '#fff' : theme.text }]}>{label}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  section: { gap: spacing.md },
  sectionLabel: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold, letterSpacing: 0.8,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 10,
    borderRadius: radius.lg, borderWidth: 1,
  },
  chipText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  findBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, borderRadius: radius.lg,
    gap: spacing.sm, marginTop: spacing.md,
  },
  findBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
})
