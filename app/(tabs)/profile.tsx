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

export default function Profile() {
  const { session, user, loading } = useAuth();

  // ---------- LOGIN / SIGNUP ----------
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // ---------- PROFILE FIELDS ----------
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateProv, setStateProv] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");

  const [saving, setSaving] = useState(false);

  // ---------- LOAD PROFILE ----------
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
      console.log("Profile load error:", error.message);
      return;
    }

    setFirstName(data.first_name ?? "");
    setLastName(data.last_name ?? "");
    setPhoneCountry(data.phone_country ?? "");
    setPhoneNumber(data.phone_number ?? "");

    setStreet(data.street ?? "");
    setCity(data.city ?? "");
    setStateProv(data.state ?? "");
    setPostalCode(data.postal_code ?? data.zip ?? "");
    setCountry(data.country ?? "");
  }

  // ---------- UPDATE PROFILE ----------
  async function updateProfile() {
    if (!user?.id) return;

    setSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: firstName || null,
        last_name: lastName || null,
        phone_country: phoneCountry || null,
        phone_number: phoneNumber || null,
        street: street || null,
        city: city || null,
        state: stateProv || null,
        postal_code: postalCode || null,
        zip: postalCode || null,
        country: country || null,
      })
      .eq("id", user.id);

    if (error) {
      Alert.alert("Update Error", error.message);
      setSaving(false);
      return;
    }

    Alert.alert("Success", "Profile updated.");

    // keep button greyed for 1.5 seconds
    setTimeout(() => setSaving(false), 1500);
  }

  // ---------- UPDATE PASSWORD ----------
  async function updatePassword() {
    if (!password) return Alert.alert("Error", "Enter a new password.");

    const { error } = await supabase.auth.updateUser({ password });

    if (error) return Alert.alert("Error", error.message);

    Alert.alert("Password Updated", "Your new password is saved.");
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  // ---------- SIGN IN / SIGN UP ----------
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
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== "undefined"
                ? window.location.origin
                : undefined,
          },
        });

        if (error) throw error;

        // Create profile metadata after sign-up
        if (data?.user) {
          await supabase
            .from("profiles")
            .update({
              first_name: firstName,
              last_name: lastName,
              phone_country: phoneCountry,
              phone_number: phoneNumber,
              street,
              city,
              state: stateProv,
              postal_code: postalCode,
              country,
            })
            .eq("id", data.user.id);
        }

        Alert.alert("Account created", "Please verify your email.");
        setMode("signin");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setAuthLoading(false);
    }
  }

  // ---------- LOADING STATE ----------
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

  // -------------------------------------------------------
  //        PROFILE SCREEN (Logged In)
  // -------------------------------------------------------
  if (session && user) {
    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: "#f9fafb" }}
        contentContainerStyle={{ alignItems: "center", padding: 20 }}
      >
        <LinearGradient
          colors={["#7c3aed", "#4f46e5"]}
          style={{ width: "100%", padding: 24, borderRadius: 16 }}
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
          {/* FIRST NAME */}
          <Label text="First Name" />
          <TextInput value={firstName} onChangeText={setFirstName} style={input} />

          {/* LAST NAME */}
          <Label text="Last Name" />
          <TextInput value={lastName} onChangeText={setLastName} style={input} />

          {/* EMAIL */}
          <Label text="Email" />
          <TextInput
            value={user.email}
            editable={false}
            style={{ ...input, backgroundColor: "#e5e7eb", color: "#555" }}
          />

          {/* PHONE COUNTRY */}
          <Label text="Phone Country Code" />
          <TextInput
            value={phoneCountry}
            onChangeText={setPhoneCountry}
            placeholder="+1, +44, +82 ..."
            style={input}
          />

          {/* PHONE NUMBER */}
          <Label text="Phone Number" />
          <TextInput
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            style={input}
          />

          {/* ADDRESS FIELDS */}
          <Label text="Street" />
          <TextInput value={street} onChangeText={setStreet} style={input} />

          <Label text="City" />
          <TextInput value={city} onChangeText={setCity} style={input} />

          <Label text="State / Province" />
          <TextInput
            value={stateProv}
            onChangeText={setStateProv}
            style={input}
          />

          <Label text="Postal Code" />
          <TextInput
            value={postalCode}
            onChangeText={setPostalCode}
            style={input}
          />

          <Label text="Country" />
          <TextInput value={country} onChangeText={setCountry} style={input} />

          {/* SAVE BUTTON */}
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

          {/* CHANGE PASSWORD */}
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

          {/* SIGN OUT */}
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

  // -------------------------------------------------------
  //     SIGN IN / SIGN UP SCREEN
  // -------------------------------------------------------
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
            <TextInput
              placeholder="Phone Country Code"
              value={phoneCountry}
              onChangeText={setPhoneCountry}
              style={input}
            />
            <TextInput
              placeholder="Phone Number"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={input}
            />
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
              placeholder="State / Province"
              value={stateProv}
              onChangeText={setStateProv}
              style={input}
            />
            <TextInput
              placeholder="Postal Code"
              value={postalCode}
              onChangeText={setPostalCode}
              style={input}
            />
            <TextInput
              placeholder="Country"
              value={country}
              onChangeText={setCountry}
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
            authLoading
              ? "Please wait…"
              : mode === "signin"
              ? "Sign In"
              : "Sign Up"
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