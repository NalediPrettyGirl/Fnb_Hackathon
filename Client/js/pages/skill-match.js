import { initShell } from '../components/shell.js';
import { skillMatchService } from '../services/skill-match.js';
import { gigCardMarkup } from '../components/cards.js';
import { routes } from '../core/routes.js';
import { escapeHtml, skillTags, emptyState, $ } from '../core/dom.js';
import { ROLES } from '../core/config.js';

const user = initShell({ active: 'skill-match', roles: [ROLES.FREELANCER] });

function render({ summary, matches }) {
  $('#matchSummary').innerHTML = `
    <h3>Your skill evidence</h3>
    <p class="view-subtitle">${summary.completedSimulations} completed simulation${summary.completedSimulations === 1 ? '' : 's'} •
      ${summary.eligibleGigs} gig${summary.eligibleGigs === 1 ? '' : 's'} you can still apply to</p>
    <div class="gig-tags-group mt-sm">
      ${summary.evidenceTracks.length ? skillTags(summary.evidenceTracks) : '<span class="card-meta">No tracks yet — complete a simulation to start matching.</span>'}
    </div>`;

  $('#matchList').innerHTML = matches.length
    ? matches.map(item => gigCardMarkup(item.gig, {
        match: item,
        actions: `<a class="btn btn-primary" href="${routes.gigHub}?search=${encodeURIComponent(item.gig.title)}">View &amp; apply</a>`
      })).join('')
    : emptyState('No open gigs to match right now. You may have already applied to all of them.');
}

async function load() {
  try { render(await skillMatchService.mine()); }
  catch (error) { $('#matchList').innerHTML = emptyState(error.message); }
}

if (user) load();
