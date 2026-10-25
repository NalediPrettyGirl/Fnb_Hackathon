import { api, escapeHtml, notify } from './api.js';

let gigs = [];
let applications = [];

function renderGigs(items) {
  const grid = document.getElementById('gigsListContainer');
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<p class="api-empty-state">No open gigs found. Seed the database or try another search.</p>';
    return;
  }
  grid.innerHTML = items.map(gig => `
    <article class="gig-card">
      <div class="gig-card-header">
        <div><span class="badge badge-rank">Open opportunity</span><h3>${escapeHtml(gig.title)}</h3></div>
        <strong class="gig-budget">R${Number(gig.budget || 0).toLocaleString('en-ZA')}</strong>
      </div>
      <p>${escapeHtml(gig.description)}</p>
      <div class="gig-tags">${(gig.skills || []).map(skill => `<span class="badge badge-tier">${escapeHtml(skill)}</span>`).join(' ')}</div>
      <div class="gig-card-footer"><span>Posted by ${escapeHtml(gig.postedBy?.name || 'SkillBridge client')}</span>
      <button class="btn btn-primary" type="button" data-apply-gig="${escapeHtml(gig._id)}">Apply</button></div>
    </article>`).join('');
}

export async function loadGigs() {
  const grid = document.getElementById('gigsListContainer');
  try {
    const search = document.getElementById('gigSearchInput')?.value.trim() || '';
    const result = await api(`/gigs?${new URLSearchParams({ search })}`);
    gigs = result.gigs || [];
    renderGigs(gigs);
  } catch (error) {
    if (grid) grid.innerHTML = `<p class="api-empty-state">${escapeHtml(error.message)}</p>`;
  }
}

export async function loadApplications() {
  try {
    const result = await api('/applications/me');
    applications = result.applications || [];
    const count = document.getElementById('myProposalsCount');
    if (count) count.textContent = String(applications.length);
  } catch { /* Client accounts may have no freelancer application view. */ }
}

export function initGigs() {
  document.getElementById('gigsListContainer')?.addEventListener('click', async event => {
    const button = event.target.closest('[data-apply-gig]');
    if (!button) return;
    const gig = gigs.find(item => item._id === button.dataset.applyGig);
    if (!gig) return;
    const coverNote = window.prompt(`Write a short application note for "${gig.title}":`);
    if (coverNote === null) return;
    button.disabled = true;
    try {
      await api(`/gigs/${gig._id}/apply`, { method: 'POST', body: JSON.stringify({ coverNote }) });
      notify('Application submitted successfully.', 'success');
      await loadApplications();
    } catch (error) { notify(error.message, 'error'); }
    finally { button.disabled = false; }
  });
  document.getElementById('gigSearchInput')?.addEventListener('input', debounce(loadGigs, 300));
  document.getElementById('myProposalsBtn')?.addEventListener('click', async () => {
    await loadApplications();
    const summary = applications.length
      ? applications.map(app => `${app.gigId?.title || 'Gig'} — ${app.status}`).join('\n')
      : 'You have not submitted any applications yet.';
    window.alert(summary);
  });
}

function debounce(fn, wait) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
}
