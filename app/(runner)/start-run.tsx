import React, { useState, useEffect } from 'react'
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, ActivityIndicator, Alert, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import * as Location from 'expo-location'
import MapView, { Marker } from 'react-native-maps'
import { useApp } from '../context/AppContext'
import { useRuns } from '../../lib/hooks/useRuns'
import { useGetSupabase } from '../../lib/hooks/useSupabase'
import { sendRunInviteNotification } from '../../lib/notifications'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { RunnerProfile } from '../../types'

const TIME_OPTIONS = [
  { label: 'Right now', minutesFromNow: 0 },
  { label: 'In 30 min', minutesFromNow: 30 },
  { label: 'In 1 hour', minutesFromNow: 60 },
  { label: 'In 2 hours', minutesFromNow: 120 },
]

export default function StartRunScreen() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const { createRun, inviteRunners } = useRuns(dbUser?.id)
  const getSupabase = useGetSupabase()
  const params = useLocalSearchParams<{ invitedIds?: string; invitedRunners?: string }>()

  const invitedIds: string[] = params.invitedIds ? JSON.parse(params.invitedIds) : []
  const invitedRunners: RunnerProfile[] = params.invitedRunners ? JSON.parse(params.invitedRunners) : []

  const [selectedTime, setSelectedTime] = useState(0)
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationLabel, setLocationLabel] = useState('')
  const [loadingLocation, setLoadingLocation] = useState(true)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    Location.requestForegroundPermissionsAsync().then(async ({ status }) => {
      if (status !== 'granted') {
        setLoadingLocation(false)
        return
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      const { latitude, longitude } = loc.coords
      setLocation({ lat: latitude, lon: longitude })

      const geo = await Location.reverseGeocodeAsync({ latitude, longitude })
      if (geo.length > 0) {
        const g = geo[0]
        setLocationLabel(
          [g.street, g.city, g.region].filter(Boolean).join(', ')
        )
      }
      setLoadingLocation(false)
    })
  }, [])

  function getRunTime(): string {
    const d = new Date()
    d.setMinutes(d.getMinutes() + TIME_OPTIONS[selectedTime].minutesFromNow)
    return d.toISOString()
  }

  function formatTime(minutesFromNow: number): string {
    const d = new Date()
    d.setMinutes(d.getMinutes() + minutesFromNow)
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  }

  async function handleSendInvites() {
    if (!location || !dbUser) {
      Alert.alert('Location unavailable', 'Please wait for your location to load.')
      return
    }
    setSending(true)
    try {
      const run = await createRun({
        host_id: dbUser.id,
        time: getRunTime(),
        latitude: location.lat,
        longitude: location.lon,
        location_label: locationLabel || 'Current location',
        pace_bucket: null,
        distance: null,
        training_type: null,
      })

      await inviteRunners(run.id, invitedIds)

      // Send push notifications
      const sb = await getSupabase()
      const { data: runnersData } = await sb
        .from('users')
        .select('expo_push_token')
        .in('id', invitedIds)

      const hostName = dbUser.name
      const timeLabel = formatTime(TIME_OPTIONS[selectedTime].minutesFromNow)
      const label = locationLabel || 'Current location'

      await Promise.all(
        (runnersData ?? [])
          .filter((r: any) => r.expo_push_token)
          .map((r: any) =>
            sendRunInviteNotification(r.expo_push_token, {
              runId: run.id,
              hostName,
              time: timeLabel,
              locationLabel: label,
            })
          )
      )

      router.replace(`/run/${run.id}/accepted`)
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Invited runners */}
        <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            Inviting {invitedRunners.length} runner{invitedRunners.length !== 1 ? 's' : ''}
          </Text>
          <View style={styles.avatarRow}>
            {invitedRunners.map((r) => (
              <View key={r.id} style={styles.invitee}>
                <View style={[styles.miniAvatar, { backgroundColor: theme.brandLight }]}>
                  <Text style={[styles.miniAvatarText, { color: theme.brand }]}>
                    {r.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <Text style={[styles.inviteeName, { color: theme.textSecondary }]} numberOfLines={1}>
                  {r.name.split(' ')[0]}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Time selector */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>When?</Text>
        <View style={styles.timeGrid}>
          {TIME_OPTIONS.map((opt, i) => (
            <Pressable
              key={i}
              style={[
                styles.timeOption,
                {
                  backgroundColor: selectedTime === i ? theme.brand : theme.surface,
                  borderColor: selectedTime === i ? theme.brand : theme.border,
                },
              ]}
              onPress={() => setSelectedTime(i)}
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedTime === i }}
            >
              <Text style={[styles.timeLabel, { color: selectedTime === i ? '#fff' : theme.text }]}>
                {opt.label}
              </Text>
              <Text style={[styles.timeValue, { color: selectedTime === i ? 'rgba(255,255,255,0.8)' : theme.textSecondary }]}>
                {formatTime(opt.minutesFromNow)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Location */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Meeting Point</Text>
        {loadingLocation ? (
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.inputBackground }]}>
            <ActivityIndicator color={theme.brand} />
            <Text style={[styles.mapPlaceholderText, { color: theme.textSecondary }]}>Getting your location…</Text>
          </View>
        ) : location ? (
          <>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.lat,
                longitude: location.lon,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
            >
              <Marker
                coordinate={{ latitude: location.lat, longitude: location.lon }}
                title="Meeting point"
              />
            </MapView>
            <View style={[styles.locationRow, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="location" size={16} color={theme.brand} />
              <TextInput
                style={[styles.locationInput, { color: theme.text }]}
                value={locationLabel}
                onChangeText={setLocationLabel}
                placeholder="Location label"
                placeholderTextColor={theme.placeholder}
                accessibilityLabel="Location label"
              />
            </View>
          </>
        ) : (
          <View style={[styles.mapPlaceholder, { backgroundColor: theme.inputBackground }]}>
            <Ionicons name="location-outline" size={32} color={theme.placeholder} />
            <Text style={[styles.mapPlaceholderText, { color: theme.textSecondary }]}>
              Location unavailable
            </Text>
          </View>
        )}

        <Pressable
          style={({ pressed }) => [
            styles.sendBtn,
            { backgroundColor: theme.brand, opacity: pressed || sending ? 0.85 : 1 },
          ]}
          onPress={handleSendInvites}
          disabled={sending || loadingLocation}
          accessibilityLabel="Send invites"
          accessibilityRole="button"
        >
          {sending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="send" size={18} color="#fff" />
              <Text style={styles.sendBtnText}>Send Invites</Text>
            </>
          )}
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  card: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  avatarRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  invitee: { alignItems: 'center', gap: 4, width: 52 },
  miniAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  miniAvatarText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  inviteeName: { fontSize: 10, fontWeight: fontWeight.medium, textAlign: 'center' },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  timeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  timeOption: {
    flex: 1, minWidth: '45%', padding: spacing.md,
    borderRadius: radius.lg, borderWidth: 1, gap: 2,
  },
  timeLabel: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  timeValue: { fontSize: fontSize.xs },
  map: { height: 200, borderRadius: radius.lg, overflow: 'hidden' },
  mapPlaceholder: {
    height: 160, borderRadius: radius.lg,
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  mapPlaceholderText: { fontSize: fontSize.sm },
  locationRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: spacing.md, borderRadius: radius.md, gap: spacing.sm,
  },
  locationInput: { flex: 1, fontSize: fontSize.md },
  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, borderRadius: radius.lg,
    gap: spacing.sm, marginTop: spacing.md,
  },
  sendBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
})
