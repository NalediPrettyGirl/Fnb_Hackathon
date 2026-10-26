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

/** Simulation card for the Skill Arena. */
export function simulationCardMarkup(sim, { completed = false, canSubmit = true } = {}) {
  const action = completed
    ? '<button class="btn btn-secondary-sm" type="button" disabled>Completed ✓</button>'
    : canSubmit
      ? `<button class="btn btn-primary-sm" type="button" data-launch-simulation="${escapeHtml(sim._id)}">Start challenge</button>`
      : '';
  return `
    <div class="sim-card" data-track="${escapeHtml(sim.skillTrack)}">
      <div class="sim-card-header">
        <div class="sim-company-icon">${trackIcon(sim.skillTrack)}</div>
        <div class="sim-status-badge free-badge">+${Number(sim.xpReward) || 0} XP</div>
      </div>
      <h3 class="sim-company-name">${escapeHtml(sim.title)}</h3>
      <p class="sim-company-industry">${escapeHtml(sim.skillTrack)}</p>
      <p class="sim-brief">${escapeHtml(sim.brief)}</p>
      <div class="sim-card-footer">
        <div class="sim-tags">
          <span class="tag-badge">${escapeHtml(sim.skillTrack)}</span>
          ${completed ? '<span class="tag-score-earned">Done</span>' : ''}
        </div>
        ${action}
      </div>
    </div>`;
}

/** Portfolio card (a completed submission). */
export function portfolioCardMarkup(project) {
  const sim = project.simulationId || {};
  return `
    <article class="portfolio-card">
      <div class="portfolio-card-top">
        <span class="badge badge-rank">${escapeHtml(sim.skillTrack || 'Project')}</span>
        <span class="portfolio-xp">+${Number(project.xpAwarded) || 0} XP</span>
      </div>
      <h3>${escapeHtml(sim.title || 'Completed simulation')}</h3>
      <p>${escapeHtml(project.answer || '')}</p>
      <small>Completed ${formatDate(project.completedAt)}</small>
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
