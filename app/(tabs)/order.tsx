import { Picker } from "@react-native-picker/picker"
import { format } from "date-fns"
import { useEffect, useState } from "react"
import { Alert, ScrollView, Switch, Text, TextInput, View } from "react-native"
import Card from "../../components/Card"
import PrimaryButton from "../../components/PrimaryButton"
import { useAuth } from "../../context/AuthProvider"
import { supabase } from "../../lib/supabase"

// Country + State libraries
import { Country, State } from "country-state-city"

export default function Order() {
  const { user } = useAuth()

  // Load profile
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    if (user?.id) loadProfile()
  }, [user])

  async function loadProfile() {
    if (!user?.id) return

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    setProfile(data)
  }

  // --- FORM STATES ---
  const [pkg, setPkg] = useState("Regular Laundry Packages")
  const [pickupType, setPickupType] = useState("Economy")
  const [serviceType, setServiceType] = useState("Normal")
  const [pickupDate, setPickupDate] = useState(format(new Date(), "yyyy-MM-dd"))

  // Address selector state
  const [addressMode, setAddressMode] = useState("profile") // profile | gps | custom

  const [customCountry, setCustomCountry] = useState("")
  const [customState, setCustomState] = useState("")
  const [customCity, setCustomCity] = useState("")
  const [customStreet, setCustomStreet] = useState("")

  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])

  const [gpsAddress, setGpsAddress] = useState("")
  const [loadingGPS, setLoadingGPS] = useState(false)

  const [promo, setPromo] = useState("")
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load countries on mount
  useEffect(() => {
    setCountries(Country.getAllCountries())
  }, [])

  // Load states dynamically when country changes
  useEffect(() => {
    if (!customCountry) return
    setStates(State.getStatesOfCountry(customCountry))
  }, [customCountry])

  // -----------------------------
  // 🛰️ Get current GPS address
  // -----------------------------
  async function fetchGPSAddress() {
    try {
      setLoadingGPS(true)

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords

          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`

          const res = await fetch(url)
          const json = await res.json()

          setGpsAddress(json.display_name || "Unable to retrieve address")
          setLoadingGPS(false)
        },
        (err) => {
          Alert.alert("Location Error", err.message)
          setLoadingGPS(false)
        }
      )
    } catch (e) {
      Alert.alert("Error", "Unable to fetch location")
      setLoadingGPS(false)
    }
  }

  // -----------------------------------------
  // 🔄 Convert address mode → final address
  // -----------------------------------------
  function buildFullAddress() {
    if (addressMode === "profile") {
      return `${profile.street}, ${profile.city}, ${profile.state}, ${profile.country}`
    }
    if (addressMode === "gps") {
      return gpsAddress
    }
    if (addressMode === "custom") {
      return `${customStreet}, ${customCity}, ${customState}, ${customCountry}`
    }
    return ""
  }

  // -----------------------------------------
  // SUBMIT ORDER
  // -----------------------------------------
  async function placeOrder() {
    if (!user) return Alert.alert("Sign in Required", "Please sign in first.")
    if (!profile) return Alert.alert("No Profile", "Please complete your profile.")
    if (!agree) return Alert.alert("Terms Required", "You must agree before continuing.")

    const finalAddress = buildFullAddress()
    if (!finalAddress.trim()) {
      return Alert.alert("Missing Address", "Please enter or select an address.")
    }

    setLoading(true)

    const customerName =
      `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim()

    const { error } = await supabase.from("orders").insert({
      uid: user.id,
      name: customerName,
      phone: profile.phone_number ?? "",
      pickup_address: finalAddress,
      pickup_date: pickupDate,
      service: pkg,
      delivery_type: pickupType === "Economy" ? "pool" : "express",
      order_type: serviceType === "Express" ? "express" : "normal",
      promo_code: promo || null,
      status: "pending",
      created_at: new Date().toISOString(),
    })

    setLoading(false)

    if (error) Alert.alert("Order Error", error.message)
    else {
      Alert.alert("Success", "Your order has been placed!")
      setPromo("")
      setAgree(false)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>

      {/* ========================= */}
      {/* 1. SELECT PACKAGE         */}
      {/* ========================= */}
      <Text style={{ fontSize: 22, fontWeight: "800" }}>1. Select Package</Text>

      <Card selected={pkg === "Shoe Cleaning (Promotion)"}>
        <Text onPress={() => setPkg("Shoe Cleaning (Promotion)")}>
          👟 Shoe Cleaning (Promotion)
        </Text>
      </Card>

      <Card selected={pkg === "Regular Laundry Packages"}>
        <Text onPress={() => setPkg("Regular Laundry Packages")}>
          🧺 Regular Laundry Packages
        </Text>
      </Card>

      <Card selected={pkg === "Specialty Services (Kuala Lumpur)"}>
        <Text onPress={() => setPkg("Specialty Services (Kuala Lumpur)")}>
          ✨ Specialty Services (Kuala Lumpur)
        </Text>
      </Card>

      {/* ========================= */}
      {/* 2. PICKUP & SERVICE       */}
      {/* ========================= */}
      <Text style={{ fontSize: 22, fontWeight: "800", marginTop: 10 }}>
        2. Pickup & Service
      </Text>

      {/* PICKUP DATE */}
      <Text style={{ fontWeight: "700" }}>Pickup Date</Text>
      <TextInput
        value={pickupDate}
        onChangeText={setPickupDate}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 12, borderRadius: 8 }}
      />

      {/* PICKUP TYPE */}
      <Text style={{ fontWeight: "700", marginTop: 10 }}>Pickup Type</Text>

      <Card selected={pickupType === "Economy"}>
        <Text onPress={() => setPickupType("Economy")}>
          🔵 Economy (Pool){"\n"}
          RM5 pickup + RM5 delivery{"\n"}
          • Route Pickup{"\n"}
          • Budget Friendly
        </Text>
      </Card>

      <Card selected={pickupType === "Express"}>
        <Text onPress={() => setPickupType("Express")}>
          🟠 Express (Urgent){"\n"}
          RM10 + distance top-up{"\n"}
          • On-Demand Rider{"\n"}
          • Distance Based
        </Text>
      </Card>

      {/* SERVICE TYPE */}
      <Text style={{ fontWeight: "700", marginTop: 10 }}>Service Type</Text>

      <Card selected={serviceType === "Normal"}>
        <Text onPress={() => setServiceType("Normal")}>
          🟢 Normal Service — Standard Rate{"\n"}
          ⏱️ Processing: 24–48 hours{"\n"}
          🚚 Delivery: Next day (2–3 days total)
        </Text>
      </Card>

      <Card selected={serviceType === "Express"}>
        <Text onPress={() => setServiceType("Express")}>
          🔴 Express Service — Priority turnaround{"\n"}
          ⚡ Ready within 24 hours{"\n"}
          🚀 Delivery included{"\n"}
          ⚠️ 50% surcharge
        </Text>
      </Card>

      {/* ========================= */}
      {/* 3. ADDRESS & DETAILS      */}
      {/* ========================= */}
      <Text style={{ fontSize: 22, fontWeight: "800", marginTop: 12 }}>
        3. Address & Details
      </Text>

      <Picker selectedValue={addressMode} onValueChange={setAddressMode}>
        <Picker.Item label="Use Profile Address" value="profile" />
        <Picker.Item label="Use Current GPS Location" value="gps" />
        <Picker.Item label="Enter Custom Address" value="custom" />
      </Picker>

      {/* PROFILE ADDRESS */}
      {addressMode === "profile" && profile && (
        <Card>
          <Text>
            {profile.street}, {profile.city}{"\n"}
            {profile.state}, {profile.country}
          </Text>
        </Card>
      )}

      {/* GPS ADDRESS */}
      {addressMode === "gps" && (
        <Card>
          <Text>{gpsAddress || "Press button to load GPS address."}</Text>

          <PrimaryButton
            title={loadingGPS ? "Locating..." : "Use My Location"}
            onPress={fetchGPSAddress}
            style={{ marginTop: 10 }}
          />
        </Card>
      )}

      {/* CUSTOM ADDRESS */}
      {addressMode === "custom" && (
        <View style={{ gap: 10 }}>

          {/* COUNTRY DROPDOWN */}
          <Text style={{ fontWeight: "700" }}>Country</Text>
          <Picker
            selectedValue={customCountry}
            onValueChange={(val) => {
              setCustomCountry(val)
              setCustomState("") // reset state
            }}
          >
            <Picker.Item label="Select Country" value="" />
            {countries.map((c) => (
              <Picker.Item key={c.isoCode} label={c.name} value={c.isoCode} />
            ))}
          </Picker>

          {/* STATE / REGION DROPDOWN */}
          <Text style={{ fontWeight: "700" }}>State / Region</Text>
          <Picker
            enabled={states.length > 0}
            selectedValue={customState}
            onValueChange={(val) => setCustomState(val)}
          >
            <Picker.Item label="Select State / Region" value="" />
            {states.map((s) => (
              <Picker.Item key={s.isoCode} label={s.name} value={s.isoCode} />
            ))}
          </Picker>

          {/* CITY */}
          <Text style={{ fontWeight: "700" }}>City</Text>
          <TextInput
            placeholder="Enter city"
            style={styles.input}
            value={customCity}
            onChangeText={setCustomCity}
          />

          {/* STREET */}
          <Text style={{ fontWeight: "700" }}>Street Address</Text>
          <TextInput
            placeholder="Street name, building number..."
            style={styles.input}
            value={customStreet}
            onChangeText={setCustomStreet}
          />
        </View>
      )}

      {/* PROMO */}
      <Text style={{ fontSize: 22, fontWeight: "800", marginTop: 12 }}>
        4. Promo Code
      </Text>
      <TextInput
        placeholder="e.g. KLYNN10"
        value={promo}
        onChangeText={setPromo}
        style={styles.input}
      />

      {/* TERMS */}
      <Card>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Switch value={agree} onValueChange={setAgree} />
          <Text style={{ marginLeft: 8 }}>I agree to the terms</Text>
        </View>
      </Card>

      {/* SUBMIT */}
      <PrimaryButton
        title={loading ? "Placing…" : "Place Order"}
        onPress={placeOrder}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  )
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
  },
}
