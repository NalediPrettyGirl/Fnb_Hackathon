// ==========================================================================
// SkillBridge Client Controller
// Implements the complete progression cycle:
// Learn -> Earn Points -> Prove Skills -> Unlock Gigs -> Complete Real Work -> Build Portfolio -> Qualify
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Application State
  const state = {
    user: {
      id: "usr-jason-01",
      name: "Jason Ranti",
      username: "@jasonranti",
      role: "Junior Digital Specialist",
      level: "Level 1 Trainee — Web Dev Track (Step 1 of 3)",
      avatar: "assets/images/user_avatar.jpg",
      skillPoints: 50,  // Starts at 50 SP; 100 SP unlocks Tier 1 Real Gigs
      tier1Unlocked: false,
      tier2Unlocked: false,
      tier1Threshold: 100,
      tier2Threshold: 250,
      walletBalance: 295.50,
      escrowBalance: 45.00,
      totalEarned: 820.00,
      employabilityScore: 84,
      streakDays: 7,
      completedSimulationsCount: 0,
      completedGigsCount: 38,
      weeklyActivity: [
        { day: "1-10 Aug", amount: 65, tasks: 4, heightPercent: 45 },
        { day: "11-20 Aug", amount: 110, tasks: 7, heightPercent: 75 },
        { day: "21-30 Aug", amount: 45, tasks: 3, heightPercent: 30 },
        { day: "1-10 Sep", amount: 140, tasks: 9, heightPercent: 95 },
        { day: "11-20 Sep", amount: 80, tasks: 5, heightPercent: 55 }
      ]
    },

    // Per-track accumulated SP sub-pools
    trackPoints: { 'web-qa': 0, 'ai-data': 0, 'design-ui': 0 },

    // IDs of completed simulations (enforces prerequisites)
    completedSimulations: [],

    // Track definitions
    tracks: [
      {
        id: 'web-qa',
        name: 'Web Dev & QA Testing',
        icon: '🖥️',
        color: '#0ea5e9',
        colorLight: 'rgba(14,165,233,0.12)',
        description: 'Master front-end fundamentals then progress to professional QA. Each step builds on the last.',
        steps: ['sim-web-01','sim-web-02','sim-web-03'],
        totalSP: 80,
        unlocksGig: 'gig-real-03'
      },
      {
        id: 'ai-data',
        name: 'AI Data & Annotation',
        icon: '🤖',
        color: '#ec4899',
        colorLight: 'rgba(236,72,153,0.12)',
        description: 'Progress from data fundamentals to advanced LLM evaluation. Build real enterprise AI skills.',
        steps: ['sim-ai-01','sim-ai-02','sim-ai-03'],
        totalSP: 80,
        unlocksGig: 'gig-real-01'
      },
      {
        id: 'design-ui',
        name: 'UI/UX Design & Accessibility',
        icon: '🎨',
        color: '#7c4dff',
        colorLight: 'rgba(124,77,255,0.12)',
        description: 'Build design intuition from visual fundamentals to professional WCAG accessibility auditing.',
        steps: ['sim-ui-01','sim-ui-02','sim-ui-03'],
        totalSP: 80,
        unlocksGig: 'gig-real-02'
      }
    ],

    // All 9 simulations across 3 sequential tracks (prerequisites enforced)
    simulations: [
      // ── WEB DEV & QA TRACK ──────────────────────────────
      { id:'sim-web-01', track:'web-qa', trackName:'Web Dev & QA Track', step:1, stepLabel:'Step 1 of 3 — Foundation',
        title:'HTML & CSS: Structuring Accessible Web Pages', category:'web-dev', categoryName:'WEB FOUNDATION',
        partnerName:'GlobalFlow Systems', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:20, difficulty:'Beginner Friendly', durationMinutes:12,
        image:'assets/images/task_code.jpg',
        description:'Learn semantic HTML5 structure and CSS layout fundamentals. Identify accessibility violations in a sample webpage.',
        prerequisites:[], prerequisiteReason:null,
        competencies:['Semantic HTML','CSS Box Model','Basic Accessibility'],
        testLabels:['Missing alt attribute on img','Non-semantic div overuse','Layout looks correct'],
        targetObject:'Missing alt attribute on img' },
      { id:'sim-web-02', track:'web-qa', trackName:'Web Dev & QA Track', step:2, stepLabel:'Step 2 of 3 — Core Skills',
        title:'JavaScript & DOM: Form Validation & Event Handling', category:'web-dev', categoryName:'WEB CORE',
        partnerName:'GlobalFlow Systems', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:25, difficulty:'Beginner Friendly', durationMinutes:15,
        image:'assets/images/task_code.jpg',
        description:'Practice debugging JavaScript event listeners and identifying broken form validation logic in a checkout flow.',
        prerequisites:['sim-web-01'], prerequisiteReason:'You need HTML & CSS foundations before working with JavaScript and the DOM.',
        competencies:['JavaScript Events','DOM Manipulation','Form Validation Logic'],
        testLabels:['Missing required field check','Event listener not bound','All validations pass'],
        targetObject:'Missing required field check' },
      { id:'sim-web-03', track:'web-qa', trackName:'Web Dev & QA Track', step:3, stepLabel:'Step 3 of 3 — QA Certification',
        title:'QA Testing: Cross-Browser Smoke Test & Bug Report Writing', category:'web-dev', categoryName:'FRONT-END QA',
        partnerName:'GlobalFlow Systems', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:35, difficulty:'Intermediate', durationMinutes:20,
        image:'assets/images/task_code.jpg',
        description:'Run cross-browser smoke tests and write professional bug tickets. Requires Web Dev foundations from Steps 1 & 2.',
        prerequisites:['sim-web-01','sim-web-02'], prerequisiteReason:'QA Testing requires both HTML/CSS basics AND JavaScript knowledge — complete Steps 1 & 2 first.',
        competencies:['Test Case Writing','Bug Documentation','Cross-Browser Testing','Regression Testing'],
        testLabels:['Layout breaks on mobile Safari','Form submits with empty fields','All tests pass'],
        targetObject:'Layout breaks on mobile Safari' },

      // ── AI DATA & ANNOTATION TRACK ───────────────────────
      { id:'sim-ai-01', track:'ai-data', trackName:'AI Data & Annotation Track', step:1, stepLabel:'Step 1 of 3 — Foundation',
        title:'AI Data Basics: Understanding Training Data Quality', category:'ai-data', categoryName:'AI FOUNDATION',
        partnerName:'TechNova AI Labs', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:20, difficulty:'Beginner Friendly', durationMinutes:12,
        image:'assets/images/task_ai.jpg',
        description:'Understand what makes a high-quality AI training dataset. Identify mislabelled examples and ambiguous annotations.',
        prerequisites:[], prerequisiteReason:null,
        competencies:['Data Quality Principles','Label Consistency','Annotation Guidelines'],
        testLabels:['Mislabelled example','Ambiguous crop','Correctly annotated'],
        targetObject:'Mislabelled example' },
      { id:'sim-ai-02', track:'ai-data', trackName:'AI Data & Annotation Track', step:2, stepLabel:'Step 2 of 3 — Core Skills',
        title:'Image Annotation: Bounding Box & Category Tagging', category:'ai-data', categoryName:'AI ANNOTATION',
        partnerName:'TechNova AI Labs', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:25, difficulty:'Beginner Friendly', durationMinutes:15,
        image:'assets/images/task_ai.jpg',
        description:'Practice bounding box tagging on fashion e-commerce images. Requires data quality foundations from Step 1.',
        prerequisites:['sim-ai-01'], prerequisiteReason:'Image annotation requires understanding data quality standards — complete Step 1 first.',
        competencies:['Bounding Box Precision','Category Taxonomy','Edge Case Handling'],
        testLabels:['Fashion Apparel','Footwear','Handbag / Accessory','Outerwear Jacket'],
        targetObject:'Fashion Apparel' },
      { id:'sim-ai-03', track:'ai-data', trackName:'AI Data & Annotation Track', step:3, stepLabel:'Step 3 of 3 — Advanced Certification',
        title:'LLM Output Evaluation: Factuality & Safety Scoring', category:'ai-data', categoryName:'AI EVALUATION',
        partnerName:'HyperScale Compute', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:35, difficulty:'Intermediate', durationMinutes:20,
        image:'assets/images/task_ai.jpg',
        description:'Compare and score AI chatbot responses for factuality, safety, and helpfulness. Requires Steps 1 & 2.',
        prerequisites:['sim-ai-01','sim-ai-02'], prerequisiteReason:'LLM evaluation requires both data quality knowledge and annotation expertise — complete Steps 1 & 2 first.',
        competencies:['RLHF Principles','Hallucination Detection','Safety Classification','Model Comparison'],
        testLabels:['Response A is more factual','Response B is safer','Both are equally good'],
        targetObject:'Response A is more factual' },

      // ── UI/UX DESIGN TRACK ───────────────────────────────
      { id:'sim-ui-01', track:'design-ui', trackName:'UI/UX Design Track', step:1, stepLabel:'Step 1 of 3 — Foundation',
        title:'Visual Design Fundamentals: Typography, Colour & Hierarchy', category:'design-ui', categoryName:'DESIGN BASICS',
        partnerName:'Apex Digital Studio', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:20, difficulty:'Beginner Friendly', durationMinutes:12,
        image:'assets/images/task_ui.jpg',
        description:'Learn fundamental visual design principles — typography scale, colour contrast, and information hierarchy.',
        prerequisites:[], prerequisiteReason:null,
        competencies:['Typography Scale','Colour Theory','Visual Hierarchy','White Space'],
        testLabels:['Font size is too small','Low colour contrast','Design is well-structured'],
        targetObject:'Low colour contrast' },
      { id:'sim-ui-02', track:'design-ui', trackName:'UI/UX Design Track', step:2, stepLabel:'Step 2 of 3 — Core Skills',
        title:'Figma Audit: Mobile Checkout UX Review', category:'design-ui', categoryName:'UI/UX AUDIT',
        partnerName:'Apex Digital Studio', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:25, difficulty:'Intermediate', durationMinutes:18,
        image:'assets/images/task_ui.jpg',
        description:'Apply design principles to audit a real mobile checkout Figma prototype. Requires design foundations from Step 1.',
        prerequisites:['sim-ui-01'], prerequisiteReason:'Figma auditing requires visual design foundations — complete Step 1 first.',
        competencies:['Heuristic Evaluation','Touch Target Sizing','Interaction Patterns'],
        testLabels:['Tap target too small','Missing loading state','UX flow is correct'],
        targetObject:'Tap target too small' },
      { id:'sim-ui-03', track:'design-ui', trackName:'UI/UX Design Track', step:3, stepLabel:'Step 3 of 3 — WCAG Certification',
        title:'WCAG 2.1 Deep Dive: Full Accessibility Audit & Reporting', category:'design-ui', categoryName:'WCAG AUDIT',
        partnerName:'Apex Digital Studio', partnerLogo:'assets/images/user_avatar.jpg',
        pointsReward:35, difficulty:'Intermediate', durationMinutes:22,
        image:'assets/images/task_ui.jpg',
        description:'Run a full WCAG 2.1 AA accessibility audit across 4 screens. Write structured remediation tickets. Requires Steps 1 & 2.',
        prerequisites:['sim-ui-01','sim-ui-02'], prerequisiteReason:'WCAG auditing requires both visual design knowledge and Figma review skills — complete Steps 1 & 2 first.',
        competencies:['WCAG 2.1 AA Criteria','Contrast Ratios','ARIA Labels','Remediation Reporting'],
        testLabels:['Contrast ratio < 4.5:1','Missing ARIA label','Accessible and compliant'],
        targetObject:'Contrast ratio < 4.5:1' }
    ],

    gigs: [
      {
        id: "gig-real-01",
        title: "E-Commerce Image Annotation: Bounding Box Tagging (20 Frames)",
        category: "ai-data",
        categoryName: "AI & DATA",
        partnerName: "TechNova AI Labs",
        partnerLogo: "assets/images/user_avatar.jpg",
        payoutUSD: 18.50,
        requiredSkillPoints: 100,
        tier: 1,
        difficulty: "Beginner Friendly",
        duration: "20-25 mins",
        image: "assets/images/task_ai.jpg",
        description: "Tag items (apparel, footwear, accessories) on real catalog photos to train visual search algorithms. Pre-funded escrow.",
        badge: "Guaranteed Escrow"
      },
      {
        id: "gig-real-02",
        title: "Mobile App Figma UI Audit & Contrast Accessibility Review",
        category: "design-ui",
        categoryName: "UI/UX DESIGN",
        partnerName: "Apex Digital Studio",
        partnerLogo: "assets/images/user_avatar.jpg",
        payoutUSD: 35.00,
        requiredSkillPoints: 100,
        tier: 1,
        difficulty: "Intermediate",
        duration: "45 mins",
        image: "assets/images/task_ui.jpg",
        description: "Inspect 6 key mobile checkout screens for WCAG 2.1 color contrast and submit structured usability bug tickets.",
        badge: "High Value Escrow"
      },
      {
        id: "gig-real-03",
        title: "Cross-Browser Responsive Bug Reproduction & Smoke Testing",
        category: "web-dev",
        categoryName: "FRONT-END QA",
        partnerName: "GlobalFlow Systems",
        partnerLogo: "assets/images/user_avatar.jpg",
        payoutUSD: 28.00,
        requiredSkillPoints: 100,
        tier: 1,
        difficulty: "Beginner Friendly",
        duration: "30 mins",
        image: "assets/images/task_code.jpg",
        description: "Verify mobile checkout behavior across mobile Safari and desktop Chrome. Document reproduction steps.",
        badge: "Partner Vetted"
      },
      {
        id: "gig-real-04",
        title: "Telehealth Mobile Onboarding Localization (EN to Swahili / French)",
        category: "content",
        categoryName: "LOCALIZATION",
        partnerName: "AfriHealth Digital",
        partnerLogo: "assets/images/user_avatar.jpg",
        payoutUSD: 24.50,
        requiredSkillPoints: 100,
        tier: 1,
        difficulty: "Beginner Friendly",
        duration: "35 mins",
        image: "assets/images/task_ui.jpg",
        description: "Translate and culturally adapt 12 onboarding cards for rural clinic patient portals. Pre-funded NGO escrow.",
        badge: "Social Impact"
      },
      {
        id: "gig-real-05",
        title: "Enterprise LLM Dialog Safety & Groundedness Benchmarking",
        category: "ai-data",
        categoryName: "AI & DATA",
        partnerName: "HyperScale Compute",
        partnerLogo: "assets/images/user_avatar.jpg",
        payoutUSD: 65.00,
        requiredSkillPoints: 250,
        tier: 2,
        difficulty: "Advanced",
        duration: "1.5 hours",
        image: "assets/images/task_ai.jpg",
        description: "Rank pairs of model outputs for factual accuracy, hallucinations, and safety compliance. High payout tier.",
        badge: "Tier 2 Enterprise"
      },
      {
        id: "gig-real-06",
        title: "Full Design System UI Component Library Build in CSS/HTML",
        category: "web-dev",
        categoryName: "FRONT-END DEV",
        partnerName: "Lumina Labs",
        partnerLogo: "assets/images/user_avatar.jpg",
        payoutUSD: 110.00,
        requiredSkillPoints: 250,
        tier: 2,
        difficulty: "Advanced",
        duration: "3.0 hours",
        image: "assets/images/task_code.jpg",
        description: "Build 8 responsive accessible dashboard components following client Figma token specifications.",
        badge: "Tier 2 Enterprise"
      }
    ],

    activeLessons: [...initialData.activeLessons],
    mentors: [...initialData.mentors],
    learningCategories: [...initialData.learningCategories],
    currentFilter: 'all',
    searchQuery: '',
    currentView: 'dashboard',
    activeRunningItem: null, // can be simulation or gig

    guideCycle: [
      { step: 1, title: "1. Learn Core Competencies", desc: "Access 10-minute micro-learning modules covering AI annotation, UI/UX audits, and QA testing standards." },
      { step: 2, title: "2. Start Job Simulations", desc: "Engage in 3-step sequential tracks. Each track builds on the last — e.g., QA requires Web Dev foundations." },
      { step: 3, title: "3. Earn SkillPoints (SP)", desc: "Every completed simulation step awards SP (+20 to +35 per step). Track SP compounds across your 3 chosen tracks." },
      { step: 4, title: "4. Prove Your Skills & Unlock Gigs", desc: "Reach 100 total SP to automatically unlock Tier 1 Real Paid Gigs with pre-funded client escrow." },
      { step: 5, title: "5. Complete Real-World Paid Work", desc: "Pick real micro-tasks from vetted businesses. Submit deliverables and receive guaranteed payouts directly to your wallet." },
      { step: 6, title: "6. Build Verifiable Portfolio", desc: "Every delivered gig logs a cryptographic proof-of-work badge and client endorsement to your public profile." },
      { step: 7, title: "7. Qualify for Better Gigs & Jobs", desc: "Reach 250+ SP to unlock Tier 2 Enterprise projects ($50-$120+) and direct interviews for remote junior roles." }
    ]
  };

  // DOM Elements
  const el = {
    views: {
      dashboard: document.getElementById('view-dashboard'),
      simulations: document.getElementById('view-simulations'),
      tasks: document.getElementById('view-tasks'),
      academy: document.getElementById('view-academy'),
      portfolio: document.getElementById('view-portfolio'),
      partnerPortal: document.getElementById('view-partner-portal')
    },
    navItems: document.querySelectorAll('.nav-item[data-view]'),
    
    // Header
    globalSearch: document.getElementById('global-search-input'),
    topUserAvatar: document.getElementById('top-user-avatar'),
    topUserName: document.getElementById('top-user-name'),
    topSpDisplay: document.getElementById('top-sp-display'),
    navBalanceBadge: document.getElementById('nav-balance-badge'),
    sidebarTaskCount: document.getElementById('sidebar-task-count'),
    
    // Progression Banner
    spMeterCurrent: document.getElementById('sp-meter-current'),
    spMeterStatus: document.getElementById('sp-meter-status'),
    spBarFill: document.getElementById('sp-bar-fill'),
    pillStepSim: document.getElementById('pill-step-sim'),
    pillStepSp: document.getElementById('pill-step-sp'),
    pillStepUnlock: document.getElementById('pill-step-unlock'),
    btnTriggerGuideModal: document.getElementById('btn-trigger-guide-modal'),
    heroCtaStartSim: document.getElementById('hero-cta-start-sim'),
    heroCtaGuideBtn: document.getElementById('hero-cta-guide-btn'),

    // Grids
    learningProgressContainer: document.getElementById('learning-progress-container'),
    simulationsMarketGrid: document.getElementById('simulations-market-grid'),
    tasksMarketGrid: document.getElementById('tasks-market-grid'),
    fullSimulationsGrid: document.getElementById('full-simulations-grid'),
    fullTasksGrid: document.getElementById('full-tasks-grid'),
    taskFilterPills: document.getElementById('task-filter-pills'),
    workTableBody: document.getElementById('work-table-body'),
    
    // Right sidebar widgets
    badgeScorePill: document.getElementById('badge-score-pill'),
    radialProgressBar: document.getElementById('radial-progress-bar'),
    sidebarGreetingName: document.getElementById('sidebar-greeting-name'),
    sidebarGreetingSub: document.getElementById('sidebar-greeting-sub'),
    barChartContainer: document.getElementById('bar-chart-container'),
    barChartLabels: document.getElementById('bar-chart-labels'),
    mentorsListContainer: document.getElementById('mentors-list-container'),
    sidebarWalletBalance: document.getElementById('sidebar-wallet-balance'),
    btnTriggerCashout: document.getElementById('btn-trigger-cashout'),
    
    // Modals
    modalCycleGuide: document.getElementById('modal-cycle-guide'),
    modalGuideClose: document.getElementById('modal-guide-close'),
    guideStepsContainer: document.getElementById('guide-steps-container'),
    guideUserSpText: document.getElementById('guide-user-sp-text'),
    btnGuideStartSim: document.getElementById('btn-guide-start-sim'),

    modalTaskRunner: document.getElementById('modal-task-runner'),
    modalTaskTitle: document.getElementById('modal-task-title'),
    modalTaskPartner: document.getElementById('modal-task-partner'),
    modalTaskBadgeSub: document.getElementById('modal-task-badge-sub'),
    modalTaskReward: document.getElementById('modal-task-reward'),
    modalTaskGuarantee: document.getElementById('modal-task-guarantee'),
    modalTaskId: document.getElementById('modal-task-id'),
    modalWorkspaceImg: document.getElementById('modal-workspace-img'),
    modalTaskClose: document.getElementById('modal-task-close'),
    modalTaskCancel: document.getElementById('modal-task-cancel'),
    modalTaskSubmit: document.getElementById('modal-task-submit'),
    modalSubmitBtnText: document.getElementById('modal-submit-btn-text'),
    submissionProgressRow: document.getElementById('submission-progress-row'),
    qaStatusText: document.getElementById('qa-status-text'),
    qaStatusPercent: document.getElementById('qa-status-percent'),
    qaProgressBar: document.getElementById('qa-progress-bar'),
    
    modalCashout: document.getElementById('modal-cashout'),
    modalCashoutClose: document.getElementById('modal-cashout-close'),
    modalCashoutCancel: document.getElementById('modal-cashout-cancel'),
    cashoutAvailableDisplay: document.getElementById('cashout-available-display'),
    cashoutAmountInput: document.getElementById('cashout-amount'),
    btnConfirmCashout: document.getElementById('btn-confirm-cashout'),

    modalShare: document.getElementById('modal-share'),
    modalShareClose: document.getElementById('modal-share-close'),
    btnSharePortfolio: document.getElementById('btn-share-portfolio'),
    btnCopyShareLink: document.getElementById('btn-copy-share-link'),
    btnExportCv: document.getElementById('btn-export-cv'),

    // Partner Portal
    btnToggleBusinessMode: document.getElementById('btn-toggle-business-mode'),
    btnExitPartnerMode: document.getElementById('btn-exit-partner-mode'),
    formPostTask: document.getElementById('form-post-task'),
    partnerSubmissionsList: document.getElementById('partner-submissions-list'),

    academyModulesGrid: document.getElementById('academy-modules-grid'),
    portfolioContainer: document.getElementById('portfolio-container'),
    toastContainer: document.getElementById('toast-container')
  };

  // ========================================================================
  // RENDERERS
  // ========================================================================

  // 1. Render Progression & SkillPoints Meter
  function renderProgressionMeter() {
    const sp = state.user.skillPoints;
    const isUnlocked = sp >= state.user.tier1Threshold;
    state.user.tier1Unlocked = isUnlocked;

    if (el.topSpDisplay) el.topSpDisplay.textContent = `${sp} SP`;
    if (el.spMeterCurrent) el.spMeterCurrent.textContent = `${sp} SP`;

    const percent = Math.min(100, (sp / state.user.tier1Threshold) * 100);
    if (el.spBarFill) el.spBarFill.style.width = `${percent}%`;

    if (isUnlocked) {
      if (el.spMeterStatus) {
        el.spMeterStatus.innerHTML = `<span style="color: #059669;">✓ Tier 1 Gigs Unlocked!</span> (Next: Tier 2 at 250 SP)`;
      }
      if (el.pillStepUnlock) {
        el.pillStepUnlock.className = "cycle-step-item completed";
        el.pillStepUnlock.innerHTML = "4. Paid Gigs Unlocked 🔓";
      }
      if (el.pillStepSp) {
        el.pillStepSp.className = "cycle-step-item completed";
        el.pillStepSp.innerHTML = `3. Points (${sp}/100 SP ✓)`;
      }
      state.user.level = "Level 2 Certified Specialist (Gigs Active)";
      if (el.sidebarGreetingSub) {
        el.sidebarGreetingSub.textContent = "Level 2 Certified • Paid Gigs Active & Ready!";
      }
    } else {
      const needed = state.user.tier1Threshold - sp;
      if (el.spMeterStatus) {
        el.spMeterStatus.innerHTML = `Need <strong>${needed} SP</strong> to unlock Tier 1 Real Money Gigs`;
      }
      if (el.pillStepUnlock) {
        el.pillStepUnlock.className = "cycle-step-item";
        el.pillStepUnlock.innerHTML = "4. Unlock Real Gigs 🔒";
      }
      if (el.pillStepSp) {
        el.pillStepSp.className = "cycle-step-item active";
        el.pillStepSp.innerHTML = `3. Earn Points (${sp}/100)`;
      }
    }

    renderUserStats();
  }

  // 2. Render User Header & Stats
  function renderUserStats() {
    el.topUserName.textContent = state.user.name;
    const formattedBalance = `$${state.user.walletBalance.toFixed(2)}`;
    el.navBalanceBadge.textContent = formattedBalance;
    el.sidebarWalletBalance.textContent = formattedBalance;
    el.cashoutAvailableDisplay.textContent = formattedBalance;
    el.cashoutAmountInput.max = state.user.walletBalance;
    el.sidebarTaskCount.textContent = `${state.gigs.length} Gigs`;

    // Radial gauge
    el.badgeScorePill.textContent = `${state.user.employabilityScore}%`;
    const circumference = 2 * Math.PI * 42;
    const offset = circumference - (state.user.employabilityScore / 100) * circumference;
    if (el.radialProgressBar) {
      el.radialProgressBar.style.strokeDasharray = circumference;
      el.radialProgressBar.style.strokeDashoffset = offset;
    }

    el.sidebarGreetingName.innerHTML = `Good Morning ${state.user.name.split(' ')[0]} 🔥`;
  }

  // Helper: check if a simulation is unlocked given current completedSimulations
  function isSimUnlocked(sim) {
    return sim.prerequisites.every(pid => state.completedSimulations.includes(pid));
  }
  function isSimDone(simId) {
    return state.completedSimulations.includes(simId);
  }

  // 3. Render Job Simulations as 3-column Pathway Tree
  function renderSimulations() {
    // ── Dashboard mini-preview: just show 3 "entry" sims (one per track)
    const entrySimIds = ['sim-web-01','sim-ai-01','sim-ui-01'];
    const dashHtml = entrySimIds.map(id => {
      const sim = state.simulations.find(s => s.id === id);
      if (!sim) return '';
      const done = isSimDone(sim.id);
      const track = state.tracks.find(t => t.id === sim.track);
      return `
        <article class="task-card simulation ${done ? 'sim-done' : ''}" style="border-top: 3px solid ${track.color};">
          <div class="task-image-wrap">
            <img src="${sim.image}" alt="${sim.title}" class="task-img" loading="lazy">
            <div style="position:absolute;top:10px;left:10px;background:${done?'rgba(16,185,129,0.9)':'rgba(234,88,12,0.9)'};color:#fff;font-size:0.68rem;font-weight:800;padding:3px 8px;border-radius:var(--radius-full);">
              ${done ? '✓ Completed' : '⚡ ' + sim.stepLabel}
            </div>
          </div>
          <div class="task-card-body">
            <div class="task-badge-row">
              <span class="category-tag sim" style="background:${track.colorLight};color:${track.color};">${track.icon} ${sim.categoryName}</span>
              <span class="task-points-badge">${done?'✓':'+'}${sim.pointsReward} SP</span>
            </div>
            <h3 class="task-title" title="${sim.title}">${sim.title}</h3>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:8px;">⏱ ${sim.durationMinutes} mins • <span style="color:${track.color};font-weight:700;">${sim.difficulty}</span></div>
            <div class="task-partner-row">
              <img src="${sim.partnerLogo}" alt="${sim.partnerName}" class="partner-avatar">
              <div class="partner-meta"><span class="partner-name">${sim.partnerName}</span><span class="partner-role">Track Partner</span></div>
              <button class="task-start-btn sim-btn" data-sim-id="${sim.id}" style="background:${done?'#059669':track.color};">
                ${done ? 'Redo' : 'Start'}
              </button>
            </div>
          </div>
        </article>`;
    }).join('');
    if (el.simulationsMarketGrid) el.simulationsMarketGrid.innerHTML = dashHtml;

    // ── Full Simulations View: Render as 3 Track Pathway Columns ──
    const pathwayHtml = state.tracks.map(track => {
      const trackSims = track.steps.map(sid => state.simulations.find(s => s.id === sid)).filter(Boolean);
      const completedInTrack = trackSims.filter(s => isSimDone(s.id)).length;
      const trackPercent = Math.round((completedInTrack / trackSims.length) * 100);
      const trackEarnedSP = completedInTrack * 0; // computed below per sim
      let earnedSP = 0;
      trackSims.forEach(s => { if(isSimDone(s.id)) earnedSP += s.pointsReward; });
      const totalTrackSP = trackSims.reduce((a,s) => a + s.pointsReward, 0);

      const stepsHtml = trackSims.map((sim, idx) => {
        const done = isSimDone(sim.id);
        const unlocked = isSimUnlocked(sim);
        const locked = !unlocked && !done;

        const connectorHtml = idx < trackSims.length - 1 ? `
          <div style="display:flex;justify-content:center;margin:0;">
            <div style="width:2px;height:28px;background:${done?track.color:'rgba(148,163,184,0.3)'};margin:0;"></div>
          </div>` : '';

        const cardHtml = `
          <div class="pathway-step-card ${done?'done':unlocked?'unlocked':'locked'}" style="
            border:1.5px solid ${done?track.color:unlocked?'rgba(148,163,184,0.3)':'rgba(100,116,139,0.2)'};
            border-left:4px solid ${done?track.color:unlocked?track.color:'#334155'};
            background:${done?track.colorLight:unlocked?'var(--surface-card)':'rgba(15,23,42,0.5)'};
            border-radius:12px;padding:14px 16px;position:relative;
            opacity:${locked?'0.5':'1'};
            transition:all 0.2s;">

            <div style="display:flex;align-items:flex-start;gap:12px;">
              <!-- Step Status Icon -->
              <div style="width:36px;height:36px;border-radius:50%;background:${done?track.color:unlocked?track.colorLight:'rgba(51,65,85,0.6)'};
                border:2px solid ${done?track.color:unlocked?track.color:'#475569'};
                display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:0.85rem;font-weight:900;color:${done?'#fff':unlocked?track.color:'#64748b'}">
                ${done ? '✓' : locked ? '🔒' : sim.step}
              </div>

              <div style="flex:1;min-width:0;">
                <div style="font-size:0.62rem;font-weight:700;letter-spacing:0.08em;color:${done?track.color:unlocked?track.color:'#475569'};margin-bottom:2px;">
                  ${sim.stepLabel.toUpperCase()} • +${sim.pointsReward} SP
                </div>
                <h4 style="font-size:0.82rem;font-weight:800;color:${locked?'#475569':'var(--text-main)'};line-height:1.3;margin-bottom:4px;">
                  ${sim.title}
                </h4>
                <p style="font-size:0.7rem;color:var(--text-muted);line-height:1.4;margin-bottom:8px;">
                  ${locked ? `🔒 ${sim.prerequisiteReason}` : sim.description}
                </p>

                ${!locked ? `
                  <!-- Competency Tags -->
                  <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
                    ${(sim.competencies||[]).map(c=>`<span style="background:rgba(148,163,184,0.15);color:#94a3b8;font-size:0.6rem;font-weight:700;padding:2px 7px;border-radius:20px;">${c}</span>`).join('')}
                  </div>

                  <div style="display:flex;align-items:center;justify-content:space-between;">
                    <span style="font-size:0.65rem;color:var(--text-muted);">⏱ ${sim.durationMinutes} mins • ${sim.partnerName}</span>
                    <button class="pathway-start-btn" data-sim-id="${sim.id}" style="
                      background:${done?'rgba(5,150,105,0.15)':track.color};color:${done?'#059669':'#fff'};
                      border:${done?'1px solid #059669':'none'};
                      font-size:0.65rem;font-weight:800;padding:5px 12px;border-radius:20px;cursor:pointer;
                      transition:all 0.2s;">
                      ${done ? '✓ Completed' : 'Start Simulation →'}
                    </button>
                  </div>` : `
                  <div style="font-size:0.65rem;color:#475569;font-style:italic;">Complete the step above to unlock</div>`}
              </div>
            </div>
          </div>
          ${connectorHtml}`;
        return cardHtml;
      }).join('');

      return `
        <div class="track-pathway-column">
          <!-- Track Header -->
          <div style="background:${track.colorLight};border:1.5px solid ${track.color}33;border-radius:14px;padding:16px;margin-bottom:16px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
              <span style="font-size:1.6rem;">${track.icon}</span>
              <div>
                <h3 style="font-size:0.95rem;font-weight:900;color:var(--text-main);">${track.name}</h3>
                <p style="font-size:0.7rem;color:var(--text-muted);">${track.description}</p>
              </div>
            </div>
            <!-- Track Progress Bar -->
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="flex:1;height:6px;background:rgba(148,163,184,0.2);border-radius:10px;overflow:hidden;">
                <div style="height:100%;width:${trackPercent}%;background:${track.color};border-radius:10px;transition:width 0.4s;"></div>
              </div>
              <span style="font-size:0.65rem;font-weight:800;color:${track.color};white-space:nowrap;">
                ${earnedSP}/${totalTrackSP} SP (${completedInTrack}/${trackSims.length} done)
              </span>
            </div>
          </div>
          <!-- Sequential Steps -->
          ${stepsHtml}
          <!-- Track Unlock Label -->
          <div style="text-align:center;margin-top:12px;font-size:0.68rem;color:${completedInTrack===3?'#059669':'#64748b'};font-weight:700;">
            ${completedInTrack===3 ? '🎉 Track Complete! Paid Gig Unlocked!' : `🔓 Complete all 3 steps to unlock ${track.name} paid gig`}
          </div>
        </div>`;
    }).join('');

    if (el.fullSimulationsGrid) {
      el.fullSimulationsGrid.innerHTML = `
        <div class="simulation-pathway-wrapper" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:24px;">
          ${pathwayHtml}
        </div>`;
    }

    // Attach simulation click handlers (works for both dashboard mini + pathway)
    document.querySelectorAll('[data-sim-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const simId = e.currentTarget.dataset.simId;
        if (simId) openSimulationRunner(simId);
      });
    });
  }

  // 4. Render Real Paid Gigs Section (Locked if SP < 100)
  function renderGigs() {
    const sp = state.user.skillPoints;
    let filtered = state.gigs;

    if (state.currentFilter !== 'all') {
      filtered = filtered.filter(g => g.category === state.currentFilter);
    }

    if (state.searchQuery.trim() !== '') {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(q) ||
        g.partnerName.toLowerCase().includes(q) ||
        g.categoryName.toLowerCase().includes(q)
      );
    }

    const cardsHtml = filtered.map(gig => {
      const isLocked = sp < gig.requiredSkillPoints;
      const pointsNeeded = gig.requiredSkillPoints - sp;

      let tagClass = 'ai';
      if (gig.category === 'design-ui') tagClass = 'ui';
      else if (gig.category === 'web-dev') tagClass = 'qa';
      else if (gig.category === 'content') tagClass = 'content';

      return `
        <article class="task-card ${isLocked ? 'locked' : ''}" data-gig-id="${gig.id}">
          <div class="task-image-wrap">
            <img src="${gig.image}" alt="${gig.title}" class="task-img" loading="lazy">
            
            ${isLocked ? `
              <div class="locked-badge-overlay">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span>Requires ${gig.requiredSkillPoints} SP (${pointsNeeded} more SP)</span>
              </div>
            ` : `
              <div style="position: absolute; top: 10px; left: 10px; background: rgba(16, 185, 129, 0.95); color: #fff; font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: var(--radius-full);">
                ✓ Unlocked & Funded
              </div>
            `}

            <button class="task-like-btn" title="Save" onclick="event.stopPropagation(); this.classList.toggle('liked');">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </button>
          </div>
          
          <div class="task-card-body">
            <div class="task-badge-row">
              <span class="category-tag ${tagClass}">${gig.categoryName}</span>
              <span class="task-payout">$${gig.payoutUSD.toFixed(2)} USD</span>
            </div>

            <h3 class="task-title" title="${gig.title}">${gig.title}</h3>

            <div style="font-size: 0.72rem; color: var(--text-muted); display: flex; align-items: center; gap: 8px;">
              <span>⏱ ${gig.duration}</span>
              <span>•</span>
              <span style="color: var(--accent-emerald); font-weight: 700;">Guaranteed Escrow</span>
            </div>

            <div class="task-partner-row">
              <img src="${gig.partnerLogo}" alt="${gig.partnerName}" class="partner-avatar">
              <div class="partner-meta">
                <span class="partner-name">${gig.partnerName}</span>
                <span class="partner-role">Pre-funded Escrow</span>
              </div>

              ${isLocked ? `
                <button class="task-start-btn" style="background: #64748b;" onclick="promptUnlockSimulation('${gig.title}', ${pointsNeeded})">
                  🔒 Locked
                </button>
              ` : `
                <button class="task-start-btn" data-open-gig-id="${gig.id}">
                  Start Paid Task
                </button>
              `}
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (el.tasksMarketGrid) el.tasksMarketGrid.innerHTML = cardsHtml;
    if (el.fullTasksGrid) el.fullTasksGrid.innerHTML = cardsHtml;

    // Attach open gig handlers for unlocked gigs
    document.querySelectorAll('[data-open-gig-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const gigId = e.currentTarget.dataset.openGigId;
        if (gigId) openGigRunner(gigId);
      });
    });
  }

  // 5. Render Filter Pills
  function renderFilterPills() {
    el.taskFilterPills.innerHTML = initialData.categories.map(cat => `
      <button class="filter-pill ${state.currentFilter === cat.id ? 'active' : ''}" data-filter="${cat.id}">
        ${cat.name} (${cat.id === 'all' ? state.gigs.length : state.gigs.filter(g => g.category === cat.id).length})
      </button>
    `).join('');

    el.taskFilterPills.querySelectorAll('.filter-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        state.currentFilter = e.currentTarget.dataset.filter;
        renderFilterPills();
        renderGigs();
      });
    });
  }

  // 6. Render 7-Step Cycle Guide Modal content
  function renderCycleGuide() {
    el.guideStepsContainer.innerHTML = state.guideCycle.map(step => {
      let isCurrent = false;
      let isDone = false;
      if (step.step === 1) isDone = true;
      if (step.step === 2) isCurrent = (state.user.skillPoints < 100);
      if (step.step === 3) isDone = (state.user.skillPoints >= 100);
      if (step.step === 4) isDone = (state.user.skillPoints >= 100);

      return `
        <div style="display: flex; gap: 14px; background: ${isCurrent ? '#eff6ff' : '#f8fafc'}; border: 1px solid ${isCurrent ? '#3b82f6' : '#e2e8f0'}; border-radius: 14px; padding: 14px;">
          <div style="width: 32px; height: 32px; border-radius: 50%; background: ${isDone ? '#10b981' : isCurrent ? '#3b82f6' : '#cbd5e1'}; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.85rem; flex-shrink: 0;">
            ${isDone ? '✓' : step.step}
          </div>
          <div>
            <h5 style="font-size: 0.9rem; font-weight: 800; color: var(--text-main);">${step.title}</h5>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">${step.desc}</p>
          </div>
        </div>
      `;
    }).join('');

    if (el.guideUserSpText) {
      const sp = state.user.skillPoints;
      el.guideUserSpText.textContent = sp >= 100 
        ? `${sp} SkillPoints (Tier 1 Gigs Active!)` 
        : `${sp} SkillPoints (Need ${100 - sp} more SP to unlock Tier 1)`;
    }
  }

  // 7. Render Lessons / Work Table
  function renderWorkTable() {
    el.workTableBody.innerHTML = state.activeLessons.map(lesson => `
      <tr>
        <td>
          <div class="mentor-cell">
            <img src="assets/images/user_avatar.jpg" alt="${lesson.mentor}" class="table-avatar">
            <div class="mentor-name-col">
              <span class="mentor-fullname">${lesson.mentor}</span>
              <span class="mentor-date">${lesson.partner}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="table-tag" style="background: ${lesson.badgeColor}; color: ${lesson.textColor};">
            ${lesson.type}
          </span>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main); font-size: 0.85rem;">${lesson.desc}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 2px;">
            Progress: <strong style="color: var(--primary);">${lesson.progress}</strong> • Status: <strong>${lesson.status}</strong>
          </div>
        </td>
        <td style="text-align: right;">
          <a class="action-circle-link" title="${lesson.action}" onclick="showToast('${lesson.action}: ${lesson.desc}')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7 7 17 7 17 17"/>
            </svg>
          </a>
        </td>
      </tr>
    `).join('');
  }

  // 8. Render Bar Chart
  function renderBarChart() {
    el.barChartContainer.innerHTML = state.user.weeklyActivity.map((item, idx) => `
      <div class="bar-col">
        <div class="bar-pillar ${idx === 3 ? 'active' : ''}" style="height: ${item.heightPercent}%;">
          <span class="bar-tooltip">$${item.amount}.00 (${item.tasks} tasks)</span>
        </div>
      </div>
    `).join('');

    el.barChartLabels.innerHTML = state.user.weeklyActivity.map(item => `
      <span class="chart-label">${item.day}</span>
    `).join('');
  }

  // 9. Render Mentors
  function renderMentors() {
    el.mentorsListContainer.innerHTML = state.mentors.map(m => `
      <div class="mentor-item-card">
        <div class="mentor-profile-wrap">
          <img src="${m.avatar}" alt="${m.name}" class="mentor-card-avatar">
          <div class="mentor-details">
            <span class="mentor-card-name">${m.name}</span>
            <span class="mentor-card-sub">${m.title}</span>
          </div>
        </div>
        <button class="btn-follow ${m.isFollowing ? 'following' : ''}" data-mentor-id="${m.id}">
          ${m.isFollowing ? 'Following' : '+ Follow'}
        </button>
      </div>
    `).join('');

    el.mentorsListContainer.querySelectorAll('.btn-follow').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.mentorId;
        const target = state.mentors.find(m => m.id === id);
        if (target) {
          target.isFollowing = !target.isFollowing;
          renderMentors();
          showToast(target.isFollowing ? `Connected with ${target.name}` : `Unfollowed ${target.name}`);
        }
      });
    });
  }

  // 10. Render Category Cards
  function renderLearningProgress() {
    el.learningProgressContainer.innerHTML = state.learningCategories.map(cat => `
      <div class="cat-progress-card" data-category="${cat.id}">
        <div class="cat-icon-box" style="background: ${cat.iconBg}; color: ${cat.iconColor};">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <rect width="18" height="18" x="3" y="3" rx="2"/>
            <path d="M7 7h10M7 12h10M7 17h6"/>
          </svg>
        </div>
        <div class="cat-meta">
          <span class="cat-count">${cat.progressText}</span>
          <span class="cat-title">${cat.title}</span>
        </div>
        <div class="cat-action-dots">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
          </svg>
        </div>
      </div>
    `).join('');
  }

  // ========================================================================
  // INTERACTIVE WORKSPACE: SIMULATIONS VS REAL GIGS
  // ========================================================================

  // Open Simulation Runner (Awards SkillPoints) — checks prerequisites first
  function openSimulationRunner(simId) {
    const sim = state.simulations.find(s => s.id === simId);
    if (!sim) return;

    // Prerequisite gate: locked step
    if (!isSimUnlocked(sim) && !isSimDone(simId)) {
      showToast(`🔒 Locked: ${sim.prerequisiteReason || 'Complete the previous step first.'}`, 'info');
      return;
    }

    const track = state.tracks.find(t => t.id === sim.track);
    const alreadyDone = isSimDone(simId);
    state.activeRunningItem = { ...sim, isSimulation: true };

    el.modalTaskTitle.textContent = `${sim.stepLabel}: ${sim.title}`;
    el.modalTaskPartner.textContent = `${sim.partnerName} • ${sim.trackName}`;
    el.modalTaskBadgeSub.textContent = alreadyDone
      ? 'Already completed — redo for practice (no extra SP)'
      : `Risk-Free Simulation • Prerequisite Chain Step ${sim.step} of 3`;
    el.modalTaskReward.textContent = alreadyDone ? 'Completed ✓' : `+${sim.pointsReward} SP`;
    el.modalTaskReward.style.color = alreadyDone ? '#059669' : (track ? track.color : '#ea580c');
    el.modalTaskGuarantee.textContent = 'Awards SkillPoints toward Gig Unlock';
    el.modalTaskId.textContent = sim.id;
    el.modalWorkspaceImg.src = sim.image;
    el.modalSubmitBtnText.textContent = alreadyDone
      ? 'Practice Complete (already earned SP)'
      : `Submit & Claim +${sim.pointsReward} SP`;

    el.submissionProgressRow.style.display = 'none';
    el.modalTaskSubmit.disabled = false;
    el.modalTaskRunner.classList.add('active');
  }

  // Open Real Paid Gig Runner (Awards Real Cash)
  function openGigRunner(gigId) {
    const gig = state.gigs.find(g => g.id === gigId);
    if (!gig) return;

    if (state.user.skillPoints < gig.requiredSkillPoints) {
      promptUnlockSimulation(gig.title, gig.requiredSkillPoints - state.user.skillPoints);
      return;
    }

    state.activeRunningItem = { ...gig, isSimulation: false };

    el.modalTaskTitle.textContent = `Real Paid Task: ${gig.title}`;
    el.modalTaskPartner.textContent = gig.partnerName;
    el.modalTaskBadgeSub.textContent = "Verified Enterprise Partner • Pre-funded Escrow";
    el.modalTaskReward.textContent = `$${gig.payoutUSD.toFixed(2)} USD`;
    el.modalTaskReward.style.color = "var(--primary)";
    el.modalTaskGuarantee.textContent = "Guaranteed Escrow Payout";
    el.modalTaskId.textContent = gig.id;
    el.modalWorkspaceImg.src = gig.image;
    el.modalSubmitBtnText.textContent = `Submit Micro-Task & Claim $${gig.payoutUSD.toFixed(2)}`;
    
    el.submissionProgressRow.style.display = 'none';
    el.modalTaskSubmit.disabled = false;
    el.modalTaskRunner.classList.add('active');
  }

  window.promptUnlockSimulation = function(gigTitle, neededSP) {
    showToast(`🔒 "${gigTitle}" requires 100 SP! You need ${neededSP} more SP. Opening Web Dev Track...`, 'info');
    setTimeout(() => {
      openSimulationRunner('sim-web-01');
    }, 600);
  };

  // Submit Handler
  el.modalTaskSubmit.addEventListener('click', () => {
    if (!state.activeRunningItem) return;
    const item = state.activeRunningItem;

    el.modalTaskSubmit.disabled = true;
    el.submissionProgressRow.style.display = 'flex';
    el.qaProgressBar.style.width = '25%';
    el.qaStatusPercent.textContent = '25%';
    el.qaStatusText.textContent = item.isSimulation 
      ? `Validating simulation tags against enterprise rubrics...` 
      : `Packaging submission for ${item.partnerName}...`;

    setTimeout(() => {
      el.qaProgressBar.style.width = '70%';
      el.qaStatusPercent.textContent = '70%';
      el.qaStatusText.textContent = item.isSimulation 
        ? `Rubric score: 99.1%! Computing SkillPoints...` 
        : `Running automated AI QA & edge consistency check...`;
    }, 600);

    setTimeout(() => {
      el.qaProgressBar.style.width = '100%';
      el.qaStatusPercent.textContent = '100%';
      el.qaStatusText.textContent = `Success! Registering verification...`;
    }, 1200);

    setTimeout(() => {
      if (item.isSimulation) {
        const alreadyDone = isSimDone(item.id);
        const prevSP = state.user.skillPoints;

        if (!alreadyDone) {
          // Award SkillPoints for first completion
          const awarded = item.pointsReward;
          state.user.skillPoints += awarded;
          state.user.completedSimulations.push(item.id);
          state.user.completedSimulationsCount += 1;
          state.user.employabilityScore = Math.min(99, state.user.employabilityScore + 3);
          // Update track sub-pool
          if (state.trackPoints[item.track] !== undefined) {
            state.trackPoints[item.track] += awarded;
          }

          const justUnlocked = prevSP < 100 && state.user.skillPoints >= 100;

          // Detect newly unlocked sims
          const newlyUnlocked = state.simulations
            .filter(s => !state.completedSimulations.includes(s.id))
            .filter(s => s.prerequisites.every(pid => state.completedSimulations.includes(pid)));

          renderProgressionMeter();
          renderGigs();
          renderSimulations(); // Re-render pathway to reflect new unlock states
          el.modalTaskRunner.classList.remove('active');

          if (justUnlocked) {
            showToast(`🎉 TIER 1 UNLOCKED! +${awarded} SP (${state.user.skillPoints} SP total) — Real Paid Gigs are ACTIVE!`, 'success');
          } else if (newlyUnlocked.length > 0) {
            showToast(`⚡ +${awarded} SP! Next unlocked: "${newlyUnlocked[0].title}" — keep going!`, 'success');
          } else {
            showToast(`⚡ +${awarded} SP earned on ${item.trackName}! Total: ${state.user.skillPoints} SP.`, 'success');
          }
        } else {
          el.modalTaskRunner.classList.remove('active');
          showToast(`Practice complete! (SP already awarded for this simulation)`, 'info');
        }
      } else {
        // Real Gig complete: Credit Escrow Cash!
        const payout = item.payoutUSD;
        state.user.walletBalance += payout;
        state.user.totalEarned += payout;
        state.user.completedGigsCount += 1;
        state.user.employabilityScore = Math.min(99, state.user.employabilityScore + 1);

        state.activeLessons.unshift({
          id: `task-${Date.now()}`,
          mentor: "Automated QA Evaluator",
          partner: item.partnerName,
          type: item.categoryName,
          badgeColor: "rgba(16, 185, 129, 0.12)",
          textColor: "#059669",
          desc: item.title,
          progress: "100%",
          status: "Completed & Paid",
          action: "View Credential"
        });

        renderUserStats();
        renderWorkTable();
        el.modalTaskRunner.classList.remove('active');

        showToast(`🎉 Work Approved! +$${payout.toFixed(2)} USD credited to your SkillBridge wallet!`, 'success');
      }
    }, 1800);
  });

  el.modalTaskClose.addEventListener('click', () => el.modalTaskRunner.classList.remove('active'));
  el.modalTaskCancel.addEventListener('click', () => el.modalTaskRunner.classList.remove('active'));

  // Tag choice selection inside workspace
  document.querySelectorAll('#modal-tags-container .tag-choice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#modal-tags-container .tag-choice-btn').forEach(b => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
      const label = e.currentTarget.dataset.label;
      const bboxLabel = document.getElementById('demo-bbox-label');
      if (bboxLabel) bboxLabel.textContent = label;
    });
  });

  // ========================================================================
  // GUIDE MODAL CONTROLLER
  // ========================================================================
  function openGuideModal() {
    renderCycleGuide();
    el.modalCycleGuide.classList.add('active');
  }

  if (el.btnTriggerGuideModal) el.btnTriggerGuideModal.addEventListener('click', openGuideModal);
  if (el.heroCtaGuideBtn) el.heroCtaGuideBtn.addEventListener('click', openGuideModal);
  if (el.btnTopPoints) el.btnTopPoints.addEventListener('click', openGuideModal);
  if (el.modalGuideClose) el.modalGuideClose.addEventListener('click', () => el.modalCycleGuide.classList.remove('active'));

  if (el.heroCtaStartSim) {
    el.heroCtaStartSim.addEventListener('click', () => {
      openSimulationRunner('sim-web-01');
    });
  }

  if (el.btnGuideStartSim) {
    el.btnGuideStartSim.addEventListener('click', () => {
      el.modalCycleGuide.classList.remove('active');
      openSimulationRunner('sim-web-01');
    });
  }

  // ========================================================================
  // VIEW NAVIGATION CONTROLLER
  // ========================================================================
  function switchView(viewName) {
    state.currentView = viewName;
    
    el.navItems.forEach(item => {
      if (item.dataset.view === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    Object.values(el.views).forEach(v => {
      if (v) v.style.display = 'none';
    });

    if (el.views[viewName]) {
      el.views[viewName].style.display = 'block';
    }

    if (viewName === 'simulations') renderSimulations();
    if (viewName === 'tasks') renderGigs();
    if (viewName === 'dashboard') {
      renderSimulations();
      renderGigs();
      renderProgressionMeter();
    }
  }

  el.navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = e.currentTarget.dataset.view;
      if (view === 'wallet') {
        openCashoutModal();
      } else {
        switchView(view);
      }
    });
  });

  // Global search input
  el.globalSearch.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderGigs();
  });

  // ========================================================================
  // CASHOUT MODAL
  // ========================================================================
  function openCashoutModal() {
    el.cashoutAvailableDisplay.textContent = `$${state.user.walletBalance.toFixed(2)}`;
    el.cashoutAmountInput.value = (Math.min(state.user.walletBalance, 150)).toFixed(2);
    el.modalCashout.classList.add('active');
  }

  el.btnTriggerCashout.addEventListener('click', openCashoutModal);
  el.modalCashoutClose.addEventListener('click', () => el.modalCashout.classList.remove('active'));
  el.modalCashoutCancel.addEventListener('click', () => el.modalCashout.classList.remove('active'));

  document.querySelectorAll('#modal-cashout .tag-choice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#modal-cashout .tag-choice-btn').forEach(b => b.classList.remove('selected'));
      e.currentTarget.classList.add('selected');
    });
  });

  el.btnConfirmCashout.addEventListener('click', () => {
    const amount = parseFloat(el.cashoutAmountInput.value);
    if (isNaN(amount) || amount <= 0 || amount > state.user.walletBalance) {
      showToast('Please enter a valid withdrawal amount.', 'error');
      return;
    }

    state.user.walletBalance -= amount;
    renderUserStats();
    el.modalCashout.classList.remove('active');
    showToast(`💸 Success! $${amount.toFixed(2)} sent via instant payout. Transaction ref: SB-${Math.floor(100000 + Math.random() * 900000)}`, 'success');
  });

  // ========================================================================
  // PARTNER BUSINESS MODE TOGGLE
  // ========================================================================
  el.btnToggleBusinessMode.addEventListener('click', () => {
    switchView('partnerPortal');
    showToast('Switched to Partner Business Workspace (TechNova AI Console)');
  });

  el.btnExitPartnerMode.addEventListener('click', () => {
    switchView('dashboard');
    showToast('Switched back to Youth Jobseeker Dashboard');
  });

  // Toast utility
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'success' ? 'success' : ''}`;
    
    let icon = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    `;
    if (type === 'success') {
      icon = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
    }

    toast.innerHTML = `${icon}<span>${message}</span>`;
    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 4500);
  }
  window.showToast = showToast;

  // Initial Boot
  renderProgressionMeter();
  renderSimulations();
  renderGigs();
  renderFilterPills();
  renderLearningProgress();
  renderWorkTable();
  renderBarChart();
  renderMentors();

  // Welcome Announcement
  setTimeout(() => {
    showToast("SkillBridge Pathway Active: Complete 1 Job Simulation (+35 SP) to unlock Real Paid Gigs!", "info");
  }, 500);
});
