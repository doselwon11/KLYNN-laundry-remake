import { useState } from 'react'
import { View, Text, TextInput, ScrollView, Switch, Alert } from 'react-native'
import { Picker } from '@react-native-picker/picker'
import { format } from 'date-fns'
import Card from '../../components/Card'
import PrimaryButton from '../../components/PrimaryButton'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthProvider'

export default function Order() {
  const { user } = useAuth()

  // state variables
  const [pkg, setPkg] = useState('Regular Laundry Packages')
  const [pickupType, setPickupType] = useState<'Economy' | 'Express'>('Economy')
  const [serviceType, setServiceType] = useState<'Normal' | 'Express'>('Normal')
  const [pickupDate, setPickupDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [address, setAddress] = useState('Use my registered address')
  const [promo, setPromo] = useState('')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  async function placeOrder() {
    if (!user) {
      return Alert.alert('Sign in required', 'Please sign in on the Profile tab first.')
    }
    if (!agree) {
      return Alert.alert('Terms Required', 'Please agree to the terms before continuing.')
    }

    setLoading(true)
    const { error } = await supabase.from('orders').insert({
      user_id: user.id,
      package: pkg,
      pickup_type: pickupType,
      service_type: serviceType,
      pickup_date: pickupDate,
      address,
      promo_code: promo,
      terms_agreed: agree,
      price_est_min: 10,
      price_est_max: 30,
    })
    setLoading(false)

    if (error) {
      Alert.alert('Error', error.message)
    } else {
      Alert.alert('✅ Order placed!', 'Check your order status on the Track tab.')
      // clear some fields
      setPromo('')
      setAgree(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* section 1: package */}
      <Text style={{ fontSize: 22, fontWeight: '800' }}>1. Select Package</Text>
      <Card selected={pkg === 'Shoe Cleaning (Promotion)'}>
        <Text onPress={() => setPkg('Shoe Cleaning (Promotion)')}>👟 Shoe Cleaning (Promotion)</Text>
      </Card>
      <Card selected={pkg === 'Regular Laundry Packages'}>
        <Text onPress={() => setPkg('Regular Laundry Packages')}>🧺 Regular Laundry Packages</Text>
      </Card>
      <Card selected={pkg === 'Specialty Services (Kuala Lumpur)'}>
        <Text onPress={() => setPkg('Specialty Services (Kuala Lumpur)')}>✨ Specialty Services (Kuala Lumpur)</Text>
      </Card>

      {/* section 2: pickup & service */}
      <Text style={{ fontSize: 22, fontWeight: '800', marginTop: 8 }}>2. Pickup & Service</Text>
      <Card selected={pickupType === 'Economy'}>
        <Text onPress={() => setPickupType('Economy')}>
          Economy (Pool) — RM5 pickup + RM5 delivery
        </Text>
      </Card>
      <Card selected={pickupType === 'Express'}>
        <Text onPress={() => setPickupType('Express')}>
          Express (Urgent) — RM10 + distance top-up
        </Text>
      </Card>

      <Card selected={serviceType === 'Normal'}>
        <Text onPress={() => setServiceType('Normal')}>
          Normal Service — Processing 24–48h, delivery next day
        </Text>
      </Card>
      <Card selected={serviceType === 'Express'}>
        <Text onPress={() => setServiceType('Express')}>
          Express Service — Completed in under 24 hours
        </Text>
      </Card>

      {/* section 3: pickup date & address */}
      <View>
        <Text style={{ fontWeight: '700', marginBottom: 6 }}>Pickup Date</Text>
        <TextInput
          value={pickupDate}
          onChangeText={setPickupDate}
          placeholder="YYYY-MM-DD"
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 10,
            padding: 12,
          }}
        />
      </View>

      <Text style={{ fontSize: 22, fontWeight: '800', marginTop: 8 }}>3. Address & Details</Text>
      <Card>
        <Text style={{ fontWeight: '700' }}>Pickup Address</Text>
        <Picker selectedValue={address} onValueChange={(v) => setAddress(v)}>
          <Picker.Item label="Use my registered address" value="Use my registered address" />
          <Picker.Item label="Use a different address" value="Use a different address" />
        </Picker>

        <Text style={{ fontWeight: '700', marginTop: 8 }}>Promo Code</Text>
        <TextInput
          placeholder="e.g., KLYNN4ALL"
          value={promo}
          onChangeText={setPromo}
          style={{
            borderWidth: 1,
            borderColor: '#e5e7eb',
            borderRadius: 10,
            padding: 12,
          }}
        />
      </Card>

      {/* section 4: terms */}
      <Card>
        <Text style={{ fontWeight: '700', marginBottom: 8 }}>Terms & Conditions</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Switch value={agree} onValueChange={setAgree} />
          <Text>By continuing, you agree to our service terms.</Text>
        </View>
      </Card>

      {/* submit button */}
      <PrimaryButton
        title={loading ? 'Placing...' : 'Place Order'}
        onPress={placeOrder}
        style={{ marginVertical: 16 }}
      />
    </ScrollView>
  )
}
