import { Tabs } from "expo-router";
import CustomNavBar from "../../src/components/navigation/CustomNavBar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        tabBar={(props) => <CustomNavBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="style" options={{ title: "Style" }} />
        <Tabs.Screen name="car" options={{ title: "Car" }} />
        <Tabs.Screen name="professional" options={{ title: "Professional" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </SafeAreaView>
  );
}