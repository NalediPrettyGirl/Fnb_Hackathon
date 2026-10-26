import { escapeHtml, formatMoney, formatDate, skillTags, statusBadge } from '../core/dom.js';

const TRACK_ICONS = {
  'data analytics': '📊', sql: '🗄️', 'web development': '💻', 'ui/ux design': '🎨', 'business analysis': '📈'
};
export const trackIcon = track => TRACK_ICONS[String(track || '').toLowerCase()] || '⚡';

/**
 * Gig card used by the Gig Hub, dashboard, Skill Match and My Gigs.
 * @param {object} gig        Gig from the API (postedBy may be populated with { name }).
 * @param {object} [options]  { actions: html, match: { matchPercentage, matchedSkills, missingSkills }, qualified }
 */
export function gigCardMarkup(gig, { actions = '', match = null, status = false } = {}) {
  const client = gig.postedBy?.name || gig.client?.name || 'SkillBridge client';
  const matchBanner = match && match.matchPercentage !== null && match.matchPercentage !== undefined
    ? `<div class="gig-match-banner">
         <span class="match-percentage">${match.matchPercentage}% match</span>
         <span class="match-reason">${match.matchedSkills?.length
           ? `You've practised: ${escapeHtml(match.matchedSkills.join(', '))}`
           : 'Complete simulations in the matching tracks to raise this score.'}</span>
       </div>`
    : '';
  const missing = match?.missingSkills?.length
    ? `<ul class="gig-deliverables-list">${match.missingSkills.map(skill => `<li>Build evidence for ${escapeHtml(skill)}</li>`).join('')}</ul>`
    : '';

  return `
    <article class="gig-card ${match?.matchPercentage >= 50 ? 'qualified' : ''}" data-gig-id="${escapeHtml(gig._id || gig.id)}">
      <div class="gig-top-row">
        <div>
          <div class="gig-client-info">
            <span class="client-logo-icon">🏢</span>
            <span class="client-name">${escapeHtml(client)}</span>
            ${status ? statusBadge(gig.status) : ''}
          </div>
          <h3 class="gig-title">${escapeHtml(gig.title)}</h3>
        </div>
        <span class="gig-rate-badge">${formatMoney(gig.budget)}</span>
      </div>
      ${matchBanner}
      <p class="gig-desc">${escapeHtml(gig.description || '')}</p>
      ${missing}
      <div class="gig-footer-row">
        <div class="gig-tags-group">${skillTags(gig.skills)}<span class="card-meta">Posted ${formatDate(gig.createdAt)}</span></div>
        <div class="gig-card-actions">${actions}</div>
      </div>
    </article>`;
}

/** Simulation card for the Skill Arena — matches Enterprise Sandbox Card format */
export function simulationCardMarkup(sim, { completed = false, canSubmit = true } = {}) {
  const company = sim.company || sim.skillTrack;
  const industry = sim.industry || sim.skillTrack;
  const icon = sim.icon || trackIcon(sim.skillTrack);
  const isPro = Boolean(sim.isPro);
  const access = sim.access || (isPro ? '🔒 Pro' : 'Free Access');
  const accessClass = isPro ? 'access-pro' : 'access-free';
  const openRoles = sim.openRoles || 25;
  const roles = sim.roles || [
    'Senior Analyst at Top Enterprise',
    'Performance & Optimization Specialist',
    'Growth Strategy & Retention Lead'
  ];
  const tags = sim.tags || [sim.skillTrack || 'SQL'];
  const score = sim.score || (isPro ? null : '95/100');

  const action = completed
    ? '<button class="btn btn-secondary-sm sim-launch-btn" type="button" disabled>Completed ✓</button>'
    : isPro
      ? `<button class="btn btn-secondary-sm sim-preview-btn" type="button" data-launch-simulation="${escapeHtml(sim._id)}">Preview Pro Simulation</button>`
      : `<button class="btn btn-primary-sm sim-launch-btn" type="button" data-launch-simulation="${escapeHtml(sim._id)}">Launch Sandbox</button>`;

  const rolesListHtml = roles.map(r => `<li>${escapeHtml(r)}</li>`).join('');
  const tagsHtml = tags.map(t => `<span class="sim-tech-pill">${escapeHtml(t)}</span>`).join('');
  const scoreHtml = score ? `<span class="sim-score-pill">Score: ${escapeHtml(score)}</span>` : '';

  return `
    <div class="sim-card" data-track="${escapeHtml(sim.skillTrack || 'SQL')}">
      <div class="sim-card-header">
        <div class="sim-company-icon">${icon}</div>
        <span class="sim-access-pill ${accessClass}">${escapeHtml(access)}</span>
      </div>
      <h3 class="sim-company-name">${escapeHtml(company)}</h3>
      <p class="sim-company-industry">${escapeHtml(industry)}</p>

      <div class="sim-roles-box">
        <div class="sim-roles-header">
          <span class="sim-briefcase-icon">👜</span>
          <strong>${openRoles} open roles &amp; gigs</strong> use this kind of work
        </div>
        <ul class="sim-roles-list">
          ${rolesListHtml}
        </ul>
        <a href="../pages/gig-hub.html" class="sim-roles-link">See them on the Jobs Desk →</a>
      </div>

      <div class="sim-card-footer">
        <div class="sim-footer-tags">
          ${tagsHtml}
          ${scoreHtml}
        </div>
        ${action}
      </div>
    </div>`;
}


/** Portfolio card (a completed submission) — with cert download + case study view. */
export function portfolioCardMarkup(project) {
  const sim = project.simulationId || {};
  const simId = sim._id || project.simulationId || 'unknown';
  const title = sim.title || 'Completed Simulation';
  const track = sim.skillTrack || 'Project';
  const xp = Number(project.xpAwarded) || 0;
  const completedDate = formatDate(project.completedAt);
  const answer = project.answer || '';
  // Show a short excerpt of the submission as the case study preview
  const excerpt = answer.length > 180 ? answer.slice(0, 180).trimEnd() + '…' : answer;

  const TRACK_ICONS_LOCAL = {
    'data analytics': '📊', sql: '🗄️', 'web development': '💻', 'ui/ux design': '🎨',
    'business analysis': '📈', 'content writing': '✍️', 'software engineering': '⚙️'
  };
  const icon = sim.icon || TRACK_ICONS_LOCAL[String(track).toLowerCase()] || '⚡';

  return `
    <article class="portfolio-card pf-card-v2" data-project-id="${escapeHtml(String(simId))}">
      <div class="pf-card-header">
        <div class="pf-card-icon">${icon}</div>
        <div class="pf-card-meta">
          <span class="badge badge-rank pf-track-badge">${escapeHtml(track)}</span>
          <span class="pf-card-xp">+${xp} XP</span>
        </div>
      </div>

      <h3 class="pf-card-title">${escapeHtml(title)}</h3>

      <div class="pf-case-study-preview">
        <span class="pf-case-label">📝 Case Study</span>
        <p class="pf-case-excerpt">${escapeHtml(excerpt || 'No answer recorded.')}</p>
      </div>

      <div class="pf-cert-strip">
        <span class="pf-cert-icon">🏆</span>
        <span class="pf-cert-text">Certificate of Completion</span>
        <span class="pf-cert-date">${completedDate}</span>
      </div>

      <div class="pf-card-actions">
        <button class="btn btn-secondary-sm pf-download-cert-btn"
          type="button"
          data-project-id="${escapeHtml(String(simId))}"
          data-sim-title="${escapeHtml(title)}"
          data-sim-track="${escapeHtml(track)}"
          data-sim-xp="${xp}"
          data-sim-date="${escapeHtml(project.completedAt || '')}">
          ⬇ Download Certificate
        </button>
        <button class="btn btn-primary-sm pf-view-case-btn"
          type="button"
          data-project-id="${escapeHtml(String(simId))}">
          View Case Study →
        </button>
      </div>
    </article>`;
}

/** Row used for recent activity lists (applications, submissions, applicants). */
export function activityItemMarkup({ avatar = '•', title, meta, trailing = '' }) {
  return `
    <div class="activity-item">
      <div class="activity-avatar-circle">${escapeHtml(avatar)}</div>
      <div class="activity-text">
        <strong>${escapeHtml(title)}</strong>
        <span class="activity-meta">${escapeHtml(meta)}</span>
      </div>
      ${trailing}
    </div>`;
}
