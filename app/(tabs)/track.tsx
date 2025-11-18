import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from 'react-native'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthProvider'
import PrimaryButton from '../../components/PrimaryButton'
import { Link } from 'expo-router'

export default function Track() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    if (!user) return

    // load initial orders
    fetchOrders()

    // subscribe to realtime updates for this user’s orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
        () => fetchOrders()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  async function fetchOrders() {
    if (!user) return
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (!error) setOrders(data || [])
  }

  if (!user) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ marginTop: 24 }}>Please sign in to track your orders.</Text>
        <Link href={{ pathname: '/profile' }} asChild>
          <PrimaryButton title="Go to Profile" style={{ marginTop: 12 }} />
        </Link>
      </View>
    )
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      {orders.length === 0 ? (
        <View style={{ alignItems: 'center', marginTop: 24 }}>
          <Text>No Active Orders</Text>
          <Link href={{ pathname: '/order' }} asChild>
            <PrimaryButton title="Place New Order" style={{ marginTop: 12 }} />
          </Link>
        </View>
      ) : (
        orders.map((o) => (
          <View
            key={o.id}
            style={{
              padding: 14,
              borderWidth: 1,
              borderColor: '#e5e7eb',
              borderRadius: 12,
              marginBottom: 12,
              backgroundColor: '#fff',
            }}
          >
            <Text style={{ fontWeight: '700' }}>{o.package}</Text>
            <Text>{o.pickup_type} • {o.service_type}</Text>
            <Text>Date: {o.pickup_date}</Text>
            <Text>Status: {o.status}</Text>
          </View>
        ))
      )}
    </ScrollView>
  )
}
