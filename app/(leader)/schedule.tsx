import React from 'react'
import { View, Text, StyleSheet, SectionList, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useLeaderClub } from '../../lib/hooks/useClub'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { EventRow } from '../../lib/database.types'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

const TRAINING_PLANS = [
  { week: 'Week 1', focus: 'Base Building', days: 'Mon · Wed · Sat', notes: 'Easy effort, conversational pace. Focus on time on feet.' },
  { week: 'Week 2', focus: 'Tempo Intervals', days: 'Tue · Thu · Sun', notes: '6×800m @ 10K pace. Full recovery between reps.' },
  { week: 'Week 3', focus: 'Long Run + Recovery', days: 'Mon · Sat · Sun', notes: 'Saturday 12mi easy. Sunday active recovery 4mi.' },
  { week: 'Week 4', focus: 'Taper', days: 'Mon · Wed · Fri', notes: 'Cut mileage 20%. Race-pace strides on Friday.' },
]

type Section = { title: string; data: EventRow[] }

export default function Schedule() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const { events, loading } = useLeaderClub(dbUser?.id)

  const now = new Date()
  const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const upcoming = events.filter((e) => {
    const d = new Date(e.datetime)
    return d >= now && d <= oneWeek
  })
  const later = events.filter((e) => new Date(e.datetime) > oneWeek)

  const sections: Section[] = []
  if (upcoming.length) sections.push({ title: 'This Week', data: upcoming })
  if (later.length) sections.push({ title: 'Coming Up', data: later })

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.brand} />
        </View>
      )}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => {
          const paceGroups: { label: string }[] = Array.isArray(item.pace_groups)
            ? (item.pace_groups as { label: string }[])
            : []
          return (
            <View style={[styles.eventCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.eventHeader}>
                <View style={[styles.dateBox, { backgroundColor: theme.brandLight }]}>
                  <Ionicons name="calendar" size={16} color={theme.brand} />
                </View>
                <View style={styles.eventInfo}>
                  <Text style={[styles.eventTitle, { color: theme.text }]}>{item.title}</Text>
                  <Text style={[styles.eventDate, { color: theme.brand }]}>
                    {formatDateTime(item.datetime)}
                  </Text>
                </View>
              </View>
              <View style={styles.eventMeta}>
                {item.location && (
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={13} color={theme.textSecondary} />
                    <Text style={[styles.metaText, { color: theme.textSecondary }]}>{item.location}</Text>
                  </View>
                )}
              </View>
              {paceGroups.length > 0 && (
                <View style={styles.paceChips}>
                  {paceGroups.map((p, i) => (
                    <View key={i} style={[styles.paceChip, { backgroundColor: theme.inputBackground }]}>
                      <Text style={[styles.paceChipText, { color: theme.textSecondary }]}>{p.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={theme.placeholder} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No upcoming runs</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Create your first run event in the Events tab.
              </Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          <View style={styles.trainingSection}>
            <Text style={[styles.sectionHeader, { color: theme.textSecondary }]}>Training Plan</Text>
            {TRAINING_PLANS.map((plan) => (
              <View
                key={plan.week}
                style={[styles.planCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
              >
                <View style={styles.planHeader}>
                  <Text style={[styles.planWeek, { color: theme.brand }]}>{plan.week}</Text>
                  <Text style={[styles.planFocus, { color: theme.text }]}>{plan.focus}</Text>
                </View>
                <View style={styles.planMeta}>
                  <Ionicons name="calendar-outline" size={13} color={theme.textSecondary} />
                  <Text style={[styles.planDays, { color: theme.textSecondary }]}>{plan.days}</Text>
                </View>
                <Text style={[styles.planNotes, { color: theme.textSecondary }]}>{plan.notes}</Text>
              </View>
            ))}
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  loadingRow: { alignItems: 'center', padding: spacing.lg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  sectionHeader: {
    fontSize: fontSize.xs, fontWeight: fontWeight.bold,
    textTransform: 'uppercase', letterSpacing: 0.8,
    marginBottom: spacing.sm, marginTop: spacing.md,
  },
  eventCard: {
    borderRadius: radius.lg, borderWidth: 1,
    padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.md,
  },
  eventHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  dateBox: { width: 36, height: 36, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  eventInfo: { flex: 1, gap: 2 },
  eventTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold, lineHeight: 20 },
  eventDate: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  eventMeta: { gap: spacing.xs },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: fontSize.sm },
  paceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  paceChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full },
  paceChipText: { fontSize: 11, fontWeight: fontWeight.medium },
  empty: { alignItems: 'center', marginTop: 60, gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  emptySubtitle: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
  trainingSection: { gap: spacing.md },
  planCard: {
    borderRadius: radius.lg, borderWidth: 1,
    padding: spacing.lg, gap: spacing.sm, marginBottom: spacing.md,
  },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  planWeek: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase' },
  planFocus: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  planMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  planDays: { fontSize: fontSize.sm },
  planNotes: { fontSize: fontSize.sm, lineHeight: 20, fontStyle: 'italic' },
})
