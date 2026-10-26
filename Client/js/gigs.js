import { api, session, escapeHtml, notify } from './api.js';

let gigs = [];
let applications = [];
let initialized = false;

function getList(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  if (!payload || typeof payload !== 'object') return [];

  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  return [];
}

function getGigList(response) {
  // Your controller wraps the service result in { success: true, data: ... }.
  const data = response?.data;

  return getList(data, ['gigs', 'items', 'results'])
    .concat(
      Array.isArray(data) || !data ? [] : []
    ).length >= 0
    ? (
        Array.isArray(data)
          ? data
          : getList(data, ['gigs', 'items', 'results']).length
            ? getList(data, ['gigs', 'items', 'results'])
            : getList(response, ['gigs', 'items', 'results'])
      )
    : [];
}

function getApplicationList(response) {
  if (Array.isArray(response?.applications)) {
    return response.applications;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.applications)) {
    return response.data.applications;
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items;
  }

  return [];
}

function renderGigs(items) {
  const grid = document.getElementById('gigsListContainer');
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <p class="api-empty-state">
        No open gigs found. Try another search or check back later.
      </p>`;
    return;
  }

  grid.innerHTML = items.map(gig => {
    const id = escapeHtml(gig._id || gig.id || '');
    const title = escapeHtml(gig.title || 'Untitled gig');
    const description = escapeHtml(gig.description || 'No description provided.');
    const budget = Number(gig.budget || 0);
    const skills = Array.isArray(gig.skills) ? gig.skills : [];
    const posterName = escapeHtml(gig.postedBy?.name || 'SkillBridge client');

    return `
      <article class="gig-card">
        <div class="gig-card-header">
          <div>
            <span class="badge badge-rank">Open opportunity</span>
            <h3>${title}</h3>
          </div>
          <strong class="gig-budget">
            R${Number.isFinite(budget) ? budget.toLocaleString('en-ZA') : '0'}
          </strong>
        </div>

        <p>${description}</p>

        <div class="gig-tags">
          ${skills.map(skill =>
            `<span class="badge badge-tier">${escapeHtml(skill)}</span>`
          ).join(' ')}
        </div>

        <div class="gig-card-footer">
          <span>Posted by ${posterName}</span>
          <button
            class="btn btn-primary"
            type="button"
            data-apply-gig="${id}"
            ${id ? '' : 'disabled'}
          >
            Apply
          </button>
        </div>
      </article>`;
  }).join('');
}

function showGigError(message) {
  const grid = document.getElementById('gigsListContainer');
  if (grid) {
    grid.innerHTML = `<p class="api-empty-state">${escapeHtml(message)}</p>`;
  }
}

export async function loadGigs() {
  const grid = document.getElementById('gigsListContainer');

  if (grid) {
    grid.innerHTML = '<p class="api-empty-state">Loading gigs...</p>';
  }

  try {
    const search = document.getElementById('gigSearchInput')?.value.trim() || '';
    const query = new URLSearchParams();

    if (search) query.set('search', search);

    const response = await api(`/gigs${query.toString() ? `?${query}` : ''}`);

    gigs = getGigList(response);
    renderGigs(gigs);

    return gigs;
  } catch (error) {
    gigs = [];
    showGigError(error.message || 'Unable to load gigs. Please try again.');
    return [];
  }
}

export async function loadApplications() {
  try {
    const response = await api('/applications/me');

    applications = getApplicationList(response);

    const count = document.getElementById('myProposalsCount');
    if (count) count.textContent = String(applications.length);

    return applications;
  } catch (error) {
    applications = [];

    const count = document.getElementById('myProposalsCount');
    if (count) count.textContent = '0';

    // Clients are not permitted to use the freelancer's /applications/me route.
    if (session.user?.role === 'freelancer') {
      notify(error.message || 'Unable to load your applications.', 'error');
    }

    return [];
  }
}

async function applyToGig(button) {
  const gigId = button.dataset.applyGig;
  const gig = gigs.find(item => String(item._id || item.id) === gigId);

  if (!gig) {
    notify('This gig could not be found. Refresh the list and try again.', 'error');
    return;
  }

  const user = session.user;

  if (!session.token || !user) {
    notify('Please log in before applying for a gig.', 'error');
    window.dispatchEvent(new CustomEvent('skillbridge:auth-required'));
    return;
  }

  if (user.role !== 'freelancer') {
    notify('Only freelancer accounts can apply for gigs.', 'error');
    return;
  }

  const coverNote = window.prompt(
    `Write a short application note for "${gig.title}".`
  );

  if (coverNote === null) return;

  button.disabled = true;

  try {
    await api(`/gigs/${encodeURIComponent(gigId)}/apply`, {
      method: 'POST',
      body: JSON.stringify({ coverNote: coverNote.trim() })
    });

    notify('Application submitted successfully.', 'success');
    await loadApplications();
  } catch (error) {
    notify(error.message || 'Unable to submit your application.', 'error');
  } finally {
    button.disabled = false;
  }
}

function showMyApplications() {
  if (!applications.length) {
    window.alert('You have not submitted any applications yet.');
    return;
  }

  const summary = applications.map(application => {
    const gig = application.gigId;
    const title = typeof gig === 'object'
      ? gig.title || 'Gig'
      : 'Gig';

    const status = application.status || 'pending';

    return `${title} — ${status}`;
  }).join('\n');

  window.alert(summary);
}

function debounce(callback, wait) {
  let timer;

  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => callback(...args), wait);
  };
}

export function initGigs() {
  if (initialized) return;
  initialized = true;

  document.getElementById('gigsListContainer')?.addEventListener('click', async event => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const button = target.closest('[data-apply-gig]');
    if (!button || button.disabled) return;

    await applyToGig(button);
  });

  document.getElementById('gigSearchInput')?.addEventListener(
    'input',
    debounce(() => loadGigs(), 300)
  );

  document.getElementById('myProposalsBtn')?.addEventListener('click', async () => {
    if (session.user?.role !== 'freelancer') {
      notify('Your applications are available to freelancer accounts.', 'info');
      return;
    }

    await loadApplications();
    showMyApplications();
  });

  window.addEventListener('skillbridge:authenticated', () => {
    loadApplications();
  });

  window.addEventListener('skillbridge:logged-out', () => {
    applications = [];

    const count = document.getElementById('myProposalsCount');
    if (count) count.textContent = '0';
  });
}
