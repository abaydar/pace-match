import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../hooks/useTheme'
import { spacing, radius, fontSize, fontWeight } from '../theme'
import type { ClubRow } from '../../lib/database.types'

type Props = {
  club: ClubRow & { member_count?: number }
  onPress?: () => void
  joined?: boolean
  onJoin?: () => Promise<void>
  onLeave?: () => Promise<void>
}

export function ClubCard({ club, onPress, joined = false, onJoin, onLeave }: Props) {
  const theme = useTheme()
  const [loading, setLoading] = useState(false)

  async function handleJoinLeave() {
    setLoading(true)
    try {
      if (joined) {
        await onLeave?.()
      } else {
        await onJoin?.()
      }
    } catch (e: any) {
      Alert.alert('Error', e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: joined ? theme.brand : theme.border, opacity: pressed ? 0.9 : 1 },
        joined && { borderWidth: 1.5 },
      ]}
      onPress={onPress}
      accessibilityLabel={`${club.name} run club`}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={[styles.clubIcon, { backgroundColor: theme.brandLight }]}>
          <Ionicons name="people" size={20} color={theme.brand} />
        </View>
        <View style={styles.nameBlock}>
          <Text style={[styles.name, { color: theme.text }]}>{club.name}</Text>
          {club.location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={12} color={theme.textSecondary} />
              <Text style={[styles.location, { color: theme.textSecondary }]}>{club.location}</Text>
            </View>
          )}
        </View>
      </View>

      {club.description && (
        <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
          {club.description}
        </Text>
      )}

      <View style={styles.footer}>
        {club.member_count !== undefined && (
          <View style={styles.stat}>
            <Ionicons name="people-outline" size={13} color={theme.textSecondary} />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              {club.member_count} members
            </Text>
          </View>
        )}
        {(onJoin || onLeave) && (
          <Pressable
            style={({ pressed }) => [
              styles.joinBtn,
              {
                backgroundColor: joined ? theme.inputBackground : theme.brand,
                opacity: pressed || loading ? 0.75 : 1,
              },
            ]}
            onPress={handleJoinLeave}
            disabled={loading}
            accessibilityLabel={joined ? 'Leave club' : 'Join club'}
            accessibilityRole="button"
          >
            {loading
              ? <ActivityIndicator size="small" color={joined ? theme.textSecondary : '#fff'} />
              : <Text style={[styles.joinBtnText, { color: joined ? theme.textSecondary : '#fff' }]}>
                  {joined ? 'Leave' : 'Join'}
                </Text>
            }
          </Pressable>
        )}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg, padding: spacing.lg,
    borderWidth: 1, gap: spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  clubIcon: {
    width: 44, height: 44, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  nameBlock: { flex: 1, gap: 2 },
  name: { fontSize: fontSize.md, fontWeight: fontWeight.bold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  location: { fontSize: fontSize.xs },
  description: { fontSize: fontSize.sm, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statText: { fontSize: fontSize.sm },
  joinBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 7,
    borderRadius: radius.lg,
    minWidth: 64,
    alignItems: 'center',
  },
  joinBtnText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
})
