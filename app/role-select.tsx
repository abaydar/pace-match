import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, SafeAreaView, ActivityIndicator, Alert } from 'react-native'
import { router } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useUser } from '@clerk/clerk-expo'
import { useApp } from './context/AppContext'
import { useTheme } from './hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from './theme'

type Role = 'runner' | 'leader'

const ROLES: { id: Role; icon: keyof typeof Ionicons.glyphMap; title: string; description: string }[] = [
  {
    id: 'runner',
    icon: 'person-outline',
    title: "I'm a Runner",
    description: 'Find running partners, join clubs, and set your ready-to-run status to connect with others nearby.',
  },
  {
    id: 'leader',
    icon: 'people-outline',
    title: "I'm a Run Club Leader",
    description: 'Manage your club, schedule runs, post announcements, and keep members informed.',
  },
]

export default function RoleSelect() {
  const theme = useTheme()
  const { createUser, dbUser } = useApp()
  const { user: clerkUser } = useUser()
  const [selected, setSelected] = useState<Role | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleContinue() {
    if (!selected || !clerkUser) return
    setSaving(true)
    try {
      // If user row doesn't exist yet (first sign-up), create it
      if (!dbUser) {
        const name = clerkUser.fullName ?? clerkUser.emailAddresses[0]?.emailAddress ?? 'Runner'
        await createUser(name, selected)
      }
      if (selected === 'runner') {
        router.replace('/(runner)/discover')
      } else {
        router.replace('/(leader)/dashboard')
      }
    } catch (e: any) {
      console.error(e)
      Alert.alert('Error', e?.message ?? String(e))
    } finally {
      setSaving(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.logoMark, { backgroundColor: theme.brand }]}>
            <Ionicons name="footsteps" size={28} color="#fff" />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>How will you use PaceMatch?</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Choose your primary role — you can always switch later.
          </Text>
        </View>

        {/* Role options */}
        <View style={styles.options}>
          {ROLES.map((role) => {
            const isSelected = selected === role.id
            return (
              <Pressable
                key={role.id}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: isSelected ? theme.brand : theme.border,
                    borderWidth: isSelected ? 2 : 1,
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
                onPress={() => setSelected(role.id)}
                accessibilityLabel={role.title}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={[styles.iconBox, { backgroundColor: isSelected ? theme.brand : theme.brandLight }]}>
                  <Ionicons name={role.icon} size={28} color={isSelected ? '#fff' : theme.brand} />
                </View>
                <View style={styles.optionText}>
                  <Text style={[styles.optionTitle, { color: theme.text }]}>{role.title}</Text>
                  <Text style={[styles.optionDesc, { color: theme.textSecondary }]}>
                    {role.description}
                  </Text>
                </View>
                {isSelected && (
                  <Ionicons name="checkmark-circle" size={24} color={theme.brand} />
                )}
              </Pressable>
            )
          })}
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.continueBtn,
            {
              backgroundColor: selected ? theme.brand : theme.inputBackground,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={handleContinue}
          disabled={!selected}
          accessibilityLabel="Continue"
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={[styles.continueBtnText, { color: selected ? '#fff' : theme.placeholder }]}>
                Continue
              </Text>
              <Ionicons
                name="arrow-forward"
                size={18}
                color={selected ? '#fff' : theme.placeholder}
              />
            </>
          )}
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoMark: {
    width: 64,
    height: 64,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  options: {
    gap: spacing.md,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  optionDesc: {
    fontSize: fontSize.sm,
    lineHeight: 18,
  },
  continueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  continueBtnText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
})
