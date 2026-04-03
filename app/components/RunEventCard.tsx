import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { EventRow } from '../../lib/database.types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

type Props = {
  event: EventRow
  onRSVP?: (status: 'going' | 'maybe') => void
  currentUserId?: string
  myRsvpStatus?: 'going' | 'maybe' | 'not_going'
}

export function RunEventCard({ event, onRSVP, myRsvpStatus }: Props) {
  const theme = useTheme()
  const paceGroups: { label: string; pace: string }[] = Array.isArray(event.pace_groups)
    ? (event.pace_groups as { label: string; pace: string }[])
    : []

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Title + date */}
      <View style={styles.header}>
        <View style={[styles.dateBox, { backgroundColor: theme.brandLight }]}>
          <Ionicons name="calendar" size={18} color={theme.brand} />
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.title, { color: theme.text }]}>{event.title}</Text>
          <Text style={[styles.datetime, { color: theme.brand }]}>
            {formatDateTime(event.datetime)}
          </Text>
        </View>
      </View>

      {/* Location */}
      {event.location && (
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.meta, { color: theme.textSecondary }]}>{event.location}</Text>
        </View>
      )}

      {/* Distance options */}
      {event.distance_options.length > 0 && (
        <View style={styles.tagsRow}>
          {event.distance_options.map((d) => (
            <View key={d} style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
              <Text style={[styles.tagText, { color: theme.textSecondary }]}>{d} mi</Text>
            </View>
          ))}
        </View>
      )}

      {/* Pace groups */}
      {paceGroups.length > 0 && (
        <View style={styles.row}>
          <Ionicons name="speedometer-outline" size={14} color={theme.textSecondary} />
          <Text style={[styles.meta, { color: theme.textSecondary }]}>
            {paceGroups.map((g) => g.label).join('  ·  ')}
          </Text>
        </View>
      )}

      {/* Route notes */}
      {event.route_notes ? (
        <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={2}>
          {event.route_notes}
        </Text>
      ) : null}

      {/* RSVP footer */}
      {onRSVP && (
        <View style={styles.footer}>
          <View style={styles.rsvpActions}>
            <Pressable
              style={({ pressed }) => [
                styles.rsvpBtn,
                {
                  backgroundColor:
                    myRsvpStatus === 'going' ? theme.success : theme.inputBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => onRSVP('going')}
              accessibilityLabel="RSVP Going"
              accessibilityRole="button"
            >
              <Text style={[styles.rsvpBtnText, { color: myRsvpStatus === 'going' ? '#fff' : theme.textSecondary }]}>
                Going
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.rsvpBtn,
                {
                  backgroundColor:
                    myRsvpStatus === 'maybe' ? theme.warning : theme.inputBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => onRSVP('maybe')}
              accessibilityLabel="RSVP Maybe"
              accessibilityRole="button"
            >
              <Text style={[styles.rsvpBtnText, { color: myRsvpStatus === 'maybe' ? '#fff' : theme.textSecondary }]}>
                Maybe
              </Text>
            </Pressable>
          </View>
        </View>
      )}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  dateBox: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    lineHeight: 20,
  },
  datetime: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  meta: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  tagText: {
    fontSize: 11,
    fontWeight: fontWeight.medium,
  },
  notes: {
    fontSize: fontSize.sm,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  rsvpCount: {},
  rsvpText: {
    fontSize: fontSize.sm,
  },
  rsvpActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rsvpBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  rsvpBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
})
