import { request, unwrap } from '../core/api.js';

export const ENTERPRISE_SIMULATIONS = [
  {
    _id: 'sim-aura-01',
    company: 'Aura Commerce Global',
    industry: 'Retail / Direct-to-Consumer Omnichannel',
    icon: '🛍️',
    isPro: false,
    access: 'Free Access',
    openRoles: 32,
    roles: [
      'Senior CPFR Analyst Walmart at Unilever',
      'Growth Strategy Analyst, Performance & Creative',
      'Analyst - Loyalty Management & Marketing Retention'
    ],
    tags: ['SQL', 'Power BI'],
    score: '98/100',
    skillTrack: 'SQL',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    xpReward: 40,
    title: 'Omnichannel Retail Demand & Inventory Forecast',
    brief: 'Analyze customer transaction history across physical retail stores and direct-to-consumer e-commerce channels. Write queries to detect cross-channel cannibalization, evaluate basket size discrepancies, and forecast reorder triggers for high-velocity SKUs.'
  },
  {
    _id: 'sim-veloce-02',
    company: 'Veloce Freight Systems',
    industry: 'Logistics / Cross-Dock & Last-Mile Telematics',
    icon: '🚚',
    isPro: false,
    access: 'Free Access',
    openRoles: 16,
    roles: [
      'Senior Financial Analyst - Operational Logistics',
      'Last-Mile Dispatch Route Optimization Lead',
      'Carrier SLA Compliance Specialist at Maersk'
    ],
    tags: ['SQL', 'Excel'],
    score: '95/100',
    skillTrack: 'SQL',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    xpReward: 35,
    title: 'Last-Mile Delivery SLA & Telematics Discrepancy Audit',
    brief: 'Cross-dock telematics logs show carrier transit delays exceeding SLA thresholds by 18%. Use SQL and structured spreadsheet models to pinpoint route failure nodes, quantify penalty charges owed by third-party dispatchers, and generate executive summaries.'
  },
  {
    _id: 'sim-aegis-03',
    company: 'Aegis Health Group',
    industry: 'Healthcare - Multi-state Hospital Revenue Cycle Audit',
    icon: '🏥',
    isPro: true,
    access: '🔒 Pro',
    openRoles: 11,
    roles: [
      'Sr. Healthcare Claims Data Analyst | Remote',
      'Inpatient Modifier Coding Auditor',
      'Clinical Telehealth Performance Consultant'
    ],
    tags: ['SQL', 'Python'],
    score: null,
    skillTrack: 'SQL',
    difficulty: 'Advanced',
    estimatedMinutes: 40,
    xpReward: 50,
    title: 'Multi-State Hospital Revenue Cycle & Claims Denial Audit',
    brief: 'Inspect hospital electronic health records (EHR) and ICD-10 medical billing claim logs to isolate recurring denial codes from private and government insurers. Quantify write-off risks and propose automated pre-bill scrubber rules.'
  },
  {
    _id: 'sim-solon-04',
    company: 'Solon Capital & Risk',
    industry: 'Fintech / Fraud Prevention & Real-Time Stress Testing',
    icon: '🏛️',
    isPro: true,
    access: '🔒 Pro',
    openRoles: 48,
    roles: [
      'Quantitative Risk & Exposure Modeler',
      'Anti-Money Laundering Rule Engine Engineer',
      'Credit Portfolio Stress Test Analyst'
    ],
    tags: ['SQL', 'Python'],
    score: null,
    skillTrack: 'SQL',
    difficulty: 'Advanced',
    estimatedMinutes: 45,
    xpReward: 60,
    title: 'Real-Time Fraud Ring Detection & Card Transaction Velocity',
    brief: 'High-velocity synthetic identity fraud spikes detected across neo-bank accounts. Build SQL window functions and anomaly detection rules to catch multi-card cash-out clusters within 30-second sliding windows.'
  },
  {
    _id: 'sim-vanguard-05',
    company: 'Vanguard Athletics Co.',
    industry: 'Sports / Matchday Fan Merchandising Analytics',
    icon: '⚽',
    isPro: false,
    access: 'Free Access',
    openRoles: 29,
    roles: [
      'Fan Engagement & Stadium Revenue Specialist',
      'Merchandising Inventory Optimization Lead',
      'Season Ticket Churn & Retention Analyst'
    ],
    tags: ['SQL', 'Power BI'],
    score: '92/100',
    skillTrack: 'SQL',
    difficulty: 'Beginner',
    estimatedMinutes: 20,
    xpReward: 30,
    title: 'Matchday Stadium Merchandising & Concession Revenue Modeling',
    brief: 'Matchday concession stand sales peak in 15-minute bursts at halftime. Analyze Point of Sale (POS) receipts to forecast inventory depletion, dynamic staff scheduling, and high-margin merchandise bundles.'
  },
  {
    _id: 'sim-helios-06',
    company: 'Helios BioPharma Labs',
    industry: 'Biotech / Cold-Chain Clinical Supply Logistics',
    icon: '💊',
    isPro: true,
    access: '🔒 Pro',
    openRoles: 14,
    roles: [
      'Clinical Trial Supply Chain Integrity Analyst',
      'Temperature Excursion Risk Modeler',
      'GxP Regulatory Compliance Specialist'
    ],
    tags: ['SQL', 'Python'],
    score: null,
    skillTrack: 'SQL',
    difficulty: 'Advanced',
    estimatedMinutes: 35,
    xpReward: 55,
    title: 'Cold-Chain IoT Sensor Temperature Excursion & Batch Loss Analysis',
    brief: 'Phase III vaccine trial vials require strict -70°C storage. Query sensor telemetry time-series to identify excursion windows, assess batch viability loss, and generate FDA 21 CFR Part 11 compliant audit trails.'
  },

  // ── CONTENT WRITER / JOURNALIST ─────────────────────────────────────────────
  {
    _id: 'sim-apex-07',
    company: 'Apex Media & Publishing',
    industry: 'Digital Journalism & Investigative Tech Reporting',
    icon: '📰',
    isPro: false,
    access: 'Free Access',
    openRoles: 28,
    roles: [
      'Senior Technology Columnist & Investigative Writer',
      'Editorial Lead - Emerging Tech & AI Policy',
      'Longform Features Journalist - Wired Syndicate'
    ],
    tags: ['Editorial', 'Research', 'SEO'],
    score: '96/100',
    skillTrack: 'Content Writing',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    xpReward: 45,
    title: 'Investigative Tech Feature & Deep-Dive Editorial',
    brief: 'Research and draft a 1,200-word investigative feature on generative AI adoption across South African fintech startups. Synthesize founder interviews, balance technical veracity with narrative pace, and construct a compelling lead hook.'
  },
  {
    _id: 'sim-omnipulse-08',
    company: 'OmniPulse SaaS Communications',
    industry: 'B2B Enterprise Content & Case Study Architecture',
    icon: '✍️',
    isPro: false,
    access: 'Free Access',
    openRoles: 35,
    roles: [
      'B2B Content Marketing Strategist',
      'Senior Customer Story Narrative Specialist',
      'Technical Copywriter - Developer Experience'
    ],
    tags: ['Copywriting', 'SEO', 'Editorial'],
    score: '94/100',
    skillTrack: 'Content Writing',
    difficulty: 'Intermediate',
    estimatedMinutes: 25,
    xpReward: 40,
    title: 'High-Converting B2B Customer Case Study & Value Proposition',
    brief: 'A logistics software client reduced customs clearing latency by 64%. Write a punchy 3-act case study (Challenge, Solution, Measurable Impact) designed to convert enterprise CTO prospects. Include pull-quotes and callout metrics.'
  },
  {
    _id: 'sim-horizon-09',
    company: 'Horizon Global PR',
    industry: 'Corporate Crisis Communications & Press Strategy',
    icon: '🎙️',
    isPro: true,
    access: '🔒 Pro',
    openRoles: 19,
    roles: [
      'Corporate Crisis Response Director',
      'Chief Media Spokesperson Strategist',
      'Executive Communications Lead'
    ],
    tags: ['Editorial', 'Research'],
    score: null,
    skillTrack: 'Content Writing',
    difficulty: 'Advanced',
    estimatedMinutes: 40,
    xpReward: 55,
    title: 'Executive Crisis Press Statement & Stakeholder Memo',
    brief: 'A regional payments gateway suffered an unplanned 4-hour outage on Black Friday. Draft the official executive press release, FAQ document for media inquiries, and a reassuring direct-to-merchant disclosure message.'
  },
  {
    _id: 'sim-veritas-10',
    company: 'Veritas Digital Newsroom',
    industry: 'Investigative Data Journalism & Fact-Checking',
    icon: '🔍',
    isPro: true,
    access: '🔒 Pro',
    openRoles: 12,
    roles: [
      'Lead Fact-Checking Editor',
      'Data Verification Specialist',
      'Public Records & FOIA Analyst'
    ],
    tags: ['Research', 'Editorial'],
    score: null,
    skillTrack: 'Content Writing',
    difficulty: 'Advanced',
    estimatedMinutes: 35,
    xpReward: 50,
    title: 'Fact-Checking Audit & Public Disclosure Investigation',
    brief: 'Audit leaked corporate governance disclosures and whistleblower testimonies. Identify statistical fallacies, cross-examine secondary claims, and produce a defensible verdict memo with cited primary sources.'
  },

  // ── UI/UX DESIGNER ──────────────────────────────────────────────────────────
  {
    _id: 'sim-pixelcraft-11',
    company: 'PixelCraft Studios',
    industry: 'Consumer Mobile Experience & Micro-interactions',
    icon: '🎨',
    isPro: false,
    access: 'Free Access',
    openRoles: 31,
    roles: [
      'Lead Product Designer - Mobile Apps',
      'Design Systems Engineer - Figma',
      'UX Interaction Specialist'
    ],
    tags: ['Figma', 'Wireframing', 'Prototyping'],
    score: '97/100',
    skillTrack: 'UI/UX Design',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    xpReward: 40,
    title: 'Mobile Checkout Funnel Redesign & Friction Reduction',
    brief: 'Redesign the 3-step checkout flow for a high-volume mobile commerce app to eliminate user drop-off at payment method selection. Produce responsive wireframe specifications, interaction states, and accessibility guidelines.'
  },
  {
    _id: 'sim-forma-12',
    company: 'Forma Design Systems',
    industry: 'Enterprise SaaS UI Component Architecture',
    icon: '📐',
    isPro: true,
    access: '🔒 Pro',
    openRoles: 22,
    roles: [
      'Design System Architect',
      'Senior UI Kit Specialist',
      'WCAG Accessibility Consultant'
    ],
    tags: ['Figma', 'User Research'],
    score: null,
    skillTrack: 'UI/UX Design',
    difficulty: 'Advanced',
    estimatedMinutes: 45,
    xpReward: 50,
    title: 'Multi-Brand Design System Component Architecture',
    brief: 'Architect a unified design token structure supporting light, dark, and high-contrast modes across web and mobile. Document component states for data tables, modal dialogs, and form inputs adhering to WCAG 2.1 AA standards.'
  },

  // ── SOFTWARE ENGINEER ───────────────────────────────────────────────────────
  {
    _id: 'sim-nexus-13',
    company: 'Nexus Cloud Infrastructure',
    industry: 'Distributed Systems & High-Throughput APIs',
    icon: '⚡',
    isPro: false,
    access: 'Free Access',
    openRoles: 44,
    roles: [
      'Senior Backend Engineer - Node.js/Go',
      'Distributed Systems Reliability Architect',
      'Cloud Native Infrastructure Lead'
    ],
    tags: ['JavaScript', 'Node.js', 'SQL'],
    score: '99/100',
    skillTrack: 'Web Development',
    difficulty: 'Intermediate',
    estimatedMinutes: 35,
    xpReward: 45,
    title: 'High-Concurrency REST API & Redis Distributed Rate Limiter',
    brief: 'Build an Express API endpoint that handles 5,000 requests/sec with token-bucket rate limiting via Redis. Ensure graceful degradation, database connection pooling, and structured error responses.'
  },
  {
    _id: 'sim-kinetix-14',
    company: 'Kinetix Web Platforms',
    industry: 'Modern Frontend & Real-Time Collaboration',
    icon: '💻',
    isPro: false,
    access: 'Free Access',
    openRoles: 38,
    roles: [
      'Senior Frontend Engineer - React/TypeScript',
      'Real-Time Web Experience Architect',
      'Full-Stack Developer'
    ],
    tags: ['JavaScript', 'React'],
    score: '96/100',
    skillTrack: 'Web Development',
    difficulty: 'Intermediate',
    estimatedMinutes: 30,
    xpReward: 40,
    title: 'Real-Time WebSocket Collaborative Canvas Component',
    brief: 'Develop an interactive frontend canvas component with optimistic UI updates and conflict-free replicated data types (CRDT) for multiplayer cursor tracking and simultaneous editing.'
  }
];

export const simulationService = {
  async list() {
    try {
      const res = await request('/simulations', { auth: false });
      const data = unwrap(res);
      const sims = data?.simulations || res?.simulations || [];
      if (sims.length > 0) {
        // Filter out old generic placeholder simulations whose title equals their skillTrack
        const nonPlaceholders = sims.filter(s => s.title !== s.skillTrack && s.company);
        return [...ENTERPRISE_SIMULATIONS, ...nonPlaceholders.filter(s => !ENTERPRISE_SIMULATIONS.some(e => e.company === s.company))];
      }
    } catch (e) {
      console.warn('Backend list simulations error, fallback to enterprise data:', e);
    }
    return ENTERPRISE_SIMULATIONS;
  },

  /** Freelancer: submit an answer. @returns {{xpAwarded, totalXp, submission}} */
  async submit(id, answer) {
    if (String(id).startsWith('sim-')) {
      // Local simulated grading
      const matched = ENTERPRISE_SIMULATIONS.find(s => s._id === id);
      const xp = matched?.xpReward || 40;
      return {
        xpAwarded: xp,
        totalXp: xp,
        submission: {
          simulationId: id,
          answer,
          completedAt: new Date().toISOString()
        }
      };
    }
    return request(`/simulations/${id}/submit`, { method: 'POST', body: { answer } });
  },

  async portfolio() {
    try {
      const res = await request('/portfolio/me');
      const data = unwrap(res);
      return data?.projects || res?.projects || [];
    } catch {
      return [];
    }
  }
};
