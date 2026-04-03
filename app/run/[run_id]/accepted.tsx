import React, { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList,
  Pressable, ActivityIndicator, TextInput, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router, useLocalSearchParams } from 'expo-router'
import { useApp } from '../../context/AppContext'
import { useAcceptedRunners } from '../../../lib/hooks/useRuns'
import { useTheme } from '../../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../../theme'
import type { AcceptedRunner } from '../../../lib/hooks/useRuns'

export default function AcceptedRunnersScreen() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const { run_id } = useLocalSearchParams<{ run_id: string }>()
  const { runners, loading, sendMessage } = useAcceptedRunners(run_id)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  async function handleMessageAll() {
    if (!message.trim() || !dbUser) return
    setSending(true)
    try {
      await sendMessage(dbUser.id, message.trim())
      setMessage('')
      Alert.alert('Sent!', 'Message delivered to all accepted runners.')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <Pressable
          onPress={() => router.replace('/(runner)/discover')}
          accessibilityLabel="Go home"
          accessibilityRole="button"
        >
          <Ionicons name="home-outline" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Run Accepted</Text>
          <View style={[styles.liveChip, { backgroundColor: theme.successLight }]}>
            <View style={[styles.liveDot, { backgroundColor: theme.success }]} />
            <Text style={[styles.liveText, { color: theme.success }]}>Live</Text>
          </View>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={runners}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            {loading
              ? 'Waiting for runners…'
              : `${runners.length} runner${runners.length !== 1 ? 's' : ''} accepted`}
          </Text>
        }
        renderItem={({ item }: { item: AcceptedRunner }) => (
          <View style={[styles.runnerRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.avatar, { backgroundColor: theme.successLight }]}>
              <Text style={[styles.avatarText, { color: theme.success }]}>
                {item.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </Text>
            </View>
            <View style={styles.runnerInfo}>
              <Text style={[styles.runnerName, { color: theme.text }]}>{item.name}</Text>
              {item.location && (
                <Text style={[styles.runnerMeta, { color: theme.textSecondary }]}>{item.location}</Text>
              )}
            </View>
            <View style={[styles.acceptedBadge, { backgroundColor: theme.successLight }]}>
              <Ionicons name="checkmark" size={13} color={theme.success} />
              <Text style={[styles.acceptedText, { color: theme.success }]}>Accepted</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="time-outline" size={48} color={theme.placeholder} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>Waiting for responses</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Runners will appear here as they accept.
              </Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <ActivityIndicator color={theme.brand} />
            </View>
          )
        }
      />

      {/* Message all */}
      <View style={[styles.footer, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <View style={[styles.inputRow, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Message all accepted runners…"
            placeholderTextColor={theme.placeholder}
            value={message}
            onChangeText={setMessage}
            accessibilityLabel="Message all runners"
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: message.trim() ? theme.brand : theme.inputBackground, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleMessageAll}
            disabled={!message.trim() || sending || runners.length === 0}
            accessibilityLabel="Send message to all"
            accessibilityRole="button"
          >
            {sending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={16} color={message.trim() ? '#fff' : theme.placeholder} />
            }
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 1,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headerTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  liveChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, gap: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 11, fontWeight: fontWeight.bold },
  list: { padding: spacing.lg, gap: spacing.sm, paddingBottom: 100 },
  subheading: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold, marginBottom: spacing.sm },
  runnerRow: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.md,
    borderRadius: radius.lg, borderWidth: 1, gap: spacing.md,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  runnerInfo: { flex: 1, gap: 2 },
  runnerName: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  runnerMeta: { fontSize: fontSize.sm },
  acceptedBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, gap: 3 },
  acceptedText: { fontSize: 11, fontWeight: fontWeight.semibold },
  empty: { alignItems: 'center', marginTop: 60, gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.semibold },
  emptySubtitle: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: spacing.lg, borderTopWidth: 1 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: radius.lg, paddingLeft: spacing.md, gap: spacing.sm, borderWidth: 1,
  },
  input: { flex: 1, fontSize: fontSize.md, paddingVertical: spacing.md },
  sendBtn: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', margin: 3 },
})
