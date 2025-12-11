import { LinearGradient } from "expo-linear-gradient";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerBackground: () => (
          <LinearGradient
            colors={["#938ee6ff", "#c095e7ff"]}
            style={{ flex: 1 }}
          />
        ),

        // SMALL LOGO IN HEADER (GLOBAL DEFAULT)
        headerTitle: () => (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Image
              source={require("../../assets/images/klynn-logo.png")}
              style={{
                width: 60,
                height: 60,
                resizeMode: "contain",
                marginRight: 8,
              }}
            />
            <Text style={{ color: "white", fontWeight: "800", fontSize: 18, textAlign:'center' }}>
              KLYNN Door-to-Door Laundry
            </Text>
          </View>
        ),

        tabBarActiveTintColor: "#9c99f1ff",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />

      <Tabs.Screen
        name="order"
        options={{
          title: "Order",
        }}
      />

      <Tabs.Screen
        name="track"
        options={{
          title: "Track",
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
