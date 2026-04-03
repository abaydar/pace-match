import React, { useState, useCallback } from 'react'
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useApp } from '../context/AppContext'
import { useLeaderClub } from '../../lib/hooks/useClub'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { UserRow } from '../../lib/database.types'

export default function Members() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const { club, members, addMember, removeMember, searchRunners, loading } = useLeaderClub(dbUser?.id)

  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<UserRow[]>([])
  const [searching, setSearching] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const memberIds = new Set(members.map((m) => m.id))

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text)
    if (text.trim().length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const results = await searchRunners(text.trim())
      setSearchResults(results.filter((r) => !memberIds.has(r.id)))
    } finally {
      setSearching(false)
    }
  }, [searchRunners, memberIds])

  async function handleAdd(user: UserRow) {
    setAddingId(user.id)
    try {
      await addMember(user.id)
      setSearchResults((prev) => prev.filter((r) => r.id !== user.id))
      setQuery('')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setAddingId(null)
    }
  }

  async function handleRemove(user: UserRow) {
    Alert.alert('Remove Member', `Remove ${user.name} from the club?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          setRemovingId(user.id)
          try {
            await removeMember(user.id)
          } catch (e: any) {
            Alert.alert('Error', e.message)
          } finally {
            setRemovingId(null)
          }
        },
      },
    ])
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} accessibilityLabel="Go back" accessibilityRole="button">
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {club?.name ?? 'Club'} Members
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={members}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            {/* Search box */}
            <View style={[styles.searchRow, { backgroundColor: theme.inputBackground }]}>
              <Ionicons name="search-outline" size={18} color={theme.placeholder} />
              <TextInput
                style={[styles.searchInput, { color: theme.text }]}
                placeholder="Search runners to add..."
                placeholderTextColor={theme.placeholder}
                value={query}
                onChangeText={handleSearch}
                autoCorrect={false}
                accessibilityLabel="Search runners"
              />
              {searching && <ActivityIndicator size="small" color={theme.brand} />}
            </View>

            {/* Search results */}
            {searchResults.length > 0 && (
              <View style={[styles.resultsBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                {searchResults.map((user) => (
                  <View key={user.id} style={[styles.resultRow, { borderBottomColor: theme.border }]}>
                    <View style={[styles.avatar, { backgroundColor: theme.brandLight }]}>
                      <Text style={[styles.avatarText, { color: theme.brand }]}>
                        {user.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.resultInfo}>
                      <Text style={[styles.resultName, { color: theme.text }]}>{user.name}</Text>
                      {user.location && (
                        <Text style={[styles.resultMeta, { color: theme.textSecondary }]}>{user.location}</Text>
                      )}
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        styles.addBtn,
                        { backgroundColor: theme.brand, opacity: pressed || addingId === user.id ? 0.75 : 1 },
                      ]}
                      onPress={() => handleAdd(user)}
                      disabled={addingId === user.id}
                      accessibilityLabel={`Add ${user.name}`}
                      accessibilityRole="button"
                    >
                      {addingId === user.id
                        ? <ActivityIndicator size="small" color="#fff" />
                        : <Text style={styles.addBtnText}>Add</Text>
                      }
                    </Pressable>
                  </View>
                ))}
              </View>
            )}

            {/* Section label */}
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {loading ? 'Loading...' : `${members.length} Member${members.length !== 1 ? 's' : ''}`}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.memberRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.avatar, { backgroundColor: theme.brandLight }]}>
              <Text style={[styles.avatarText, { color: theme.brand }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.memberInfo}>
              <Text style={[styles.memberName, { color: theme.text }]}>{item.name}</Text>
              {item.location && (
                <Text style={[styles.memberMeta, { color: theme.textSecondary }]}>{item.location}</Text>
              )}
            </View>
            <Pressable
              onPress={() => handleRemove(item)}
              disabled={removingId === item.id}
              accessibilityLabel={`Remove ${item.name}`}
              accessibilityRole="button"
            >
              {removingId === item.id
                ? <ActivityIndicator size="small" color={theme.placeholder} />
                : <Ionicons name="remove-circle-outline" size={22} color={theme.placeholder} />
              }
            </Pressable>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={theme.placeholder} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No members yet. Search for runners above to add them.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  listHeader: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    paddingVertical: spacing.xs,
  },
  resultsBox: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
  },
  resultInfo: { flex: 1, gap: 2 },
  resultName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  resultMeta: { fontSize: fontSize.sm },
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.md,
    minWidth: 52,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  memberInfo: { flex: 1, gap: 2 },
  memberName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  memberMeta: { fontSize: fontSize.sm },
  empty: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyText: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
})
