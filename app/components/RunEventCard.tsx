import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { RunEvent, formatDateTime } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'

type Props = {
  event: RunEvent
  onRSVP?: (status: 'going' | 'maybe') => void
  currentUserId?: string
}

export function RunEventCard({ event, onRSVP, currentUserId }: Props) {
  const theme = useTheme()
  const goingCount = event.rsvpList.filter((r) => r.status === 'going').length
  const maybeCount = event.rsvpList.filter((r) => r.status === 'maybe').length
  const myRSVP = currentUserId
    ? event.rsvpList.find((r) => r.userId === currentUserId)?.status
    : undefined

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
      <View style={styles.row}>
        <Ionicons name="location-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.meta, { color: theme.textSecondary }]}>{event.location}</Text>
      </View>

      {/* Distance options */}
      <View style={styles.tagsRow}>
        {event.distanceOptions.map((d) => (
          <View key={d} style={[styles.tag, { backgroundColor: theme.inputBackground }]}>
            <Text style={[styles.tagText, { color: theme.textSecondary }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Pace groups */}
      <View style={styles.row}>
        <Ionicons name="speedometer-outline" size={14} color={theme.textSecondary} />
        <Text style={[styles.meta, { color: theme.textSecondary }]}>
          {event.paceGroups.join('  ·  ')}
        </Text>
      </View>

      {/* Route notes */}
      {event.routeNotes ? (
        <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={2}>
          {event.routeNotes}
        </Text>
      ) : null}

      {/* RSVP footer */}
      <View style={styles.footer}>
        <View style={styles.rsvpCount}>
          <Text style={[styles.rsvpText, { color: theme.text }]}>
            <Text style={{ color: theme.success, fontWeight: fontWeight.bold }}>{goingCount} going</Text>
            {'  '}
            <Text style={{ color: theme.warning }}>{maybeCount} maybe</Text>
          </Text>
        </View>
        {onRSVP && (
          <View style={styles.rsvpActions}>
            <Pressable
              style={({ pressed }) => [
                styles.rsvpBtn,
                {
                  backgroundColor:
                    myRSVP === 'going' ? theme.success : theme.inputBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => onRSVP('going')}
              accessibilityLabel="RSVP Going"
              accessibilityRole="button"
            >
              <Text style={[styles.rsvpBtnText, { color: myRSVP === 'going' ? '#fff' : theme.textSecondary }]}>
                Going
              </Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.rsvpBtn,
                {
                  backgroundColor:
                    myRSVP === 'maybe' ? theme.warning : theme.inputBackground,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => onRSVP('maybe')}
              accessibilityLabel="RSVP Maybe"
              accessibilityRole="button"
            >
              <Text style={[styles.rsvpBtnText, { color: myRSVP === 'maybe' ? '#fff' : theme.textSecondary }]}>
                Maybe
              </Text>
            </Pressable>
          </View>
        )}
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
