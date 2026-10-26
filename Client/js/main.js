import { session, notify } from './api.js';
import { initAuth } from './auth.js';
import { initSimulations, loadSimulations } from './simulations.js';
import { loadPortfolio } from './portfolio.js';
import { initGigs, loadGigs, loadApplications } from './gigs.js';
import { loadDashboard } from './dashboard.js';

let appLoadPromise = null;
let reloadRequested = false;

function initNavigation() {
  document.querySelectorAll('.nav-link[data-view]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();

      const view = link.dataset.view;

      document.querySelectorAll('.view-panel').forEach(panel => {
        panel.classList.remove('active');
      });

      document.getElementById(`view-${view}`)?.classList.add('active');

      document.querySelectorAll('.nav-link[data-view]').forEach(item => {
        item.classList.toggle('active', item === link);
      });

      if (window.innerWidth < 900) {
        document.getElementById('appSidebar')?.classList.remove('mobile-open');
      }
    });
  });

  const navTo = view => {
    document.querySelector(`.nav-link[data-view="${view}"]`)?.click();
  };

  document.getElementById('exploreSimsBtn')?.addEventListener('click', () => {
    navTo('work-desk');
  });

  document.getElementById('dashBrowseGigsBtn')?.addEventListener('click', () => {
    navTo('jobs-desk');
  });

  document.getElementById('viewAllQualifiedGigsBtn')?.addEventListener('click', () => {
    navTo('jobs-desk');
  });

  document.getElementById('collapseSidebarBtn')?.addEventListener('click', () => {
    document.querySelector('.app-sidebar')?.classList.toggle('collapsed');
  });

  document.getElementById('mobileSidebarToggle')?.addEventListener('click', () => {
    document.querySelector('.app-sidebar')?.classList.toggle('mobile-open');
  });
}

function addPortfolioSection() {
  const dashboard = document.getElementById('view-dashboard');

  if (!dashboard || document.getElementById('portfolioSection')) {
    return;
  }

  const section = document.createElement('section');

  section.id = 'portfolioSection';
  section.className = 'portfolio-section';

  section.innerHTML = `
    <div class="portfolio-section-heading">
      <div>
        <h2>Your Portfolio</h2>
        <p>Real submissions from your completed SkillBridge simulations.</p>
      </div>
      <span class="badge badge-rank">
        <span id="portfolioCount">0</span> projects
      </span>
    </div>

    <div id="portfolioGrid" class="portfolio-grid">
      <p class="api-empty-state">Your portfolio will appear here.</p>
    </div>

    <p id="apiStatusMessage" class="api-status-message" role="status"></p>
  `;

  dashboard.appendChild(section);
}

function resetAuthenticatedUI() {
  [
    'dashWeekXp',
    'dashTasksCompleted',
    'portfolioCount',
    'dashApplicationsCount',
    'dashPendingApplications',
    'myProposalsCount'
  ].forEach(id => {
    const element = document.getElementById(id);

    if (element) {
      element.textContent = '0';
    }
  });

  const streak = document.getElementById('dashStreakDays');

  if (streak) {
    streak.textContent = '—';
  }

  const portfolioGrid = document.getElementById('portfolioGrid');

  if (portfolioGrid) {
    portfolioGrid.innerHTML = `
      <p class="api-empty-state">Log in to view your portfolio.</p>
    `;
  }

  const status = document.getElementById('apiStatusMessage');

  if (status) {
    status.textContent = '';
  }
}

async function loadAuthenticatedData() {
  if (!session.token) {
    return;
  }

  // loadDashboard() already requests /dashboard and handles its own errors.
  // Its returned data is used to determine whether loading can continue.
  const dashboardData = await loadDashboard();

  if (!dashboardData || !session.token) {
    return;
  }

  const tasks = [
    loadSimulations(),
    loadPortfolio(),
    loadGigs()
  ];

  // /applications/me is restricted to freelancer accounts by the backend.
  if (session.user?.role === 'freelancer') {
    tasks.push(loadApplications());
  } else {
    const proposalsCount = document.getElementById('myProposalsCount');

    if (proposalsCount) {
      proposalsCount.textContent = '0';
    }
  }

  await Promise.all(tasks);
}

function loadAuthenticatedApp() {
  if (!session.token) {
    return Promise.resolve();
  }

  // Coalesce repeated login/data-changed events into a single follow-up reload.
  if (appLoadPromise) {
    reloadRequested = true;
    return appLoadPromise;
  }

  appLoadPromise = (async () => {
    do {
      reloadRequested = false;

      if (!session.token) {
        break;
      }

      try {
        await loadAuthenticatedData();
      } catch (error) {
        notify(
          error.message || 'Unable to load SkillBridge. Please try again.',
          'error'
        );
      }
    } while (reloadRequested && session.token);
  })().finally(() => {
    appLoadPromise = null;
  });

  return appLoadPromise;
}

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initNavigation();
  initSimulations();
  initGigs();
  addPortfolioSection();

  window.addEventListener('skillbridge:authenticated', () => {
    loadAuthenticatedApp();
  });

  window.addEventListener('skillbridge:data-changed', () => {
    loadAuthenticatedApp();
  });

  window.addEventListener('skillbridge:logged-out', () => {
    reloadRequested = false;
    resetAuthenticatedUI();
  });

  window.addEventListener('skillbridge:session-expired', () => {
    reloadRequested = false;
    resetAuthenticatedUI();
  });

  if (session.token) {
    loadAuthenticatedApp();
  }
});
