import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../hooks/useTheme'

export default function RunnerLayout() {
  const theme = useTheme()

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.brand,
        tabBarInactiveTintColor: theme.placeholder,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.tabBarBorder,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="filter"
        options={{
          title: 'Find Run',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flag-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ready"
        options={{
          title: 'Ready',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flash-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubbles-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="runners" options={{ href: null, title: 'Available Runners' }} />
      <Tabs.Screen name="start-run" options={{ href: null, title: 'Start a Run' }} />
    </Tabs>
  )
}
