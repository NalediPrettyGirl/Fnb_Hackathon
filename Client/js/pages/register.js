import { redirectIfSignedIn } from '../core/guard.js';
import { authService } from '../services/auth.js';
import { profileService } from '../services/profile.js';
import { routes } from '../core/routes.js';
import { setBusy, $, $$ } from '../core/dom.js';

redirectIfSignedIn();

// Self-assessed skills collected in step 3 (saved to the profile after sign-up).
const SKILLS = [
  { key: 'sql', label: 'SQL & Databases' },
  { key: 'viz', label: 'Data Visualization' },
  { key: 'comm', label: 'Business Communication' },
  { key: 'web', label: 'Web Development' },
  { key: 'design', label: 'UI/UX Design' }
];
const ratings = {};
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

function renderSkills() {
  $('#signupSkillList').innerHTML = SKILLS.map(skill => `
    <div class="signup-skill-row">
      <span class="skill-name">${skill.label}</span>
      <div class="skill-stars" data-skill="${skill.key}">
        ${[1, 2, 3, 4, 5].map(value => `<span class="star" data-val="${value}">★</span>`).join('')}
      </div>
    </div>`).join('');

  $('#signupSkillList').addEventListener('click', event => {
    const star = event.target.closest('.star');
    if (!star) return;
    const holder = star.parentElement;
    const value = Number(star.dataset.val);
    ratings[holder.dataset.skill] = value;
    $$('.star', holder).forEach(item => item.classList.toggle('lit', Number(item.dataset.val) <= value));
  });
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

    // Save confident skills to the new profile. Failure here must not block sign-up.
    const skills = SKILLS.filter(skill => (ratings[skill.key] || 0) >= 3).map(skill => skill.label);
    if (skills.length) {
      try { await profileService.update({ skills }); } catch { /* optional */ }
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
  $('#signupNext2').addEventListener('click', () => showStep(3));
  $('#signupBack2').addEventListener('click', () => showStep(1));
  $('#signupBack3').addEventListener('click', () => showStep(2));
  $('#signupLaunchBtn').addEventListener('click', createAccount);

  $$('.signup-role-card').forEach(card => {
    const select = () => {
      $$('.signup-role-card').forEach(item => item.classList.remove('selected'));
      card.classList.add('selected');
      role = card.dataset.role;
      // Skill ratings only matter for freelancers.
      $('#signupStep3 .signup-subtitle').textContent = role === 'freelancer'
        ? 'Rate your confidence — skills rated 3★ or more are added to your profile'
        : 'Optional — tell us which skills you usually hire for (3★ or more are saved to your profile)';
    };
    card.addEventListener('click', select);
    card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); select(); } });
  });

  $$('#signupStep1 input').forEach(input => input.addEventListener('keydown', event => {
    if (event.key === 'Enter') { event.preventDefault(); $('#signupNext1').click(); }
  }));
}

renderSkills();
bindPasswordStrength();
bindEvents();
