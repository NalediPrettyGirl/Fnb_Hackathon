import { requireSession, showFlashMessage } from '../core/guard.js';
import { session } from '../core/session.js';
import { routes, goTo } from '../core/routes.js';
import { ROLES, XP_LEVELS, STORAGE_KEYS } from '../core/config.js';
import { escapeHtml, initials, $, $$ } from '../core/dom.js';
import { notify } from '../core/toast.js';
import { bindModalDismissal } from '../core/modal.js';
import { authService } from '../services/auth.js';
import { profileService } from '../services/profile.js';
import { adminService } from '../services/admin.js';
import { NAV_SECTIONS } from './nav-config.js';
import { bellMarkup, initNotificationBell } from './notification-bell.js';
import { logoSvg } from './icons.js';

function levelFor(xp) {
  const index = XP_LEVELS.reduce((found, level, i) => (xp >= level.min ? i : found), 0);
  const current = XP_LEVELS[index];
  const next = XP_LEVELS[index + 1];
  const percent = next ? Math.min(100, Math.round(((xp - current.min) / (next.min - current.min)) * 100)) : 100;
  return { current, next, percent };
}

function sidebarMarkup(user, activeId) {
  const isFreelancer = user.role === ROLES.FREELANCER;
  const navHtml = NAV_SECTIONS.map(section => {
    const items = section.items.filter(item => item.roles.includes(user.role));
    if (!items.length) return '';
    return `
      <div class="nav-section-label">${section.label}</div>
      <ul class="nav-list">
        ${items.map(item => `
          <li class="nav-item" ${item.adminOnly ? 'id="adminNavItem" hidden' : ''}>
            <a href="${item.href}" class="nav-link ${item.id === activeId ? 'active' : ''}" id="nav-${item.id}">
              ${item.icon}
              <span class="nav-label">${item.label}</span>
              ${item.chip ? `<span class="nav-chip ${item.chip.cls}">${item.chip.text}</span>` : ''}
            </a>
          </li>`).join('')}
      </ul>`;
  }).join('');

  return `
    <aside class="app-sidebar" id="appSidebar">
      <div class="sidebar-header">
        <a href="${routes.dashboard}" class="sidebar-brand">
          <div class="brand-logo-icon">${logoSvg}</div>
          <span class="brand-name">Skill<span class="brand-accent">Bridge</span></span>
        </a>
        <button class="sidebar-collapse-btn" id="collapseSidebarBtn" title="Toggle Sidebar" type="button">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>

      <a class="user-profile-card" href="${routes.profile}" title="View and edit your profile">
        <div class="user-avatar-row">
          <div class="user-avatar" id="sidebarAvatar">${escapeHtml(initials(user.name))}</div>
          <div class="user-info">
            <div class="user-name-title"><span class="user-name" id="userNameDisplay">${escapeHtml(user.name)}</span></div>
            <div class="user-badges">
              <span class="badge badge-rank" id="userRankDisplay">${isFreelancer ? levelFor(user.xp || 0).current.name : 'Client'}</span>
              <span class="badge badge-tier verified" id="userCareerBadge">${!isFreelancer ? 'Hiring' : (user.headline || (typeof localStorage !== 'undefined' ? localStorage.getItem('skillbridge_career_path') : null) || 'Data Analyst')}</span>
            </div>
          </div>
        </div>
        ${isFreelancer ? `
        <div class="user-progress-box">
          <div class="user-progress-labels">
            <span class="progress-role" id="progressRoleLabel">XP progress</span>
            <span class="progress-xp" id="progressXpLabel"><strong id="currentXpText">${user.xp || 0}</strong> XP</span>
          </div>
          <div class="progress-bar-track"><div class="progress-bar-fill" id="sidebarXpBar" style="width:${levelFor(user.xp || 0).percent}%"></div></div>
        </div>` : ''}
      </a>

      <nav class="sidebar-nav">${navHtml}</nav>

      <div class="sidebar-footer">
        <button class="sign-out-btn" id="signOutBtn" type="button">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Sign out</span>
        </button>
      </div>
    </aside>`;
}

function topbarMarkup(user) {
  return `
    <header class="app-topbar">
      <div class="topbar-left">
        <button class="mobile-sidebar-toggle" id="mobileSidebarToggle" aria-label="Open navigation menu" type="button">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <form class="search-input-wrapper" id="globalSearchForm" role="search">
          <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" id="globalSearchInput" class="search-input" placeholder="Search gigs by title, skill or keyword…" aria-label="Search gigs">
          <span class="search-kbd">Ctrl K</span>
        </form>
      </div>
      <div class="topbar-right">
        ${bellMarkup}
        <a class="topbar-user-pill" id="userPillBtn" href="${routes.profile}" title="Your profile">
          <div class="user-avatar-sm" id="topbarAvatarSm">${escapeHtml(initials(user.name))}</div>
          <span class="user-pill-name" id="topbarUserName">${escapeHtml(user.name.split(' ')[0])}</span>
        </a>
      </div>
    </header>`;
}

function bindShellEvents() {
  const sidebar = $('#appSidebar');
  $('#collapseSidebarBtn')?.addEventListener('click', () => sidebar.classList.toggle('collapsed'));
  $('#mobileSidebarToggle')?.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));

  $('#signOutBtn')?.addEventListener('click', async () => {
    await authService.logout();
    sessionStorage.setItem('skillbridge_flash_ok', 'You have been signed out.');
    window.location.href = routes.login;
  });

  const search = $('#globalSearchInput');
  $('#globalSearchForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const term = search.value.trim();
    goTo(routes.gigHub, term ? { search: term } : {});
  });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      search?.focus();
    }
  });
}

/** Refreshes name/XP from the server so the sidebar never shows stale numbers. */
async function refreshIdentity() {
  try {
    const profile = await profileService.get();
    session.updateUser({ name: profile.name, xp: profile.xp });
    $$('.user-name, #topbarUserName').forEach(node => {
      node.textContent = node.id === 'topbarUserName' ? profile.name.split(' ')[0] : profile.name;
    });
    $$('#sidebarAvatar, #topbarAvatarSm').forEach(node => { node.textContent = initials(profile.name); });
    if (profile.role === ROLES.FREELANCER) {
      const career = profile.headline || (typeof localStorage !== 'undefined' ? localStorage.getItem('skillbridge_career_path') : null) || 'Data Analyst';
      const careerBadge = $('#userCareerBadge');
      if (careerBadge) careerBadge.textContent = career;
      const level = levelFor(profile.xp || 0);
      const rank = $('#userRankDisplay');
      if (rank) rank.textContent = level.current.name;
      const xpText = $('#currentXpText');
      if (xpText) xpText.textContent = String(profile.xp || 0);
      const label = $('#progressXpLabel');
      if (label && level.next) label.innerHTML = `<strong id="currentXpText">${profile.xp || 0}</strong> / ${level.next.min} XP`;
      const bar = $('#sidebarXpBar');
      if (bar) bar.style.width = `${level.percent}%`;
    }
  } catch { /* the page itself will surface API problems */ }
}

/** The Admin link only appears for the account matching ADMIN_EMAIL on the server. */
async function revealAdminLink() {
  const item = $('#adminNavItem');
  if (!item) return;
  let known = sessionStorage.getItem(STORAGE_KEYS.adminProbe);
  if (known === null) {
    try { await adminService.overview(); known = '1'; }
    catch { known = '0'; }
    sessionStorage.setItem(STORAGE_KEYS.adminProbe, known);
  }
  item.hidden = known !== '1';
}

/**
 * Builds the sidebar + topbar around the page's <main id="appMain"> and enforces login/role.
 * @param {{ active: string, roles?: string[] }} options
 * @returns {object|null} the signed-in user (null when redirecting)
 */
export function initShell({ active, roles } = {}) {
  const user = requireSession(roles);
  if (!user) return null;

  const container = $('#appContainer');
  const main = $('#appMain');
  container.insertAdjacentHTML('afterbegin', sidebarMarkup(user, active));
  main.insertAdjacentHTML('afterbegin', topbarMarkup(user));

  bindShellEvents();
  bindModalDismissal();
  initNotificationBell();
  showFlashMessage();
  refreshIdentity();
  revealAdminLink();
  return user;
}

export { notify };
