import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import { router } from 'expo-router'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) return null

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    })
  }

  const token = await Notifications.getExpoPushTokenAsync()
  return token.data
}

export async function sendRunInviteNotification(
  pushToken: string,
  payload: { runId: string; hostName: string; time: string; locationLabel: string }
) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: pushToken,
      title: `${payload.hostName} wants to run with you`,
      body: `${payload.time} · ${payload.locationLabel}`,
      data: { screen: 'RunInvite', runId: payload.runId },
    }),
  })
}

export function setupNotificationListener() {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data as { runId?: string }
    if (data?.runId) {
      router.push(`/invite/${data.runId}`)
    }
  })
  return () => sub.remove()
}
