import { api, escapeHtml } from './api.js';

export async function loadDashboard() {
  try {
    const data = await api('/dashboard');
    const user = data.user || {};
    const name = user.name || 'SkillBridge member';
    const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    document.querySelectorAll('.user-name').forEach(node => node.textContent = name);
    document.querySelectorAll('.user-avatar').forEach(node => node.textContent = initials);
    const xp = document.getElementById('dashWeekXp');
    const streak = document.getElementById('dashStreakDays');
    const tasks = document.getElementById('dashTasksCompleted');
    if (xp) xp.textContent = String(data.xp ?? 0);
    const xpLabel = xp?.closest('.stat-body')?.querySelector('.stat-label');
    if (xpLabel) xpLabel.textContent = 'Total XP';
    const xpDelta = xp?.parentElement?.querySelector('.stat-delta');
    if (xpDelta) xpDelta.textContent = 'All-time';
    if (streak) streak.textContent = '—';
    if (tasks) tasks.textContent = String(data.completedTasks ?? 0);
    const count = document.getElementById('portfolioCount');
    if (count) count.textContent = String(data.completedTasks ?? 0);
  } catch (error) {
    const status = document.getElementById('apiStatusMessage');
    if (status) status.textContent = error.message;
  }
}
