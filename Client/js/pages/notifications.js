import { initShell } from '../components/shell.js';
import { notificationService } from '../services/notifications.js';
import { notificationItemMarkup } from '../components/notification-bell.js';
import { notify } from '../core/toast.js';
import { $ } from '../core/dom.js';

const user = initShell({ active: 'notifications' });
const state = { page: 1, totalPages: 1, unread: false };

async function load() {
  const list = $('#notificationsList');
  try {
    const result = await notificationService.list({ page: state.page, unread: state.unread, limit: 15 });
    state.totalPages = result.totalPages || 1;
    list.innerHTML = result.notifications.length
      ? result.notifications.map(notificationItemMarkup).join('')
      : '<li class="notif-item"><div class="notif-info"><p class="notif-text">No notifications to show.</p></div></li>';
    $('#notifPagination').hidden = state.totalPages <= 1;
    $('#notifPageLabel').textContent = `Page ${state.page} of ${state.totalPages}`;
    $('#notifPrev').disabled = state.page <= 1;
    $('#notifNext').disabled = state.page >= state.totalPages;
  } catch (error) {
    list.innerHTML = `<li class="notif-item"><div class="notif-info"><p class="notif-text">${error.message}</p></div></li>`;
  }
}

$('#notificationsList').addEventListener('click', async event => {
  const item = event.target.closest('[data-notification-id]');
  if (!item?.classList.contains('unread')) return;
  try { await notificationService.markRead(item.dataset.notificationId); item.classList.remove('unread'); }
  catch (error) { notify(error.message, 'error'); }
});
$('#markAllBtn').addEventListener('click', async () => {
  try { await notificationService.markAllRead(); notify('All notifications marked as read.', 'success'); load(); }
  catch (error) { notify(error.message, 'error'); }
});
$('#unreadOnly').addEventListener('change', event => { state.unread = event.target.checked; state.page = 1; load(); });
$('#notifPrev').addEventListener('click', () => { state.page -= 1; load(); });
$('#notifNext').addEventListener('click', () => { state.page += 1; load(); });

if (user) load();
