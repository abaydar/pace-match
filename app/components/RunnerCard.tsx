import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { StatusBadge } from './StatusBadge'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { MatchedRunner } from '../../lib/hooks/useRunners'

type Props = {
  user: MatchedRunner
  onRequestRun?: () => void
  onMessage?: () => void
  requestSent?: boolean
}

function formatPace(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export function RunnerCard({ user, onRequestRun, onMessage, requestSent = false }: Props) {
  const theme = useTheme()

  const paceLabel =
    user.pace_min && user.pace_max
      ? `${formatPace(user.pace_min)}–${formatPace(user.pace_max)} /mi`
      : null

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Avatar + Name */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.brandLight }]}>
          <Text style={[styles.avatarText, { color: theme.brand }]}>
            {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: theme.text }]}>{user.name}</Text>
          {user.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
              <Text style={[styles.location, { color: theme.textSecondary }]}>{user.location}</Text>
            </View>
          )}
        </View>
        {user.ready_status && <StatusBadge status={user.ready_status as any} small />}
      </View>

      {/* Pace */}
      {paceLabel && (
        <View style={styles.paceRow}>
          <Ionicons name="timer-outline" size={14} color={theme.brand} />
          <Text style={[styles.pace, { color: theme.text }]}>{paceLabel}</Text>
        </View>
      )}

      {/* Tags */}
      <View style={styles.tags}>
        {user.goals.map((g: string) => (
          <View key={g} style={[styles.tag, { backgroundColor: theme.brandLight }]}>
            <Text style={[styles.tagText, { color: theme.brand }]}>{g}</Text>
          </View>
        ))}
        {user.distance_min && user.distance_max && (
          <View style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>
              {user.distance_min}–{user.distance_max} mi
            </Text>
          </View>
        )}
        {user.training_type && (
          <View style={[styles.tag, { backgroundColor: theme.warningLight }]}>
            <Text style={[styles.tagText, { color: theme.warning }]}>{user.training_type}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btnPrimary,
            { backgroundColor: requestSent ? theme.inputBackground : theme.brand, opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={!requestSent ? onRequestRun : undefined}
          accessibilityLabel={requestSent ? 'Request sent' : `Request to run with ${user.name}`}
          accessibilityRole="button"
        >
          <Ionicons
            name={requestSent ? 'checkmark' : 'person-add-outline'}
            size={14}
            color={requestSent ? theme.textSecondary : '#fff'}
          />
          <Text style={[styles.btnText, { color: requestSent ? theme.textSecondary : '#fff' }]}>
            {requestSent ? 'Requested' : 'Request to run'}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            styles.btnSecondary,
            { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={onMessage}
          accessibilityLabel={`Message ${user.name}`}
          accessibilityRole="button"
        >
          <Ionicons name="chatbubble-outline" size={14} color={theme.brand} />
          <Text style={[styles.btnText, { color: theme.brand }]}>Message</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  nameBlock: { flex: 1, gap: 2 },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { fontSize: fontSize.xs },
  paceRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pace: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  tagText: { fontSize: 11, fontWeight: fontWeight.medium, textTransform: 'capitalize' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  btn: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 8,
    borderRadius: radius.md, gap: 5,
  },
  btnPrimary: {},
  btnSecondary: { borderWidth: 1 },
  btnText: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
})
