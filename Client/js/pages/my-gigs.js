import { initShell } from '../components/shell.js';
import { gigService } from '../services/gigs.js';
import { gigCardMarkup } from '../components/cards.js';
import { routes } from '../core/routes.js';
import { notify } from '../core/toast.js';
import { ROLES } from '../core/config.js';
import { escapeHtml, emptyState, $ } from '../core/dom.js';

const user = initShell({ active: 'my-gigs', roles: [ROLES.CLIENT] });
let gigs = [];

function actions(gig) {
  const id = escapeHtml(gig._id);
  return `
    <a class="btn btn-primary-sm" href="${routes.gigApplicants}?gigId=${id}">Applicants</a>
    <a class="btn btn-secondary-sm" href="${routes.postGig}?id=${id}">Edit</a>
    <button class="btn btn-secondary-sm" type="button" data-toggle-status="${id}">${gig.status === 'open' ? 'Close' : 'Re-open'}</button>
    <button class="btn btn-secondary-sm btn-danger" type="button" data-delete-gig="${id}">Delete</button>`;
}

function render() {
  $('#myGigsList').innerHTML = gigs.length
    ? gigs.map(gig => gigCardMarkup(gig, { status: true, actions: actions(gig) })).join('')
    : emptyState('You have not posted any gigs yet. Use “Post a Gig” to create your first one.');
}

async function load() {
  try { gigs = await gigService.listMine(user.id); render(); }
  catch (error) { $('#myGigsList').innerHTML = emptyState(error.message); }
}

$('#myGigsList').addEventListener('click', async event => {
  const toggle = event.target.closest('[data-toggle-status]');
  const remove = event.target.closest('[data-delete-gig]');
  try {
    if (toggle) {
      const gig = gigs.find(item => item._id === toggle.dataset.toggleStatus);
      const updated = await gigService.setStatus(gig._id, gig.status === 'open' ? 'closed' : 'open');
      gigs = gigs.map(item => (item._id === updated._id ? updated : item));
      notify(`Gig ${updated.status}.`, 'success');
      render();
    } else if (remove) {
      const gig = gigs.find(item => item._id === remove.dataset.deleteGig);
      if (!window.confirm(`Delete “${gig.title}”? This cannot be undone.`)) return;
      await gigService.remove(gig._id);
      gigs = gigs.filter(item => item._id !== gig._id);
      notify('Gig deleted.', 'success');
      render();
    }
  } catch (error) {
    // e.g. 409 when a gig already has applications and can only be closed.
    notify(error.message, 'error');
  }
});

if (user) load();
