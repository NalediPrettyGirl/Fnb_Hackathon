import { initShell } from '../components/shell.js';
import { applicationService } from '../services/applications.js';
import { routes } from '../core/routes.js';
import { notify } from '../core/toast.js';
import { ROLES } from '../core/config.js';
import { escapeHtml, formatDate, statusBadge, emptyState, readQuery, $ } from '../core/dom.js';

const user = initShell({ active: 'my-gigs', roles: [ROLES.CLIENT] });
const gigId = readQuery('gigId');
let applications = [];

function render() {
  $('#applicantsList').innerHTML = applications.length
    ? applications.map(app => `
        <article class="row-card" data-application-id="${escapeHtml(app._id)}">
          <div class="row-main">
            <h3>${escapeHtml(app.userId?.name || 'Freelancer')}</h3>
            <p>${escapeHtml(app.userId?.email || '')} • Applied ${formatDate(app.createdAt)}</p>
            <div class="cover-note">${app.coverNote ? escapeHtml(app.coverNote) : 'No cover note provided.'}</div>
          </div>
          <div class="row-actions">
            ${statusBadge(app.status)}
            ${app.status === 'pending' ? `
              <button class="btn btn-primary-sm" type="button" data-decide="accepted">Accept</button>
              <button class="btn btn-secondary-sm btn-danger" type="button" data-decide="rejected">Reject</button>` : ''}
          </div>
        </article>`).join('')
    : emptyState('No applications yet. Share your gig to attract freelancers.');
}

async function load() {
  if (!gigId) { window.location.replace(routes.myGigs); return; }
  try {
    const result = await applicationService.forGig(gigId);
    applications = result.applications;
    $('#applicantsGigTitle').textContent = `${result.gig.title} — ${result.count} applicant${result.count === 1 ? '' : 's'}`;
    render();
  } catch (error) {
    $('#applicantsList').innerHTML = emptyState(error.message);
  }
}

$('#applicantsList').addEventListener('click', async event => {
  const button = event.target.closest('[data-decide]');
  if (!button) return;
  const id = button.closest('[data-application-id]').dataset.applicationId;
  button.disabled = true;
  try {
    const updated = await applicationService.setStatus(id, button.dataset.decide);
    applications = applications.map(app => (app._id === id ? { ...app, status: updated.status } : app));
    notify(`Application ${updated.status}.`, 'success');
    render();
  } catch (error) {
    notify(error.message, 'error');
    button.disabled = false;
  }
});

if (user) load();
