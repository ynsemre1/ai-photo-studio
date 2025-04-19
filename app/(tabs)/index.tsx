import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import StyleBox from "../../src/components/StyleBox";

const data = [
  //TODO: uri change with Firebase Storage
  //TODO: this holder will change to style
  {
    id: "1",
    uri: "https://plus.unsplash.com/premium_photo-1731951687921-4b2029496c98?q=80&w=3115&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    value: "styleA",
  },
  {
    id: "2",
    uri: "https://images.unsplash.com/photo-1741762764258-8f9348bdf186?q=80&w=2160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    value: "styleB",
  },
  {
    id: "3",
    uri: "https://images.unsplash.com/photo-1741762764258-8f9348bdf186?q=80&w=2160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    value: "styleC",
  },
  {
    id: "4",
    uri: "https://images.unsplash.com/photo-1741762764258-8f9348bdf186?q=80&w=2160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    value: "styleD",
  },
  {
    id: "5",
    uri: "https://images.unsplash.com/photo-1741762764258-8f9348bdf186?q=80&w=2160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    value: "styleB",
  },
  {
    id: "6",
    uri: "https://images.unsplash.com/photo-1741762764258-8f9348bdf186?q=80&w=2160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    value: "styleB",
  },
  {
    id: "7",
    uri: "https://images.unsplash.com/photo-1741762764258-8f9348bdf186?q=80&w=2160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    value: "styleB",
  },
  {
    id: "8",
    uri: "https://images.unsplash.com/photo-1741762764258-8f9348bdf186?q=80&w=2160&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    value: "styleB",
  },
];

export default function HomeScreen() {
  const router = useRouter();

  const handlePress = (value: string) => {
    router.push({ pathname: "/upload-image", params: { value } });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        renderItem={({ item }) => (
          <StyleBox uri={item.uri} value={item.value} onPress={handlePress} />
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gridContainer: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

/*
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function StyleDetail() {
  const { value } = useLocalSearchParams<{ value: string }>();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Gelen değer: {value}</Text>
    </View>
  );
}
*/
