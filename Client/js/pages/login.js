import { redirectIfSignedIn, showFlashMessage } from '../core/guard.js';
import { authService } from '../services/auth.js';
import { routes } from '../core/routes.js';
import { readQuery, setBusy, $ } from '../core/dom.js';
import { notify } from '../core/toast.js';

redirectIfSignedIn();
showFlashMessage();

const form = $('#loginForm');
const errorBox = $('#loginError');

// Only allow redirects back into this site's own app pages.
function nextDestination() {
  const next = readQuery('next');
  return next && /^[a-z0-9-]+\.html$/i.test(next) ? `pages/${next}` : routes.dashboard;
}

$('#togglePasswordBtn').addEventListener('click', () => {
  const input = $('#loginPassword');
  input.type = input.type === 'password' ? 'text' : 'password';
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  errorBox.hidden = true;
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  if (!email || !password) {
    errorBox.textContent = 'Enter your email and password.';
    errorBox.hidden = false;
    return;
  }
  if (!email.includes('@')) {
    errorBox.textContent = 'Please enter a valid email address (e.g. you@company.com).';
    errorBox.hidden = false;
    return;
  }
  const button = $('#loginSubmit');
  setBusy(button, true, 'Logging in…');
  try {
    await authService.login(email, password);
    notify('You are now logged in.', 'success');
    window.location.href = nextDestination();
  } catch (error) {
    const isNetwork = error.status === 0 || /Cannot reach/i.test(error.message);
    errorBox.textContent = isNetwork
      ? 'Cannot reach API. The cloud server may be waking up from sleep — please retry in a few seconds.'
      : error.message;
    errorBox.hidden = false;
    setBusy(button, false);
  }
});
