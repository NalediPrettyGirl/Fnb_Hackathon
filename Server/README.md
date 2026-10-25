# SkillBridge API

See the repository [README](../README.md) for setup, environment variables, frontend modules, API routes, and manual smoke tests.

Quick start from this directory:

```bash
npm install
cp .env.example .env
# Edit .env: set MONGODB_URI and a JWT_SECRET of at least 32 characters.
npm run seed
npm run dev
```

Then open http://localhost:3000. The Express server serves the `Client/` frontend and API from one origin.
