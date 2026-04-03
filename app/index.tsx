import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { useAuth } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'
import { useApp } from './context/AppContext'
import { useTheme } from './hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from './theme'

const FEATURES = [
  { icon: 'search-outline' as const, text: 'Discover runners with your pace & goals' },
  { icon: 'flash-outline' as const, text: 'Set "Ready to Run" status to meet up fast' },
  { icon: 'people-outline' as const, text: 'Join run clubs and build your community' },
  { icon: 'shield-checkmark-outline' as const, text: 'Club leaders manage schedules & safety' },
]

export default function Index() {
  const theme = useTheme()
  const { isSignedIn } = useAuth()
  const { dbUser, userLoading } = useApp()

  useEffect(() => {
    if (!isSignedIn || userLoading) return
    if (dbUser?.role === 'runner') {
      router.replace('/(runner)/discover')
    } else if (dbUser?.role === 'leader') {
      router.replace('/(leader)/dashboard')
    } else if (isSignedIn) {
      // Signed in but no DB user yet — send to role select
      router.replace('/role-select')
    }
  }, [isSignedIn, userLoading, dbUser?.role])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Logo / hero */}
        <View style={styles.hero}>
          <View style={[styles.logoMark, { backgroundColor: theme.brand }]}>
            <Ionicons name="footsteps" size={40} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>PaceMatch</Text>
          <Text style={[styles.tagline, { color: theme.textSecondary }]}>
            Find your running community
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: theme.brandLight }]}>
                <Ionicons name={f.icon} size={18} color={theme.brand} />
              </View>
              <Text style={[styles.featureText, { color: theme.text }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Auth CTAs */}
        <View style={styles.ctaGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: theme.brand, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={() => router.push('/signup')}
            accessibilityLabel="Get started"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: theme.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => router.push('/login')}
            accessibilityLabel="Sign in"
            accessibilityRole="button"
          >
            <Text style={[styles.secondaryBtnText, { color: theme.text }]}>I already have an account</Text>
          </Pressable>
        </View>

        <Text style={[styles.footer, { color: theme.placeholder }]}>
          Free to join · NYC & beyond
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: 'center',
    gap: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoMark: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  appName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.bold,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  features: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: fontSize.md,
    flex: 1,
    lineHeight: 22,
  },
  ctaGroup: {
    gap: spacing.md,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  secondaryBtn: {
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.medium,
  },
  footer: {
    textAlign: 'center',
    fontSize: fontSize.sm,
  },
})
