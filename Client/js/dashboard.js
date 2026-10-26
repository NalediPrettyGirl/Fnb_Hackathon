import { api } from './api.js';

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = String(value ?? 0);
}

function updateUserDetails(user = {}) {
  const name = user.name || 'SkillBridge member';

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map(part => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  document.querySelectorAll('.user-name').forEach(node => {
    node.textContent = name;
  });

  document.querySelectorAll('.user-avatar').forEach(node => {
    node.textContent = initials;
  });
}

function updateDashboardStats(data = {}) {
  const xp = document.getElementById('dashWeekXp');
  const tasks = document.getElementById('dashTasksCompleted');

  setText('dashWeekXp', data.xp ?? 0);
  setText('dashTasksCompleted', data.completedTasks ?? 0);
  setText('portfolioCount', data.completedTasks ?? 0);

  const xpLabel = xp?.closest('.stat-body')?.querySelector('.stat-label');
  if (xpLabel) xpLabel.textContent = 'Total XP';

  const xpDelta = xp?.parentElement?.querySelector('.stat-delta');
  if (xpDelta) xpDelta.textContent = 'All-time';

  // The backend does not currently provide streak data.
  setText('dashStreakDays', '—');

  // Display application counts if those elements exist in the HTML.
  setText('dashApplicationsCount', data.applicationCount ?? 0);
  setText('dashPendingApplications', data.pendingApplications ?? 0);
}

function showDashboardError(message) {
  const status = document.getElementById('apiStatusMessage');

  if (status) {
    status.textContent = message;
  }
}

export async function loadDashboard() {
  const status = document.getElementById('apiStatusMessage');

  if (status) {
    status.textContent = 'Loading your dashboard...';
  }

  try {
    const data = await api('/dashboard');

    updateUserDetails(data.user || {});
    updateDashboardStats(data);

    if (status) {
      status.textContent = '';
    }

    window.dispatchEvent(
      new CustomEvent('skillbridge:dashboard-loaded', {
        detail: data
      })
    );

    return data;
  } catch (error) {
    showDashboardError(
      error.message || 'Unable to load your dashboard. Please try again.'
    );

    return null;
  }
}

// Keep the dashboard UI synchronized when the user signs out.
window.addEventListener('skillbridge:logged-out', () => {
  setText('dashWeekXp', 0);
  setText('dashTasksCompleted', 0);
  setText('portfolioCount', 0);
  setText('dashStreakDays', '—');
  setText('dashApplicationsCount', 0);
  setText('dashPendingApplications', 0);
});
