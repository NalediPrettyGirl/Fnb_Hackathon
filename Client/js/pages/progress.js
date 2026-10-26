import { initShell } from '../components/shell.js';
import { analyticsService } from '../services/analytics.js';
import { statCardMarkup } from '../components/stat-card.js';
import { activityItemMarkup } from '../components/cards.js';
import { formatDate, skillTags, emptyState, $ } from '../core/dom.js';
import { ROLES } from '../core/config.js';

const user = initShell({ active: 'progress', roles: [ROLES.FREELANCER] });

function render({ progress, recentSubmissions }) {
  const { applications } = progress;
  $('#progressStats').innerHTML = [
    statCardMarkup({ label: 'Current XP', value: progress.currentXp, sub: `${progress.earnedXp} from simulations`, icon: '⚡' }),
    statCardMarkup({ label: 'Simulations done', value: progress.completedSimulations, icon: '✓', tone: 'green' }),
    statCardMarkup({ label: 'Applications', value: applications.pending + applications.accepted + applications.rejected, sub: `${applications.pending} pending`, icon: '💼' }),
    statCardMarkup({ label: 'Accepted', value: applications.accepted, sub: `${applications.rejected} rejected`, icon: '🎉', tone: 'green' })
  ].join('');

  $('#progressTracks').innerHTML = progress.skillTracksPractised.length
    ? skillTags(progress.skillTracksPractised)
    : '<span class="card-meta">No tracks practised yet.</span>';

  $('#progressRecent').innerHTML = recentSubmissions.length
    ? recentSubmissions.map(item => activityItemMarkup({
        avatar: '⭐',
        title: item.simulationId?.title || 'Simulation',
        meta: `${item.simulationId?.skillTrack || ''} • ${formatDate(item.completedAt)}`,
        trailing: `<span class="portfolio-xp">+${item.xpAwarded} XP</span>`
      })).join('')
    : emptyState('No submissions yet.');
}

async function load() {
  try { render(await analyticsService.mine()); }
  catch (error) { $('#progressStats').innerHTML = emptyState(error.message); }
}

if (user) load();
