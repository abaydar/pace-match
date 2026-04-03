import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { ConnectionRow } from '../../lib/database.types'

type Filter = 'all' | 'pending' | 'accepted'

export default function Messages() {
  const theme = useTheme()
  const { connections, acceptConnectionRequest, declineConnectionRequest, dbUser } = useApp()
  const [filter, setFilter] = useState<Filter>('all')

  // Only show requests sent TO me (inbound)
  const inbound = connections.filter((r: ConnectionRow) => r.to_user_id === dbUser?.id)

  const filtered = inbound.filter((r: ConnectionRow) => {
    if (filter === 'pending') return r.status === 'pending'
    if (filter === 'accepted') return r.status === 'accepted'
    return r.status !== 'declined'
  })

  const pendingCount = inbound.filter((r: ConnectionRow) => r.status === 'pending').length

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['all', 'pending', 'accepted'] as Filter[]).map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterTab,
              filter === f && { borderBottomColor: theme.brand, borderBottomWidth: 2 },
            ]}
            onPress={() => setFilter(f)}
            accessibilityRole="tab"
            accessibilityState={{ selected: filter === f }}
          >
            <Text
              style={[
                styles.filterText,
                { color: filter === f ? theme.brand : theme.textSecondary },
              ]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
            {f === 'pending' && pendingCount > 0 && (
              <View style={[styles.countBadge, { backgroundColor: theme.brand }]}>
                <Text style={styles.countBadgeText}>{pendingCount}</Text>
              </View>
            )}
          </Pressable>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }: { item: ConnectionRow }) => {
          const isPending = item.status === 'pending'
          // Sender ID shown until a user-cache hook is added
          const senderInitials = item.from_user_id.slice(0, 2).toUpperCase()
          return (
            <View
              style={[
                styles.requestCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {/* Header */}
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: theme.brandLight }]}>
                  <Text style={[styles.avatarText, { color: theme.brand }]}>
                    {senderInitials}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={[styles.name, { color: theme.text }]}>Runner {item.from_user_id.slice(0, 6)}</Text>
                  <Text style={[styles.meta, { color: theme.textSecondary }]}>
                    Requested {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor:
                        isPending ? theme.warningLight : theme.successLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: isPending ? theme.warning : theme.success },
                    ]}
                  >
                    {isPending ? 'Pending' : 'Running partner'}
                  </Text>
                </View>
              </View>

              {/* Status pill area — goals will be shown once user profile fetching is added */}

              {/* Actions */}
              {isPending && (
                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      { backgroundColor: theme.brand, opacity: pressed ? 0.8 : 1 },
                    ]}
                    onPress={() => acceptConnectionRequest(item.id)}
                    accessibilityLabel="Accept request"
                    accessibilityRole="button"
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.actionBtnText}>Accept</Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionBtn,
                      styles.declineBtn,
                      { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                    ]}
                    onPress={() => declineConnectionRequest(item.id)}
                    accessibilityLabel="Decline request"
                    accessibilityRole="button"
                  >
                    <Ionicons name="close" size={16} color={theme.textSecondary} />
                    <Text style={[styles.actionBtnText, { color: theme.textSecondary }]}>
                      Decline
                    </Text>
                  </Pressable>
                </View>
              )}

              {!isPending && (
                <Pressable
                  style={({ pressed }) => [
                    styles.messageBtn,
                    { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
                  ]}
                  accessibilityLabel="Send message"
                  accessibilityRole="button"
                >
                  <Ionicons name="chatbubble-outline" size={16} color={theme.brand} />
                  <Text style={[styles.messageBtnText, { color: theme.brand }]}>
                    Send Message
                  </Text>
                </Pressable>
              )}
            </View>
          )
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="chatbubbles-outline" size={56} color={theme.placeholder} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No requests yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
              Discover runners and request a run to get started!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  countBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: fontWeight.bold,
  },
  list: {
    padding: spacing.lg,
  },
  requestCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  meta: {
    fontSize: fontSize.xs,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: fontWeight.semibold,
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
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radius.md,
    gap: 5,
  },
  declineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: 5,
    marginTop: spacing.xs,
  },
  messageBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  empty: {
    alignItems: 'center',
    marginTop: 80,
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  emptySubtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
})
