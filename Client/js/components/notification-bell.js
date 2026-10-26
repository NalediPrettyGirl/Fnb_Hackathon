import { notificationService } from '../services/notifications.js';
import { escapeHtml, timeAgo, $ } from '../core/dom.js';
import { routes } from '../core/routes.js';

const TYPE_STYLE = {
  application_received: { icon: '💼', cls: 'green' },
  application_accepted: { icon: '✅', cls: 'green' },
  application_rejected: { icon: '📩', cls: 'terracotta' },
  system: { icon: '🔔', cls: 'sage' }
};

export const bellMarkup = `
  <div class="notif-wrapper">
    <button class="icon-circle-btn" id="notifBellBtn" title="Notifications" aria-haspopup="true" aria-expanded="false">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
        <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
      </svg>
      <span class="notif-badge-dot" id="notifBadgeDot" hidden></span>
    </button>
    <div class="notif-dropdown" id="notifDropdown">
      <div class="notif-dropdown-header">
        <h4>Notifications</h4>
        <button class="btn-text-sm" id="markAllReadBtn" type="button">Mark all read</button>
      </div>
      <ul class="notif-list" id="notifList"><li class="notif-item"><div class="notif-info"><p class="notif-text">Loading…</p></div></li></ul>
      <a class="btn-text-sm full-width" href="${routes.notifications}">View all notifications</a>
    </div>
  </div>`;

export function notificationItemMarkup(item) {
  const style = TYPE_STYLE[item.type] || TYPE_STYLE.system;
  return `
    <li class="notif-item ${item.isRead ? '' : 'unread'}" data-notification-id="${escapeHtml(item._id)}">
      <div class="notif-icon-circle ${style.cls}">${style.icon}</div>
      <div class="notif-info">
        <p class="notif-text"><strong>${escapeHtml(item.title)}</strong> ${escapeHtml(item.message)}</p>
        <span class="notif-time">${escapeHtml(timeAgo(item.createdAt))}</span>
      </div>
    </li>`;
}

export function initNotificationBell() {
  const bell = $('#notifBellBtn');
  const dropdown = $('#notifDropdown');
  const dot = $('#notifBadgeDot');
  const list = $('#notifList');
  if (!bell || !dropdown) return;

  async function refresh() {
    try {
      const { notifications, unreadCount } = await notificationService.list({ limit: 6 });
      dot.hidden = unreadCount === 0;
      list.innerHTML = notifications.length
        ? notifications.map(notificationItemMarkup).join('')
        : '<li class="notif-item"><div class="notif-info"><p class="notif-text">You\'re all caught up.</p></div></li>';
    } catch {
      list.innerHTML = '<li class="notif-item"><div class="notif-info"><p class="notif-text">Notifications are unavailable right now.</p></div></li>';
    }
  }

  bell.addEventListener('click', event => {
    event.stopPropagation();
    const open = dropdown.classList.toggle('show');
    bell.setAttribute('aria-expanded', String(open));
    if (open) refresh();
  });
  document.addEventListener('click', event => {
    if (!dropdown.contains(event.target)) dropdown.classList.remove('show');
  });

  list.addEventListener('click', async event => {
    const item = event.target.closest('[data-notification-id]');
    if (!item || !item.classList.contains('unread')) return;
    try {
      await notificationService.markRead(item.dataset.notificationId);
      item.classList.remove('unread');
      refresh();
    } catch { /* non-critical */ }
  });

  $('#markAllReadBtn')?.addEventListener('click', async () => {
    try { await notificationService.markAllRead(); await refresh(); } catch { /* non-critical */ }
  });

  // Keep the unread dot fresh without a page reload.
  const poll = async () => {
    try { dot.hidden = (await notificationService.list({ limit: 1, unread: true })).unreadCount === 0; }
    catch { /* offline */ }
  };
  poll();
  window.setInterval(poll, 60000);
}
