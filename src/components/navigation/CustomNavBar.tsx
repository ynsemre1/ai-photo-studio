import { View, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "@react-navigation/native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  BounceIn,
  SlideInUp,
  BounceInUp, 
  BounceOutDown
} from "react-native-reanimated";
import { Feather, Ionicons } from "@expo/vector-icons";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const PRIMARY_COLOR = "#130057";
const SECONDARY_COLOR = "#fff";

const CustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors } = useTheme();
  const currentRouteName = state.routes[state.index].name;
  const isUploadImageScreen = currentRouteName === "upload-image";

  const renderTab = (route: any, index: number) => {
    if (["_sitemap", "+not-found", "upload-image"].includes(route.name))
      return null;

    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const label = options.title ?? route.name;

    const onPress = () => {
      const event = navigation.emit({
        type: "tabPress",
        target: route.key,
        canPreventDefault: true,
      });

      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name, route.params);
      }
    };

    return (
      <AnimatedTouchableOpacity
        layout={LinearTransition.springify().mass(0.5)}
        key={route.key}
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={options.tabBarAccessibilityLabel}
        onPress={onPress}
        style={[
          styles.tabItem,
          { backgroundColor: isFocused ? SECONDARY_COLOR : "transparent" },
        ]}
      >
        {getIconByRouteName(
          route.name,
          isFocused ? PRIMARY_COLOR : SECONDARY_COLOR
        )}
        {isFocused && label && (
          <Animated.Text
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(200)}
            style={{
              color: isFocused ? PRIMARY_COLOR : SECONDARY_COLOR,
              fontSize: 14,
              paddingLeft: 4,
              textAlign: "center",
            }}
          >
            {label}
          </Animated.Text>
        )}
      </AnimatedTouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => renderTab(route, index))}

      {isUploadImageScreen && (
        <Animated.View
        // TODO: Animation will change,
          entering={SlideInUp.duration(100)}
          exiting={BounceOutDown.duration(400)}
          style={styles.plusWrapper}
        >
          {/* Arka plan çıkıntısı */}
          <View style={styles.plusBase} />
          {/* Üstteki + simgesi */}
          <View style={styles.plusButton}>
            <Feather name="plus" size={32} color="#fff" />
          </View>
        </Animated.View>
      )}
    </View>
  );
};

function getIconByRouteName(routeName: string, color: string) {
  switch (routeName) {
    case "index":
      return <Feather name="home" size={25} color={color} />;
    case "style":
      return <Ionicons name="color-palette-outline" size={25} color={color} />;
    case "car":
      return <Ionicons name="car-sport-outline" size={25} color={color} />;
    case "professional":
      return <Ionicons name="airplane-outline" size={25} color={color} />;
    case "profile":
      return <Feather name="user" size={25} color={color} />;
    default:
      return <Feather name="circle" size={25} color={color} />;
  }
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: PRIMARY_COLOR,
    width: "80%",
    alignSelf: "center",
    bottom: 40,
    borderRadius: 40,
    paddingHorizontal: 12,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 8,
    shadowOpacity: 0.25,
    elevation: 10,
    borderTopWidth: 1.5,
    borderTopColor: "#00000030",
    zIndex: 2,
  },
  plusWrapper: {
    position: "absolute",
    top: -58,
    alignSelf: "center",
    zIndex: 10,
    alignItems: "center",
  },
  plusBase: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plusButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  tabItem: {
    flexDirection: "row",
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    borderRadius: 30,
  },
});

export default CustomNavBar;
