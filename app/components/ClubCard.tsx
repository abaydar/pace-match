import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { RunClub } from '../data/mockData'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'

type Props = {
  club: RunClub
  onPress?: () => void
  joined?: boolean
}

export function ClubCard({ club, onPress, joined = false }: Props) {
  const theme = useTheme()

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
      ]}
      onPress={onPress}
      accessibilityLabel={`${club.name} run club`}
      accessibilityRole="button"
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.clubIcon, { backgroundColor: theme.brandLight }]}>
          <Ionicons name="people" size={20} color={theme.brand} />
        </View>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: theme.text }]}>{club.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
            <Text style={[styles.location, { color: theme.textSecondary }]}>{club.location}</Text>
          </View>
        </View>
        {joined && (
          <View style={[styles.joinedBadge, { backgroundColor: theme.successLight }]}>
            <Text style={[styles.joinedText, { color: theme.success }]}>Joined</Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
        {club.description}
      </Text>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Ionicons name="people-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.statText, { color: theme.textSecondary }]}>
            {club.memberCount} members
          </Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="timer-outline" size={13} color={theme.textSecondary} />
          <Text style={[styles.statText, { color: theme.textSecondary }]}>{club.pace}</Text>
        </View>
      </View>

      {/* Schedule */}
      <View style={styles.scheduleRow}>
        <Ionicons name="calendar-outline" size={13} color={theme.brand} />
        <Text style={[styles.schedule, { color: theme.brand }]} numberOfLines={1}>
          {club.schedule.join('  ·  ')}
        </Text>
      </View>
    </Pressable>
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
    alignItems: 'center',
    gap: spacing.md,
  },
  clubIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  location: {
    fontSize: fontSize.xs,
  },
  joinedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  joinedText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
  },
  description: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: fontSize.sm,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  schedule: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    flex: 1,
  },
})
