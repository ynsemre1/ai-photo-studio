import { Tabs } from "expo-router";
import CustomNavBar from "../../src/components/navigation/CustomNavBar";
import { StyleDataProvider } from "../../src/context/StyleDataProvider";
import { FavoriteProvider } from "../../src/context/FavoriteContext";
import { CoinProvider } from "../../src/context/CoinContext";
import { UserProvider } from "../../src/context/UserContext";

export default function TabsLayout() {
  return (
    <UserProvider>
      <CoinProvider>
        <StyleDataProvider>
          <FavoriteProvider>
            <Tabs
              tabBar={(props) => <CustomNavBar {...props} />}
              screenOptions={{
                headerShown: false,
              }}
            >
              <Tabs.Screen name="home" options={{ title: "Home" }} />
              <Tabs.Screen name="style" options={{ title: "Style" }} />
              <Tabs.Screen name="car" options={{ title: "Car" }} />
              <Tabs.Screen
                name="professional"
                options={{ title: "Professional" }}
              />
              <Tabs.Screen
                name="profileScreens"
                options={{ title: "Profile" }}
              />
            </Tabs>
          </FavoriteProvider>
        </StyleDataProvider>
      </CoinProvider>
    </UserProvider>
  );
}
