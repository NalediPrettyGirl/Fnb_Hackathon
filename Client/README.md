# SkillBridge Client

Plain HTML, CSS and JavaScript (ES modules, no build step). The Express server in `../Server` serves this
folder and the API from the same origin, so run the server and open <http://localhost:5000>.

```
Client/
├── index.html            Landing page (public; shows live gigs + track guides)
├── login.html            Log in
├── register.html         3-step sign-up (account → role → skills)
├── pages/                Signed-in pages, one per feature
│   ├── dashboard.html        role-based (freelancer / client)           GET /dashboard
│   ├── skill-arena.html      simulations + submit answer                GET /simulations, POST /simulations/:id/submit
│   ├── gig-hub.html          browse, search, apply                      GET /gigs, POST /gigs/:id/apply
│   ├── my-applications.html  freelancer applications                    GET /applications/me
│   ├── skill-match.html      gigs ranked by proven skills               GET /skillmatch/me
│   ├── portfolio.html        completed simulations                      GET /portfolio/me
│   ├── progress.html         XP / analytics                             GET /analytics/me
│   ├── track-guides.html     career roadmaps                            GET /guides
│   ├── my-gigs.html          client: manage gigs                        POST/PATCH/DELETE /gigs
│   ├── post-gig.html         client: create / edit a gig
│   ├── gig-applicants.html   client: accept / reject                    GET /applications/gig/:id, PATCH /applications/:id/status
│   ├── notifications.html    notification centre                        GET/PATCH /notifications
│   ├── profile.html          view / edit profile                        GET/PATCH /profile/me
│   └── admin.html            overview + role management                 GET/PATCH /admin/*
├── css/                  The original stylesheet split by purpose (same rules, same order),
│                         plus components.css (shared extras) and landing.css
└── js/
    ├── core/             config, api client, session, routes, guards, dom helpers, toast, modal
    ├── services/         one module per backend feature (all fetch calls live here)
    ├── components/       app shell (sidebar + top bar), notification bell, card renderers
    └── pages/            one entry script per HTML page
```

## Conventions

- All HTTP goes through `js/services/*`, which use `js/core/api.js` (adds the JWT, unwraps `{ success, data }`, throws `ApiError`).
- Every signed-in page starts with `initShell({ active, roles })`, which injects the sidebar and top bar, enforces login and role, and wires notifications.
- Change the sidebar in one place: `js/components/nav-config.js`.
- Currency, XP levels and the API base URL live in `js/core/config.js`.
- To host the client separately from the API, add `<meta name="skillbridge-api" content="https://host/api">` to the pages and set `CLIENT_ORIGIN` in `Server/.env`.

## Checks

`npm test` (in this folder) parses every JS module and verifies that all imports and `<script>` / `<link>` paths resolve.

## API limitations the UI works around

- There is no "my gigs" endpoint, so **My Gigs** pages through `GET /gigs?status=all` and keeps the gigs posted by the signed-in client.
- `GET /api/guides` serves the static list from `routes/guides.js`; the database-backed `guideRoutes.js` is not mounted in `app.js`.
- The Admin link only appears when `GET /admin/overview` succeeds (the account matches `ADMIN_EMAIL`).
