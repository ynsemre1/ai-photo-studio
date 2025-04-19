import { Tabs } from "expo-router";
import CustomNavBar from "../../src/components/navigation/CustomNavBar";

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <CustomNavBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="style" options={{ title: "Style" }} />
      <Tabs.Screen name="car" options={{ title: "Car" }} />
      <Tabs.Screen name="professional" options={{ title: "Professional" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}