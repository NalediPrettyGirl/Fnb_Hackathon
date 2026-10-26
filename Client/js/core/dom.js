import { CURRENCY } from './config.js';

export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

export function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

export function formatMoney(amount) {
  return `${CURRENCY.symbol}${Number(amount || 0).toLocaleString(CURRENCY.locale)}`;
}

export function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString(CURRENCY.locale, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function timeAgo(value) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (!Number.isFinite(seconds)) return '';
  if (seconds < 60) return 'Just now';
  const steps = [[60, 'min'], [3600, 'hour'], [86400, 'day']];
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hour${seconds >= 7200 ? 's' : ''} ago`;
  if (seconds < 86400 * 30) return `${Math.floor(seconds / 86400)} day${seconds >= 172800 ? 's' : ''} ago`;
  return formatDate(value);
}

export function initials(name = '') {
  return String(name).trim().split(/\s+/).filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || 'SB';
}

export function debounce(fn, wait = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
}

export function emptyState(message) {
  return `<p class="api-empty-state">${escapeHtml(message)}</p>`;
}

export function setBusy(button, busy, busyLabel) {
  if (!button) return;
  if (busy) {
    button.dataset.label = button.textContent;
    if (busyLabel) button.textContent = busyLabel;
  } else if (button.dataset.label) {
    button.textContent = button.dataset.label;
  }
  button.disabled = busy;
}

export function statusBadge(status) {
  const labels = { pending: 'Pending', accepted: 'Accepted', rejected: 'Rejected', open: 'Open', closed: 'Closed' };
  return `<span class="status-chip status-${escapeHtml(status)}">${escapeHtml(labels[status] || status)}</span>`;
}

export function skillTags(skills = []) {
  return skills.map(skill => `<span class="tag-badge">${escapeHtml(skill)}</span>`).join('');
}

export function readQuery(name) {
  return new URLSearchParams(window.location.search).get(name);
}
