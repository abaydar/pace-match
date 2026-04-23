import React from 'react'
import {
  View, Text, StyleSheet, Pressable,
  ActivityIndicator, Alert, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import MapView, { Marker } from 'react-native-maps'
import { useApp } from '../context/AppContext'
import { useRunInvite, useRuns } from '../../lib/hooks/useRuns'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'

export default function RunInviteScreen() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const { run_id } = useLocalSearchParams<{ run_id: string }>()
  const { run, host, invite, loading } = useRunInvite(run_id, dbUser?.id)
  const { respondToInvite } = useRuns(dbUser?.id)
  const [responding, setResponding] = React.useState<'accepting' | 'declining' | null>(null)

  async function handleRespond(status: 'accepted' | 'declined') {
    if (!invite) return
    setResponding(status === 'accepted' ? 'accepting' : 'declining')
    try {
      await respondToInvite(invite.id, status)
      if (status === 'accepted') {
        router.replace(`/run/${run_id}/accepted`)
      } else {
        router.replace('/(runner)/discover')
      }
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setResponding(null)
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.brand} />
        </View>
      </SafeAreaView>
    )
  }

  if (!run || !host) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.danger} />
          <Text style={[styles.errorText, { color: theme.danger }]}>Invite not found</Text>
          <Pressable onPress={() => router.replace('/(runner)/discover')}>
            <Text style={[styles.link, { color: theme.brand }]}>Go home</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const alreadyResponded = invite?.status !== 'pending'
  const runTime = new Date(run.time).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Host */}
        <View style={styles.hostRow}>
          <View style={[styles.hostAvatar, { backgroundColor: theme.brand }]}>
            <Text style={styles.hostAvatarText}>
              {host.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </Text>
          </View>
          <View>
            <Text style={[styles.inviteLabel, { color: theme.textSecondary }]}>Run invite from</Text>
            <Text style={[styles.hostName, { color: theme.text }]}>{host.name}</Text>
          </View>
        </View>

        {/* Details */}
        <View style={[styles.detailsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={theme.brand} />
            <Text style={[styles.detailText, { color: theme.text }]}>{runTime}</Text>
          </View>
          {run.location_label && (
            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color={theme.brand} />
              <Text style={[styles.detailText, { color: theme.text }]}>{run.location_label}</Text>
            </View>
          )}
          {run.distance && (
            <View style={styles.detailRow}>
              <Ionicons name="map-outline" size={18} color={theme.brand} />
              <Text style={[styles.detailText, { color: theme.text }]}>{run.distance} mi</Text>
            </View>
          )}
          {run.pace_bucket && (
            <View style={styles.detailRow}>
              <Ionicons name="timer-outline" size={18} color={theme.brand} />
              <Text style={[styles.detailText, { color: theme.text }]}>{run.pace_bucket} /mi</Text>
            </View>
          )}
          {run.training_type && (
            <View style={styles.detailRow}>
              <Ionicons name="fitness-outline" size={18} color={theme.brand} />
              <Text style={[styles.detailText, { color: theme.text }]}>{run.training_type}</Text>
            </View>
          )}
        </View>

        {/* Map */}
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: run.latitude,
            longitude: run.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          scrollEnabled={false}
        >
          <Marker
            coordinate={{ latitude: run.latitude, longitude: run.longitude }}
            title={run.location_label ?? 'Meeting point'}
          />
        </MapView>

        {/* Status badge */}
        {alreadyResponded && (
          <View style={[
            styles.statusBadge,
            { backgroundColor: invite?.status === 'accepted' ? theme.successLight : theme.inputBackground },
          ]}>
            <Text style={[styles.statusText, { color: invite?.status === 'accepted' ? theme.success : theme.textSecondary }]}>
              You {invite?.status} this invite
            </Text>
          </View>
        )}

        {/* Actions */}
        {!alreadyResponded && (
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.declineBtn,
                { borderColor: theme.border, opacity: pressed || responding !== null ? 0.7 : 1 },
              ]}
              onPress={() => handleRespond('declined')}
              disabled={responding !== null}
              accessibilityLabel="Decline invite"
              accessibilityRole="button"
            >
              {responding === 'declining'
                ? <ActivityIndicator color={theme.textSecondary} />
                : <Text style={[styles.declineBtnText, { color: theme.textSecondary }]}>Decline</Text>
              }
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.acceptBtn,
                { backgroundColor: theme.brand, opacity: pressed || responding !== null ? 0.7 : 1 },
              ]}
              onPress={() => handleRespond('accepted')}
              disabled={responding !== null}
              accessibilityLabel="Accept invite"
              accessibilityRole="button"
            >
              {responding === 'accepting'
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.acceptBtnText}>Accept</Text>
              }
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: spacing.xl, gap: spacing.lg, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  hostRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  hostAvatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  hostAvatarText: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  inviteLabel: { fontSize: fontSize.sm },
  hostName: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  detailsCard: { borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  detailText: { fontSize: fontSize.md },
  map: { height: 200, borderRadius: radius.lg, overflow: 'hidden' },
  statusBadge: { borderRadius: radius.lg, padding: spacing.md, alignItems: 'center' },
  statusText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  declineBtn: {
    flex: 1, paddingVertical: spacing.lg, borderRadius: radius.lg,
    borderWidth: 1, alignItems: 'center',
  },
  declineBtnText: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  acceptBtn: { flex: 2, paddingVertical: spacing.lg, borderRadius: radius.lg, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontSize: fontSize.md, fontWeight: fontWeight.bold },
  errorText: { fontSize: fontSize.md, textAlign: 'center' },
  link: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
})
