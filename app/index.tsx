import React, { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, Text } from 'react-native';

export default function HomeScreen() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleGenerate = async () => {
  };

  return (
    <View style={styles.container}>
      <Text>"Main"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { borderWidth: 1, padding: 10, marginBottom: 16, borderRadius: 8 },
  image: { width: 300, height: 300, marginTop: 16, alignSelf: 'center' },
});