import { Tabs } from "expo-router";
import React from "react";
import CustomNavBar from "../src/components/navigation/CustomNavBar";

export default function Layout() {
  return (
  <Tabs tabBar ={(props) => <CustomNavBar {...props} />}>
    //TODO: index.tsx will change favorite screen
    <Tabs.Screen name="index" options={{ title: "Home" }} /> 
    <Tabs.Screen name="style" options={{ title: "Style" }} />
    <Tabs.Screen name="car" options={{ title: "Car" }} />
    <Tabs.Screen name="professional" options={{ title: "Professional" }} />
    <Tabs.Screen name="profile" options={{ title: "Profile" }} />
  </Tabs>);
}