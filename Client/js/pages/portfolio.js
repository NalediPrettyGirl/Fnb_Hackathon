import { initShell } from '../components/shell.js';
import { simulationService } from '../services/simulations.js';
import { portfolioCardMarkup } from '../components/cards.js';
import { emptyState, $ } from '../core/dom.js';
import { ROLES } from '../core/config.js';

const user = initShell({ active: 'portfolio', roles: [ROLES.FREELANCER] });

async function load() {
  try {
    const projects = await simulationService.portfolio();
    $('#portfolioCount').textContent = String(projects.length);
    $('#portfolioGrid').innerHTML = projects.length
      ? projects.map(portfolioCardMarkup).join('')
      : emptyState('Your portfolio is ready for its first project. Complete a simulation in the Skill Arena to add work here.');
  } catch (error) {
    $('#portfolioGrid').innerHTML = emptyState(error.message);
  }
}

if (user) load();
