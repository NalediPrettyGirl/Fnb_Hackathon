import { api, escapeHtml, notify } from './api.js';

let simulations = [];
let activeSimulation = null;

function renderSimulations(items) {
  const grid = document.getElementById('simulationsGrid');
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<p class="api-empty-state">No simulations are available yet. Try again after the administrator seeds the database.</p>';
    return;
  }
  grid.innerHTML = items.map(sim => `
    <article class="sim-card" data-simulation-id="${escapeHtml(sim._id)}">
      <div class="sim-card-header">
        <span class="sim-company-logo">⚡</span>
        <span class="badge badge-rank">${escapeHtml(sim.skillTrack || 'General')}</span>
      </div>
      <h3>${escapeHtml(sim.title)}</h3>
      <p>${escapeHtml(sim.brief)}</p>
      <div class="sim-card-footer">
        <span>⭐ ${Number(sim.xpReward) || 0} XP</span>
        <button class="btn btn-primary sim-launch-btn" type="button" data-launch-simulation="${escapeHtml(sim._id)}">Start challenge</button>
      </div>
    </article>`).join('');
}

export async function loadSimulations() {
  try {
    const result = await api('/simulations');
    simulations = result.simulations || [];
    renderSimulations(simulations);
  } catch (error) {
    const grid = document.getElementById('simulationsGrid');
    if (grid) grid.innerHTML = `<p class="api-empty-state">${escapeHtml(error.message)}</p>`;
  }
}

function openSimulation(simulation) {
  activeSimulation = simulation;
  document.getElementById('simModalTitle').textContent = simulation.title;
  document.getElementById('simModalSubtitle').textContent = `${simulation.skillTrack || 'Skill challenge'} · ${simulation.xpReward || 0} XP`;
  document.getElementById('simBriefText').textContent = simulation.brief;
  document.getElementById('simDeliverablesList').innerHTML = '<li>Submit a clear, practical response to the challenge.</li><li>Explain your reasoning and assumptions.</li>';
  const editor = document.getElementById('simSqlTextarea');
  if (editor) {
    editor.value = '';
    editor.placeholder = 'Write your solution here. Explain your approach in at least a few sentences.';
  }
  const modal = document.getElementById('simSandboxModal');
  modal?.classList.add('show');
}

export function initSimulations() {
  document.getElementById('simulationsGrid')?.addEventListener('click', event => {
    const button = event.target.closest('[data-launch-simulation]');
    if (!button) return;
    const simulation = simulations.find(item => item._id === button.dataset.launchSimulation);
    if (simulation) openSimulation(simulation);
  });
  const close = () => {
    const modal = document.getElementById('simSandboxModal');
    modal?.classList.remove('show');
    activeSimulation = null;
  };
  document.getElementById('closeSimModalBtn')?.addEventListener('click', close);
  document.getElementById('cancelSimModalBtn')?.addEventListener('click', close);
  document.getElementById('submitSimSolutionBtn')?.addEventListener('click', async () => {
    if (!activeSimulation) return;
    const answer = document.getElementById('simSqlTextarea')?.value.trim() || '';
    const button = document.getElementById('submitSimSolutionBtn');
    if (answer.length < 5) { notify('Write an answer of at least 5 characters before submitting.', 'error'); return; }
    button.disabled = true;
    try {
      const result = await api(`/simulations/${activeSimulation._id}/submit`, {
        method: 'POST', body: JSON.stringify({ answer })
      });
      notify(`Submitted successfully. +${result.xpAwarded} XP earned.`, 'success');
      close();
      window.dispatchEvent(new CustomEvent('skillbridge:data-changed'));
    } catch (error) {
      notify(error.message, 'error');
    } finally { button.disabled = false; }
  });
}
