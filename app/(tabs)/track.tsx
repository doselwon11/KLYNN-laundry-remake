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

    fetchOrders()

    // Subscriptions (realtime)
    const channel = supabase
      .channel("orders-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `uid=eq.${user.id}` },
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
      .from("orders")
      .select("*")
      .eq("uid", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.log("Order load error:", error)
      return
    }

    setOrders(data || [])
  }

  if (!user) {
    return (
      <View style={{ padding: 16, alignItems: 'center' }}>
        <Text style={{ marginTop: 24 }}>Please sign in to track your orders.</Text>
        <Link href="/profile" asChild>
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
          <Link href="/order" asChild>
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
              borderColor: "#e5e7eb",
              borderRadius: 12,
              marginBottom: 12,
              backgroundColor: "#fff",
            }}
          >
            {/* ORDER ID */}
            <Text style={{ fontWeight: "800", fontSize: 16 }}>
              {o.id}
            </Text>

            {/* SERVICE */}
            <Text style={{ marginTop: 4 }}>
              🧺 Service: {o.service ?? "Laundry"}
            </Text>

            {/* DELIVERY TYPE */}
            <Text>
              🚚 Delivery: {o.delivery_type ?? "-"}
            </Text>

            {/* PICKUP DATE */}
            <Text>
              📅 Pickup Date: {o.pickup_date}
            </Text>

            {/* ADDRESS */}
            <Text numberOfLines={2}>
              📍 {o.pickup_address}
            </Text>

            {/* STATUS */}
            <Text style={{ marginTop: 6, fontWeight: "700" }}>
              Status: {o.status}
            </Text>

            {/* PRICE (if exists) */}
            {o.final_price && (
              <Text>💰 Price: RM {o.final_price}</Text>
            )}

            {/* Vendor (optional) */}
            {o.vendor && (
              <Text>🏭 Vendor: {o.vendor}</Text>
            )}
          </View>
        ))
      )}
    </ScrollView>
  )
}