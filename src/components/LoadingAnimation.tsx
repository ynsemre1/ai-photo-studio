import React from "react";
import { View, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

//TODO: Need to change loading animation size, or change loading animation 

type Props = {
  source: any;
  size?: number;
};

export default function LoadingAnimation({ source, size = 40 }: Props) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LottieView
        source={source}
        autoPlay
        loop
        style={{
          width: size * 2.5,
          height: size * 2.5,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", 
  },
});