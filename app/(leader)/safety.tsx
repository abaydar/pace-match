import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Modal,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'

const WEATHER_TEMPLATES = [
  {
    id: 'rain',
    icon: 'rainy-outline' as const,
    label: 'Rain Advisory',
    message: 'Due to expected rain, today\'s run is still ON. Dress in moisture-wicking layers. The route may be slippery — slow down on turns. Stay visible with bright colors!',
  },
  {
    id: 'heat',
    icon: 'sunny-outline' as const,
    label: 'Heat Warning',
    message: 'High heat advisory in effect. We\'re adjusting today\'s run to 6 AM (earlier start). Bring extra water. Route shortened to 5 miles. Know the signs of heat exhaustion.',
  },
  {
    id: 'cold',
    icon: 'snow-outline' as const,
    label: 'Cold Weather',
    message: 'Cold temps expected. Layer up: base layer + insulating mid layer + wind-resistant shell. Cover extremities. We\'ll run at a slightly easier effort to account for icy paths.',
  },
  {
    id: 'cancel',
    icon: 'close-circle-outline' as const,
    label: 'Run Cancelled',
    message: '⚠️ Today\'s run is CANCELLED due to severe weather / unsafe conditions. Stay safe at home. Next run is [date]. Follow our page for updates.',
  },
]

type Contact = {
  id: string
  name: string
  role: string
  phone: string
}

const DEFAULT_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Sam Torres', role: 'Club Leader', phone: '(212) 555-0101' },
  { id: 'c2', name: 'Jordan Kim', role: 'Co-Leader', phone: '(917) 555-0198' },
  { id: 'c3', name: 'NYC Emergency Services', role: 'Emergency', phone: '911' },
  { id: 'c4', name: 'NYC Parks Dept.', role: 'Park Issues', phone: '311' },
]

export default function Safety() {
  const theme = useTheme()
  const [contacts, setContacts] = useState<Contact[]>(DEFAULT_CONTACTS)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [showContactModal, setShowContactModal] = useState(false)
  const [editName, setEditName] = useState('')
  const [editRole, setEditRole] = useState('')
  const [editPhone, setEditPhone] = useState('')

  function sendTemplate(template: typeof WEATHER_TEMPLATES[0]) {
    Alert.alert(
      `Send ${template.label}`,
      `This will send the following alert to all 210 club members:\n\n"${template.message.slice(0, 100)}..."`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Now',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              '✅ Alert Sent',
              `"${template.label}" sent to 210 members.`
            ),
        },
      ]
    )
  }

  function handleSaveContact() {
    if (!editName || !editPhone) return
    if (editingContact) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === editingContact.id
            ? { ...c, name: editName, role: editRole, phone: editPhone }
            : c
        )
      )
    } else {
      setContacts((prev) => [
        ...prev,
        { id: `c${Date.now()}`, name: editName, role: editRole, phone: editPhone },
      ])
    }
    setShowContactModal(false)
    setEditingContact(null)
    setEditName('')
    setEditRole('')
    setEditPhone('')
  }

  function openEditContact(contact?: Contact) {
    if (contact) {
      setEditingContact(contact)
      setEditName(contact.name)
      setEditRole(contact.role)
      setEditPhone(contact.phone)
    } else {
      setEditingContact(null)
      setEditName('')
      setEditRole('')
      setEditPhone('')
    }
    setShowContactModal(true)
  }

  function handleEmergencyUpdate() {
    Alert.alert(
      '🚨 Emergency Update',
      'This will send an urgent safety alert to ALL club members immediately. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Emergency Alert',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              '🚨 Emergency Alert Sent',
              'All 210 members have been notified.'
            ),
        },
      ]
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Emergency alert button */}
        <Pressable
          style={({ pressed }) => [
            styles.emergencyBtn,
            { opacity: pressed ? 0.9 : 1 },
          ]}
          onPress={handleEmergencyUpdate}
          accessibilityLabel="Send emergency update to all members"
          accessibilityRole="button"
        >
          <Ionicons name="warning" size={24} color="#fff" />
          <View>
            <Text style={styles.emergencyBtnTitle}>Send Emergency Update</Text>
            <Text style={styles.emergencyBtnSub}>Immediately notify all 210 members</Text>
          </View>
        </Pressable>

        {/* Weather templates */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Weather Plan Templates</Text>
        <View style={styles.templatesGrid}>
          {WEATHER_TEMPLATES.map((t) => (
            <Pressable
              key={t.id}
              style={({ pressed }) => [
                styles.templateCard,
                { backgroundColor: theme.surface, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={() => sendTemplate(t)}
              accessibilityLabel={`Send ${t.label} alert`}
              accessibilityRole="button"
            >
              <View style={[styles.templateIcon, { backgroundColor: theme.warningLight }]}>
                <Ionicons name={t.icon} size={22} color={theme.warning} />
              </View>
              <Text style={[styles.templateLabel, { color: theme.text }]}>{t.label}</Text>
              <Text style={[styles.templatePreview, { color: theme.textSecondary }]} numberOfLines={2}>
                {t.message}
              </Text>
              <View style={[styles.sendChip, { backgroundColor: theme.dangerLight }]}>
                <Ionicons name="send-outline" size={12} color={theme.danger} />
                <Text style={[styles.sendChipText, { color: theme.danger }]}>Tap to send</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Emergency contacts */}
        <View style={styles.contactsHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Emergency Contacts</Text>
          <Pressable
            style={({ pressed }) => [
              styles.addContactBtn,
              { borderColor: theme.brand, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => openEditContact()}
            accessibilityLabel="Add emergency contact"
            accessibilityRole="button"
          >
            <Ionicons name="add" size={16} color={theme.brand} />
            <Text style={[styles.addContactText, { color: theme.brand }]}>Add</Text>
          </Pressable>
        </View>

        <View style={[styles.contactsCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {contacts.map((contact, i) => (
            <View
              key={contact.id}
              style={[
                styles.contactRow,
                i < contacts.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <View style={[styles.contactIcon, { backgroundColor: contact.id === 'c3' ? theme.dangerLight : theme.inputBackground }]}>
                <Ionicons
                  name={contact.id === 'c3' ? 'medkit-outline' : 'person-outline'}
                  size={16}
                  color={contact.id === 'c3' ? theme.danger : theme.textSecondary}
                />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: theme.text }]}>{contact.name}</Text>
                <Text style={[styles.contactMeta, { color: theme.textSecondary }]}>
                  {contact.role} · {contact.phone}
                </Text>
              </View>
              <Pressable
                onPress={() => openEditContact(contact)}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                accessibilityLabel={`Edit ${contact.name}`}
                accessibilityRole="button"
              >
                <Ionicons name="create-outline" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          ))}
        </View>

        {/* Safety guidelines */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Safety Guidelines</Text>
        <View style={[styles.guidelinesCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {[
            { icon: 'phone-portrait-outline' as const, text: 'Always carry your phone on runs' },
            { icon: 'location-outline' as const, text: 'Share your route with someone before solo runs' },
            { icon: 'people-outline' as const, text: 'Buddy system on early morning or evening runs' },
            { icon: 'car-outline' as const, text: 'Run against traffic, stay visible at intersections' },
            { icon: 'water-outline' as const, text: 'Hydrate before, during, and after runs' },
            { icon: 'heart-outline' as const, text: 'Know the signs of heat stroke and hypothermia' },
          ].map((item, i, arr) => (
            <View
              key={i}
              style={[
                styles.guidelineRow,
                i < arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
              ]}
            >
              <Ionicons name={item.icon} size={16} color={theme.brand} />
              <Text style={[styles.guidelineText, { color: theme.text }]}>{item.text}</Text>
            </View>
          ))}
        </View>

      </ScrollView>

      {/* Contact edit modal */}
      <Modal visible={showContactModal} animationType="slide" presentationStyle="formSheet">
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: theme.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {editingContact ? 'Edit Contact' : 'Add Contact'}
            </Text>
            <Pressable
              onPress={() => setShowContactModal(false)}
              accessibilityLabel="Close"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          </View>
          <View style={styles.contactForm}>
            {([
              { label: 'Name', value: editName, setter: setEditName, placeholder: 'Full name' },
              { label: 'Role', value: editRole, setter: setEditRole, placeholder: 'e.g. Co-Leader, Medical' },
              { label: 'Phone', value: editPhone, setter: setEditPhone, placeholder: '(212) 555-0000' },
            ] as const).map(({ label, value, setter, placeholder }) => (
              <View key={label} style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: theme.textSecondary }]}>{label}</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.inputBackground, color: theme.text }]}
                  value={value}
                  onChangeText={setter as (t: string) => void}
                  placeholder={placeholder}
                  placeholderTextColor={theme.placeholder}
                  accessibilityLabel={label}
                />
              </View>
            ))}
            <Pressable
              style={({ pressed }) => [
                styles.saveBtn,
                { backgroundColor: theme.brand, opacity: pressed ? 0.85 : 1 },
              ]}
              onPress={handleSaveContact}
              accessibilityLabel="Save contact"
              accessibilityRole="button"
            >
              <Text style={styles.saveBtnText}>Save Contact</Text>
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
  emergencyBtn: {
    backgroundColor: '#DC2626',
    borderRadius: radius.lg,
    padding: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emergencyBtnTitle: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  emergencyBtnSub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  templateCard: {
    width: '47%',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
  },
  templatePreview: {
    fontSize: fontSize.xs,
    lineHeight: 16,
  },
  sendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  sendChipText: {
    fontSize: 10,
    fontWeight: fontWeight.semibold,
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addContactBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1,
    gap: 4,
  },
  addContactText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  contactsCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
  },
  contactMeta: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
  guidelinesCard: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  guidelineText: {
    fontSize: fontSize.sm,
    flex: 1,
    lineHeight: 20,
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
  contactForm: {
    padding: spacing.xl,
    paddingTop: 0,
    gap: spacing.lg,
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
  saveBtn: {
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
})
