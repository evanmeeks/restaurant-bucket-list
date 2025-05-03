/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  createdAt: number;
  lastLogin: number;
  preferences?: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  darkMode?: boolean;
  defaultRadius?: number;
  defaultCategories?: string[];
  emailNotifications?: boolean;
  pushNotifications?: boolean;
}
