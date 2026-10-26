import { STORAGE_KEYS } from './config.js';

export const session = {
  get token() { return localStorage.getItem(STORAGE_KEYS.token); },
  get user() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.user) || 'null'); }
    catch { return null; }
  },
  get isLoggedIn() { return Boolean(this.token && this.user); },
  save({ token, user }) {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    sessionStorage.removeItem(STORAGE_KEYS.adminProbe);
  },
  updateUser(patch) {
    const user = this.user;
    if (user) localStorage.setItem(STORAGE_KEYS.user, JSON.stringify({ ...user, ...patch }));
  },
  clear() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    sessionStorage.removeItem(STORAGE_KEYS.adminProbe);
  }
};
