import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Switch,
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import { useRunners } from '../../lib/hooks/useRunners'
import type { ReadyStatusVisibility } from '../../lib/database.types'

type TimeOption = 'now' | 'today-morning' | 'today-afternoon' | 'today-evening' | 'tomorrow-morning' | 'tomorrow-evening'

const TIME_OPTIONS: { label: string; value: TimeOption }[] = [
  { label: 'Right now', value: 'now' },
  { label: 'This morning', value: 'today-morning' },
  { label: 'This afternoon', value: 'today-afternoon' },
  { label: 'This evening', value: 'today-evening' },
  { label: 'Tomorrow morning', value: 'tomorrow-morning' },
  { label: 'Tomorrow evening', value: 'tomorrow-evening' },
]

const VISIBILITY_OPTIONS: { label: string; value: ReadyStatusVisibility; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'Everyone', value: 'everyone', icon: 'globe-outline' },
  { label: 'Club members only', value: 'club_members', icon: 'shield-outline' },
]

function timeOptionToWindow(value: TimeOption): { start: Date; end: Date } | null {
  const now = new Date()
  const today = new Date(now)
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  switch (value) {
    case 'now': return null
    case 'today-morning':
      today.setHours(6, 0, 0, 0)
      const mEnd = new Date(today); mEnd.setHours(12, 0, 0, 0)
      return { start: today, end: mEnd }
    case 'today-afternoon':
      today.setHours(12, 0, 0, 0)
      const aEnd = new Date(today); aEnd.setHours(17, 0, 0, 0)
      return { start: today, end: aEnd }
    case 'today-evening':
      today.setHours(17, 0, 0, 0)
      const eEnd = new Date(today); eEnd.setHours(21, 0, 0, 0)
      return { start: today, end: eEnd }
    case 'tomorrow-morning':
      tomorrow.setHours(6, 0, 0, 0)
      const tmEnd = new Date(tomorrow); tmEnd.setHours(12, 0, 0, 0)
      return { start: tomorrow, end: tmEnd }
    case 'tomorrow-evening':
      tomorrow.setHours(17, 0, 0, 0)
      const teEnd = new Date(tomorrow); teEnd.setHours(21, 0, 0, 0)
      return { start: tomorrow, end: teEnd }
  }
}

export default function ReadyToRun() {
  const theme = useTheme()
  const { readyStatus, setReadyNow, setTimeWindow, clearReadyStatus, dbUser } = useApp()
  const { runners, fetchMatches } = useRunners()
  const [isReady, setIsReady] = useState(readyStatus !== null)
  const [timeOption, setTimeOption] = useState<TimeOption>('now')
  const [visibility, setVisibility] = useState<ReadyStatusVisibility>('club_members')

  // Runners with active ready status from matched results
  const availableRunners = runners.filter((r) => r.ready_status !== null)

  async function handleToggle(value: boolean) {
    setIsReady(value)
    if (value) {
      if (timeOption === 'now') {
        await setReadyNow(visibility)
      } else {
        const window = timeOptionToWindow(timeOption)
        if (window) await setTimeWindow(window.start, window.end, visibility)
      }
      fetchMatches()
    } else {
      await clearReadyStatus()
    }
  }

  async function handleTimeChange(value: TimeOption) {
    setTimeOption(value)
    if (isReady) {
      if (value === 'now') {
        await setReadyNow(visibility)
      } else {
        const window = timeOptionToWindow(value)
        if (window) await setTimeWindow(window.start, window.end, visibility)
      }
    }
  }

  async function handleVisibilityChange(value: ReadyStatusVisibility) {
    setVisibility(value)
    if (isReady) {
      if (timeOption === 'now') {
        await setReadyNow(value)
      } else {
        const window = timeOptionToWindow(timeOption)
        if (window) await setTimeWindow(window.start, window.end, value)
      }
    }
  }

  function readyStatusLabel(): string {
    if (!isReady) return "Let others know you're available"
    const opt = TIME_OPTIONS.find((o) => o.value === timeOption)
    const vis = visibility === 'everyone' ? 'everyone' : 'club members only'
    return `${opt?.label ?? 'Ready'} · visible to ${vis}`
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.statusRow}>
            <View style={styles.statusLeft}>
              <View style={[styles.statusIcon, { backgroundColor: isReady ? '#D1FAE5' : theme.inputBackground }]}>
                <Ionicons
                  name="flash"
                  size={24}
                  color={isReady ? '#059669' : theme.placeholder}
                />
              </View>
              <View>
                <Text style={[styles.statusLabel, { color: theme.text }]}>Ready to Run</Text>
                <Text style={[styles.statusSub, { color: theme.textSecondary }]}>
                  {readyStatusLabel()}
                </Text>
              </View>
            </View>
            <Switch
              value={isReady}
              onValueChange={handleToggle}
              trackColor={{ false: theme.border, true: '#34D399' }}
              thumbColor={isReady ? '#059669' : theme.placeholder}
              accessibilityLabel="Toggle ready to run status"
            />
          </View>
        </View>

        {/* Time Selector */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>When are you available?</Text>
        <View style={styles.timeGrid}>
          {TIME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.timeOption,
                {
                  backgroundColor:
                    timeOption === opt.value ? theme.brand : theme.surface,
                  borderColor: timeOption === opt.value ? theme.brand : theme.border,
                },
              ]}
              onPress={() => handleTimeChange(opt.value)}
              accessibilityLabel={opt.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: timeOption === opt.value }}
            >
              <Text
                style={[
                  styles.timeOptionText,
                  { color: timeOption === opt.value ? '#fff' : theme.text },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Visibility */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Who can see your status?</Text>
        <View style={styles.visibilityRow}>
          {VISIBILITY_OPTIONS.map((opt) => (
            <Pressable
              key={opt.value}
              style={[
                styles.visibilityOption,
                {
                  backgroundColor:
                    visibility === opt.value ? theme.brand : theme.surface,
                  borderColor: visibility === opt.value ? theme.brand : theme.border,
                  flex: 1,
                },
              ]}
              onPress={() => handleVisibilityChange(opt.value)}
              accessibilityLabel={opt.label}
              accessibilityRole="radio"
              accessibilityState={{ selected: visibility === opt.value }}
            >
              <Ionicons
                name={opt.icon}
                size={18}
                color={visibility === opt.value ? '#fff' : theme.textSecondary}
              />
              <Text
                style={[
                  styles.visibilityText,
                  { color: visibility === opt.value ? '#fff' : theme.text },
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Available runners feed */}
        <View style={styles.feedHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Available Runners
          </Text>
          <View style={[styles.badge, { backgroundColor: theme.brandLight }]}>
            <Text style={[styles.badgeText, { color: theme.brand }]}>{availableRunners.length}</Text>
          </View>
        </View>

        {availableRunners.length === 0 ? (
          <View style={[styles.emptyFeed, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Ionicons name="people-outline" size={40} color={theme.placeholder} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No one's ready yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Toggle your status above to be the first!
            </Text>
          </View>
        ) : (
          <View style={styles.runnerList}>
            {availableRunners.map((runner) => (
              <View
                key={runner.id}
                style={[styles.runnerRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={[styles.miniAvatar, { backgroundColor: theme.brandLight }]}>
                  <Text style={[styles.miniAvatarText, { color: theme.brand }]}>
                    {runner.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.runnerInfo}>
                  <Text style={[styles.runnerName, { color: theme.text }]}>{runner.name}</Text>
                  <Text style={[styles.runnerMeta, { color: theme.textSecondary }]}>
                    {runner.location ?? 'Unknown location'}
                  </Text>
                </View>
                <View style={[styles.readyBadge, { backgroundColor: '#D1FAE5' }]}>
                  <Text style={styles.readyBadgeText}>Ready</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  statusCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  statusSub: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  timeOptionText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  visibilityRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  visibilityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  visibilityText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  feedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  emptyFeed: {
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  runnerList: {
    gap: spacing.sm,
  },
  runnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  miniAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  runnerInfo: {
    flex: 1,
  },
  runnerName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  runnerMeta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  readyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  readyBadgeText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
    color: '#059669',
  },
})
