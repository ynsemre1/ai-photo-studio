import React from 'react';
import { View, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';

const screenWidth = Dimensions.get('window').width;
const boxSize = (screenWidth - 48) / 2;

type Props = {
  uri: string;
  value: string;
  onPress: (value: string) => void;
};

export default function StyleBox({ uri, value, onPress }: Props) {
  return (
    <TouchableOpacity onPress={() => onPress(value)} style={styles.item}>
      <Image source={{ uri }} style={styles.image} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    width: boxSize,
    height: boxSize,
    margin: 8,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});