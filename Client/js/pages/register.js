import { redirectIfSignedIn } from '../core/guard.js';
import { authService } from '../services/auth.js';
import { profileService } from '../services/profile.js';
import { routes } from '../core/routes.js';
import { setBusy, $, $$ } from '../core/dom.js';

redirectIfSignedIn();

// Tailored skills per career path
const PATH_SKILLS = {
  'Data Analyst': [
    { key: 'sql', label: 'SQL & Databases', defaultVal: 4 },
    { key: 'viz', label: 'Data Visualization', defaultVal: 3 },
    { key: 'comm', label: 'Business Communication', defaultVal: 4 },
    { key: 'pm', label: 'Project Management', defaultVal: 3 }
  ],
  'UI/UX Designer': [
    { key: 'figma', label: 'Wireframing & Figma', defaultVal: 4 },
    { key: 'research', label: 'User Research & Personas', defaultVal: 4 },
    { key: 'proto', label: 'Interactive Prototyping', defaultVal: 3 },
    { key: 'designsys', label: 'Design Systems', defaultVal: 3 }
  ],
  'Content Writer / Journalist': [
    { key: 'copy', label: 'Copywriting & Narrative', defaultVal: 4 },
    { key: 'seo', label: 'SEO & Content Strategy', defaultVal: 4 },
    { key: 'editing', label: 'Editing & Fact-Checking', defaultVal: 4 },
    { key: 'research', label: 'Research & Interviewing', defaultVal: 3 }
  ],
  'Software Engineer': [
    { key: 'frontend', label: 'Frontend Development', defaultVal: 4 },
    { key: 'backend', label: 'Backend & REST APIs', defaultVal: 4 },
    { key: 'database', label: 'Database & SQL', defaultVal: 3 },
    { key: 'git', label: 'Git & Version Control', defaultVal: 4 }
  ],
  'Client': [
    { key: 'hiring', label: 'Talent Sourcing', defaultVal: 4 },
    { key: 'scoping', label: 'Project Scoping & Briefs', defaultVal: 4 },
    { key: 'budget', label: 'Milestone & Budget Planning', defaultVal: 3 },
    { key: 'comm', label: 'Stakeholder Communication', defaultVal: 4 }
  ]
};

const ratings = {};
let selectedPath = 'Data Analyst';
let role = 'freelancer';

const showError = (id, message) => {
  const box = $(id);
  box.textContent = message || '';
  box.hidden = !message;
};

function showStep(step) {
  $$('.signup-step-panel').forEach(panel => panel.classList.remove('active'));
  $(`#signupStep${step}`)?.classList.add('active');
  $$('.signup-step-indicator').forEach((indicator, index) => {
    indicator.classList.toggle('active', index + 1 === step);
    indicator.classList.toggle('done', index + 1 < step);
  });
}

function getActiveSkills() {
  return PATH_SKILLS[selectedPath] || PATH_SKILLS['Data Analyst'];
}

function renderSkills() {
  const skills = getActiveSkills();
  const listEl = $('#signupSkillList');
  if (!listEl) return;

  // Initialize ratings for any new skills
  skills.forEach(skill => {
    if (ratings[skill.key] === undefined) {
      ratings[skill.key] = skill.defaultVal || 3;
    }
  });

  listEl.innerHTML = skills.map(skill => {
    const val = ratings[skill.key] || 0;
    return `
      <div class="signup-skill-row">
        <span class="skill-name">${skill.label}</span>
        <div class="skill-stars" data-skill="${skill.key}">
          ${[1, 2, 3, 4, 5].map(v => `<span class="star ${v <= val ? 'lit' : ''}" data-val="${v}">★</span>`).join('')}
        </div>
      </div>`;
  }).join('');
}

function scorePassword(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}

function bindPasswordStrength() {
  const levels = [
    { label: '', color: 'transparent' },
    { label: 'Weak', color: '#d9534f' },
    { label: 'Fair', color: '#e0a030' },
    { label: 'Good', color: '#87977B' },
    { label: 'Strong', color: '#4caf7d' }
  ];
  $('#signupPassword').addEventListener('input', event => {
    const value = event.target.value;
    const level = value ? Math.max(1, scorePassword(value)) : 0;
    $('#strengthFill').style.width = `${level * 25}%`;
    $('#strengthFill').style.background = levels[level].color;
    $('#strengthLabel').textContent = levels[level].label;
    $('#strengthLabel').style.color = levels[level].color;
  });
}

function validateAccount() {
  const name = $('#signupFullName').value.trim();
  const email = $('#signupEmail').value.trim();
  const password = $('#signupPassword').value;
  if (name.length < 2) return 'Enter your full name (at least 2 characters).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email address.';
  if (password.length < 8) return 'Password must contain at least 8 characters.';
  return '';
}

async function createAccount() {
  showError('#registerFinalError', '');
  const button = $('#signupLaunchBtn');
  setBusy(button, true, 'Creating account…');
  try {
    await authService.register({
      name: $('#signupFullName').value.trim(),
      email: $('#signupEmail').value.trim(),
      password: $('#signupPassword').value,
      role
    });

    // Save confident skills and career path headline to the new profile.
    const activeSkills = getActiveSkills();
    const skills = activeSkills.filter(skill => (ratings[skill.key] || 0) >= 3).map(skill => skill.label);
    const headline = selectedPath;
    localStorage.setItem('skillbridge_career_path', selectedPath);
    try {
      await profileService.update({ skills, headline });
    } catch {
      /* optional */
    }

    $$('.signup-steps-bar').forEach(bar => { bar.hidden = true; });
    showStep('Success');
    window.setTimeout(() => { window.location.href = routes.dashboard; }, 1200);
  } catch (error) {
    showError('#registerFinalError', error.message);
    setBusy(button, false);
    if (error.status === 409 || /email/i.test(error.message)) showStep(1);
    showError('#registerError', error.status === 409 ? error.message : '');
  }
}

function bindEvents() {
  $('#togglePasswordBtn').addEventListener('click', () => {
    const input = $('#signupPassword');
    input.type = input.type === 'password' ? 'text' : 'password';
  });

  $('#signupNext1').addEventListener('click', () => {
    const problem = validateAccount();
    showError('#registerError', problem);
    if (!problem) showStep(2);
  });
  $('#signupNext2').addEventListener('click', () => {
    renderSkills();
    showStep(3);
  });
  $('#signupBack2').addEventListener('click', () => showStep(1));
  $('#signupBack3').addEventListener('click', () => showStep(2));
  $('#signupLaunchBtn').addEventListener('click', createAccount);

  // Star rating clicks
  $('#signupSkillList')?.addEventListener('click', event => {
    const star = event.target.closest('.star');
    if (!star) return;
    const holder = star.parentElement;
    const value = Number(star.dataset.val);
    ratings[holder.dataset.skill] = value;
    $$('.star', holder).forEach(item => item.classList.toggle('lit', Number(item.dataset.val) <= value));
  });

  // Career path selection (Data Analyst, UI/UX Designer, etc.)
  $$('.signup-role-card').forEach(card => {
    const select = () => {
      $$('.signup-role-card').forEach(item => item.classList.remove('selected'));
      $('#clientToggleBtn')?.classList.remove('active');
      card.classList.add('selected');
      role = 'freelancer';
      selectedPath = card.dataset.path || 'Data Analyst';
      localStorage.setItem('skillbridge_career_path', selectedPath);
      $('#signupStep3 .signup-subtitle').textContent = "Rate your confidence — we'll tailor your dashboard";
      renderSkills();
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        select();
      }
    });
  });

  // Client toggle button
  $('#clientToggleBtn')?.addEventListener('click', () => {
    $$('.signup-role-card').forEach(item => item.classList.remove('selected'));
    $('#clientToggleBtn')?.classList.add('active');
    role = 'client';
    selectedPath = 'Client';
    localStorage.setItem('skillbridge_career_path', 'Client');
    $('#signupStep3 .signup-subtitle').textContent = "Tell us what skills you're looking to hire for";
    renderSkills();
  });

  $$('#signupStep1 input').forEach(input => input.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); $('#signupNext1').click(); }
  }));
}

renderSkills();
bindPasswordStrength();
bindEvents();
