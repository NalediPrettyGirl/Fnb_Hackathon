import { api, session, notify, escapeHtml } from './api.js';

const overlay = () => document.getElementById('signupOverlay');
let mode = 'register';
let selectedRole = 'freelancer';

function showAuthStep(step) {
  document.querySelectorAll('.signup-step-panel').forEach(panel => panel.classList.remove('active'));
  const target = document.getElementById(`signupStep${step}`);
  target?.classList.add('active');
  document.querySelectorAll('.signup-step-indicator').forEach((indicator, index) => {
    indicator.classList.toggle('active', index + 1 === step);
    indicator.classList.toggle('done', index + 1 < step);
  });
}

function setMode(nextMode) {
  mode = nextMode;
  const name = document.getElementById('signupFullName');
  const step2 = document.getElementById('signupNext1');
  const loginLink = document.getElementById('signupLoginLink');
  const heading = document.querySelector('#signupStep1 h2');
  const subtitle = document.querySelector('#signupStep1 .signup-subtitle');
  const roleStep = document.querySelector('.signup-steps-bar');
  if (mode === 'login') {
    if (name) name.closest('.signup-form-group').hidden = true;
    if (step2) step2.textContent = 'Log in';
    if (heading) heading.textContent = 'Welcome Back';
    if (subtitle) subtitle.textContent = 'Log in to continue your SkillBridge journey.';
    if (roleStep) roleStep.hidden = true;
    if (loginLink) loginLink.textContent = 'Create an account';
    showAuthStep(1);
  } else {
    if (name) name.closest('.signup-form-group').hidden = false;
    if (step2) step2.textContent = 'Continue →';
    if (heading) heading.textContent = 'Create Your Account';
    if (subtitle) subtitle.textContent = 'Build practical skills and connect with freelance opportunities.';
    if (roleStep) roleStep.hidden = false;
    if (loginLink) loginLink.textContent = 'Log in';
    showAuthStep(1);
  }
}

function showOverlay() {
  const element = overlay();
  if (!element) return;
  element.classList.remove('hidden');
  document.body.classList.add('signup-active');
}

function hideOverlay(user) {
  const element = overlay();
  if (element) element.classList.add('hidden');
  document.body.classList.remove('signup-active');
  if (user) {
    const name = user.name || 'SkillBridge member';
    const initials = name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
    document.querySelectorAll('.user-name').forEach(node => node.textContent = name);
    document.querySelectorAll('.user-avatar').forEach(node => node.textContent = initials);
  }
}

async function authenticate() {
  const name = document.getElementById('signupFullName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPassword')?.value;
  if (!email || !password || (mode === 'register' && !name)) {
    notify(mode === 'register' ? 'Enter your name, email and password.' : 'Enter your email and password.', 'error');
    return;
  }
  if (mode === 'register' && password.length < 8) {
    notify('Password must contain at least 8 characters.', 'error');
    return;
  }
  try {
    const result = await api(`/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify(mode === 'register'
        ? { name, email, password, role: selectedRole }
        : { email, password })
    });
    session.save(result);
    hideOverlay(result.user);
    notify(mode === 'register' ? 'Account created successfully.' : 'You are now logged in.', 'success');
    window.dispatchEvent(new CustomEvent('skillbridge:authenticated', { detail: result }));
  } catch (error) {
    notify(error.message, 'error');
  }
}

export function logout() {
  session.clear();
  showOverlay();
  setMode('login');
  notify('You have been signed out.', 'success');
}

export function initAuth() {
  document.querySelectorAll('.signup-role-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.signup-role-card').forEach(item => item.classList.remove('selected'));
      card.classList.add('selected');
      selectedRole = card.dataset.role === 'client' ? 'client' : 'freelancer';
    });
  });

  document.getElementById('signupNext1')?.addEventListener('click', () => {
    if (mode === 'login') authenticate();
    else {
      const name = document.getElementById('signupFullName')?.value.trim();
      const email = document.getElementById('signupEmail')?.value.trim();
      const password = document.getElementById('signupPassword')?.value || '';
      if (!name || !email || password.length < 8) {
        notify('Enter your name, a valid email and a password of at least 8 characters.', 'error');
        return;
      }
      showAuthStep(2);
    }
  });
  document.getElementById('signupNext2')?.addEventListener('click', () => showAuthStep(3));
  document.getElementById('signupBack2')?.addEventListener('click', () => showAuthStep(1));
  document.getElementById('signupBack3')?.addEventListener('click', () => showAuthStep(2));
  document.getElementById('signupLaunchBtn')?.addEventListener('click', authenticate);
  document.getElementById('signupLoginLink')?.addEventListener('click', event => {
    event.preventDefault();
    setMode(mode === 'register' ? 'login' : 'register');
  });
  document.getElementById('signupEyeBtn')?.addEventListener('click', () => {
    const input = document.getElementById('signupPassword');
    if (!input) return;
    input.type = input.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('signOutBtn')?.addEventListener('click', logout);

  window.addEventListener('skillbridge:session-expired', () => {
    showOverlay();
    setMode('login');
    notify('Your session expired. Please log in again.', 'error');
  });

  if (session.token && session.user) hideOverlay(session.user);
  else { showOverlay(); setMode('login'); }
}
