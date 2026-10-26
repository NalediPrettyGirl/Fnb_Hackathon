import { routes } from '../core/routes.js';
import { ROLES } from '../core/config.js';
import { icons } from './icons.js';

const { FREELANCER, CLIENT } = ROLES;

// Single source of truth for the sidebar. `roles` controls who sees each entry.
export const NAV_SECTIONS = [
  {
    label: 'YOUR WORK',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: routes.dashboard, icon: icons.dashboard, roles: [FREELANCER, CLIENT] },
      { id: 'skill-arena', label: 'Skill Arena', href: routes.skillArena, icon: icons.arena, chip: { text: 'Simulations', cls: 'hot' }, roles: [FREELANCER] },
      { id: 'gig-hub', label: 'Gig Hub', href: routes.gigHub, icon: icons.gigs, roles: [FREELANCER, CLIENT] },
      { id: 'my-applications', label: 'My Applications', href: routes.myApplications, icon: icons.applications, roles: [FREELANCER] },
      { id: 'skill-match', label: 'Skill Match', href: routes.skillMatch, icon: icons.match, roles: [FREELANCER] },
      { id: 'my-gigs', label: 'My Gigs', href: routes.myGigs, icon: icons.myGigs, roles: [CLIENT] },
      { id: 'post-gig', label: 'Post a Gig', href: routes.postGig, icon: icons.postGig, roles: [CLIENT] }
    ]
  },
  {
    label: 'GROW',
    items: [
      { id: 'portfolio', label: 'Portfolio', href: routes.portfolio, icon: icons.portfolio, roles: [FREELANCER] },
      { id: 'progress', label: 'Progress', href: routes.progress, icon: icons.progress, roles: [FREELANCER] },
      { id: 'track-guides', label: 'Track Guides', href: routes.trackGuides, icon: icons.guides, chip: { text: 'Roadmaps', cls: 'roadmaps' }, roles: [FREELANCER, CLIENT] }
    ]
  },
  {
    label: 'ACCOUNT',
    items: [
      { id: 'profile', label: 'Profile', href: routes.profile, icon: icons.profile, roles: [FREELANCER, CLIENT] },
      { id: 'admin', label: 'Admin', href: routes.admin, icon: icons.admin, roles: [FREELANCER, CLIENT], adminOnly: true }
    ]
  }
];
