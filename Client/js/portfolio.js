import { api, escapeHtml } from './api.js';

export async function loadPortfolio() {
  const grid = document.getElementById('portfolioGrid');
  const count = document.getElementById('portfolioCount');
  if (!grid) return;
  try {
    const result = await api('/portfolio/me');
    const projects = result.projects || [];
    if (count) count.textContent = String(projects.length);
    if (!projects.length) {
      grid.innerHTML = '<p class="api-empty-state">Your portfolio is ready for its first project. Complete a simulation to add work here.</p>';
      return;
    }
    grid.innerHTML = projects.map(project => {
      const sim = project.simulationId || {};
      return `<article class="portfolio-card">
        <div class="portfolio-card-top"><span class="badge badge-rank">${escapeHtml(sim.skillTrack || 'Project')}</span><span class="portfolio-xp">+${Number(project.xpAwarded) || 0} XP</span></div>
        <h3>${escapeHtml(sim.title || 'Completed simulation')}</h3>
        <p>${escapeHtml(project.answer || '')}</p>
        <small>Completed ${project.completedAt ? new Date(project.completedAt).toLocaleDateString() : 'recently'}</small>
      </article>`;
    }).join('');
  } catch (error) {
    grid.innerHTML = `<p class="api-empty-state">${escapeHtml(error.message)}</p>`;
  }
}
