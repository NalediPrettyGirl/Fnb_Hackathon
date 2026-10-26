
// Central API configuration
export const API_BASE = 'https://skillbridge-hackathon-api.onrender.com/api';

export const STORAGE_KEYS = {
  token: 'skillbridge_token',
  user: 'skillbridge_user',
  adminProbe: 'skillbridge_admin_probe'
};

export const ROLES = {
  FREELANCER: 'freelancer',
  CLIENT: 'client'
};

// Display-only XP ladder
export const XP_LEVELS = [
  { name: 'Newcomer', min: 0 },
  { name: 'Junior Analyst', min: 100 },
  { name: 'Associate', min: 300 },
  { name: 'Senior Analyst', min: 600 },
  { name: 'Expert', min: 1000 }
];

export const CURRENCY = {
  locale: 'en-ZA',
  symbol: 'R'
};

export const GUIDE_META = {
  'data-analytics': {
    icon: '📊',
    tracks: ['Data Analytics', 'SQL', 'Business Analysis']
  },
  'web-development': {
    icon: '💻',
    tracks: ['Web Development']
  },
  'ui-ux': {
    icon: '🎨',
    tracks: ['UI/UX Design']
  }
};
