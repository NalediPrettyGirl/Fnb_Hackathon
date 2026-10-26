import { initShell } from '../components/shell.js';
import { guideService } from '../services/guides.js';
import { simulationService } from '../services/simulations.js';
import { routes } from '../core/routes.js';
import { GUIDE_META, ROLES } from '../core/config.js';
import { escapeHtml, emptyState, readQuery, $, $$ } from '../core/dom.js';

const user = initShell({ active: 'track-guides' });
let guides = [];
let simulations = [];
let activeId = readQuery('guide');

function relatedSimulations(guide) {
  const tracks = GUIDE_META[guide.id]?.tracks || [];
  return simulations.filter(sim => tracks.includes(sim.skillTrack));
}

function renderTabs() {
  $('#guideTabs').innerHTML = guides.map(guide => `
    <button class="track-tab-btn ${guide.id === activeId ? 'active' : ''}" type="button" data-guide="${escapeHtml(guide.id)}">
      <span class="tab-icon">${GUIDE_META[guide.id]?.icon || '📘'}</span>
      <span class="tab-text"><strong>${escapeHtml(guide.title)}</strong><small>${guide.steps.length} steps</small></span>
    </button>`).join('');
}

function renderPanel() {
  const guide = guides.find(item => item.id === activeId);
  if (!guide) { $('#guidePanel').innerHTML = emptyState('Select a track to see its roadmap.'); return; }
  const related = relatedSimulations(guide);
  const tracks = GUIDE_META[guide.id]?.tracks || [];
  const arenaTrack = tracks[0];

  $('#guidePanel').innerHTML = `
    <div class="track-guide-panel active">
      <div class="guide-hero-card">
        <div class="guide-hero-info">
          <span class="guide-badge green">Career track</span>
          <h2 class="guide-hero-title">${escapeHtml(guide.title)} Roadmap</h2>
          <p class="guide-hero-desc">Follow these steps in order. Back each one up with practice in the Skill Arena, then apply your skills to real gigs.</p>
          <div class="guide-tags-row">${tracks.map(track => `<span class="guide-tag">${escapeHtml(track)}</span>`).join('')}</div>
        </div>
        <div class="guide-stats-grid">
          <div class="guide-stat-tile"><span class="guide-stat-val">${guide.steps.length}</span><span class="guide-stat-label">Roadmap steps</span></div>
          <div class="guide-stat-tile"><span class="guide-stat-val">${related.length}</span><span class="guide-stat-label">Related simulations</span></div>
        </div>
      </div>

      <div class="guide-section-block">
        <div class="guide-section-header">
          <div><h3 class="guide-section-title">Milestone Execution Blueprint</h3><p class="guide-section-subtitle">Work through each step to build job-ready evidence.</p></div>
          <span class="guide-phase-counter">${guide.steps.length} Progressive Steps</span>
        </div>
        <div class="guide-roadmap-timeline">
          ${guide.steps.map((step, index) => `
            <div class="timeline-step-item">
              <div class="timeline-step-marker">
                <span class="marker-dot">${index + 1}</span>
                ${index < guide.steps.length - 1 ? '<div class="marker-line"></div>' : ''}
              </div>
              <div class="timeline-step-content">
                <div class="timeline-step-head">
                  <span class="step-timing">Step ${index + 1} of ${guide.steps.length}</span>
                  <h4 class="step-title">${escapeHtml(step)}</h4>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  const link = $('#guideArenaLink');
  if (user?.role === ROLES.FREELANCER && arenaTrack) link.href = `${routes.skillArena}?track=${encodeURIComponent(related[0]?.skillTrack || arenaTrack)}`;
}

$('#guideTabs').addEventListener('click', event => {
  const tab = event.target.closest('[data-guide]');
  if (!tab) return;
  activeId = tab.dataset.guide;
  $$('.track-tab-btn', $('#guideTabs')).forEach(item => item.classList.toggle('active', item === tab));
  renderPanel();
});

async function load() {
  try {
    [guides, simulations] = await Promise.all([guideService.list(), simulationService.list().catch(() => [])]);
    if (!guides.some(guide => guide.id === activeId)) activeId = guides[0]?.id;
    renderTabs();
    renderPanel();
  } catch (error) {
    $('#guidePanel').innerHTML = emptyState(error.message);
  }
}

if (user) load();
