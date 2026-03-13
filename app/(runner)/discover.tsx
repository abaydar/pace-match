import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  Modal,
  ScrollView,
  TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { MOCK_USERS, MOCK_CLUBS } from '../data/mockData'
import { RunnerCard } from '../components/RunnerCard'
import { ClubCard } from '../components/ClubCard'
import { useApp } from '../context/AppContext'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'

type Tab = 'runners' | 'clubs'

const PACE_OPTIONS = ['Any', 'Under 7:00', '7:00–8:00', '8:00–9:00', '9:00–10:00', '10:00+']
const GOAL_OPTIONS = ['fitness', 'social', 'long-run', 'race training']
const DISTANCE_OPTIONS = ['3–5 mi', '6–8 mi', '9–12 mi', '12+ mi']

export default function Discover() {
  const theme = useTheme()
  const { sendConnectionRequest, hasSentRequest } = useApp()
  const [activeTab, setActiveTab] = useState<Tab>('runners')
  const [query, setQuery] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedDistance, setSelectedDistance] = useState<string>('Any')
  const [selectedPace, setSelectedPace] = useState<string>('Any')

  const filteredRunners = useMemo(() => {
    return MOCK_USERS.filter((u) => {
      const q = query.toLowerCase()
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.location.toLowerCase().includes(q) ||
        u.goals.some((g) => g.includes(q))
      const matchesGoals =
        selectedGoals.length === 0 || selectedGoals.some((g) => u.goals.includes(g))
      return matchesSearch && matchesGoals
    })
  }, [query, selectedGoals])

  const filteredClubs = useMemo(() => {
    return MOCK_CLUBS.filter((c) => {
      const q = query.toLowerCase()
      return (
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q)
      )
    })
  }, [query])

  function toggleGoal(goal: string) {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: theme.inputBackground }]}>
        <Ionicons name="search-outline" size={18} color={theme.placeholder} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder={activeTab === 'runners' ? 'Search runners...' : 'Search clubs...'}
          placeholderTextColor={theme.placeholder}
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Search"
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={18} color={theme.placeholder} />
          </Pressable>
        )}
        <Pressable
          onPress={() => setShowFilter(true)}
          style={[styles.filterBtn, { backgroundColor: theme.brandLight }]}
          accessibilityLabel="Open filters"
          accessibilityRole="button"
        >
          <Ionicons name="options-outline" size={16} color={theme.brand} />
        </Pressable>
      </View>

      {/* Segmented control */}
      <View style={[styles.segmented, { backgroundColor: theme.inputBackground }]}>
        {(['runners', 'clubs'] as Tab[]).map((tab) => (
          <Pressable
            key={tab}
            style={[
              styles.segment,
              activeTab === tab && { backgroundColor: theme.surface, shadowColor: theme.shadow },
              activeTab === tab && styles.segmentActive,
            ]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text
              style={[
                styles.segmentText,
                { color: activeTab === tab ? theme.text : theme.placeholder },
              ]}
            >
              {tab === 'runners' ? 'Runners' : 'Run Clubs'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Active filters */}
      {selectedGoals.length > 0 && (
        <View style={styles.activeFilters}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {selectedGoals.map((g) => (
              <Pressable
                key={g}
                style={[styles.activeFilter, { backgroundColor: theme.brandLight }]}
                onPress={() => toggleGoal(g)}
              >
                <Text style={[styles.activeFilterText, { color: theme.brand }]}>{g}</Text>
                <Ionicons name="close" size={12} color={theme.brand} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {/* List */}
      {activeTab === 'runners' ? (
        <FlatList
          data={filteredRunners}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RunnerCard
              user={item}
              requestSent={hasSentRequest(item.id)}
              onRequestRun={() => sendConnectionRequest(item.id)}
              onMessage={() => {}}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="search-outline" size={48} color={theme.placeholder} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No runners found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Try adjusting your search or filters
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredClubs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ClubCard club={item} joined={item.id === 'c1'} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={theme.placeholder} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No clubs found</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Try a different search term
              </Text>
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.filterSheet, { backgroundColor: theme.background }]}>
          <View style={styles.filterHeader}>
            <Text style={[styles.filterTitle, { color: theme.text }]}>Filter Runners</Text>
            <Pressable onPress={() => setShowFilter(false)} accessibilityLabel="Close filters">
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Goals */}
            <Text style={[styles.filterSection, { color: theme.textSecondary }]}>GOALS</Text>
            <View style={styles.chipGroup}>
              {GOAL_OPTIONS.map((g) => (
                <Pressable
                  key={g}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedGoals.includes(g) ? theme.brand : theme.inputBackground,
                    },
                  ]}
                  onPress={() => toggleGoal(g)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedGoals.includes(g) ? '#fff' : theme.text },
                    ]}
                  >
                    {g}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Pace */}
            <Text style={[styles.filterSection, { color: theme.textSecondary }]}>PACE RANGE</Text>
            <View style={styles.chipGroup}>
              {PACE_OPTIONS.map((p) => (
                <Pressable
                  key={p}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedPace === p ? theme.brand : theme.inputBackground,
                    },
                  ]}
                  onPress={() => setSelectedPace(p)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedPace === p ? '#fff' : theme.text },
                    ]}
                  >
                    {p}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Distance */}
            <Text style={[styles.filterSection, { color: theme.textSecondary }]}>DISTANCE</Text>
            <View style={styles.chipGroup}>
              {DISTANCE_OPTIONS.map((d) => (
                <Pressable
                  key={d}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedDistance === d ? theme.brand : theme.inputBackground,
                    },
                  ]}
                  onPress={() => setSelectedDistance(d)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedDistance === d ? '#fff' : theme.text },
                    ]}
                  >
                    {d}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <View style={styles.filterActions}>
            <Pressable
              style={[styles.filterResetBtn, { borderColor: theme.border }]}
              onPress={() => {
                setSelectedGoals([])
                setSelectedPace('Any')
                setSelectedDistance('Any')
              }}
            >
              <Text style={[styles.filterResetText, { color: theme.textSecondary }]}>Reset</Text>
            </Pressable>
            <Pressable
              style={[styles.filterApplyBtn, { backgroundColor: theme.brand }]}
              onPress={() => setShowFilter(false)}
            >
              <Text style={styles.filterApplyText}>Apply Filters</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: radius.lg,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmented: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: 3,
    marginBottom: spacing.md,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: radius.md,
  },
  segmentActive: {
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  activeFilters: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    gap: 4,
  },
  activeFilterText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'capitalize',
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
  },
  empty: {
    alignItems: 'center',
    marginTop: 60,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
  },
  filterSheet: {
    flex: 1,
    padding: spacing.xl,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  filterTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  filterSection: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  filterActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  filterResetBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  filterResetText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  filterApplyBtn: {
    flex: 2,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  filterApplyText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: '#fff',
  },
})
