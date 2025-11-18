import { Tabs } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerBackground: () => (
          <LinearGradient
            colors={["#4f46e5", "#a855f7"]}
            style={{ flex: 1 }}
          />
        ),
        headerTitleStyle: { color: 'white', fontWeight: '800' },
        tabBarActiveTintColor: '#3b34ff',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home' }}
      />
      <Tabs.Screen
        name="order"
        options={{ title: 'Order' }}
      />
      <Tabs.Screen
        name="track"
        options={{ title: 'Track' }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile' }}
      />
    </Tabs>
  )
}
