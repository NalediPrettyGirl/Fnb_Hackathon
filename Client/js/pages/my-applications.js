import { initShell } from '../components/shell.js';
import { applicationService } from '../services/applications.js';
import { statCardMarkup } from '../components/stat-card.js';
import { escapeHtml, formatMoney, formatDate, statusBadge, skillTags, emptyState, $ } from '../core/dom.js';
import { ROLES } from '../core/config.js';

const user = initShell({ active: 'my-applications', roles: [ROLES.FREELANCER] });

function render(applications) {
  const count = status => applications.filter(app => app.status === status).length;
  $('#applicationStats').innerHTML = [
    statCardMarkup({ label: 'Pending', value: count('pending'), icon: '⏳' }),
    statCardMarkup({ label: 'Accepted', value: count('accepted'), icon: '✅', tone: 'green' }),
    statCardMarkup({ label: 'Rejected', value: count('rejected'), icon: '📩' })
  ].join('');

  $('#applicationsList').innerHTML = applications.length
    ? applications.map(app => {
        const gig = app.gigId;
        return `
          <article class="row-card">
            <div>
              <h3>${escapeHtml(gig?.title || 'Gig no longer available')}</h3>
              <p>${gig ? `${escapeHtml(gig.postedBy?.name || 'Client')} • ${formatMoney(gig.budget)} • ` : ''}Applied ${formatDate(app.createdAt)}</p>
              ${gig ? `<div class="gig-tags-group mt-sm">${skillTags(gig.skills)}</div>` : ''}
              ${app.coverNote ? `<div class="cover-note">${escapeHtml(app.coverNote)}</div>` : ''}
            </div>
            <div class="row-actions">${statusBadge(app.status)}</div>
          </article>`;
      }).join('')
    : emptyState('You have not applied to any gigs yet. Browse the Gig Hub to find your first one.');
}

async function load() {
  try { render(await applicationService.mine()); }
  catch (error) { $('#applicationsList').innerHTML = emptyState(error.message); }
}

if (user) load();
