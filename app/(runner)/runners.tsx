import React, { useState, useEffect, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  ActivityIndicator, Pressable, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import { useApp } from '../context/AppContext'
import { useGetSupabase } from '../../lib/hooks/useSupabase'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { RunFilters, RunnerProfile } from '../../types'
import { DEFAULT_FILTERS } from '../../types'

function haversinemiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function AvailableRunnersScreen() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const getSupabase = useGetSupabase()
  const params = useLocalSearchParams<{ filters?: string }>()
  const filters: RunFilters = params.filters ? JSON.parse(params.filters) : DEFAULT_FILTERS

  const [runners, setRunners] = useState<RunnerProfile[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [myLocation, setMyLocation] = useState<{ lat: number; lon: number } | null>(null)

  const loadRunners = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== 'granted') throw new Error('Location permission denied')

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const { latitude: myLat, longitude: myLon } = loc.coords
      setMyLocation({ lat: myLat, lon: myLon })

      const sb = await getSupabase()
      let query = sb
        .from('users')
        .select('id, name, avatar_url, gender, pace_min, pace_max, training_type, distance_min, distance_max, latitude, longitude, is_available, expo_push_token')
        .eq('is_available', true)
        .eq('role', 'runner')
        .neq('id', dbUser?.id ?? '')

      if (filters.genderPreference !== 'Any') {
        const g = filters.genderPreference === 'Women only' ? 'female' : 'male'
        query = query.eq('gender', g)
      }
      if (filters.trainingType) query = query.eq('training_type', filters.trainingType)

      const { data, error: err } = await query
      if (err) throw err

      const mapped: RunnerProfile[] = (data ?? [])
        .filter((r: any) => r.latitude != null && r.longitude != null)
        .map((r: any) => ({
          id: r.id,
          name: r.name,
          avatar_url: r.avatar_url,
          gender: r.gender,
          pace_bucket: paceSecondsToBucket(r.pace_min, r.pace_max),
          preferred_distance: distanceToBucket(r.distance_min),
          training_type: r.training_type,
          latitude: r.latitude,
          longitude: r.longitude,
          is_available: r.is_available,
          expo_push_token: r.expo_push_token,
          distanceAway: haversinemiles(myLat, myLon, r.latitude, r.longitude),
        }))
        .filter((r: RunnerProfile) => r.distanceAway! <= filters.radiusMiles)
        .filter((r: RunnerProfile) => !filters.distance || r.preferred_distance === filters.distance)
        .filter((r: RunnerProfile) => !filters.paceBucket || r.pace_bucket === filters.paceBucket)
        .sort((a: RunnerProfile, b: RunnerProfile) => (a.distanceAway ?? 0) - (b.distanceAway ?? 0))

      setRunners(mapped)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [dbUser?.id, filters])

  useEffect(() => { loadRunners() }, [loadRunners])

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleStartRun() {
    if (selected.size === 0) {
      Alert.alert('Select runners', 'Choose at least one runner to invite.')
      return
    }
    const invitedIds = Array.from(selected)
    const invitedRunners = runners.filter((r) => selected.has(r.id))
    router.push({
      pathname: '/(runner)/start-run',
      params: {
        invitedIds: JSON.stringify(invitedIds),
        invitedRunners: JSON.stringify(invitedRunners),
      },
    })
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.brand} />
          <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Finding runners nearby…</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
        <View style={styles.center}>
          <Ionicons name="warning-outline" size={48} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>
          <Pressable style={[styles.retryBtn, { borderColor: theme.border }]} onPress={loadRunners}>
            <Text style={[styles.retryBtnText, { color: theme.text }]}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <FlatList
        data={runners}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.header, { color: theme.textSecondary }]}>
            {runners.length} runner{runners.length !== 1 ? 's' : ''} within {filters.radiusMiles} mi
          </Text>
        }
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id)
          return (
            <Pressable
              style={[
                styles.card,
                {
                  backgroundColor: theme.surface,
                  borderColor: isSelected ? theme.brand : theme.border,
                  borderWidth: isSelected ? 2 : 1,
                },
              ]}
              onPress={() => toggleSelect(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
            >
              <View style={styles.cardRow}>
                <View style={[styles.avatar, { backgroundColor: isSelected ? theme.brand : theme.brandLight }]}>
                  <Text style={[styles.avatarText, { color: isSelected ? '#fff' : theme.brand }]}>
                    {item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: theme.text }]}>{item.name}</Text>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>
                    {[
                      item.distanceAway != null ? `${item.distanceAway.toFixed(1)} mi away` : null,
                      item.pace_bucket ? `${item.pace_bucket} /mi` : null,
                      item.training_type,
                    ].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {isSelected && <Ionicons name="checkmark-circle" size={22} color={theme.brand} />}
              </View>
            </Pressable>
          )
        }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="search-outline" size={48} color={theme.placeholder} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No runners found</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Try adjusting your filters or radius.
            </Text>
          </View>
        }
      />
      {runners.length > 0 && (
        <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <Pressable
            style={({ pressed }) => [
              styles.startBtn,
              { backgroundColor: selected.size > 0 ? theme.brand : theme.inputBackground, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleStartRun}
            accessibilityLabel="Start a run"
            accessibilityRole="button"
          >
            <Ionicons name="flag-outline" size={18} color={selected.size > 0 ? '#fff' : theme.placeholder} />
            <Text style={[styles.startBtnText, { color: selected.size > 0 ? '#fff' : theme.placeholder }]}>
              {selected.size > 0 ? `Start a Run (${selected.size} invited)` : 'Select runners to invite'}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  )
}

function paceSecondsToBucket(paceMin: number | null, paceMax: number | null) {
  if (!paceMin) return null
  const avg = paceMin
  if (avg < 480) return '7:00-8:00'
  if (avg < 570) return '8:00-9:30'
  return '9:30-11:00'
}

function distanceToBucket(distMin: number | null) {
  if (!distMin) return null
  if (distMin <= 3) return '3'
  if (distMin <= 5) return '5'
  if (distMin <= 10) return '10'
  return 'Half'
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 100 },
  header: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  card: { borderRadius: radius.lg, padding: spacing.md },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  info: { flex: 1, gap: 2 },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  meta: { fontSize: fontSize.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xl, marginTop: 60 },
  loadingText: { fontSize: fontSize.md },
  errorText: { fontSize: fontSize.md, textAlign: 'center' },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  emptySubtitle: { fontSize: fontSize.md, textAlign: 'center' },
  retryBtn: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: radius.lg, borderWidth: 1 },
  retryBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: spacing.lg, borderTopWidth: 1,
  },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, borderRadius: radius.lg, gap: spacing.sm,
  },
  startBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
})
