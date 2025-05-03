import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../../theme';

interface CategoryCardProps {
  category: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: category.color }]}>
        <Icon name={category.icon} size={24} color="white" />
      </View>
      <Text style={styles.name}>{category.name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginHorizontal: 8 },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: { fontSize: 14, color: theme.colors.grey1, textAlign: 'center' },
});
