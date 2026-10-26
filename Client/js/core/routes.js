// Page URLs in one place. Works whether the current page is at the root or inside /pages/.
const inPages = window.location.pathname.includes('/pages/');
const toRoot = inPages ? '../' : '';
const toPages = inPages ? '' : 'pages/';

export const routes = {
  home: `${toRoot}index.html`,
  login: `${toRoot}login.html`,
  register: `${toRoot}register.html`,
  dashboard: `${toPages}dashboard.html`,
  skillArena: `${toPages}skill-arena.html`,
  gigHub: `${toPages}gig-hub.html`,
  myApplications: `${toPages}my-applications.html`,
  skillMatch: `${toPages}skill-match.html`,
  portfolio: `${toPages}portfolio.html`,
  progress: `${toPages}progress.html`,
  trackGuides: `${toPages}track-guides.html`,
  myGigs: `${toPages}my-gigs.html`,
  postGig: `${toPages}post-gig.html`,
  gigApplicants: `${toPages}gig-applicants.html`,
  notifications: `${toPages}notifications.html`,
  profile: `${toPages}profile.html`,
  admin: `${toPages}admin.html`
};

export function goTo(route, query = {}) {
  const params = new URLSearchParams(query).toString();
  window.location.href = params ? `${route}?${params}` : route;
}
