import { initShell } from '../components/shell.js';
import { simulationService } from '../services/simulations.js';
import { simulationCardMarkup, trackIcon } from '../components/cards.js';
import { openModal, closeModal } from '../core/modal.js';
import { notify } from '../core/toast.js';
import { ROLES } from '../core/config.js';
import { escapeHtml, emptyState, setBusy, readQuery, $, $$ } from '../core/dom.js';

const user = initShell({ active: 'skill-arena' });
const canSubmit = user?.role === ROLES.FREELANCER;

let simulations = [];
let completedIds = new Set();
let activeTrack = readQuery('track') || 'all';
let activeSimulation = null;

function renderFilters() {
  const tracks = [...new Set(simulations.map(sim => sim.skillTrack))];
  $('#trackFilters').innerHTML = ['all', ...tracks].map(track => `
    <button class="pill-btn ${track === activeTrack ? 'active' : ''}" type="button" data-track="${escapeHtml(track)}">${track === 'all' ? 'All tracks' : escapeHtml(track)}</button>`).join('');
}

function renderGrid() {
  const visible = simulations.filter(sim => activeTrack === 'all' || sim.skillTrack === activeTrack);
  $('#simulationsGrid').innerHTML = visible.length
    ? visible.map(sim => simulationCardMarkup(sim, { completed: completedIds.has(sim._id), canSubmit })).join('')
    : emptyState('No simulations found for this track yet.');
}

async function load() {
  try {
    simulations = await simulationService.list();
    if (canSubmit) {
      const portfolio = await simulationService.portfolio();
      completedIds = new Set(portfolio.map(project => String(project.simulationId?._id || project.simulationId)));
    }
    renderFilters();
    renderGrid();
  } catch (error) {
    $('#simulationsGrid').innerHTML = emptyState(error.message);
  }
}

function openSimulation(sim) {
  activeSimulation = sim;
  $('#simModalLogo').textContent = trackIcon(sim.skillTrack);
  $('#simModalTitle').textContent = sim.title;
  $('#simModalSubtitle').textContent = `${sim.skillTrack} · ${sim.xpReward} XP`;
  $('#simBriefText').textContent = sim.brief;
  $('#simModalReward').textContent = `+${sim.xpReward} XP on submission`;
  $('#simAnswerInput').value = '';
  openModal('simSandboxModal');
}

$('#trackFilters').addEventListener('click', event => {
  const pill = event.target.closest('[data-track]');
  if (!pill) return;
  activeTrack = pill.dataset.track;
  $$('.pill-btn', $('#trackFilters')).forEach(item => item.classList.toggle('active', item === pill));
  renderGrid();
});

$('#simulationsGrid').addEventListener('click', event => {
  const button = event.target.closest('[data-launch-simulation]');
  const sim = button && simulations.find(item => item._id === button.dataset.launchSimulation);
  if (sim) openSimulation(sim);
});

$('#submitSimBtn').addEventListener('click', async () => {
  if (!activeSimulation) return;
  const answer = $('#simAnswerInput').value.trim();
  if (answer.length < 5) { notify('Write an answer of at least 5 characters before submitting.', 'error'); return; }
  const button = $('#submitSimBtn');
  setBusy(button, true, 'Submitting…');
  try {
    const result = await simulationService.submit(activeSimulation._id, answer);
    notify(`Submitted! +${result.xpAwarded} XP earned (total ${result.totalXp} XP).`, 'success');
    completedIds.add(activeSimulation._id);
    closeModal('simSandboxModal');
    activeSimulation = null;
    renderGrid();
    // Refresh the sidebar XP bar.
    const xp = $('#currentXpText');
    if (xp) xp.textContent = String(result.totalXp);
  } catch (error) {
    notify(error.message, 'error');
    if (error.status === 409) { completedIds.add(activeSimulation._id); closeModal('simSandboxModal'); renderGrid(); }
  } finally {
    setBusy(button, false);
  }
});

if (user) load();
