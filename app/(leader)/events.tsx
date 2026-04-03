import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { RunEventCard } from '../components/RunEventCard'
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

export default function Events() {
  const theme = useTheme()
  const { dbUser } = useApp()
  const { club, events, createEvent, rsvp } = useLeaderClub(dbUser?.id)
  const [showCreate, setShowCreate] = useState(false)

  // Form state
  const [title, setTitle] = useState('')
  const [dateStr, setDateStr] = useState('Saturday, Mar 28 · 8:00 AM')
  const [location, setLocation] = useState('')
  const [routeNotes, setRouteNotes] = useState('')
  const [paceGroupsText, setPaceGroupsText] = useState('')
  const [distancesText, setDistancesText] = useState('')

  async function handleCreate() {
    if (!title || !location || !club) {
      Alert.alert('Missing fields', 'Please fill in the title and location.')
      return
    }
    await createEvent({
      club_id: club.id,
      title,
      datetime: new Date().toISOString(),
      location,
      route_notes: routeNotes || null,
      pace_groups: paceGroupsText
        ? paceGroupsText.split(',').map((s) => ({ label: s.trim(), pace: s.trim() }))
        : [],
      distance_options: distancesText
        ? distancesText.split(',').map((s) => parseFloat(s.trim())).filter(Boolean)
        : [],
    })
    setShowCreate(false)
    setTitle('')
    setLocation('')
    setRouteNotes('')
    setPaceGroupsText('')
    setDistancesText('')
    Alert.alert('Run Created!', `"${title}" has been added to the schedule.`)
  }

  async function handleRSVP(eventId: string, status: 'going' | 'maybe') {
    if (!dbUser) return
    await rsvp(eventId, dbUser.id, status)
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      {/* Create button */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{events.length} Run Events</Text>
        <Pressable
          style={({ pressed }) => [
            styles.createBtn,
            { backgroundColor: theme.brand, opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={() => setShowCreate(true)}
          accessibilityLabel="Create a new run event"
          accessibilityRole="button"
        >
          <Ionicons name="add" size={18} color="#fff" />
          <Text style={styles.createBtnText}>Create Run</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {events.map((event) => (
          <RunEventCard
            key={event.id}
            event={event}
            currentUserId={dbUser?.id}
            onRSVP={(status) => handleRSVP(event.id, status)}
          />
        ))}
      </ScrollView>

      {/* Create Run Modal */}
      <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>Create Run Event</Text>
            <Pressable
              onPress={() => setShowCreate(false)}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Run Title *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="e.g. Saturday Long Run – Central Park"
                placeholderTextColor={theme.placeholder}
                value={title}
                onChangeText={setTitle}
                accessibilityLabel="Run title"
              />
            </View>

            {/* Date */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Date & Time</Text>
              <View style={[styles.formInput, styles.dateField, { backgroundColor: theme.inputBackground }]}>
                <Ionicons name="calendar-outline" size={16} color={theme.placeholder} />
                <TextInput
                  style={[styles.dateInput, { color: theme.text }]}
                  value={dateStr}
                  onChangeText={setDateStr}
                  accessibilityLabel="Date and time"
                />
              </View>
              <Text style={[styles.formHint, { color: theme.placeholder }]}>
                Date picker integration available via @react-native-community/datetimepicker
              </Text>
            </View>

            {/* Location */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Location *</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Meeting point address or landmark"
                placeholderTextColor={theme.placeholder}
                value={location}
                onChangeText={setLocation}
                accessibilityLabel="Location"
              />
            </View>

            {/* Map placeholder */}
            <View style={[styles.mapPlaceholder, { backgroundColor: theme.inputBackground, borderColor: theme.border }]}>
              <Ionicons name="map-outline" size={36} color={theme.placeholder} />
              <Text style={[styles.mapPlaceholderText, { color: theme.placeholder }]}>
                Map view (react-native-maps)
              </Text>
            </View>

            {/* Route notes */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Route Notes</Text>
              <TextInput
                style={[styles.formInput, styles.textArea, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="Describe the route, turns, landmarks..."
                placeholderTextColor={theme.placeholder}
                value={routeNotes}
                onChangeText={setRouteNotes}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                accessibilityLabel="Route notes"
              />
            </View>

            {/* Pace groups */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Pace Groups (comma-separated)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="8:00–8:30, 8:30–9:00, 9:00–10:00"
                placeholderTextColor={theme.placeholder}
                value={paceGroupsText}
                onChangeText={setPaceGroupsText}
                accessibilityLabel="Pace groups"
              />
            </View>

            {/* Distance options */}
            <View style={styles.formGroup}>
              <Text style={[styles.formLabel, { color: theme.textSecondary }]}>Distance Options (comma-separated)</Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                placeholder="5 mi, 8 mi, 10 mi"
                placeholderTextColor={theme.placeholder}
                value={distancesText}
                onChangeText={setDistancesText}
                accessibilityLabel="Distance options"
              />
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: theme.brand, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleCreate}
              accessibilityLabel="Create run event"
              accessibilityRole="button"
            >
              <Text style={styles.submitBtnText}>Create Run Event</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.lg,
    gap: 5,
  },
  createBtnText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
  },
  list: {
    padding: spacing.lg,
    paddingTop: 0,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  modalSafe: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  formContent: {
    padding: spacing.xl,
    gap: spacing.lg,
    paddingTop: 0,
  },
  formGroup: {
    gap: spacing.sm,
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
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateInput: {
    flex: 1,
    fontSize: fontSize.md,
  },
  formHint: {
    fontSize: fontSize.xs,
    fontStyle: 'italic',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  mapPlaceholder: {
    height: 140,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mapPlaceholderText: {
    fontSize: fontSize.sm,
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
