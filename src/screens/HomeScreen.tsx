import React, { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet } from 'react-native';
import { generateImage } from '../api/openai';

export default function HomeScreen() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleGenerate = async () => {
    const url = await generateImage(prompt);
    setImageUrl(url);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a prompt"
        value={prompt}
        onChangeText={setPrompt}
      />
      <Button title="Generate Image" onPress={handleGenerate} />
      {imageUrl && (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16 },
  input: { borderWidth: 1, padding: 10, marginBottom: 16, borderRadius: 8 },
  image: { width: 300, height: 300, marginTop: 16, alignSelf: 'center' },
});