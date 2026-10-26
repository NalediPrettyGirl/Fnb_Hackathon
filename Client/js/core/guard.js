import { session } from './session.js';
import { routes } from './routes.js';
import { SESSION_EXPIRED_EVENT } from './api.js';
import { notify } from './toast.js';

/** Redirects to the login page when there is no session, or to the dashboard when the role is not allowed. */
export function requireSession(allowedRoles) {
  if (!session.isLoggedIn) {
    const next = encodeURIComponent(window.location.pathname.split('/').pop() || '');
    window.location.replace(`${routes.login}?next=${next}`);
    return null;
  }
  const { user } = session;
  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    sessionStorage.setItem('skillbridge_flash', `That page is only for ${allowedRoles.join(' / ')} accounts.`);
    window.location.replace(routes.dashboard);
    return null;
  }
  window.addEventListener(SESSION_EXPIRED_EVENT, () => {
    sessionStorage.setItem('skillbridge_flash', 'Your session expired. Please log in again.');
    window.location.replace(routes.login);
  });
  return user;
}

/** Public pages (login/register) send signed-in visitors straight to the app. */
export function redirectIfSignedIn() {
  if (session.isLoggedIn) window.location.replace(routes.dashboard);
}

/** Shows one-shot messages left by a previous page (e.g. "session expired", "signed out"). */
export function showFlashMessage() {
  [['skillbridge_flash', 'error'], ['skillbridge_flash_ok', 'success']].forEach(([key, type]) => {
    const message = sessionStorage.getItem(key);
    if (message) {
      sessionStorage.removeItem(key);
      notify(message, type);
    }
  });
}
