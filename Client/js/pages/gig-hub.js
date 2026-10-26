import { initShell } from '../components/shell.js';
import { gigService } from '../services/gigs.js';
import { skillMatchService } from '../services/skill-match.js';
import { gigCardMarkup } from '../components/cards.js';
import { openModal, closeModal } from '../core/modal.js';
import { notify } from '../core/toast.js';
import { ROLES } from '../core/config.js';
import { escapeHtml, formatMoney, emptyState, debounce, setBusy, readQuery, $ } from '../core/dom.js';

const user = initShell({ active: 'gig-hub' });
const isFreelancer = user?.role === ROLES.FREELANCER;

const state = { page: 1, totalPages: 1, search: readQuery('search') || '', gigs: [], applying: null, matches: new Map() };

function actionsFor(gig) {
  if (isFreelancer) return `<button class="btn btn-primary" type="button" data-apply-gig="${escapeHtml(gig._id)}">Apply</button>`;
  if (String(gig.postedBy?._id) === String(user.id)) return `<a class="btn btn-secondary-sm" href="gig-applicants.html?gigId=${encodeURIComponent(gig._id)}">View applicants</a>`;
  return '';
}

function render() {
  $('#gigsListContainer').innerHTML = state.gigs.length
    ? state.gigs.map(gig => gigCardMarkup(gig, { actions: actionsFor(gig), match: state.matches.get(gig._id) })).join('')
    : emptyState(state.search ? `No open gigs match “${state.search}”.` : 'No open gigs yet. Check back soon.');
  $('#gigPagination').hidden = state.totalPages <= 1;
  $('#gigPageLabel').textContent = `Page ${state.page} of ${state.totalPages}`;
  $('#gigPrev').disabled = state.page <= 1;
  $('#gigNext').disabled = state.page >= state.totalPages;
}

async function load() {
  try {
    const result = await gigService.list({ search: state.search, page: state.page, limit: 10 });
    state.gigs = result.gigs;
    state.totalPages = result.totalPages || 1;
    $('#gigCount').textContent = `${result.total} open gig${result.total === 1 ? '' : 's'}`;
    render();
  } catch (error) {
    $('#gigsListContainer').innerHTML = emptyState(error.message);
  }
}

/** Skill-match percentages are optional extras; the hub works without them. */
async function loadMatches() {
  if (!isFreelancer) return;
  try {
    const { matches } = await skillMatchService.mine();
    state.matches = new Map(matches.map(item => [item.gig._id, item]));
    render();
  } catch { /* ignore */ }
}

function openApply(gig) {
  state.applying = gig;
  $('#applyModalTitle').textContent = `Apply: ${gig.title}`;
  $('#applyModalSubtitle').textContent = `Client: ${gig.postedBy?.name || 'SkillBridge client'} • Budget: ${formatMoney(gig.budget)}`;
  $('#applyCoverNote').value = '';
  const match = state.matches.get(gig._id);
  const banner = $('#applyMatchBanner');
  banner.hidden = !(match && match.matchPercentage !== null);
  if (!banner.hidden) {
    $('#applyMatchScore').textContent = `${match.matchPercentage}% Match`;
    $('#applyMatchDesc').textContent = match.matchedSkills.length
      ? `Your completed simulations cover: ${match.matchedSkills.join(', ')}.`
      : 'Complete simulations in the matching tracks to strengthen your application.';
  }
  openModal('applyModal');
}

if (user) {
  $('#gigSearchInput').value = state.search;
  $('#myApplicationsLink').hidden = !isFreelancer;
  $('#postGigLink').hidden = isFreelancer;

  $('#gigSearchInput').addEventListener('input', debounce(event => {
    state.search = event.target.value.trim();
    state.page = 1;
    load();
  }, 300));
  $('#gigPrev').addEventListener('click', () => { state.page -= 1; load(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  $('#gigNext').addEventListener('click', () => { state.page += 1; load(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  $('#gigsListContainer').addEventListener('click', event => {
    const button = event.target.closest('[data-apply-gig]');
    const gig = button && state.gigs.find(item => item._id === button.dataset.applyGig);
    if (gig) openApply(gig);
  });

  $('#applyForm').addEventListener('submit', async event => {
    event.preventDefault();
    if (!state.applying) return;
    const button = $('#applySubmitBtn');
    setBusy(button, true, 'Sending…');
    try {
      await gigService.apply(state.applying._id, $('#applyCoverNote').value.trim());
      notify('Application submitted successfully.', 'success');
      closeModal('applyModal');
      state.applying = null;
    } catch (error) {
      notify(error.message, 'error');
    } finally {
      setBusy(button, false);
    }
  });

  load();
  loadMatches();
}
