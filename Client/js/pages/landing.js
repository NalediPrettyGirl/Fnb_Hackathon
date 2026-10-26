import { gigService } from '../services/gigs.js';
import { guideService } from '../services/guides.js';
import { session } from '../core/session.js';
import { routes } from '../core/routes.js';
import { GUIDE_META } from '../core/config.js';
import { escapeHtml, formatMoney, skillTags, emptyState, $ } from '../core/dom.js';

$('#year').textContent = new Date().getFullYear();

// Signed-in visitors get a shortcut to the app instead of the sign-up buttons.
if (session.isLoggedIn) {
  $('#landingActions').innerHTML = `<a class="btn btn-primary-sm" href="${routes.dashboard}">Open dashboard</a>`;
}

async function loadGigs() {
  const box = $('#liveGigs');
  try {
    const { gigs } = await gigService.list({ limit: 6 });
    box.innerHTML = gigs.length
      ? gigs.map(gig => `
          <article class="live-gig">
            <div class="gig-top-row">
              <h3>${escapeHtml(gig.title)}</h3>
              <span class="budget">${formatMoney(gig.budget)}</span>
            </div>
            <p>${escapeHtml(gig.description.length > 140 ? `${gig.description.slice(0, 140)}…` : gig.description)}</p>
            <div class="tags">${skillTags(gig.skills.slice(0, 4))}</div>
          </article>`).join('')
      : emptyState('No open gigs right now. Check back soon, or create an account to post one.');
  } catch {
    box.innerHTML = emptyState('Gigs are unavailable right now. Please try again shortly.');
  }
}

async function loadTracks() {
  const box = $('#liveTracks');
  try {
    const guides = await guideService.list();
    box.innerHTML = guides.length
      ? guides.map(guide => `
          <article class="track-pill-card">
            <div class="emoji">${GUIDE_META[guide.id]?.icon || '📘'}</div>
            <h3>${escapeHtml(guide.title)}</h3>
            <p>${guide.steps.length} steps — from ${escapeHtml(guide.steps[0].toLowerCase())} to ${escapeHtml(guide.steps[guide.steps.length - 1].toLowerCase())}.</p>
          </article>`).join('')
      : emptyState('Track guides are coming soon.');
  } catch {
    box.innerHTML = emptyState('Track guides are unavailable right now.');
  }
}

loadGigs();
loadTracks();
