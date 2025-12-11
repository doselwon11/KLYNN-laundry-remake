import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PrimaryButton from "../../components/PrimaryButton";
import { useAuth } from "../../context/AuthProvider";
import { supabase } from "../../lib/supabase";

// ------------------------------------------------------------
// Profile Screen Component
// ------------------------------------------------------------
export default function Profile() {
  const { session, user, loading } = useAuth();

  // ---------------- AUTH STATE ----------------
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ---------------- PROFILE FIELDS ----------------
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [phoneCountry, setPhoneCountry] = useState(""); // Composite "Country|+Code"
  const [phoneNumber, setPhoneNumber] = useState("");

  const [country, setCountry] = useState("");
  const [stateProv, setStateProv] = useState("");
  const [city, setCity] = useState("");
  const [street, setStreet] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [saving, setSaving] = useState(false);

  // ---------------- DROPDOWN LISTS ----------------
  const [countryCodes, setCountryCodes] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);

  // ---------------- FETCH COUNTRY & STATES ----------------
  useEffect(() => {
    fetchCountryCodes();
    fetchCountries();
  }, []);

  async function fetchCountryCodes() {
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/codes");
      const json = await res.json();

      if (!json?.data || !Array.isArray(json.data)) return;

      const list = json.data
        .filter((c: any) => c?.name && c?.dial_code)
        .map((c: any) => ({
          label: `${c.name} (${c.dial_code})`,
          value: `${c.name}|${c.dial_code}`,
        }))
        .sort((a: any, b: any) => a.label.localeCompare(b.label));

      setCountryCodes(list);
    } catch (err) {
      console.log("Dial code fetch error:", err);
    }
  }

  async function fetchCountries() {
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/positions");
      const json = await res.json();

      if (!json?.data || !Array.isArray(json.data)) return;

      const list = json.data
        .map((c: any) => c.name)
        .sort((a: string, b: string) => a.localeCompare(b));

      setCountries(list);
    } catch (err) {
      console.log("Country fetch error:", err);
    }
  }

  // ---------------- FETCH STATES WHEN COUNTRY SELECTED ----------------
  useEffect(() => {
    if (country) fetchStates(country);
  }, [country]);

  async function fetchStates(selectedCountry: string) {
    setLoadingStates(true);
    try {
      const res = await fetch("https://countriesnow.space/api/v0.1/countries/states", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry }),
      });

      const json = await res.json();

      if (json?.data?.states) {
        const list = json.data.states
          .map((s: any) => s.name)
          .sort((a: string, b: string) => a.localeCompare(b));

        setStates(list);
      } else {
        setStates([]);
      }
    } catch (err) {
      console.log("State fetch error:", err);
    }
    setLoadingStates(false);
  }

  // ---------------- LOAD PROFILE ----------------
  useEffect(() => {
    if (user?.id) loadProfile();
  }, [user]);

  async function loadProfile() {
    if (!user?.id) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.log("Profile load error:", error);
      return;
    }

    setFirstName(data.first_name ?? "");
    setLastName(data.last_name ?? "");

    if (data.phone_country) {
      setPhoneCountry(`${data.country}|${data.phone_country}`);
    }

    setPhoneNumber(data.phone_number ?? "");

    setCountry(data.country ?? "");
    setStreet(data.street ?? "");
    setCity(data.city ?? "");
    setStateProv(data.state ?? "");
    setPostalCode(data.postal_code ?? "");

    // Load correct state list for their country
    if (data.country) fetchStates(data.country);
  }

  // ---------------- SAVE PROFILE ----------------
  async function updateProfile() {
    if (!user?.id) return;

    setSaving(true);

    let realCountry = country || null;
    let realDialCode = null;

    if (phoneCountry.includes("|")) {
      const parts = phoneCountry.split("|");
      realCountry = parts[0].trim();
      realDialCode = parts[1].trim();
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        country: realCountry,
        phone_country: realDialCode,
        phone_number: phoneNumber || null,
        street: street || null,
        city: city || null,
        state: stateProv || null,
        postal_code: postalCode || null,
      })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Update Error", error.message);
      setSaving(false);
      return;
    }

    Alert.alert("Success", "Profile updated.");
    setTimeout(() => setSaving(false), 1200);
  }

  // ---------------- UPDATE PASSWORD ----------------
  async function updatePassword() {
    if (!password) return Alert.alert("Error", "Enter a new password.");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) return Alert.alert("Error", error.message);

    Alert.alert("Password Updated", "Your new password is saved.");
  }

  // ---------------- SIGN OUT ----------------
  async function signOut() {
    await supabase.auth.signOut();
  }

  // ---------------- SIGN IN / SIGN UP ----------------
  async function handleAuth() {
    if (!email || !password)
      return Alert.alert("Missing fields", "Please fill all fields.");

    setAuthLoading(true);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        Alert.alert("Welcome!");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        Alert.alert("Account created", "You may now sign in.");
        setMode("signin");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  // ---------------- LOADING SCREEN ----------------
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f9fafb",
        }}
      >
        <Text style={{ fontSize: 20 }}>Loading...</Text>
      </View>
    );
  }

  // =====================================================================
  //                          LOGGED IN PROFILE UI
  // =====================================================================
  if (session && user) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f9fafb" }}
        contentContainerStyle={{ alignItems: "center", padding: 20 }}
      >
        <LinearGradient
          colors={["#7c3aed", "#4f46e5"]}
          style={{ width: "60%", padding: 16, borderRadius: 16 }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 26,
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            My Profile
          </Text>
        </LinearGradient>

        <View style={{ width: "100%", maxWidth: 400, marginTop: 20, gap: 12 }}>
          {/* Names */}
          <Label text="First Name" />
          <TextInput value={firstName} onChangeText={setFirstName} style={input} />

          <Label text="Last Name" />
          <TextInput value={lastName} onChangeText={setLastName} style={input} />

          {/* Email */}
          <Label text="Email" />
          <TextInput
            value={user.email}
            editable={false}
            style={{ ...input, backgroundColor: "#e5e7eb", color: "#555" }}
          />

          {/* Country Code */}
          <Label text="Country Code" />
          <View style={pickerWrap}>
            <Picker
              selectedValue={phoneCountry}
              onValueChange={(v) => setPhoneCountry(v)}
            >
              <Picker.Item label="Select Country Code" value="" />
              {countryCodes.map((c) => (
                <Picker.Item key={c.value} label={c.label} value={c.value} />
              ))}
            </Picker>
          </View>

          {/* Phone number */}
          <Label text="Phone Number" />
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={input}
          />

          {/* Country */}
          <Label text="Country" />
          <View style={pickerWrap}>
            <Picker selectedValue={country} onValueChange={setCountry}>
              <Picker.Item label="Select Country" value="" />
              {countries.map((ct) => (
                <Picker.Item key={ct} label={ct} value={ct} />
              ))}
            </Picker>
          </View>

          {/* State — dynamic */}
          <Label text="State / Province" />
          <View style={pickerWrap}>
            <Picker
              enabled={!loadingStates && states.length > 0}
              selectedValue={stateProv}
              onValueChange={setStateProv}
            >
              <Picker.Item
                label={
                  loadingStates
                    ? "Loading states..."
                    : states.length > 0
                    ? "Select State / Province"
                    : "No states available"
                }
                value=""
              />
              {states.map((s) => (
                <Picker.Item key={s} label={s} value={s} />
              ))}
            </Picker>
          </View>

          {/* City */}
          <Label text="City" />
          <TextInput value={city} onChangeText={setCity} style={input} />

          {/* Street */}
          <Label text="Street" />
          <TextInput value={street} onChangeText={setStreet} style={input} />

          {/* Postal Code */}
          <Label text="Postal Code" />
          <TextInput value={postalCode} onChangeText={setPostalCode} style={input} />

          {/* Save button */}
          <PrimaryButton
            title={saving ? "Saved ✓" : "Save Changes"}
            onPress={updateProfile}
            disabled={saving}
            style={{
              backgroundColor: saving ? "#9CA3AF" : "#4f46e5",
              borderRadius: 10,
              height: 50,
              justifyContent: "center",
              marginTop: 6,
            }}
          />

          {/* Password */}
          <Label text="Change Password" />
          <TextInput
            placeholder="New Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={input}
          />
          <PrimaryButton
            title="Update Password"
            onPress={updatePassword}
            style={{
              backgroundColor: "#2563eb",
              borderRadius: 10,
              height: 50,
              justifyContent: "center",
            }}
          />

          {/* Sign out */}
          <PrimaryButton
            title="Sign Out"
            onPress={signOut}
            style={{
              backgroundColor: "red",
              borderRadius: 10,
              height: 50,
              justifyContent: "center",
              marginTop: 20,
            }}
          />
        </View>
      </ScrollView>
    );
  }

  // =====================================================================
  //                          SIGN-IN / SIGN-UP UI
  // =====================================================================
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        padding: 20,
        backgroundColor: "#f9fafb",
      }}
    >
      <LinearGradient
        colors={["#7c3aed", "#4f46e5"]}
        style={{ width: "100%", paddingVertical: 24, borderRadius: 16 }}
      >
        <Text
          style={{
            fontSize: 26,
            fontWeight: "800",
            color: "white",
            textAlign: "center",
          }}
        >
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </Text>
      </LinearGradient>

      <View style={{ width: "100%", maxWidth: 400, marginTop: 24, gap: 10 }}>
        {mode === "signup" && (
          <>
            <TextInput
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
              style={input}
            />

            <TextInput
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
              style={input}
            />

            {/* Country Code Dropdown */}
            <View style={pickerWrap}>
              <Picker
                selectedValue={phoneCountry}
                onValueChange={setPhoneCountry}
              >
                <Picker.Item label="Country Code" value="" />
                {countryCodes.map((c) => (
                  <Picker.Item key={c.value} label={c.label} value={c.value} />
                ))}
              </Picker>
            </View>

            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={input}
            />

            {/* Country Dropdown */}
            <View style={pickerWrap}>
              <Picker selectedValue={country} onValueChange={setCountry}>
                <Picker.Item label="Country" value="" />
                {countries.map((ct) => (
                  <Picker.Item key={ct} label={ct} value={ct} />
                ))}
              </Picker>
            </View>

            {/* Dynamic State */}
            <View style={pickerWrap}>
              <Picker
                enabled={!loadingStates && states.length > 0}
                selectedValue={stateProv}
                onValueChange={setStateProv}
              >
                <Picker.Item
                  label={
                    loadingStates
                      ? "Loading states..."
                      : states.length > 0
                      ? "Select State / Province"
                      : "No states available"
                  }
                  value=""
                />
                {states.map((s) => (
                  <Picker.Item key={s} label={s} value={s} />
                ))}
              </Picker>
            </View>

            <TextInput
              placeholder="Street"
              value={street}
              onChangeText={setStreet}
              style={input}
            />
            <TextInput
              placeholder="City"
              value={city}
              onChangeText={setCity}
              style={input}
            />
            <TextInput
              placeholder="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
              style={input}
            />
          </>
        )}

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          style={input}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={input}
        />

        <PrimaryButton
          title={
            authLoading ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"
          }
          onPress={handleAuth}
          style={{
            backgroundColor: "#4f46e5",
            borderRadius: 10,
            height: 50,
            justifyContent: "center",
            marginTop: 6,
          }}
        />

        <TouchableOpacity
          onPress={() => setMode(mode === "signin" ? "signup" : "signin")}
          style={{ alignSelf: "center", marginTop: 8 }}
        >
          <Text style={{ color: "#4f46e5", fontWeight: "600" }}>
            {mode === "signin"
              ? "Don't have an account? Sign Up"
              : "Already have an account? Sign In"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ------------------------------------------------------------
// Helper Components
// ------------------------------------------------------------
function Label({ text }: { text: string }) {
  return <Text style={{ fontWeight: "600", marginTop: 4 }}>{text}</Text>;
}

const input = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  padding: 12,
  backgroundColor: "white",
};

const pickerWrap = {
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  overflow: "hidden" as const,
  backgroundColor: "white",
};