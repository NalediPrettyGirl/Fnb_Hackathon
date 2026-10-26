import { initShell } from '../components/shell.js';
import { adminService } from '../services/admin.js';
import { statCardMarkup } from '../components/stat-card.js';
import { notify } from '../core/toast.js';
import { escapeHtml, formatDate, debounce, emptyState, $ } from '../core/dom.js';

const user = initShell({ active: 'admin' });
const state = { page: 1, totalPages: 1, search: '', role: '' };

async function loadOverview() {
  try {
    const o = await adminService.overview();
    $('#adminOverview').innerHTML = [
      statCardMarkup({ label: 'Users', value: o.users, icon: '👥' }),
      statCardMarkup({ label: 'Gigs', value: o.gigs, icon: '💼', tone: 'green' }),
      statCardMarkup({ label: 'Applications', value: o.applications, icon: '📥' }),
      statCardMarkup({ label: 'Simulations', value: o.simulations, icon: '⭐', tone: 'green' }),
      statCardMarkup({ label: 'Submissions', value: o.submissions, icon: '✓' })
    ].join('');
  } catch (error) {
    $('#adminOverview').innerHTML = emptyState(error.status === 403 ? 'Administrator access required.' : error.message);
    $('.panel').hidden = true;
    throw error;
  }
}

async function loadUsers() {
  try {
    const { users, pagination } = await adminService.users({ search: state.search, role: state.role, page: state.page });
    state.totalPages = pagination.totalPages || 1;
    $('#adminUsersBody').innerHTML = users.length ? users.map(item => `
      <tr data-user-id="${escapeHtml(item._id)}">
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.email)}</td>
        <td>${escapeHtml(item.role)}</td>
        <td>${formatDate(item.createdAt)}</td>
        <td>
          <select class="filter-dropdown" data-role-select aria-label="Role for ${escapeHtml(item.name)}">
            <option value="freelancer" ${item.role === 'freelancer' ? 'selected' : ''}>Freelancer</option>
            <option value="client" ${item.role === 'client' ? 'selected' : ''}>Client</option>
          </select>
        </td>
      </tr>`).join('') : '<tr><td colspan="5">No users found.</td></tr>';
    $('#adminPagination').hidden = state.totalPages <= 1;
    $('#adminPageLabel').textContent = `Page ${state.page} of ${state.totalPages}`;
    $('#adminPrev').disabled = state.page <= 1;
    $('#adminNext').disabled = state.page >= state.totalPages;
  } catch (error) {
    $('#adminUsersBody').innerHTML = `<tr><td colspan="5">${escapeHtml(error.message)}</td></tr>`;
  }
}

$('#adminUsersBody').addEventListener('change', async event => {
  const select = event.target.closest('[data-role-select]');
  if (!select) return;
  try {
    const updated = await adminService.setRole(select.closest('tr').dataset.userId, select.value);
    notify(`${updated.name} is now a ${updated.role}.`, 'success');
    loadUsers();
  } catch (error) {
    notify(error.message, 'error');
    loadUsers();
  }
});
$('#adminSearch').addEventListener('input', debounce(event => { state.search = event.target.value.trim(); state.page = 1; loadUsers(); }));
$('#adminRoleFilter').addEventListener('change', event => { state.role = event.target.value; state.page = 1; loadUsers(); });
$('#adminPrev').addEventListener('click', () => { state.page -= 1; loadUsers(); });
$('#adminNext').addEventListener('click', () => { state.page += 1; loadUsers(); });

if (user) loadOverview().then(loadUsers).catch(() => {});
