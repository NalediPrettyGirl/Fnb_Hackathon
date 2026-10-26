import { initShell } from '../components/shell.js';
import { simulationService } from '../services/simulations.js';
import { portfolioCardMarkup } from '../components/cards.js';
import { openModal, closeModal, bindModalDismissal } from '../core/modal.js';
import { emptyState, escapeHtml, formatDate, $ } from '../core/dom.js';
import { ROLES } from '../core/config.js';

const user = initShell({ active: 'portfolio', roles: [ROLES.FREELANCER] });

// All loaded portfolio projects keyed by simulationId for quick lookup
let projectsById = {};

/* ─── Certificate Generator ─────────────────────────────────────────── */

function generateCertHTML({ userName, simTitle, track, xp, date }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate — ${simTitle}</title>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', Georgia, serif;
      background: #f8f6f1;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 32px;
    }
    .cert {
      background: #ffffff;
      border: 2px solid #d8e4d0;
      border-radius: 16px;
      max-width: 720px;
      width: 100%;
      padding: 56px 64px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.10);
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    .cert::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 8px;
      background: linear-gradient(90deg, #3d5a35 0%, #87977b 50%, #c8765a 100%);
      border-radius: 16px 16px 0 0;
    }
    .cert-logo {
      font-size: 2.4rem;
      margin-bottom: 8px;
    }
    .cert-brand {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: #3d5a35;
      margin-bottom: 32px;
    }
    .cert-heading {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #8a8a8a;
      margin-bottom: 14px;
    }
    .cert-name {
      font-size: 2.4rem;
      font-weight: 800;
      color: #2a2a2a;
      margin-bottom: 20px;
      line-height: 1.2;
    }
    .cert-desc {
      font-size: 1rem;
      color: #555;
      line-height: 1.7;
      margin-bottom: 28px;
      max-width: 480px;
      margin-left: auto;
      margin-right: auto;
    }
    .cert-simulation-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: #3d5a35;
      margin-bottom: 6px;
    }
    .cert-track-pill {
      display: inline-block;
      background: #e8f0e9;
      color: #3d5a35;
      border: 1px solid #c8dcc9;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 16px;
      margin-bottom: 32px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .cert-divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #d8e4d0, transparent);
      margin: 28px 0;
    }
    .cert-meta-row {
      display: flex;
      justify-content: space-around;
      align-items: center;
      gap: 16px;
    }
    .cert-meta-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cert-meta-label {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #a0a0a0;
    }
    .cert-meta-value {
      font-size: 1rem;
      font-weight: 700;
      color: #2a2a2a;
    }
    .cert-xp-badge {
      color: #c8765a;
    }
    .cert-footer {
      margin-top: 36px;
      font-size: 0.72rem;
      color: #b0b0b0;
      letter-spacing: 0.5px;
    }
    .cert-seal {
      font-size: 3rem;
      margin-bottom: 8px;
    }
    @media print {
      body { background: white; padding: 0; }
      .cert { box-shadow: none; border: 2px solid #d8e4d0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="cert">
    <div class="cert-logo">🎓</div>
    <div class="cert-brand">SkillBridge</div>

    <div class="cert-heading">Certificate of Completion</div>
    <div class="cert-name">${escapeHtml(userName)}</div>
    <div class="cert-desc">
      has successfully completed the enterprise simulation challenge and demonstrated professional-level competency in
    </div>
    <div class="cert-simulation-title">${escapeHtml(simTitle)}</div>
    <div class="cert-track-pill">${escapeHtml(track)}</div>

    <div class="cert-divider"></div>

    <div class="cert-meta-row">
      <div class="cert-meta-item">
        <span class="cert-meta-label">Issued On</span>
        <span class="cert-meta-value">${escapeHtml(date)}</span>
      </div>
      <div class="cert-meta-item">
        <span class="cert-meta-label">XP Awarded</span>
        <span class="cert-meta-value cert-xp-badge">+${xp} XP</span>
      </div>
      <div class="cert-meta-item">
        <span class="cert-meta-label">Platform</span>
        <span class="cert-meta-value">SkillBridge</span>
      </div>
    </div>

    <div class="cert-footer">
      This certificate is issued by SkillBridge and verifies completion of an enterprise-grade simulation challenge. · skillbridge.app
    </div>
  </div>

  <div class="no-print" style="margin-top:24px; text-align:center">
    <button onclick="window.print()" style="padding:10px 28px; background:#3d5a35; color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:700; cursor:pointer; font-family:inherit;">
      🖨 Print / Save as PDF
    </button>
    <button onclick="window.close()" style="margin-left:12px; padding:10px 20px; background:#f1efeb; color:#3d5a35; border:1px solid #d8e4d0; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer; font-family:inherit;">
      Close
    </button>
  </div>
</body>
</html>`;
}

function downloadCertificate({ userName, simTitle, track, xp, date }) {
  const html = generateCertHTML({ userName, simTitle, track, xp, date });
  const win = window.open('', '_blank', 'width=820,height=680,scrollbars=yes');
  if (!win) {
    // Fallback: download as .html file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SkillBridge_Certificate_${simTitle.replace(/[^a-z0-9]/gi, '_').slice(0, 40)}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

/* ─── Case Study Modal ───────────────────────────────────────────────── */

function openCaseStudyModal(project) {
  const sim = project.simulationId || {};
  const simId = String(sim._id || project.simulationId || '');
  const title = sim.title || 'Simulation';
  const track = sim.skillTrack || 'Project';
  const xp = Number(project.xpAwarded) || 0;
  const date = formatDate(project.completedAt);
  const answer = project.answer || 'No submission recorded.';

  const TRACK_ICONS = {
    'data analytics': '📊', sql: '🗄️', 'web development': '💻', 'ui/ux design': '🎨',
    'business analysis': '📈', 'content writing': '✍️', 'software engineering': '⚙️'
  };
  const icon = sim.icon || TRACK_ICONS[track.toLowerCase()] || '⚡';

  $('#caseModalIcon').textContent = icon;
  $('#caseModalTitle').textContent = title;
  $('#caseModalSubtitle').textContent = `Completed ${date} · ${track}`;
  $('#caseModalMeta').innerHTML = `
    <span class="badge badge-rank">${escapeHtml(track)}</span>
    <span class="badge badge-tier verified">+${xp} XP Earned</span>
    <span class="badge badge-rank">Completed ${escapeHtml(date)}</span>`;
  $('#caseModalAnswer').textContent = answer;

  // Wire download cert from the modal
  const dlBtn = $('#caseModalDownloadCert');
  dlBtn.onclick = () => {
    downloadCertificate({
      userName: user?.name || 'SkillBridge Learner',
      simTitle: title,
      track,
      xp,
      date
    });
  };

  openModal('caseStudyModal');
}

/* ─── Load & Render ──────────────────────────────────────────────────── */

async function load() {
  try {
    const projects = await simulationService.portfolio();

    // Index for quick lookup
    projectsById = {};
    projects.forEach(p => {
      const id = String(p.simulationId?._id || p.simulationId || '');
      if (id) projectsById[id] = p;
    });

    const totalXp = projects.reduce((sum, p) => sum + (Number(p.xpAwarded) || 0), 0);
    const certCount = projects.length; // every completed simulation gets a cert

    // Header counts
    $('#portfolioCount').textContent = String(projects.length);
    $('#certCount').textContent = String(certCount);

    // Stats strip
    if (projects.length > 0) {
      const strip = $('#portfolioStatsStrip');
      strip.style.display = 'flex';
      $('#pfTotalXp').textContent = String(totalXp);
      $('#pfCompletedCount').textContent = String(projects.length);
      $('#pfCertCount').textContent = String(certCount);
    }

    // Grid
    if (projects.length) {
      $('#portfolioGrid').innerHTML = projects.map(portfolioCardMarkup).join('');
    } else {
      $('#portfolioGrid').innerHTML = `
        <div class="pf-empty-cta">
          <span class="pf-empty-icon">🎯</span>
          <h3>Your portfolio is empty</h3>
          <p>Complete a simulation in the Skill Arena to earn your first certificate and add a project here.</p>
          <a class="btn btn-primary" href="skill-arena.html">Go to Skill Arena →</a>
        </div>`;
    }
  } catch (error) {
    $('#portfolioGrid').innerHTML = emptyState(error.message);
  }
}

/* ─── Event Delegation ───────────────────────────────────────────────── */

$('#portfolioGrid').addEventListener('click', e => {
  // Download certificate
  const certBtn = e.target.closest('.pf-download-cert-btn');
  if (certBtn) {
    const simId = certBtn.dataset.projectId;
    const project = projectsById[simId];
    downloadCertificate({
      userName: user?.name || 'SkillBridge Learner',
      simTitle: certBtn.dataset.simTitle || 'Simulation',
      track: certBtn.dataset.simTrack || 'Project',
      xp: Number(certBtn.dataset.simXp) || 0,
      date: certBtn.dataset.simDate ? formatDate(certBtn.dataset.simDate) : 'N/A'
    });
    return;
  }

  // View case study
  const caseBtn = e.target.closest('.pf-view-case-btn');
  if (caseBtn) {
    const simId = caseBtn.dataset.projectId;
    const project = projectsById[simId];
    if (project) openCaseStudyModal(project);
    return;
  }
});

// Modal close on backdrop click / X button
document.addEventListener('click', e => {
  if (e.target.dataset.closeModal === 'caseStudyModal') closeModal('caseStudyModal');
  if (e.target.id === 'caseStudyModal') closeModal('caseStudyModal');
});

if (user) load();
