import { theme } from '../theme';

/**
 * Restaurant categories based on Foursquare taxonomy
 * Each category has:
 * - id: Foursquare category ID
 * - name: Display name
 * - icon: Material icon name
 * - color: Brand color (optional)
 */
export const categories = [
  {
    id: '13065',
    name: 'Restaurant',
    icon: 'restaurant',
    color: theme.colors.primary,
  },
  {
    id: '13034',
    name: 'Cafe',
    icon: 'local-cafe',
    color: '#8D6E63',
  },
  {
    id: '13003',
    name: 'Bar',
    icon: 'local-bar',
    color: '#7B1FA2',
  },
  {
    id: '13145',
    name: 'Fast Food',
    icon: 'fastfood',
    color: '#F57C00',
  },
  {
    id: '13350',
    name: 'Pizza',
    icon: 'local-pizza',
    color: '#D32F2F',
  },
  {
    id: '13274',
    name: 'Breakfast',
    icon: 'free-breakfast',
    color: '#FFA000',
  },
  {
    id: '13072',
    name: 'Asian',
    icon: 'restaurant',
    color: '#00897B',
  },
  {
    id: '13236',
    name: 'Mexican',
    icon: 'restaurant',
    color: '#E64A19',
  },
  {
    id: '13005',
    name: 'Bakery',
    icon: 'cake',
    color: '#AD1457',
  },
  {
    id: '13285',
    name: 'American',
    icon: 'restaurant',
    color: '#0277BD',
  },
  {
    id: '13070',
    name: 'Italian',
    icon: 'restaurant',
    color: '#558B2F',
  },
  {
    id: '13074',
    name: 'Chinese',
    icon: 'restaurant',
    color: '#EF5350',
  },
  {
    id: '13265',
    name: 'Japanese',
    icon: 'restaurant',
    color: '#3949AB',
  },
  {
    id: '13199',
    name: 'Indian',
    icon: 'restaurant',
    color: '#FB8C00',
  },
  {
    id: '13080',
    name: 'Thai',
    icon: 'restaurant',
    color: '#AFB42B',
  },
  {
    id: '13142',
    name: 'Seafood',
    icon: 'set-meal',
    color: '#0097A7',
  },
  {
    id: '13303',
    name: 'Vegetarian',
    icon: 'eco',
    color: '#43A047',
  },
  {
    id: '13193',
    name: 'BBQ',
    icon: 'outdoor-grill',
    color: '#BF360C',
  },
  {
    id: '13377',
    name: 'Steakhouse',
    icon: 'restaurant',
    color: '#6D4C41',
  },
  {
    id: '13053',
    name: 'Food Truck',
    icon: 'local-shipping',
    color: '#607D8B',
  },
  {
    id: '13291',
    name: 'Dessert',
    icon: 'icecream',
    color: '#D81B60',
  },
  {
    id: '13339',
    name: 'Wine Bar',
    icon: 'wine-bar',
    color: '#8E24AA',
  },
  {
    id: '13375',
    name: 'Brewery',
    icon: 'sports-bar',
    color: '#5D4037',
  },
  {
    id: '13263',
    name: 'Sushi',
    icon: 'restaurant',
    color: '#00ACC1',
  },
];

/**
 * Find a category by ID
 */
export const getCategoryById = (id: string) => {
  return categories.find(category => category.id === id);
};

/**
 * Get a subset of categories
 */
export const getCategoriesSubset = (ids: string[]) => {
  return categories.filter(category => ids.includes(category.id));
};

/**
 * Get categories grouped by type
 */
export const getCategoriesGrouped = () => {
  const groups = [
    {
      title: 'Popular',
      data: categories.slice(0, 6),
    },
    {
      title: 'Cuisine Types',
      data: categories.filter(c => 
        ['Asian', 'Mexican', 'American', 'Italian', 'Chinese', 'Japanese', 'Indian', 'Thai'].includes(c.name)
      ),
    },
    {
      title: 'Meal Types',
      data: categories.filter(c => 
        ['Breakfast', 'Fast Food', 'Seafood', 'BBQ', 'Steakhouse', 'Dessert'].includes(c.name)
      ),
    },
    {
      title: 'Drinks & Others',
      data: categories.filter(c => 
        ['Cafe', 'Bar', 'Wine Bar', 'Brewery'].includes(c.name)
      ),
    },
  ];
  
  return groups;
};
