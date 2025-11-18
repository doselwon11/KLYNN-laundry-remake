import { Link } from 'expo-router'
import { ScrollView, Text, View } from 'react-native'
import PrimaryButton from '../../components/PrimaryButton'

export default function Home() {
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#fafafa',
      }}
    >
      {/* location */}
      <Text style={{ color: '#777', marginBottom: 8 }}>📍 Kuala Lumpur</Text>

      {/* title */}
      <Text
        style={{
          fontSize: 28,
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        Laundry Day,
      </Text>
      <Text
        style={{
          fontSize: 28,
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        Done Right.
      </Text>

      {/* subtitle */}
      <Text
        style={{
          fontSize: 15,
          textAlign: 'center',
          color: '#666',
          marginBottom: 24,
          lineHeight: 20,
        }}
      >
        Tap one button, and we'll handle the rest. Pickup and delivery for just RM10.
      </Text>

      {/* booking button */}
      <View style={{ width: '100%', alignItems: 'center', marginBottom: 20 }}>
        <Link href={{ pathname: '/order' }} asChild>
          <PrimaryButton
            title="Book My Laundry Now"
            style={{
              backgroundColor: '#2563eb',
              width: 260,
              height: 48,
              borderRadius: 30,
              justifyContent: 'center',
            }}
          />
        </Link>
      </View>

      {/* bottom notice */}
      <View
        style={{
          backgroundColor: '#ede9ff',
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 10,
          width: '90%',
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            color: '#333',
            fontSize: 14,
            lineHeight: 20,
          }}
        >
          📌 Book tonight so we can swing by first thing tomorrow morning.{'\n'}
          Don't stress it, just KLYNN it! ✨
        </Text>
      </View>
    </ScrollView>
  )
}