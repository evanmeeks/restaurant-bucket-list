import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is a placeholder Image component to use until we can fix the React Native Image issue
interface ImageProps {
  source: { uri: string } | number;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoad?: () => void;
  onError?: (error: any) => void;
}

const CustomImage: React.FC<ImageProps> = ({ 
  source, 
  style, 
  resizeMode,
  onLoad,
  onError 
}) => {
  const uri = typeof source === 'number' ? '' : source.uri;
  
  return (
    <View 
      style={[
        styles.imageContainer, 
        style, 
        { backgroundColor: '#E1E1E1' }
      ]}
    >
      <Text style={styles.placeholder}>Image Placeholder</Text>
      <Text style={styles.uri} numberOfLines={1}>
        {uri}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  placeholder: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  uri: {
    fontSize: 10,
    color: '#999',
    maxWidth: '90%',
  },
});

export default CustomImage;
