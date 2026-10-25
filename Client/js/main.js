import { api, session, notify } from './api.js';
import { initAuth } from './auth.js';
import { initSimulations, loadSimulations } from './simulations.js';
import { loadPortfolio } from './portfolio.js';
import { initGigs, loadGigs, loadApplications } from './gigs.js';
import { loadDashboard } from './dashboard.js';

function initNavigation() {
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      const view = link.dataset.view;
      document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));
      document.getElementById(`view-${view}`)?.classList.add('active');
      document.querySelectorAll('.nav-link[data-view]').forEach(item => item.classList.toggle('active', item === link));
      if (window.innerWidth < 900) document.getElementById('appSidebar')?.classList.remove('mobile-open');
    });
  });
  const navTo = view => document.querySelector(`.nav-link[data-view="${view}"]`)?.click();
  document.getElementById('exploreSimsBtn')?.addEventListener('click', () => navTo('work-desk'));
  document.getElementById('dashBrowseGigsBtn')?.addEventListener('click', () => navTo('jobs-desk'));
  document.getElementById('viewAllQualifiedGigsBtn')?.addEventListener('click', () => navTo('jobs-desk'));
  document.getElementById('collapseSidebarBtn')?.addEventListener('click', () => document.querySelector('.app-sidebar')?.classList.toggle('collapsed'));
  document.getElementById('mobileSidebarToggle')?.addEventListener('click', () => document.querySelector('.app-sidebar')?.classList.toggle('mobile-open'));
}

async function loadAuthenticatedApp() {
  if (!session.token) return;
  try {
    await api('/dashboard');
    await Promise.all([loadDashboard(), loadSimulations(), loadPortfolio(), loadGigs(), loadApplications()]);
  } catch (error) {
    notify(error.message, 'error');
  }
}

function addPortfolioSection() {
  const dashboard = document.getElementById('view-dashboard');
  if (!dashboard || document.getElementById('portfolioSection')) return;
  const section = document.createElement('section');
  section.id = 'portfolioSection';
  section.className = 'portfolio-section';
  section.innerHTML = `
    <div class="portfolio-section-heading">
      <div><h2>Your Portfolio</h2><p>Real submissions from your completed SkillBridge simulations.</p></div>
      <span class="badge badge-rank"><span id="portfolioCount">0</span> projects</span>
    </div>
    <div id="portfolioGrid" class="portfolio-grid"><p class="api-empty-state">Loading portfolio…</p></div>
    <p id="apiStatusMessage" class="api-status-message" role="status"></p>`;
  dashboard.appendChild(section);
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNavigation();
  initSimulations();
  initGigs();
  addPortfolioSection();
  window.addEventListener('skillbridge:authenticated', loadAuthenticatedApp);
  window.addEventListener('skillbridge:data-changed', loadAuthenticatedApp);
  if (session.token) loadAuthenticatedApp();
});
