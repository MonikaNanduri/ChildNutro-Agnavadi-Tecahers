export const PALETTE = {
  health: '#A8E6CF',
  trust: '#A0C4FF',
  energy: '#FFD6A5',
  background: '#FFFFFF',
  text: '#2D3436',
  severe: '#FF6B6B',
  moderate: '#FFD93D',
  healthy: '#6BCB77',
};

export const GROWTH_DATA: any = {
  BOYS: {
    2: { h: [85, 91], minW: 10.5, maxW: 15.5 },
    3: { h: [94, 101], minW: 12.5, maxW: 18 },
    4: { h: [100, 108], minW: 13.5, maxW: 21 },
    5: { h: [106, 113], minW: 15, maxW: 24 },
    6: { h: [116, 130], minW: 18, maxW: 34 },
    7: { h: [116, 130], minW: 18, maxW: 34 },
    8: { h: [116, 130], minW: 19, maxW: 36 },
    9: { h: [132, 150], minW: 25, maxW: 52 },
    10: { h: [132, 150], minW: 25, maxW: 52 },
    11: { h: [132, 150], minW: 25, maxW: 52 },
    12: { h: [132, 150], minW: 25, maxW: 52 },
  },
  GIRLS: {
    2: { h: [84, 90], minW: 10, maxW: 15 },
    3: { h: [92, 100], minW: 11.5, maxW: 17.5 },
    4: { h: [98, 105], minW: 13, maxW: 20 },
    5: { h: [104, 110], minW: 14.5, maxW: 23.5 },
    6: { h: [115, 128], minW: 17, maxW: 32 },
    7: { h: [115, 128], minW: 17, maxW: 32 },
    8: { h: [115, 128], minW: 18, maxW: 34 },
    9: { h: [130, 150], minW: 24, maxW: 50 },
    10: { h: [130, 150], minW: 24, maxW: 50 },
    11: { h: [130, 150], minW: 24, maxW: 50 },
    12: { h: [130, 150], minW: 24, maxW: 50 },
  }
};

export const BMI_CATEGORIES = {
  UNDERWEIGHT: {
    label: 'Underweight',
    color: '#FFD93D',
    icon: '😟',
    suggestions: [
      { food: 'Whole Milk', emoji: '🥛' },
      { food: 'Boiled Eggs', emoji: '🥚' },
      { food: 'Bananas', emoji: '🍌' },
      { food: 'Rice & Dal', emoji: '🍚' },
      { food: 'Peanut Butter', emoji: '🥜' },
    ],
    alert: 'Child needs attention and nutrition rich diet.'
  },
  NORMAL: {
    label: 'Normal',
    color: '#6BCB77',
    icon: '😊',
    suggestions: [
      { food: 'Balanced Diet', emoji: '🥗' },
      { food: 'Fresh Fruits', emoji: '🍎' },
      { food: 'Green Vegetables', emoji: '🥦' },
      { food: 'Daily Exercise', emoji: '🏃' },
    ],
    alert: 'Healthy growth! Maintain this lifestyle.'
  },
  OVERWEIGHT: {
    label: 'Overweight',
    color: '#FF6B6B',
    icon: '⚠️',
    suggestions: [
      { food: 'More Vegetables', emoji: '🥦' },
      { food: 'Reduce Junk Food', emoji: '🍟' },
      { food: 'Avoid Sugary Drinks', emoji: '🍩' },
      { food: 'Active Playtime', emoji: '⚽' },
    ],
    alert: 'Caution! Child needs more activity and less sugar.'
  }
};

export const calculateBMI = (weight: number, heightCm: number) => {
  const heightM = heightCm / 100;
  return Number((weight / (heightM * heightM)).toFixed(2));
};

export const checkHealthStatus = (age: number, gender: string, height: number, weight: number) => {
  const dataset = gender.toLowerCase() === 'male' ? GROWTH_DATA.BOYS : GROWTH_DATA.GIRLS;
  const config = dataset[age];
  
  if (!config) return { status: 'Normal', warning: false }; // Fallback

  let status = 'Normal';
  const heightWarning = height < config.h[0] || height > config.h[1];
  
  if (weight < config.minW) status = 'Underweight';
  else if (weight > config.maxW) status = 'Overweight';

  return { status, heightWarning };
};
