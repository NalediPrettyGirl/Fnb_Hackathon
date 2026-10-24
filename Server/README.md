# SkillBridge Hackathon MVP

SkillBridge is a small full-stack hackathon prototype. It keeps the existing HTML/CSS/vanilla-JavaScript frontend and adds a Node.js + Express REST API backed by MongoDB/Mongoose.

## Architecture

The backend follows a route → controller → service → model → MongoDB flow:

- **Routes** declare HTTP methods, URL paths, and middleware. They should stay thin.
- **Controllers** translate HTTP requests into service calls and format HTTP responses.
- **Services** hold business rules and database workflows. This is where validation, application rules, and XP awarding belong.
- **Models** define MongoDB document schemas, constraints, and indexes.
- **Middleware** handles cross-cutting concerns such as JWT authentication and role checks.
- **Config** contains infrastructure setup, such as connecting to MongoDB.
- **Scripts** contain one-off maintenance tasks such as seeding demo records.

## Folder and file guide

```text
SkillBridge_Hackathon/
├── config/
│   └── database.js                 # Opens the Mongoose connection
├── controllers/
│   ├── applicationController.js    # HTTP responses for applications
│   ├── authController.js           # HTTP responses for register/login
│   ├── dashboardController.js     # HTTP response for dashboard data
│   ├── gigController.js            # HTTP responses for gig browsing/posting/applying
│   └── simulationController.js     # Simulation submission and portfolio responses
├── middleware/
│   └── auth.js                     # Verifies JWT and enforces user roles
├── models/
│   ├── Application.js              # Application schema and duplicate-application index
│   ├── Gig.js                      # Gig schema
│   ├── Simulation.js                # Simulation-task schema
│   ├── Submission.js                # Submitted answer schema and one-completion index
│   └── User.js                      # User schema; password hash is excluded by default
├── routes/
│   ├── applications.js             # /api/applications routes
│   ├── auth.js                     # /api/auth routes
│   ├── dashboard.js                # /api/dashboard route
│   ├── gigs.js                     # /api/gigs routes
│   ├── guides.js                   # Static /api/guides endpoint
│   ├── portfolio.js                # /api/portfolio routes
│   └── simulations.js              # /api/simulations routes
├── scripts/
│   └── seed.js                     # Seeds five tasks, demo client, and example gigs
├── services/
│   ├── applicationService.js       # Application retrieval and client decision rules
│   ├── authService.js              # Registration, password hashing, login, JWT creation
│   ├── dashboardService.js         # Aggregates XP/task/application statistics
│   ├── gigService.js               # Gig queries, creation, and applying to gigs
│   └── simulationService.js        # Lists tasks, stores submissions, awards XP, portfolio
├── .env.example                    # Environment-variable template; no real secrets
├── .gitignore                      # Excludes .env and node_modules
├── index.html                      # Existing frontend page
├── script.js                       # Existing frontend JavaScript
├── style.css                       # Existing frontend styles
├── package.json                    # Dependencies and npm commands
└── server.js                       # Express app setup, route registration, error handling
```

### What each layer should do

**`server.js`** loads environment variables, applies security/JSON/CORS middleware, registers routes, exposes the health endpoint, connects to MongoDB, and starts the HTTP server. It should not contain feature-specific business logic.

**`config/database.js`** contains the one database connection function. Keeping this separate makes the startup file easier to read and the database connection easier to change.

**`routes/*.js`** map paths to controller methods. For example, `routes/gigs.js` says `POST /api/gigs` requires a logged-in client and then calls `gigController.create`. It does not create the database record itself.

**`controllers/*.js`** handle the web/API boundary: read `req.params`, `req.query`, `req.body`, and the authenticated `req.user`; call a service; return the correct HTTP status and JSON response; pass errors to Express using `next(error)`.

**`services/*.js`** contain reusable business operations. `authService` hashes passwords and creates tokens. `gigService` checks gig inputs and open status. `applicationService` ensures only the owner of a gig can accept/reject its applications. `simulationService` stores a completed task and awards XP. `dashboardService` gathers counts for the signed-in user.

**`models/*.js`** define data shape and database-level constraints. The unique indexes on `Application` and `Submission` help prevent duplicate applications and duplicate task completions, including when requests arrive close together.

**`middleware/auth.js`** verifies the bearer JWT, loads the current user from MongoDB, and attaches a safe user object to `req.user`. `allowRoles('client')` and `allowRoles('freelancer')` restrict role-specific operations.

**`scripts/seed.js`** inserts five example simulations, a demo client, and three example gigs when no gigs exist. It is safe to rerun for simulations because it uses upserts. The demo client credentials are for local demos only.

## Setup

Requirements: Node.js 18+ and MongoDB local or Atlas.

```bash
cp .env.example .env
npm install
```

Edit `.env` and set a real MongoDB URI plus a random JWT secret of at least 32 characters. Then:

```bash
npm run seed
npm run dev
```

Open http://localhost:3000. Health check: http://localhost:3000/api/health.

Demo client (local development only): `demo.client@skillbridge.local` / `DemoClient123!`.

## API endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create freelancer/client account |
| POST | `/api/auth/login` | Public | Verify credentials and return JWT |
| GET | `/api/gigs` | Public | Browse open gigs; optional `?search=...`, `?status=all` |
| GET | `/api/gigs/:id` | Public | Read gig details |
| POST | `/api/gigs` | Client JWT | Post a gig |
| POST | `/api/gigs/:id/apply` | Freelancer JWT | Apply to an open gig |
| GET | `/api/applications/me` | JWT | List current user's applications |
| PATCH | `/api/applications/:id/status` | Client JWT | Accept/reject an application to own gig |
| GET | `/api/simulations` | Public | List seeded tasks |
| POST | `/api/simulations/:id/submit` | Freelancer JWT | Complete task and receive XP once |
| GET | `/api/dashboard` | JWT | XP, completed tasks, application counts |
| GET | `/api/portfolio/me` | JWT | List completed simulations |
| GET | `/api/guides` | Public | Static career-track guide JSON |
| GET | `/api/health` | Public | API and database status |

For protected endpoints, send this header:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

### Example registration request

```json
{
  "name": "Demo Freelancer",
  "email": "freelancer@example.com",
  "password": "StrongPass123!",
  "role": "freelancer"
}
```

### Example gig creation request

```json
{
  "title": "Build a small landing page",
  "description": "Create a responsive one-page site for a local business.",
  "budget": 1800,
  "skills": ["HTML", "CSS", "JavaScript"]
}
```

### Example simulation submission request

```json
{
  "answer": "I would inspect missing values, duplicates, data types and invalid values before documenting the cleaning decisions."
}
```

## Important MVP limitations

- Simulation answers are not graded. A valid-length answer completes the task and awards XP.
- JWTs are returned to the frontend; protect them appropriately and never expose the JWT secret.
- Demo seed credentials are not production credentials. Change/remove them before deployment.
- Payments, contracts, recommendation algorithms, real skill grading, and auto-generated portfolios are future work.
- Before a public deployment, add rate limiting, more automated tests, logging/monitoring, stricter CORS origins, and a review of authorization/data privacy.
