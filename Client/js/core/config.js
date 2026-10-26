// Central place for everything that may need changing between environments.

// The backend serves this client, so the API is on the same origin by default.
// To host the client separately, set <meta name="skillbridge-api" content="https://your-api.example.com/api">
// in each page (and add the client's origin to CLIENT_ORIGIN in Server/.env).
const metaApi = document.querySelector('meta[name="skillbridge-api"]')?.content?.trim();
export const API_BASE = (metaApi || '/api').replace(/\/$/, '');

export const STORAGE_KEYS = {
  token: 'skillbridge_token',
  user: 'skillbridge_user',
  adminProbe: 'skillbridge_admin_probe'
};

export const ROLES = { FREELANCER: 'freelancer', CLIENT: 'client' };

// Display-only XP ladder for the sidebar progress bar. The backend stores raw XP only.
export const XP_LEVELS = [
  { name: 'Newcomer', min: 0 },
  { name: 'Junior Analyst', min: 100 },
  { name: 'Associate', min: 300 },
  { name: 'Senior Analyst', min: 600 },
  { name: 'Expert', min: 1000 }
];

export const CURRENCY = { locale: 'en-ZA', symbol: 'R' };

// Maps the guide ids returned by GET /api/guides to the simulation skill tracks they relate to.
export const GUIDE_META = {
  'data-analytics': { icon: '📊', tracks: ['Data Analytics', 'SQL', 'Business Analysis'] },
  'web-development': { icon: '💻', tracks: ['Web Development'] },
  'ui-ux': { icon: '🎨', tracks: ['UI/UX Design'] }
};
