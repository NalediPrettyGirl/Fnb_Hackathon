import { initShell } from '../components/shell.js';
import { dashboardService } from '../services/dashboard.js';
import { statCardMarkup } from '../components/stat-card.js';
import { gigCardMarkup, activityItemMarkup } from '../components/cards.js';
import { routes } from '../core/routes.js';
import { escapeHtml, formatMoney, formatDate, statusBadge, emptyState, $ } from '../core/dom.js';

const user = initShell({ active: 'dashboard' });

function checklistItem({ title, sub, done }) {
  return `
    <div class="cert-check-item ${done ? 'completed' : ''}">
      <span class="check-icon ${done ? '' : 'circle'}">${done ? '✓' : ''}</span>
      <div class="check-content"><span class="check-title">${escapeHtml(title)}</span><span class="check-sub">${escapeHtml(sub)}</span></div>
      <span class="check-status-badge ${done ? '' : 'open'}">${done ? 'Completed' : 'Open'}</span>
    </div>`;
}

function renderFreelancer(data) {
  const { stats, recentApplications, recentSubmissions, recommendedGigs } = data;
  const steps = [
    { title: 'Complete your first simulation', sub: 'Practise in the Skill Arena to earn XP.', done: stats.completedSimulations > 0 },
    { title: 'Complete every available simulation', sub: `${stats.completedSimulations} of ${stats.totalSimulations} done`, done: stats.totalSimulations > 0 && stats.remainingSimulations === 0 },
    { title: 'Submit your first gig application', sub: 'Apply to an open gig in the Gig Hub.', done: stats.applications.total > 0 },
    { title: 'Get an application accepted', sub: `${stats.applications.accepted} accepted so far`, done: stats.applications.accepted > 0 }
  ];
  const doneCount = steps.filter(step => step.done).length;
  const percent = Math.round((doneCount / steps.length) * 100);

  $('#dashboardActions').innerHTML = `
    <a class="btn btn-secondary" href="${routes.skillArena}">Explore Simulations</a>
    <a class="btn btn-primary" href="${routes.gigHub}">Browse Paid Gigs</a>`;

  const activity = [
    ...recentApplications.map(app => ({
      date: app.updatedAt, html: activityItemMarkup({
        avatar: '💼', title: app.gig?.title || 'Gig no longer available',
        meta: `Applied ${formatDate(app.appliedAt)}`, trailing: statusBadge(app.status)
      })
    })),
    ...recentSubmissions.map(sub => ({
      date: sub.completedAt, html: activityItemMarkup({
        avatar: '⭐', title: sub.simulation?.title || 'Simulation',
        meta: `Completed ${formatDate(sub.completedAt)}`, trailing: `<span class="portfolio-xp">+${sub.xpAwarded} XP</span>`
      })
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  $('#dashboardRoot').innerHTML = `
    <div class="dashboard-grid">
      <div class="dashboard-main-col">
        <div class="stats-row">
          ${statCardMarkup({ label: 'Total XP', value: stats.xp, sub: 'All-time', icon: '⚡' })}
          ${statCardMarkup({ label: 'Simulations', value: `${stats.completedSimulations}/${stats.totalSimulations}`, sub: `${stats.completionPercentage}% complete`, icon: '✓', tone: 'green' })}
          ${statCardMarkup({ label: 'Applications', value: stats.applications.total, sub: `${stats.applications.pending} pending`, icon: '💼' })}
          ${statCardMarkup({ label: 'Accepted', value: stats.applications.accepted, sub: `${stats.applications.rejected} rejected`, icon: '🎉', tone: 'green' })}
        </div>

        <div class="cert-roadmap-card">
          <div class="cert-card-header">
            <div><h3 class="cert-card-title">Your getting-started checklist</h3><p class="cert-card-desc">Practise, apply and get hired — your progress is tracked automatically.</p></div>
            <span class="cert-percentage-pill">${percent}%</span>
          </div>
          <div class="cert-card-progress">
            <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${percent}%"></div></div>
            <span class="cert-count-label">${doneCount} of ${steps.length} steps done</span>
          </div>
          <div class="cert-checklist">${steps.map(checklistItem).join('')}</div>
        </div>

        <div class="featured-gigs-teaser">
          <div class="teaser-header">
            <div><h3 class="teaser-title">Recommended gigs</h3><p class="teaser-subtitle">Open gigs you haven't applied to yet.</p></div>
            <a class="btn-text-sm" href="${routes.skillMatch}">See skill match →</a>
          </div>
          <div class="gigs-container">
            ${recommendedGigs.length
              ? recommendedGigs.map(gig => gigCardMarkup({ ...gig, _id: gig.id, postedBy: gig.client }, {
                  actions: `<a class="btn btn-primary-sm" href="${routes.gigHub}?search=${encodeURIComponent(gig.title)}">View &amp; apply</a>` })).join('')
              : emptyState('No recommendations right now. Check the Gig Hub later.')}
          </div>
        </div>
      </div>

      <div class="dashboard-side-col">
        <div class="community-card">
          <span class="community-label">RECENT ACTIVITY</span>
          <div class="community-feed-list">${activity.length ? activity.map(item => item.html).join('') : emptyState('Nothing yet — complete a simulation or apply for a gig.')}</div>
        </div>
      </div>
    </div>`;
}

function renderClient(data) {
  const { stats, recentGigs, recentApplications } = data;
  $('#dashboardActions').innerHTML = `
    <a class="btn btn-secondary" href="${routes.myGigs}">Manage My Gigs</a>
    <a class="btn btn-primary" href="${routes.postGig}">Post a Gig</a>`;

  $('#dashboardRoot').innerHTML = `
    <div class="dashboard-grid">
      <div class="dashboard-main-col">
        <div class="stats-row">
          ${statCardMarkup({ label: 'Gigs posted', value: stats.totalGigs, sub: `${stats.openGigs} open`, icon: '📌' })}
          ${statCardMarkup({ label: 'Closed gigs', value: stats.closedGigs, icon: '🔒', tone: 'green' })}
          ${statCardMarkup({ label: 'Applications', value: stats.applications.total, sub: `${stats.applications.pending} to review`, icon: '📥' })}
          ${statCardMarkup({ label: 'Accepted', value: stats.applications.accepted, sub: `${stats.applications.rejected} rejected`, icon: '✅', tone: 'green' })}
        </div>
        <div class="featured-gigs-teaser">
          <div class="teaser-header">
            <div><h3 class="teaser-title">Your recent gigs</h3><p class="teaser-subtitle">Most recently updated first.</p></div>
            <a class="btn-text-sm" href="${routes.myGigs}">Manage all →</a>
          </div>
          <div class="gigs-container">
            ${recentGigs.length
              ? recentGigs.map(gig => gigCardMarkup({ ...gig, _id: gig.id }, {
                  status: true,
                  actions: `<a class="btn btn-primary-sm" href="${routes.gigApplicants}?gigId=${encodeURIComponent(gig.id)}">View applicants</a>` })).join('')
              : emptyState('You have not posted a gig yet. Post your first one to start receiving applications.')}
          </div>
        </div>
      </div>
      <div class="dashboard-side-col">
        <div class="community-card">
          <span class="community-label">LATEST APPLICATIONS</span>
          <div class="community-feed-list">
            ${recentApplications.length ? recentApplications.map(app => activityItemMarkup({
              avatar: (app.freelancer?.name || '?')[0].toUpperCase(),
              title: app.freelancer?.name || 'A freelancer',
              meta: `${app.gig?.title || 'Gig'} • ${formatDate(app.appliedAt)}`,
              trailing: statusBadge(app.status)
            })).join('') : emptyState('No applications yet.')}
          </div>
        </div>
      </div>
    </div>`;
}

async function load() {
  try {
    const data = await dashboardService.get();
    (data.role === 'client' ? renderClient : renderFreelancer)(data);
  } catch (error) {
    $('#dashboardRoot').innerHTML = emptyState(error.message);
  }
}

if (user) load();
