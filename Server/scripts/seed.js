require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Gig = require('../models/Gig');
const Simulation = require('../models/Simulation');

const simulationSeed = [
  // ── DATA ANALYTICS ──────────────────────────────────────────────────────────
  {
    title: 'Clean a Messy Sales Dataset',
    brief: 'You receive a CSV export from a retail chain with 12,000 rows of monthly sales data. The file contains: missing values in the "region" and "sales_rep" columns, duplicate order IDs, dates stored as text in mixed formats (DD/MM/YYYY and YYYY-MM-DD), and sales amounts with currency symbols that prevent numeric calculations.\n\nDescribe your step-by-step cleaning approach: how you identify each issue, the tools or functions you would use, and the validation checks you would run to confirm the data is clean before handing it to the analysis team.',
    skillTrack: 'Data Analytics', xpReward: 25, difficulty: 'Beginner', estimatedMinutes: 20,
    company: 'Aura Commerce Global', industry: 'Retail / Direct-to-Consumer Omnichannel'
  },
  {
    title: 'Build a Sales Performance Dashboard',
    brief: 'The Head of Sales at a mid-size e-commerce company wants a single dashboard that answers three questions every Monday morning:\n1. Which product categories generated the most revenue last week vs the week before?\n2. Which sales reps are below their monthly target, and by how much?\n3. Where are customers dropping off in the funnel (browse → cart → checkout → payment)?\n\nDescribe the visualisation types you would choose for each question, the data sources you would connect, and any calculated fields or KPIs you would create. Explain your design decisions.',
    skillTrack: 'Data Analytics', xpReward: 35, difficulty: 'Intermediate', estimatedMinutes: 30,
    company: 'Veloce Freight Systems', industry: 'Logistics / Cross-Dock & Last-Mile Telematics'
  },
  {
    title: 'Investigate a Sudden Drop in Conversions',
    brief: 'Traffic to your e-commerce client\'s website is unchanged week-over-week, but the checkout conversion rate dropped from 3.8% to 2.1% overnight. You have access to Google Analytics, the payment gateway logs, and a database of A/B test variants currently running.\n\nWrite a structured investigation plan: what hypotheses you would form, which data you would pull first, how you would isolate the root cause, and what you would communicate to the product team while the investigation is in progress.',
    skillTrack: 'Data Analytics', xpReward: 45, difficulty: 'Advanced', estimatedMinutes: 40,
    company: 'Aegis Health Group', industry: 'Healthcare / Multi-state Hospital Revenue Cycle Audit'
  },
  {
    title: 'Forecast Next Quarter\'s Revenue',
    brief: 'You have 24 months of monthly revenue data for a SaaS company. Revenue has grown steadily but shows a clear seasonal dip every December and January. The sales team plans to launch a new pricing tier in month 25.\n\nExplain which forecasting approach you would use (e.g. moving average, exponential smoothing, linear regression, or another method), how you would account for seasonality, and how you would model the impact of the new pricing tier. State your assumptions clearly.',
    skillTrack: 'Data Analytics', xpReward: 50, difficulty: 'Advanced', estimatedMinutes: 45,
    company: 'Solon Capital & Risk', industry: 'Fintech / Fraud Prevention & Real-Time Stress Testing'
  },

  // ── SQL ─────────────────────────────────────────────────────────────────────
  {
    title: 'Write a SQL Business Query',
    brief: 'The marketing team asks: "Which product categories generated the most revenue in each of the last three months, and how does that compare to the same period last year?"\n\nYou have access to two tables:\n• orders(order_id, customer_id, order_date, total_amount, status)\n• order_items(item_id, order_id, product_id, category, quantity, unit_price)\n\nWrite the SQL query (or queries) that answer the question. Explain each clause and any assumptions you make about the schema.',
    skillTrack: 'SQL', xpReward: 30, difficulty: 'Beginner', estimatedMinutes: 25,
    company: 'Vanguard Athletics Co.', industry: 'Sports / Matchday Fan Merchandising Analytics'
  },
  {
    title: 'Find Duplicate and Orphaned Records',
    brief: 'Your database has grown organically and the data team suspects integrity problems. Write SQL to:\n1. Identify customers with more than one account using the same email address.\n2. Find orders that reference a product_id that no longer exists in the products table.\n3. List invoices that have no matching payment record after 30 days.\n\nFor each query, explain your join strategy, how you handle NULLs, and what index you would recommend to make the query performant at scale.',
    skillTrack: 'SQL', xpReward: 40, difficulty: 'Intermediate', estimatedMinutes: 35,
    company: 'Helios BioPharma Labs', industry: 'Biotech / Cold-Chain Clinical Supply Logistics'
  },
  {
    title: 'Optimise a Slow-Running Report Query',
    brief: 'A weekly report query that used to run in 4 seconds now takes 3 minutes. It joins six tables, uses several subqueries, and applies multiple LIKE filters on un-indexed columns. The EXPLAIN plan shows full table scans on the two largest tables (8M and 22M rows).\n\nDescribe your optimisation approach: how you read the execution plan, which indexes you would add and why, how you might rewrite subqueries as CTEs or window functions, and how you would validate that the optimisation does not change the results.',
    skillTrack: 'SQL', xpReward: 55, difficulty: 'Advanced', estimatedMinutes: 45,
    company: 'Solon Capital & Risk', industry: 'Fintech / Fraud Prevention & Real-Time Stress Testing'
  },
  {
    title: 'Build a Cohort Retention Analysis',
    brief: 'Your product manager wants to understand user retention. Users who sign up in the same calendar month form a "cohort". You need to show, for each cohort, what percentage of users were still active (made at least one action) in each of the 6 months after sign-up.\n\nYou have: users(user_id, signup_date) and events(event_id, user_id, event_date, event_type).\n\nWrite the SQL to produce a cohort-by-month retention matrix. Explain any window functions or date arithmetic you use.',
    skillTrack: 'SQL', xpReward: 60, difficulty: 'Advanced', estimatedMinutes: 50,
    company: 'Vanguard Athletics Co.', industry: 'Sports / Matchday Fan Merchandising Analytics'
  },

  // ── WEB DEVELOPMENT ─────────────────────────────────────────────────────────
  {
    title: 'Design a REST API',
    brief: 'A startup is building a task-management tool for remote teams. Design a REST API that supports:\n• User registration and JWT login\n• Creating, reading, updating, and archiving tasks (not hard-delete)\n• Assigning tasks to team members\n• Filtering tasks by status, assignee, and due date\n\nFor each endpoint specify: HTTP method, path, request body or query params, success response shape, and at least two relevant error responses with status codes. Explain your decisions around authentication, versioning, and pagination.',
    skillTrack: 'Web Development', xpReward: 30, difficulty: 'Beginner', estimatedMinutes: 25,
    company: 'Nexus DevOps', industry: 'SaaS / Developer Productivity'
  },
  {
    title: 'Debug a Broken React Component',
    brief: 'A colleague pushed a React component that fetches user data on mount and displays it in a table. Users report that:\n• The component re-fetches every second even when nothing changes.\n• Clicking "Sort by name" crashes the app with "Cannot read properties of undefined".\n• On slow connections the loading spinner never disappears.\n\nYou cannot run the code — you must reason from symptoms. Describe the three most likely bugs (one per symptom), the exact code pattern that would cause each, and the fix you would apply. Write the corrected useEffect hook for the re-fetch issue.',
    skillTrack: 'Web Development', xpReward: 40, difficulty: 'Intermediate', estimatedMinutes: 35,
    company: 'Nexus DevOps', industry: 'SaaS / Developer Productivity'
  },
  {
    title: 'Plan a Performant E-Commerce Frontend',
    brief: 'A fashion retailer\'s website scores 28/100 on Lighthouse performance. Their homepage loads 4.2 MB of images, uses a 380 KB blocking CSS bundle, and renders a 200-item product grid on first load.\n\nWrite a prioritised improvement plan covering: image optimisation strategy, CSS delivery, JavaScript bundle splitting, lazy loading, and server-side vs client-side rendering trade-offs. For each change, estimate the likely performance gain and any trade-offs.',
    skillTrack: 'Web Development', xpReward: 50, difficulty: 'Advanced', estimatedMinutes: 40,
    company: 'Aura Commerce Global', industry: 'Retail / Direct-to-Consumer Omnichannel'
  },
  {
    title: 'Secure a Node.js API Against Common Attacks',
    brief: 'You are reviewing a Node.js/Express API before its public launch. During a code review you spot:\n• User-supplied input is interpolated directly into MongoDB queries.\n• Passwords are hashed with MD5.\n• There is no rate limiting on the login endpoint.\n• JWT secrets are stored in the repo as plain text.\n• CORS is set to allow all origins.\n\nFor each vulnerability, name the attack it enables, explain the impact, and write the corrected code snippet or configuration that fixes it.',
    skillTrack: 'Web Development', xpReward: 60, difficulty: 'Advanced', estimatedMinutes: 50,
    company: 'Solon Capital & Risk', industry: 'Fintech / Fraud Prevention & Real-Time Stress Testing'
  },

  // ── UI/UX DESIGN ────────────────────────────────────────────────────────────
  {
    title: 'Improve a User Journey',
    brief: 'A user abandons a three-step registration form at step 2 ("Verify your email") at a rate of 68%. The current flow is: Step 1 — Enter name, email, password. Step 2 — Enter the 6-digit code emailed to them. Step 3 — Choose a subscription plan.\n\nSuggest three specific design or UX changes that could reduce drop-off. For each change: describe what you would alter, explain the psychological principle or UX heuristic behind it, and explain how you would measure whether it worked.',
    skillTrack: 'UI/UX Design', xpReward: 25, difficulty: 'Beginner', estimatedMinutes: 20,
    company: 'Aura Commerce Global', industry: 'Retail / Direct-to-Consumer Omnichannel'
  },
  {
    title: 'Design a Mobile Dashboard for Field Workers',
    brief: 'A logistics company has 200 field delivery drivers who currently use paper forms. You are designing a mobile app dashboard for them. Constraints: drivers use it with one hand while standing, they have unreliable 3G coverage, and many are not tech-savvy.\n\nDescribe: the three most critical pieces of information to show on the home screen, how you would handle offline mode, your approach to the navigation structure, and two accessibility considerations. Sketch or describe the hierarchy of a single key screen.',
    skillTrack: 'UI/UX Design', xpReward: 40, difficulty: 'Intermediate', estimatedMinutes: 35,
    company: 'Veloce Freight Systems', industry: 'Logistics / Cross-Dock & Last-Mile Telematics'
  },
  {
    title: 'Conduct a Heuristic Evaluation',
    brief: 'You are evaluating the checkout flow of a mid-size e-commerce site. During a walkthrough you notice: the "Place Order" button is grey and looks disabled; error messages disappear after 2 seconds; the back button clears the entire cart; there is no order summary visible during payment; and the site uses 8 different shades of blue inconsistently.\n\nUsing Nielsen\'s 10 usability heuristics, map each issue to the heuristic it violates, rate the severity (1–4), and propose a specific fix for the three highest-severity issues.',
    skillTrack: 'UI/UX Design', xpReward: 45, difficulty: 'Intermediate', estimatedMinutes: 40,
    company: 'Vanguard Athletics Co.', industry: 'Sports / Matchday Fan Merchandising Analytics'
  },
  {
    title: 'Design a Design System from Scratch',
    brief: 'A fast-growing startup has 4 product teams building separate web apps. Each team has built its own buttons, forms, and colour palettes — the products look like they are from different companies.\n\nDescribe: the core token categories you would define first (colour, spacing, typography, etc.), how you would handle component variants and states, your strategy for getting designer and developer buy-in, and how you would version and maintain the system as products evolve.',
    skillTrack: 'UI/UX Design', xpReward: 55, difficulty: 'Advanced', estimatedMinutes: 50,
    company: 'Nexus DevOps', industry: 'SaaS / Developer Productivity'
  },

  // ── BUSINESS ANALYSIS ───────────────────────────────────────────────────────
  {
    title: 'Communicate an Insight',
    brief: 'Your analysis shows that sales fell 15% this month compared to the same month last year. Before presenting to the executive team, you need to ensure your finding is solid and actionable.\n\nList the validation checks and supporting evidence you would gather before the meeting. Describe how you would structure the presentation: what context you would open with, how you would present the data, and what recommendations or next steps you would propose.',
    skillTrack: 'Business Analysis', xpReward: 35, difficulty: 'Beginner', estimatedMinutes: 25,
    company: 'Solon Capital & Risk', industry: 'Fintech / Fraud Prevention & Real-Time Stress Testing'
  },
  {
    title: 'Write a Business Requirements Document',
    brief: 'A regional bank wants to launch a mobile feature that allows customers to temporarily freeze/unfreeze their debit card from the app. You are the BA responsible for the requirements.\n\nWrite a mini BRD covering: the business objective, three user stories with acceptance criteria, a list of functional requirements (at least 5), two non-functional requirements (e.g. security, performance), and a list of assumptions and out-of-scope items.',
    skillTrack: 'Business Analysis', xpReward: 45, difficulty: 'Intermediate', estimatedMinutes: 40,
    company: 'Solon Capital & Risk', industry: 'Fintech / Fraud Prevention & Real-Time Stress Testing'
  },
  {
    title: 'Map and Improve a Business Process',
    brief: 'A healthcare provider\'s patient onboarding takes an average of 11 days from referral to first appointment. The current process: GP refers patient (Day 1) → Referral faxed to specialist (Day 2) → Admin enters referral into system (Day 3-4) → Insurance pre-authorisation requested (Day 4-7) → Appointment scheduled manually by phone (Day 8-10) → Confirmation letter posted (Day 11).\n\nIdentify the biggest bottlenecks. Propose a redesigned process that could reduce the time to under 3 days. Specify which steps you would automate, digitise, or eliminate, and what risks your redesign introduces.',
    skillTrack: 'Business Analysis', xpReward: 55, difficulty: 'Advanced', estimatedMinutes: 45,
    company: 'Aegis Health Group', industry: 'Healthcare / Multi-state Hospital Revenue Cycle Audit'
  },
  {
    title: 'Prioritise a Product Backlog',
    brief: 'You are the BA on a team that has 40 backlog items across: bug fixes, new features requested by sales, infrastructure upgrades, and a compliance deadline in 6 weeks. The team has capacity for 12 story points per sprint and runs 2-week sprints.\n\nDescribe the prioritisation framework you would use (e.g. MoSCoW, WSJF, Kano), how you would handle the compliance deadline vs other items, how you would communicate trade-offs to stakeholders, and what information you need from the team before finalising the order.',
    skillTrack: 'Business Analysis', xpReward: 50, difficulty: 'Advanced', estimatedMinutes: 40,
    company: 'Nexus DevOps', industry: 'SaaS / Developer Productivity'
  },
  {
    title: 'Conduct a Stakeholder Analysis',
    brief: 'A city municipality is rolling out a new digital permit application system to replace a paper-based process. Stakeholders include: property owners, building contractors, municipal clerks, inspectors, IT department, the mayor\'s office, and local advocacy groups concerned about digital exclusion.\n\nCreate a stakeholder map: classify each group by their level of interest and influence, describe their primary concerns, and propose a specific engagement or communication strategy for the three most critical stakeholder groups.',
    skillTrack: 'Business Analysis', xpReward: 40, difficulty: 'Intermediate', estimatedMinutes: 35,
    company: 'Aegis Health Group', industry: 'Healthcare / Multi-state Hospital Revenue Cycle Audit'
  }
];

const gigSeed = [
  { title: 'Build a Small Business Landing Page', description: 'Create a responsive one-page website for a local service business. Include services, contact details and a WhatsApp call-to-action.', budget: 1800, skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'] },
  { title: 'Sales Data Cleanup and Summary', description: 'Clean a spreadsheet of sales records, document data-quality issues and prepare a concise summary of monthly performance.', budget: 1200, skills: ['Excel', 'Data Cleaning', 'Reporting'] },
  { title: 'Create a Basic MongoDB API', description: 'Build a small Express REST API with CRUD endpoints, request validation and MongoDB persistence.', budget: 2500, skills: ['Node.js', 'Express', 'MongoDB', 'REST API'] },
  { title: 'SQL Report for Finance Team', description: 'Write and document a set of SQL queries that generate a weekly revenue report from a PostgreSQL database.', budget: 1500, skills: ['SQL', 'PostgreSQL', 'Reporting'] },
  { title: 'UX Audit of Mobile App', description: 'Conduct a heuristic evaluation of an existing iOS app and deliver a prioritised list of UX improvements with mockup sketches.', budget: 2000, skills: ['UI/UX Design', 'User Research', 'Figma'] },
  { title: 'E-Commerce Analytics Dashboard', description: 'Connect Google Analytics and Shopify data in Looker Studio and build an executive dashboard showing revenue, conversion and top products.', budget: 3000, skills: ['Data Analytics', 'Looker Studio', 'Google Analytics'] },
  { title: 'Business Requirements for New Feature', description: 'Interview stakeholders and produce a BRD for a customer loyalty points feature on an existing mobile banking app.', budget: 2200, skills: ['Business Analysis', 'Requirements Gathering', 'Documentation'] }
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is missing. Copy .env.example to .env and configure MongoDB.');
  await mongoose.connect(process.env.MONGODB_URI);
  let client = await User.findOne({ email: 'demo.client@skillbridge.local' });
  if (!client) client = await User.create({ name: 'SkillBridge Demo Client', email: 'demo.client@skillbridge.local', passwordHash: await bcrypt.hash('DemoClient123!', 12), role: 'client' });
  const existingGigs = await Gig.countDocuments();
  if (existingGigs === 0) await Gig.insertMany(gigSeed.map(gig => ({ ...gig, postedBy: client._id })));
  for (const item of simulationSeed) await Simulation.updateOne({ title: item.title }, { $setOnInsert: item }, { upsert: true });
  console.log(`Seed complete. Gigs in database: ${await Gig.countDocuments()}; simulations: ${await Simulation.countDocuments()}.`);
  console.log('Demo client login: demo.client@skillbridge.local / DemoClient123!');
  await mongoose.disconnect();
}
seed().catch(async error => { console.error(error); await mongoose.disconnect().catch(() => {}); process.exit(1); });
