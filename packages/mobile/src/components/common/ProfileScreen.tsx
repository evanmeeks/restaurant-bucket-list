import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@restaurant-bucket-list/core/src/store';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ProfileScreen = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const bucketList = useSelector((state: RootState) => state.bucketList.items);

  const visitedCount = bucketList.filter((item) => item.visited).length;
  const totalCount = bucketList.length;

  const menuItems = [
    {
      title: 'Account Settings',
      icon: 'person',
      onPress: () => {
        // Navigate to account settings
      },
    },
    {
      title: 'Notifications',
      icon: 'notifications',
      onPress: () => {
        // Navigate to notifications settings
      },
    },
    {
      title: 'Privacy Policy',
      icon: 'privacy-tip',
      onPress: () => {
        // Navigate to privacy policy
      },
    },
    {
      title: 'Terms of Service',
      icon: 'description',
      onPress: () => {
        // Navigate to terms of service
      },
    },
    {
      title: 'Help & Support',
      icon: 'help',
      onPress: () => {
        // Navigate to help & support
      },
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
        <View style={styles.profileInfo}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
            <Icon name="person" size={40} color="#FFFFFF" />
          </View>
          <View style={styles.stats}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {visitedCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
              Restaurants Visited
            </Text>
          </View>
          <View style={styles.stats}>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>
              {totalCount}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.text }]}>
              In Bucket List
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Appearance
          </Text>
        </View>
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Icon name="dark-mode" size={24} color={theme.colors.text} />
            <Text style={[styles.settingText, { color: theme.colors.text }]}>
              Dark Mode
            </Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={isDark ? '#FFFFFF' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.colors.card }]}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Settings
          </Text>
        </View>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.settingItem}
            onPress={item.onPress}
          >
            <View style={styles.settingInfo}>
              <Icon name={item.icon} size={24} color={theme.colors.text} />
              <Text style={[styles.settingText, { color: theme.colors.text }]}>
                {item.title}
              </Text>
            </View>
            <Icon name="chevron-right" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { backgroundColor: theme.colors.error }]}
        onPress={() => {
          // Handle logout
        }}
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stats: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;