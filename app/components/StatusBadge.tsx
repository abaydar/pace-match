import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { ReadyStatus, readyStatusLabel } from '../data/mockData'
import { radius, fontSize } from '../theme'

type Props = {
  status: ReadyStatus
  small?: boolean
}

export function StatusBadge({ status, small = false }: Props) {
  const isNow = status.timeWindow === 'now'
  const label = readyStatusLabel(status)

  return (
    <View style={[styles.badge, isNow ? styles.badgeNow : styles.badgeSoon, small && styles.small]}>
      <View style={[styles.dot, isNow ? styles.dotNow : styles.dotSoon]} />
      <Text style={[styles.text, isNow ? styles.textNow : styles.textSoon, small && styles.textSmall]}>
        {label}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 5,
    alignSelf: 'flex-start',
  },
  badgeNow: {
    backgroundColor: '#D1FAE5',
  },
  badgeSoon: {
    backgroundColor: '#DBEAFE',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotNow: {
    backgroundColor: '#059669',
  },
  dotSoon: {
    backgroundColor: '#2563EB',
  },
  text: {
    fontWeight: '600',
    fontSize: fontSize.xs,
  },
  textSmall: {
    fontSize: 10,
  },
  textNow: {
    color: '#065F46',
  },
  textSoon: {
    color: '#1E40AF',
  },
})
