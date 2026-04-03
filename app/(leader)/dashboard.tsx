import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Modal, TextInput, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { useApp } from '../context/AppContext'
import { useLeaderClub } from '../../lib/hooks/useClub'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

export default function Dashboard() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const { club, events, announcements, memberCount, loading, createClub, sendEmergencyAlert } = useLeaderClub(dbUser?.id)

  const [showCreateClub, setShowCreateClub] = useState(false)
  const [clubName, setClubName] = useState('')
  const [clubDesc, setClubDesc] = useState('')
  const [clubLocation, setClubLocation] = useState('')
  const [creatingClub, setCreatingClub] = useState(false)

  const nextEvent = events[0] ?? null
  const recentAnnouncement = announcements[0] ?? null

  async function handleCreateClub() {
    if (!clubName.trim() || !dbUser) return
    setCreatingClub(true)
    try {
      await createClub(clubName.trim(), clubDesc.trim(), clubLocation.trim())
      setShowCreateClub(false)
      setClubName('')
      setClubDesc('')
      setClubLocation('')
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setCreatingClub(false)
    }
  }

  function handleWeatherAlert() {
    if (!club) return
    Alert.alert(
      'Weather Alert',
      'Send a weather update to all club members?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Alert',
          style: 'destructive',
          onPress: async () => {
            await sendEmergencyAlert(club.id, 'Weather Alert', 'Please check conditions before heading out.')
            Alert.alert('Alert Sent', `Weather alert sent to ${memberCount} members.`)
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcomeRow}>
          <View>
            <Text style={[styles.welcomeLabel, { color: theme.textSecondary }]}>Welcome back,</Text>
            <Text style={[styles.welcomeName, { color: theme.text }]}>{dbUser?.name}</Text>
          </View>
          <View style={[styles.clubBadge, { backgroundColor: theme.brandLight }]}>
            <Ionicons name="people" size={14} color={theme.brand} />
            <Text style={[styles.clubBadgeText, { color: theme.brand }]}>
              {memberCount} members
            </Text>
          </View>
        </View>

        {/* Create club prompt */}
        {!loading && !club && (
          <Pressable
            style={({ pressed }) => [
              styles.createClubCard,
              { backgroundColor: theme.brand, opacity: pressed ? 0.9 : 1 },
            ]}
            onPress={() => setShowCreateClub(true)}
            accessibilityLabel="Set up your club"
            accessibilityRole="button"
          >
            <Ionicons name="add-circle-outline" size={28} color="#fff" />
            <View style={{ flex: 1 }}>
              <Text style={styles.createClubTitle}>Set Up Your Club</Text>
              <Text style={styles.createClubSub}>Tap to create your run club and get started.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
          </Pressable>
        )}

        {/* Next run card */}
        {nextEvent ? (
          <View style={[styles.nextRunCard, { backgroundColor: theme.brand }]}>
            <Text style={styles.nextRunLabel}>Next Scheduled Run</Text>
            <Text style={styles.nextRunTitle}>{nextEvent.title}</Text>
            <View style={styles.nextRunMeta}>
              <Ionicons name="calendar-outline" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.nextRunMetaText}>{formatDateTime(nextEvent.datetime)}</Text>
            </View>
            {nextEvent.location && (
              <View style={styles.nextRunMeta}>
                <Ionicons name="location-outline" size={14} color="rgba(255,255,255,0.8)" />
                <Text style={styles.nextRunMetaText}>{nextEvent.location}</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.nextRunCard, { backgroundColor: theme.brand }]}>
            <Text style={styles.nextRunLabel}>Next Scheduled Run</Text>
            <Text style={styles.nextRunTitle}>No upcoming runs</Text>
            <Text style={styles.nextRunMetaText}>Create your first run event below</Text>
          </View>
        )}

        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push('/(leader)/events')}
            accessibilityLabel="Create a run event"
            accessibilityRole="button"
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.brandLight }]}>
              <Ionicons name="add-circle-outline" size={22} color={theme.brand} />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Create Run</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push('/(leader)/announcements')}
            accessibilityLabel="Post an announcement"
            accessibilityRole="button"
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EDE9FE' }]}>
              <Ionicons name="megaphone-outline" size={22} color="#7C3AED" />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Announce</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleWeatherAlert}
            accessibilityLabel="Send weather alert"
            accessibilityRole="button"
          >
            <View style={[styles.quickActionIcon, { backgroundColor: theme.warningLight }]}>
              <Ionicons name="cloud-outline" size={22} color={theme.warning} />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Weather Alert</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.quickAction,
              { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={() => router.push('/(leader)/members')}
            accessibilityLabel="Manage club members"
            accessibilityRole="button"
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Ionicons name="people-outline" size={22} color="#16A34A" />
            </View>
            <Text style={[styles.quickActionLabel, { color: theme.text }]}>Members</Text>
          </Pressable>
        </View>

        {/* Recent announcement */}
        {recentAnnouncement && (
          <>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Latest Announcement</Text>
            <View style={[styles.announcementCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              {recentAnnouncement.pinned && (
                <View style={styles.pinnedRow}>
                  <Ionicons name="pin" size={13} color={theme.brand} />
                  <Text style={[styles.pinnedText, { color: theme.brand }]}>Pinned</Text>
                </View>
              )}
              <Text style={[styles.announcementTitle, { color: theme.text }]}>
                {recentAnnouncement.title}
              </Text>
              <Text style={[styles.announcementBody, { color: theme.textSecondary }]} numberOfLines={3}>
                {recentAnnouncement.body}
              </Text>
              <Pressable
                onPress={() => router.push('/(leader)/announcements')}
                accessibilityLabel="View all announcements"
                accessibilityRole="link"
              >
                <Text style={[styles.viewAll, { color: theme.brand }]}>View all announcements →</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* Create Club Modal */}
      <Modal visible={showCreateClub} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create Your Club</Text>
            <Pressable onPress={() => setShowCreateClub(false)} accessibilityLabel="Close" accessibilityRole="button">
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.form}>
            <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Club Name *</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="e.g. Brooklyn Distance Runners"
              placeholderTextColor={theme.placeholder}
              value={clubName}
              onChangeText={setClubName}
              accessibilityLabel="Club name"
            />
            <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Description</Text>
            <TextInput
              style={[styles.formInput, styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="What's your club about?"
              placeholderTextColor={theme.placeholder}
              value={clubDesc}
              onChangeText={setClubDesc}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              accessibilityLabel="Club description"
            />
            <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Location</Text>
            <TextInput
              style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
              placeholder="e.g. Brooklyn, NY"
              placeholderTextColor={theme.placeholder}
              value={clubLocation}
              onChangeText={setClubLocation}
              accessibilityLabel="Club location"
            />
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: theme.brand, opacity: pressed || creatingClub ? 0.85 : 1 },
              ]}
              onPress={handleCreateClub}
              disabled={creatingClub || !clubName.trim()}
              accessibilityLabel="Create club"
              accessibilityRole="button"
            >
              {creatingClub
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitBtnText}>Create Club</Text>
              }
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeLabel: {
    fontSize: fontSize.sm,
  },
  welcomeName: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  clubBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    gap: 5,
  },
  clubBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  nextRunCard: {
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  nextRunLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  nextRunTitle: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  nextRunMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextRunMetaText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: fontSize.sm,
  },
  rsvpSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    marginTop: spacing.md,
  },
  rsvpItem: {
    flex: 1,
    alignItems: 'center',
  },
  rsvpDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  rsvpCount: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  rsvpLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textAlign: 'center',
  },
  announcementCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pinnedText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
  },
  announcementTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  announcementBody: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  viewAll: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    marginTop: spacing.xs,
  },
  scheduleCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  scheduleText: {
    fontSize: fontSize.md,
  },
  createClubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  createClubTitle: {
    color: '#fff',
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  createClubSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  form: {
    padding: spacing.xl,
    paddingTop: 0,
    gap: spacing.md,
  },
  formLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  formInput: {
    padding: spacing.md,
    borderRadius: radius.md,
    fontSize: fontSize.md,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
})
