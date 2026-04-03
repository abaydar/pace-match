import React, { useState } from 'react'
import {
  View, Text, StyleSheet, FlatList, Pressable,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from '../context/AppContext'
import { useLeaderClub } from '../../lib/hooks/useClub'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { AnnouncementRow } from '../../lib/database.types'

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function Announcements() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const { club, announcements, postAnnouncement, loading } = useLeaderClub(dbUser?.id)

  const [showCompose, setShowCompose] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [pinNew, setPinNew] = useState(false)
  const [posting, setPosting] = useState(false)

  async function handlePost() {
    if (!newTitle || !newBody || !club) {
      Alert.alert('Missing info', 'Please add a title and message.')
      return
    }
    setPosting(true)
    try {
      await postAnnouncement(club.id, newTitle, newBody, pinNew)
      setShowCompose(false)
      setNewTitle('')
      setNewBody('')
      setPinNew(false)
      Alert.alert('Posted!', 'Your announcement has been sent to all members.')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setPosting(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {announcements.length} Announcements
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.composeBtn,
            { backgroundColor: theme.brand, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => setShowCompose(true)}
          accessibilityLabel="Compose new announcement"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.composeBtnText}>Post</Text>
        </Pressable>
      </View>

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.brand} />
        </View>
      )}

      <FlatList
        data={announcements}
        keyExtractor={(item: AnnouncementRow) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
        renderItem={({ item }: { item: AnnouncementRow }) => (
          <View
            style={[
              styles.announcementCard,
              { backgroundColor: theme.surface, borderColor: item.pinned ? theme.brand : theme.border },
              item.pinned && styles.pinnedCard,
            ]}
          >
            {item.pinned && (
              <View style={styles.pinnedBanner}>
                <Ionicons name="pin" size={12} color={theme.brand} />
                <Text style={[styles.pinnedText, { color: theme.brand }]}>Pinned</Text>
              </View>
            )}
            <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
            <Text style={[styles.body, { color: theme.textSecondary }]}>{item.body}</Text>
            <View style={styles.footer}>
              <Text style={[styles.time, { color: theme.placeholder }]}>
                {formatRelative(item.created_at)}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="megaphone-outline" size={56} color={theme.placeholder} />
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No announcements yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Tap "Post" to send your first message to club members.
              </Text>
            </View>
          ) : null
        }
      />

      {/* Compose Modal */}
      <Modal visible={showCompose} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>New Announcement</Text>
            <Pressable onPress={() => setShowCompose(false)} accessibilityLabel="Close" accessibilityRole="button">
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <View style={styles.form}>
            <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Title</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Announcement title..."
              placeholderTextColor={theme.placeholder}
              value={newTitle}
              onChangeText={setNewTitle}
              accessibilityLabel="Announcement title"
            />

            <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Message</Text>
            <TextInput
              style={[styles.formInput, styles.bodyInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="Write your message to members..."
              placeholderTextColor={theme.placeholder}
              value={newBody}
              onChangeText={setNewBody}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              accessibilityLabel="Announcement message"
            />

            <Pressable
              style={[styles.pinToggle, { borderColor: theme.border }]}
              onPress={() => setPinNew((v) => !v)}
              accessibilityLabel={pinNew ? 'Unpin this announcement' : 'Pin this announcement'}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: pinNew }}
            >
              <Ionicons
                name={pinNew ? 'checkbox' : 'square-outline'}
                size={22}
                color={pinNew ? theme.brand : theme.textSecondary}
              />
              <Text style={[styles.pinToggleText, { color: theme.text }]}>Pin this announcement</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.postBtn,
                { backgroundColor: theme.brand, opacity: pressed || posting ? 0.85 : 1 },
              ]}
              onPress={handlePost}
              disabled={posting}
              accessibilityLabel="Post announcement"
              accessibilityRole="button"
            >
              {posting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.postBtnText}>Send to Members</Text>
                </>
              )}
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: spacing.lg, paddingBottom: spacing.md,
  },
  headerTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  composeBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.lg, gap: 5,
  },
  composeBtnText: { color: '#fff', fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  loadingRow: { alignItems: 'center', padding: spacing.md },
  list: { padding: spacing.lg, paddingTop: 0, paddingBottom: spacing.xxl },
  announcementCard: {
    borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg, gap: spacing.sm,
  },
  pinnedCard: { borderWidth: 1.5 },
  pinnedBanner: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pinnedText: { fontSize: fontSize.xs, fontWeight: fontWeight.bold },
  title: { fontSize: fontSize.md, fontWeight: fontWeight.bold, lineHeight: 22 },
  body: { fontSize: fontSize.md, lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xs },
  time: { fontSize: fontSize.xs },
  empty: { alignItems: 'center', marginTop: 80, gap: spacing.md, paddingHorizontal: spacing.xl },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  emptySubtitle: { fontSize: fontSize.md, textAlign: 'center', lineHeight: 22 },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: spacing.xl,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  form: { padding: spacing.xl, paddingTop: 0, gap: spacing.md },
  formLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.6 },
  formInput: { padding: spacing.md, borderRadius: radius.md, fontSize: fontSize.md },
  bodyInput: { minHeight: 140, textAlignVertical: 'top' },
  pinToggle: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, paddingVertical: spacing.sm,
    borderTopWidth: 1, borderBottomWidth: 1,
  },
  pinToggleText: { fontSize: fontSize.md },
  postBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: spacing.lg, borderRadius: radius.lg,
    gap: spacing.sm, marginTop: spacing.md,
  },
  postBtnText: { color: '#fff', fontSize: fontSize.lg, fontWeight: fontWeight.bold },
})
