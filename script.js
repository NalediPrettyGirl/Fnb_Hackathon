/**
 * SkillBridge — Virtual Career Simulation & Freelance Marketplace
 * Core Application Logic (Vanilla JavaScript)
 */

document.addEventListener('DOMContentLoaded', () => {
  // =========================================================================
  // SMART SIGNUP / ONBOARDING ENGINE
  // =========================================================================
  (function initSignupFlow() {
    const overlay = document.getElementById('signupOverlay');
    if (!overlay) return;

    // If user already completed signup, skip immediately
    if (localStorage.getItem('skillbridge_signup_done') === '1') {
      overlay.remove();
      return;
    }

    document.body.classList.add('signup-active');

    const steps = overlay.querySelectorAll('.signup-step-panel');
    const indicators = overlay.querySelectorAll('.signup-step-indicator');
    const lines = overlay.querySelectorAll('.signup-step-line');
    let currentStep = 1;

    function showStep(n) {
      steps.forEach(p => p.classList.remove('active'));
      const target = document.getElementById(n === 4 ? 'signupStepSuccess' : `signupStep${n}`);
      if (target) {
        // Re-trigger animation by removing/adding active
        void target.offsetWidth;
        target.classList.add('active');
      }

      indicators.forEach((ind, i) => {
        const stepNum = i + 1;
        ind.classList.remove('active', 'done');
        if (stepNum < n) ind.classList.add('done');
        else if (stepNum === n) ind.classList.add('active');
      });

      lines.forEach((line, i) => {
        line.classList.toggle('filled', i < n - 1);
      });

      currentStep = n;
    }

    // --- Step 1: Account Info ---
    const nameInput = document.getElementById('signupFullName');
    const emailInput = document.getElementById('signupEmail');
    const passInput = document.getElementById('signupPassword');
    const next1 = document.getElementById('signupNext1');
    const eyeBtn = document.getElementById('signupEyeBtn');
    const strengthFill = document.getElementById('strengthFill');
    const strengthLabel = document.getElementById('strengthLabel');

    function validateStep1() {
      // Keep Continue button enabled even when textboxes are empty for frictionless demo / onboarding
      if (next1) next1.disabled = false;
    }
    if (next1) next1.disabled = false;

    nameInput?.addEventListener('input', validateStep1);
    emailInput?.addEventListener('input', validateStep1);
    passInput?.addEventListener('input', () => {
      validateStep1();
      const len = passInput.value.length;
      let pct = 0, color = '', label = '';
      if (len === 0) { pct = 0; label = ''; }
      else if (len < 6)  { pct = 25;  color = '#e74c3c'; label = 'Weak'; }
      else if (len < 10) { pct = 55;  color = '#f5c542'; label = 'Fair'; }
      else if (len < 14) { pct = 80;  color = '#87977B'; label = 'Strong'; }
      else               { pct = 100; color = '#2ecc71'; label = 'Very Strong'; }
      strengthFill.style.width = pct + '%';
      strengthFill.style.background = color;
      strengthLabel.textContent = label;
      strengthLabel.style.color = color;
    });

    eyeBtn?.addEventListener('click', () => {
      passInput.type = passInput.type === 'password' ? 'text' : 'password';
      eyeBtn.textContent = passInput.type === 'password' ? '👁' : '🙈';
    });

    next1?.addEventListener('click', () => showStep(2));

    // --- Step 2: Role Selection ---
    const roleCards = overlay.querySelectorAll('.signup-role-card');
    const next2 = document.getElementById('signupNext2');
    const back2 = document.getElementById('signupBack2');
    let selectedRole = 'data-analyst';
    if (next2) next2.disabled = false;

    roleCards.forEach(card => {
      card.addEventListener('click', () => {
        roleCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedRole = card.getAttribute('data-role');
        if (next2) next2.disabled = false;
      });
    });

    next2?.addEventListener('click', () => showStep(3));
    back2?.addEventListener('click', () => showStep(1));

    // --- Step 3: Skill Stars ---
    const starGroups = overlay.querySelectorAll('.skill-stars');
    const back3 = document.getElementById('signupBack3');
    const launchBtn = document.getElementById('signupLaunchBtn');

    starGroups.forEach(group => {
      const stars = group.querySelectorAll('.star');
      stars.forEach(star => {
        star.addEventListener('click', () => {
          const val = parseInt(star.getAttribute('data-val'), 10);
          stars.forEach(s => {
            s.classList.toggle('lit', parseInt(s.getAttribute('data-val'), 10) <= val);
          });
          group.setAttribute('data-selected', val);
        });

        star.addEventListener('mouseenter', () => {
          const val = parseInt(star.getAttribute('data-val'), 10);
          stars.forEach(s => {
            const sv = parseInt(s.getAttribute('data-val'), 10);
            if (sv <= val) s.classList.add('lit');
          });
        });

        star.addEventListener('mouseleave', () => {
          const selected = parseInt(group.getAttribute('data-selected') || '0', 10);
          stars.forEach(s => {
            const sv = parseInt(s.getAttribute('data-val'), 10);
            s.classList.toggle('lit', sv <= selected);
          });
        });
      });
    });

    back3?.addEventListener('click', () => showStep(2));

    // --- Launch ---
    launchBtn?.addEventListener('click', () => {
      showStep(4); // Success animation

      // Save the signup data to localStorage for the app
      const fullName = nameInput.value.trim() || 'Jordan Vance';
      const initials = fullName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
      const roleMap = {
        'data-analyst': 'Junior Analyst',
        'business-analyst': 'Business Analyst',
        'freelancer': 'Freelancer',
        'career-changer': 'Junior Analyst'
      };
      const roleName = roleMap[selectedRole] || 'Junior Analyst';

      localStorage.setItem('stratum_user_profile', JSON.stringify({
        name: fullName,
        initials: initials,
        role: roleName
      }));
      localStorage.setItem('skillbridge_signup_done', '1');

      // After a brief success animation, reveal the app
      setTimeout(() => {
        overlay.classList.add('hidden');
        document.body.classList.remove('signup-active');
        // Update the live app state
        if (window.__skillBridgeApplyProfile) {
          window.__skillBridgeApplyProfile({
            name: fullName,
            initials: initials,
            role: roleName
          });
        }
        setTimeout(() => overlay.remove(), 600);
      }, 2200);
    });

    // Log in link → skip signup for demo
    document.getElementById('signupLoginLink')?.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('skillbridge_signup_done', '1');
      overlay.classList.add('hidden');
      document.body.classList.remove('signup-active');
      setTimeout(() => overlay.remove(), 600);
    });
  })();

  // =========================================================================
  // APPLICATION STATE & STORAGE
  // =========================================================================
  const savedProfile = JSON.parse(localStorage.getItem('stratum_user_profile') || 'null');

  const state = {
    user: {
      name: savedProfile?.name || 'Jordan Vance',
      initials: savedProfile?.initials || 'JV',
      role: savedProfile?.role || 'Junior Analyst',
      plan: 'Free', // 'Free' or 'Pro'
      currentXp: 340,
      nextLevelXp: 1500,
      weeklyXp: 140,
      streakDays: 4,
      tasksCompleted: 6,
      completedSims: ['auracommerce-1', 'veloce-1'],
      proposalsSent: 1,
      earnedGigsRevenue: 0
    },
    currentView: 'dashboard',
    activeSim: null,
    gigs: [
      {
        id: 'gig-aura-1',
        title: 'E-Commerce Customer Retention & Cohort Churn Dashboard (SQL / Power BI)',
        client: 'Aura Commerce Partner Network',
        clientLocation: 'Remote (US / Global)',
        clientSpent: '$52,000+ spent',
        clientRating: 4.9,
        budget: '$1,450 Fixed',
        budgetValue: 1450,
        type: 'fixed',
        category: 'SQL,Power BI',
        companyMatch: 'Aura',
        matchPercent: 98,
        isQualified: true,
        qualificationReason: 'Direct match for your verified Aura Commerce Simulation (Score: 98/100)',
        deliverables: [
          'Clean SQL schema aggregating 12-month customer order cohorts',
          'Interactive Power BI report highlighting 60-day churn drop-offs',
          '1-page executive memo for VP of Omnichannel Merchandising'
        ],
        tags: ['SQL', 'Power BI', 'E-Commerce', 'Cohort Modeling'],
        applicants: 4,
        posted: '2 hours ago'
      },
      {
        id: 'gig-veloce-1',
        title: 'Supply Chain Dispatch Route Bottleneck Model & SLA Reporting',
        client: 'Veloce Freight Systems Partner',
        clientLocation: 'Remote (North America)',
        clientSpent: '$86,000+ spent',
        clientRating: 5.0,
        budget: '$1,900 Fixed',
        budgetValue: 1900,
        type: 'fixed',
        category: 'SQL,Excel',
        companyMatch: 'Veloce',
        matchPercent: 95,
        isQualified: true,
        qualificationReason: 'Direct match for your Veloce Freight Simulation & Live Desk incident resolution',
        deliverables: [
          'Carrier handoff delay query with automated indexing',
          'Midwest hub SLA compliance spreadsheet template',
          'Automated daily threshold alert trigger'
        ],
        tags: ['SQL', 'Excel', 'Supply Chain', 'Logistics'],
        applicants: 7,
        posted: '5 hours ago'
      },
      {
        id: 'gig-retail-growth-1',
        title: 'Senior CPFR Retail Analyst — Omnichannel Growth Strategy',
        client: 'Unilever / Retail Brand Partners',
        clientLocation: 'Remote (Hybrid US / UK)',
        clientSpent: '$210,000+ spent',
        clientRating: 4.95,
        budget: '$70 - $85 / hr · 20 hrs/wk',
        budgetValue: 1600,
        type: 'hourly',
        category: 'SQL,Power BI',
        companyMatch: 'Aura',
        matchPercent: 92,
        isQualified: true,
        qualificationReason: 'Simulated retail order experience directly requested by hiring director',
        deliverables: [
          'Weekly POS inventory reconciliation model',
          'Out-of-stock risk assessment reports',
          'Executive presentation for quarterly category review'
        ],
        tags: ['SQL', 'CPFR', 'Retail', 'Inventory'],
        applicants: 12,
        posted: '1 day ago'
      },
      {
        id: 'gig-aegis-1',
        title: 'Healthcare Claims Revenue Cycle Anomaly Detection Script',
        client: 'Aegis Clinical Health Solutions',
        clientLocation: 'Remote (Canada / US)',
        clientSpent: '$34,000+ spent',
        clientRating: 4.85,
        budget: '$75 - $95 / hr · 15 hrs/wk',
        budgetValue: 1350,
        type: 'hourly',
        category: 'SQL,Python',
        companyMatch: 'Aegis',
        matchPercent: 86,
        isQualified: false,
        qualificationReason: 'Requires Aegis Health Group Pro Simulation completion',
        deliverables: [
          'Python Pandas script flagging claims with missing modifier codes',
          'Database reconciliation between intake and billing logs',
          'HIPAA-compliant sanitization routine'
        ],
        tags: ['SQL', 'Python', 'Healthcare', 'Audit'],
        applicants: 3,
        posted: 'Just now'
      },
      {
        id: 'gig-solon-1',
        title: 'Fintech Transaction Fraud Stress Scenario Modeling',
        client: 'Solon Risk Capital Partners',
        clientLocation: 'Remote (EU / US)',
        clientSpent: '$115,000+ spent',
        clientRating: 4.9,
        budget: '$2,700 Fixed',
        budgetValue: 2700,
        type: 'fixed',
        category: 'SQL,Python,Power BI',
        companyMatch: 'Solon',
        matchPercent: 84,
        isQualified: false,
        qualificationReason: 'Requires Solon Capital & Risk Pro Simulation completion',
        deliverables: [
          'Chargeback velocity and card-testing surge prediction model',
          'Risk scoring dashboard with automated anomaly triggers',
          'Presentation for Chief Risk Officer'
        ],
        tags: ['Fintech', 'Fraud', 'SQL', 'Python'],
        applicants: 8,
        posted: 'Yesterday'
      },
      {
        id: 'gig-vanguard-1',
        title: 'Matchday Fan Merchandising & Kit Sales Forecasting',
        client: 'Vanguard Athletic Group',
        clientLocation: 'Remote (Global)',
        clientSpent: '$53,000+ spent',
        clientRating: 4.88,
        budget: '$1,350 Fixed',
        budgetValue: 1350,
        type: 'fixed',
        category: 'SQL,Excel',
        companyMatch: 'Vanguard',
        matchPercent: 91,
        isQualified: true,
        qualificationReason: 'Matches Vanguard Athletics Co. retail inventory simulation',
        deliverables: [
          'Matchday vs off-season demand projection model',
          'Inventory safety stock calculator for new jersey launches',
          'Excel dashboard with dynamic player name filters'
        ],
        tags: ['SQL', 'Excel', 'Sports Analytics', 'E-Commerce'],
        applicants: 6,
        posted: '3 days ago'
      }
    ],
    proposals: [
      {
        gigTitle: 'E-Commerce Customer Retention & Cohort Churn Dashboard',
        client: 'Aura Commerce Partner Network',
        rate: '$1,450',
        status: 'Under Review by Recruiter',
        submittedAt: 'Today, 9:20 AM'
      }
    ],
    sampleDatasets: {
      aura_orders: [
        { order_id: 1001, customer_id: 204, order_date: '2025-01-04', order_status: 'Delivered', order_amount: 142.50, region: 'East' },
        { order_id: 1002, customer_id: 318, order_date: '2025-01-05', order_status: 'Delivered', order_amount: 89.20, region: 'West' },
        { order_id: 1003, customer_id: 109, order_date: '2025-01-06', order_status: 'Processing', order_amount: 215.00, region: 'Midwest' },
        { order_id: 1004, customer_id: 542, order_date: '2025-01-08', order_status: 'Cancelled', order_amount: 45.00, region: 'South' },
        { order_id: 1005, customer_id: 881, order_date: '2025-01-09', order_status: 'Delivered', order_amount: 320.40, region: 'East' },
        { order_id: 1006, customer_id: 9999, order_date: '2025-01-10', order_status: 'Test_Mode', order_amount: 999.00, region: 'Internal' },
        { order_id: 1007, customer_id: 412, order_date: '2025-01-12', order_status: 'Returned', order_amount: 110.00, region: 'West' },
        { order_id: 1008, customer_id: 733, order_date: '2025-01-14', order_status: 'Delivered', order_amount: 198.50, region: 'Midwest' },
        { order_id: 1009, customer_id: 620, order_date: '2025-01-15', order_status: 'Processing', order_amount: 310.80, region: 'East' },
        { order_id: 1010, customer_id: 305, order_date: '2025-01-16', order_status: 'Delivered', order_amount: 74.00, region: 'South' }
      ]
    }
  };

  // =========================================================================
  // DOM SELECTORS
  // =========================================================================
  const appSidebar = document.getElementById('appSidebar');
  const collapseSidebarBtn = document.getElementById('collapseSidebarBtn');
  const mobileSidebarToggle = document.getElementById('mobileSidebarToggle');
  const navLinks = document.querySelectorAll('.nav-link');
  const viewPanels = document.querySelectorAll('.view-panel');
  
  // User Profile DOM
  const userNameDisplay = document.getElementById('userNameDisplay');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const userRankDisplay = document.getElementById('userRankDisplay');
  const progressRoleLabel = document.getElementById('progressRoleLabel');
  const dashRankBadge = document.getElementById('dashRankBadge');
  const topbarAvatarSm = document.getElementById('topbarAvatarSm');
  const topbarUserName = document.getElementById('topbarUserName');
  const userPlanDisplay = document.getElementById('userPlanDisplay');
  const currentXpText = document.getElementById('currentXpText');
  const sidebarXpBar = document.getElementById('sidebarXpBar');
  const dashWeekXp = document.getElementById('dashWeekXp');
  const dashTasksCompleted = document.getElementById('dashTasksCompleted');
  const certCandidateName = document.getElementById('certCandidateName');

  // Customize Profile Modal
  const customizeProfileModal = document.getElementById('customizeProfileModal');
  const closeProfileModalBtn = document.getElementById('closeProfileModalBtn');
  const cancelProfileModalBtn = document.getElementById('cancelProfileModalBtn');
  const customizeProfileForm = document.getElementById('customizeProfileForm');
  const inputUserName = document.getElementById('inputUserName');
  const inputUserRole = document.getElementById('inputUserRole');
  const inputUserInitials = document.getElementById('inputUserInitials');
  const editProfileBtn = document.getElementById('editProfileBtn');
  const userProfileCard = document.getElementById('userProfileCard');
  const userPillBtn = document.getElementById('userPillBtn');

  // Rate Calculator Modal
  const rateCalcModal = document.getElementById('rateCalcModal');
  const closeRateCalcModalBtn = document.getElementById('closeRateCalcModalBtn');
  const freelancerRateCalcBtn = document.getElementById('freelancerRateCalcBtn');

  // Announcements & Notifications
  const topAnnouncement = document.getElementById('topAnnouncement');
  const closeAnnouncementBtn = document.getElementById('closeAnnouncementBtn');
  const bannerCtaBtn = document.getElementById('bannerCtaBtn');
  const notifBellBtn = document.getElementById('notifBellBtn');
  const notifDropdown = document.getElementById('notifDropdown');
  const markAllReadBtn = document.getElementById('markAllReadBtn');

  // Modals & Drawers
  const simSandboxModal = document.getElementById('simSandboxModal');
  const closeSimModalBtn = document.getElementById('closeSimModalBtn');
  const cancelSimModalBtn = document.getElementById('cancelSimModalBtn');
  const submitSimSolutionBtn = document.getElementById('submitSimSolutionBtn');
  const runSimQueryBtn = document.getElementById('runSimQueryBtn');
  const simSqlTextarea = document.getElementById('simSqlTextarea');
  const simQueryOutputArea = document.getElementById('simQueryOutputArea');
  const simOutputStatus = document.getElementById('simOutputStatus');
  const tabSqlEditor = document.getElementById('tabSqlEditor');
  const tabSampleData = document.getElementById('tabSampleData');
  const paneSqlEditor = document.getElementById('paneSqlEditor');
  const paneSampleData = document.getElementById('paneSampleData');
  const simSampleDataTable = document.getElementById('simSampleDataTable');

  // Proposal Modal
  const proposalModal = document.getElementById('proposalModal');
  const closeProposalModalBtn = document.getElementById('closeProposalModalBtn');
  const cancelProposalBtn = document.getElementById('cancelProposalBtn');
  const proposalForm = document.getElementById('proposalForm');
  const autoGeneratePitchBtn = document.getElementById('autoGeneratePitchBtn');
  const proposalCoverLetter = document.getElementById('proposalCoverLetter');
  const proposalModalTitle = document.getElementById('proposalModalTitle');
  const proposalModalClient = document.getElementById('proposalModalClient');
  const proposedRateInput = document.getElementById('proposedRateInput');

  // Pro & Cert Modals
  const upgradeProModal = document.getElementById('upgradeProModal');
  const closeUpgradeModalBtn = document.getElementById('closeUpgradeModalBtn');
  const upgradeProSidebarBtn = document.getElementById('upgradeProSidebarBtn');
  const bannerSeePlansBtn = document.getElementById('bannerSeePlansBtn');
  const confirmUpgradeBtn = document.getElementById('confirmUpgradeBtn');
  const certModal = document.getElementById('certModal');
  const topCertWidget = document.getElementById('topCertWidget');
  const viewCertDetailsBtn = document.getElementById('viewCertDetailsBtn');
  const closeCertModalBtn = document.getElementById('closeCertModalBtn');
  const closeCertModalFooterBtn = document.getElementById('closeCertModalFooterBtn');

  // Break Room
  const breakRoomToggleBtn = document.getElementById('breakRoomToggleBtn');
  const breakRoomDrawer = document.getElementById('breakRoomDrawer');
  const closeBreakRoomBtn = document.getElementById('closeBreakRoomBtn');
  const breakRoomInput = document.getElementById('breakRoomInput');
  const sendBreakRoomBtn = document.getElementById('sendBreakRoomBtn');
  const breakRoomMessages = document.getElementById('breakRoomMessages');
  const openFloorChatBtn = document.getElementById('openFloorChatBtn');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // =========================================================================
  // USER PROFILE "MAKE IT MINE" INITIALIZATION & HANDLERS
  // =========================================================================
  function applyUserProfile() {
    userNameDisplay.textContent = state.user.name;
    sidebarAvatar.textContent = state.user.initials;
    userRankDisplay.textContent = state.user.role;
    progressRoleLabel.textContent = state.user.role;
    if (dashRankBadge) dashRankBadge.textContent = state.user.role;
    if (topbarAvatarSm) topbarAvatarSm.textContent = state.user.initials;
    if (topbarUserName) topbarUserName.textContent = state.user.name.split(' ')[0];
    if (certCandidateName) certCandidateName.textContent = `Candidate: ${state.user.name}`;

    inputUserName.value = state.user.name;
    inputUserInitials.value = state.user.initials;
    inputUserRole.value = state.user.role;
  }

  function openCustomizeProfileModal() {
    customizeProfileModal.classList.add('show');
  }

  userProfileCard?.addEventListener('click', (e) => {
    openCustomizeProfileModal();
  });

  editProfileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCustomizeProfileModal();
  });

  userPillBtn?.addEventListener('click', () => {
    openCustomizeProfileModal();
  });

  closeProfileModalBtn?.addEventListener('click', () => customizeProfileModal.classList.remove('show'));
  cancelProfileModalBtn?.addEventListener('click', () => customizeProfileModal.classList.remove('show'));

  customizeProfileForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const newName = inputUserName.value.trim() || 'Jordan Vance';
    const newRole = inputUserRole.value;
    const newInitials = inputUserInitials.value.trim().toUpperCase() || 'JV';

    state.user.name = newName;
    state.user.role = newRole;
    state.user.initials = newInitials;

    localStorage.setItem('stratum_user_profile', JSON.stringify({
      name: newName,
      role: newRole,
      initials: newInitials
    }));

    applyUserProfile();
    customizeProfileModal.classList.remove('show');
    showToast(`Identity updated! Welcome, ${newName}.`, 'success');
  });

  applyUserProfile();

  // Expose profile updater for signup flow
  window.__skillBridgeApplyProfile = function(profile) {
    if (profile.name) state.user.name = profile.name;
    if (profile.initials) state.user.initials = profile.initials;
    if (profile.role) state.user.role = profile.role;
    applyUserProfile();
  };

  // =========================================================================
  // ROUTING & VIEW NAVIGATION
  // =========================================================================
  function switchView(viewId) {
    if (!viewId) viewId = 'dashboard';
    viewId = viewId.replace('#', '');
    
    const targetPanel = document.getElementById(`view-${viewId}`);
    if (!targetPanel) return;

    state.currentView = viewId;

    navLinks.forEach(link => {
      const linkView = link.getAttribute('data-view');
      if (linkView === viewId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    viewPanels.forEach(panel => panel.classList.remove('active'));
    targetPanel.classList.add('active');

    appSidebar.classList.remove('mobile-open');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewId === 'jobs-desk') {
      renderGigs();
    } else if (viewId === 'dashboard') {
      renderDashboardTeaserGigs();
    } else if (viewId === 'track-guide') {
      syncTrackGuideView();
    }
  }

  // =========================================================================
  // CAREER TRACK GUIDES ENGINE
  // =========================================================================
  const careerTrackSelect = document.getElementById('careerTrackSelect');
  const openTrackGuideBtn = document.getElementById('openTrackGuideBtn');
  const trackTabBtns = document.querySelectorAll('.track-tab-btn');
  const trackGuidePanels = document.querySelectorAll('.track-guide-panel');

  function showTrackGuide(trackId) {
    if (!trackId) trackId = 'data-analyst';

    // Update tabs
    trackTabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-track') === trackId);
    });

    // Update panels
    trackGuidePanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `guide-panel-${trackId}`);
    });

    // Sync dropdown
    if (careerTrackSelect && careerTrackSelect.value !== trackId) {
      careerTrackSelect.value = trackId;
    }
  }

  function syncTrackGuideView() {
    const activeTrack = careerTrackSelect ? careerTrackSelect.value : 'data-analyst';
    showTrackGuide(activeTrack);
  }

  // Dropdown selection instantly switches to Guide Page for that Track
  careerTrackSelect?.addEventListener('change', (e) => {
    const selected = e.target.value;
    showTrackGuide(selected);
    window.location.hash = 'track-guide';
    switchView('track-guide');
  });

  // Topbar Guide button
  openTrackGuideBtn?.addEventListener('click', () => {
    const selected = careerTrackSelect ? careerTrackSelect.value : 'data-analyst';
    showTrackGuide(selected);
    window.location.hash = 'track-guide';
    switchView('track-guide');
  });

  // Guide Tabs inside View
  trackTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const track = btn.getAttribute('data-track');
      showTrackGuide(track);
    });
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.getAttribute('data-view');
      window.location.hash = view;
      switchView(view);
    });
  });

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash || '#dashboard';
    switchView(hash);
  });

  const initialHash = window.location.hash ? window.location.hash : '#dashboard';
  switchView(initialHash);

  // =========================================================================
  // SIDEBAR & SHELL INTERACTIONS
  // =========================================================================
  collapseSidebarBtn?.addEventListener('click', () => {
    appSidebar?.classList.toggle('collapsed');
  });

  mobileSidebarToggle?.addEventListener('click', () => {
    appSidebar?.classList.toggle('mobile-open');
  });

  closeAnnouncementBtn?.addEventListener('click', () => {
    topAnnouncement?.classList.add('hidden');
  });

  bannerCtaBtn?.addEventListener('click', () => {
    window.location.hash = 'work-desk';
  });

  // Notifications
  notifBellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifDropdown.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!notifDropdown.contains(e.target) && !notifBellBtn.contains(e.target)) {
      notifDropdown.classList.remove('show');
    }
  });

  markAllReadBtn.addEventListener('click', () => {
    document.querySelectorAll('.notif-item').forEach(item => item.classList.remove('unread'));
    const notifDot = document.querySelector('.notif-badge-dot');
    if (notifDot) notifDot.style.display = 'none';
    showToast('All notifications marked as read.');
  });

  // Global search Ctrl + K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const globalSearch = document.getElementById('globalSearchInput');
      if (globalSearch) globalSearch.focus();
    }
  });

  const globalSearchInput = document.getElementById('globalSearchInput');
  if (globalSearchInput) {
    globalSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = globalSearchInput.value.trim().toLowerCase();
        if (query) {
          window.location.hash = 'jobs-desk';
          setTimeout(() => {
            const gigSearch = document.getElementById('gigSearchInput');
            if (gigSearch) {
              gigSearch.value = query;
              filterGigs();
            }
          }, 100);
        }
      }
    });
  }

  // =========================================================================
  // TOAST NOTIFICATION UTILITY
  // =========================================================================
  function showToast(message, type = 'normal') {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '🎉' : '⚡'}</span>
      <span class="toast-text">${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // =========================================================================
  // XP & USER REWARD ENGINE
  // =========================================================================
  function awardXp(amount, reason = '') {
    state.user.currentXp += amount;
    state.user.weeklyXp += amount;

    currentXpText.textContent = state.user.currentXp;
    dashWeekXp.textContent = state.user.weeklyXp;
    
    const pct = Math.min(100, Math.round((state.user.currentXp / state.user.nextLevelXp) * 100));
    sidebarXpBar.style.width = `${pct}%`;

    if (state.user.currentXp >= state.user.nextLevelXp && state.user.role === 'Junior Analyst') {
      state.user.role = 'Senior Analyst';
      state.user.nextLevelXp = 5000;
      userRankDisplay.textContent = 'Senior Analyst';
      progressRoleLabel.textContent = 'Senior Analyst';
      if (dashRankBadge) dashRankBadge.textContent = 'Senior Analyst';
      showToast('🚀 LEVEL UP! You reached Senior Analyst rank!', 'success');
    }

    showToast(`+${amount} XP gained! ${reason}`);
  }

  // =========================================================================
  // WORK DESK & COMPANY SIMULATION LOGIC (Unique Brandings)
  // =========================================================================
  const filterPillBtns = document.querySelectorAll('.filter-pills-bar .pill-btn');
  filterPillBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterPillBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');

      const simCards = document.querySelectorAll('.sim-card');
      simCards.forEach(card => {
        const cardTech = card.getAttribute('data-tech') || '';
        if (filter === 'all' || cardTech.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  document.querySelectorAll('.sim-jobs-link').forEach(link => {
    link.addEventListener('click', () => {
      const company = link.getAttribute('data-company-filter');
      window.location.hash = 'jobs-desk';
      setTimeout(() => {
        const gigSearch = document.getElementById('gigSearchInput');
        if (gigSearch) {
          gigSearch.value = company;
          filterGigs();
        }
      }, 50);
    });
  });

  document.querySelectorAll('.open-sim-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const simId = btn.getAttribute('data-sim-id');
      const isPro = btn.closest('.sim-card').getAttribute('data-pro') === 'true';

      if (isPro && state.user.plan !== 'Pro') {
        upgradeProModal.classList.add('show');
        return;
      }

      openSimulationSandbox(simId);
    });
  });

  // (Dead impact slider engine removed — smooth slider at bottom handles carousel)

  function openSimulationSandbox(simId) {
    state.activeSim = simId;
    const simModalTitle = document.getElementById('simModalTitle');
    const simModalSubtitle = document.getElementById('simModalSubtitle');
    const simModalLogo = document.getElementById('simModalLogo');
    const simBriefText = document.getElementById('simBriefText');

    if (simId === 'veloce') {
      simModalLogo.textContent = '🚚';
      simModalTitle.textContent = 'Veloce Freight Systems — Dispatch Telemetry Sandbox';
      simModalSubtitle.textContent = 'Episode 1: Last-Mile Delivery Delays & Cross-Dock SLA Bottlenecks';
      simBriefText.textContent = 'Veloce Freight Operations needs a query that isolates carrier handoff delays causing SLA delivery failures across Midwest regional hubs.';
      simSqlTextarea.value = `-- Veloce Freight Dispatch Investigation Query:
SELECT 
    dispatch_stage, 
    COUNT(*) AS total_dispatches, 
    AVG(delay_minutes) AS average_delay_mins 
FROM veloce_live_dispatch 
WHERE status = 'DELAYED' 
GROUP BY dispatch_stage 
ORDER BY average_delay_mins DESC;`;
    } else {
      simModalLogo.textContent = '🛍️';
      simModalTitle.textContent = 'Aura Commerce Global — Enterprise Sandbox';
      simModalSubtitle.textContent = 'Episode 1: Schema Investigation & Customer Order Status Breakdown';
      simBriefText.textContent = 'Aura Commerce VP of Merchandising needs to understand how orders flow through their omnichannel fulfillment pipeline. Write a SQL query grouping orders by order_status and gross merchandise value (GMV).';
      simSqlTextarea.value = `-- Write your query below:
SELECT 
    order_status, 
    COUNT(*) AS total_orders, 
    ROUND(SUM(order_amount), 2) AS total_gmv 
FROM orders 
WHERE customer_id != 9999 
GROUP BY order_status 
ORDER BY total_gmv DESC;`;
    }

    renderSampleDataTable();
    simOutputStatus.textContent = 'Ready to execute';
    simQueryOutputArea.innerHTML = '<div class="empty-state-output">Click <strong>"Run Query"</strong> to test your SQL against the dataset.</div>';
    simSandboxModal.classList.add('show');
  }

  tabSqlEditor.addEventListener('click', () => {
    tabSqlEditor.classList.add('active');
    tabSampleData.classList.remove('active');
    paneSqlEditor.classList.add('active');
    paneSampleData.classList.remove('active');
  });

  tabSampleData.addEventListener('click', () => {
    tabSampleData.classList.add('active');
    tabSqlEditor.classList.remove('active');
    paneSampleData.classList.add('active');
    paneSqlEditor.classList.remove('active');
  });

  function renderSampleDataTable() {
    const data = state.sampleDatasets.aura_orders;
    let tableHtml = `
      <table class="data-table">
        <thead>
          <tr>
            <th>order_id</th>
            <th>customer_id</th>
            <th>order_date</th>
            <th>order_status</th>
            <th>order_amount</th>
            <th>region</th>
          </tr>
        </thead>
        <tbody>
    `;

    data.forEach(row => {
      tableHtml += `
        <tr>
          <td>${row.order_id}</td>
          <td>${row.customer_id}</td>
          <td>${row.order_date}</td>
          <td><span class="badge ${row.order_status === 'Delivered' ? 'badge-rank' : 'badge-tier'}">${row.order_status}</span></td>
          <td>$${row.order_amount.toFixed(2)}</td>
          <td>${row.region}</td>
        </tr>
      `;
    });

    tableHtml += `</tbody></table>`;
    simSampleDataTable.innerHTML = tableHtml;
  }

  runSimQueryBtn.addEventListener('click', () => {
    simOutputStatus.textContent = 'Executing query...';

    setTimeout(() => {
      simOutputStatus.textContent = 'Returned 4 rows in 12ms';
      
      const groups = {};
      state.sampleDatasets.aura_orders.forEach(row => {
        if (row.customer_id === 9999) return;
        const status = row.order_status;
        if (!groups[status]) {
          groups[status] = { count: 0, gmv: 0 };
        }
        groups[status].count += 1;
        groups[status].gmv += row.order_amount;
      });

      let outHtml = `
        <table class="data-table">
          <thead>
            <tr>
              <th>order_status</th>
              <th>total_orders</th>
              <th>total_gmv ($)</th>
            </tr>
          </thead>
          <tbody>
      `;

      Object.keys(groups).forEach(status => {
        outHtml += `
          <tr>
            <td><strong>${status}</strong></td>
            <td>${groups[status].count}</td>
            <td>$${groups[status].gmv.toFixed(2)}</td>
          </tr>
        `;
      });

      outHtml += `</tbody></table>`;
      simQueryOutputArea.innerHTML = outHtml;
      showToast('Query executed successfully against live sandbox data.');
    }, 250);
  });

  const resetSimQueryBtn = document.getElementById('resetSimQueryBtn');
  if (resetSimQueryBtn) {
    resetSimQueryBtn.addEventListener('click', () => {
      simSqlTextarea.value = `SELECT \n    order_status, \n    COUNT(*) AS total_orders, \n    ROUND(SUM(order_amount), 2) AS total_gmv \nFROM orders \nWHERE customer_id != 9999 \nGROUP BY order_status \nORDER BY total_gmv DESC;`;
    });
  }

  submitSimSolutionBtn.addEventListener('click', () => {
    submitSimSolutionBtn.disabled = true;
    submitSimSolutionBtn.textContent = 'Grading with AI Evaluator...';

    setTimeout(() => {
      submitSimSolutionBtn.disabled = false;
      submitSimSolutionBtn.textContent = 'Submit Solution & Grade (+50 XP)';
      simSandboxModal.classList.remove('show');

      awardXp(50, 'Completed Aura Commerce Global Episode 1 with Score 98/100!');
      
      state.user.tasksCompleted += 1;
      dashTasksCompleted.textContent = state.user.tasksCompleted;

      prependCommunityActivity(state.user.name, 'completed "What Order Statuses Exist?" at Aura Commerce', '98/100', 'Just now');

      showToast('🎉 Certified Grade: 98/100! Your score is now verified on your Jobs Desk profile.', 'success');
    }, 1200);
  });

  closeSimModalBtn.addEventListener('click', () => simSandboxModal.classList.remove('show'));
  cancelSimModalBtn.addEventListener('click', () => simSandboxModal.classList.remove('show'));

  // =========================================================================
  // FREELANCE JOBS DESK & GIGS ENGINE
  // =========================================================================
  function renderGigs() {
    filterGigs();
  }

  function filterGigs() {
    const gigsContainer = document.getElementById('gigsListContainer');
    if (!gigsContainer) return;

    const searchVal = (document.getElementById('gigSearchInput')?.value || '').toLowerCase();
    const typeVal = document.getElementById('gigTypeFilter')?.value || 'all';
    const budgetVal = document.getElementById('gigBudgetFilter')?.value || 'all';
    const onlyQualified = document.getElementById('onlyQualifiedCheckbox')?.checked;

    const filtered = state.gigs.filter(gig => {
      const matchesSearch = !searchVal || 
        gig.title.toLowerCase().includes(searchVal) ||
        gig.client.toLowerCase().includes(searchVal) ||
        gig.tags.some(t => t.toLowerCase().includes(searchVal));

      const matchesType = typeVal === 'all' || gig.type === typeVal;

      let matchesBudget = true;
      if (budgetVal === 'under-1000') matchesBudget = gig.budgetValue < 1000;
      else if (budgetVal === '1000-2500') matchesBudget = gig.budgetValue >= 1000 && gig.budgetValue <= 2500;
      else if (budgetVal === 'over-2500') matchesBudget = gig.budgetValue > 2500;

      const matchesQualified = !onlyQualified || gig.isQualified;

      return matchesSearch && matchesType && matchesBudget && matchesQualified;
    });

    if (filtered.length === 0) {
      gigsContainer.innerHTML = `
        <div style="background: white; border: 1px solid var(--color-beige); border-radius: var(--radius-lg); padding: 40px; text-align: center;">
          <h3>No gigs matching your filter criteria.</h3>
          <p style="color: var(--color-charcoal-muted); margin-top: 6px;">Try unchecking "Only Show Gigs I Qualify For" or clearing your search term.</p>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach(gig => {
      html += `
        <div class="gig-card ${gig.isQualified ? 'qualified' : ''}" data-gig-id="${gig.id}">
          <div class="gig-top-row">
            <div class="gig-client-info">
              <div class="client-logo-icon">💼</div>
              <span class="client-name">${gig.client}</span>
              <span class="client-verified">✓ Verified Client</span>
              <span>•</span>
              <span>${gig.clientLocation}</span>
              <span>•</span>
              <span>⭐ ${gig.clientRating} (${gig.clientSpent})</span>
            </div>
            <div class="gig-rate-badge">${gig.budget}</div>
          </div>

          <h3 class="gig-title">${gig.title}</h3>

          ${gig.isQualified ? `
            <div class="gig-match-banner">
              <span class="match-percentage">⚡ ${gig.matchPercent}% Match</span>
              <span class="match-reason">${gig.qualificationReason}</span>
            </div>
          ` : `
            <div class="gig-match-banner" style="background-color: var(--color-terracotta-light); border-color: rgba(184, 111, 82, 0.3);">
              <span class="match-percentage" style="color: var(--color-terracotta); border-color: var(--color-terracotta);">${gig.matchPercent}% Match</span>
              <span class="match-reason" style="color: var(--color-terracotta);">${gig.qualificationReason}</span>
            </div>
          `}

          <div class="gig-deliverables-list">
            <strong>Required Deliverables:</strong>
            ${gig.deliverables.map(d => `<li>${d}</li>`).join('')}
          </div>

          <div class="gig-footer-row">
            <div class="gig-tags-group">
              ${gig.tags.map(t => `<span class="tag-badge">${t}</span>`).join('')}
              <span style="font-size: 0.76rem; color: var(--color-charcoal-subtle); margin-left: 8px;">
                ${gig.applicants} applicants • Posted ${gig.posted}
              </span>
            </div>

            <div class="gig-card-actions">
              ${gig.isQualified ? `
                <button class="btn btn-primary submit-pitch-btn" data-gig-id="${gig.id}">Submit Proposal with Verified Score</button>
              ` : `
                <button class="btn btn-secondary complete-sim-first-btn" data-company="${gig.companyMatch}">Complete ${gig.companyMatch} Simulation First</button>
              `}
            </div>
          </div>
        </div>
      `;
    });

    gigsContainer.innerHTML = html;

    gigsContainer.querySelectorAll('.submit-pitch-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gigId = btn.getAttribute('data-gig-id');
        openProposalModal(gigId);
      });
    });

    gigsContainer.querySelectorAll('.complete-sim-first-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        window.location.hash = 'work-desk';
      });
    });
  }

  document.getElementById('gigSearchInput')?.addEventListener('input', filterGigs);
  document.getElementById('gigTypeFilter')?.addEventListener('change', filterGigs);
  document.getElementById('gigBudgetFilter')?.addEventListener('change', filterGigs);
  document.getElementById('onlyQualifiedCheckbox')?.addEventListener('change', filterGigs);

  function renderDashboardTeaserGigs() {
    const teaserContainer = document.getElementById('dashTeaserGigsGrid');
    if (!teaserContainer) return;

    const qualifiedGigs = state.gigs.filter(g => g.isQualified).slice(0, 2);
    let html = '';
    qualifiedGigs.forEach(gig => {
      html += `
        <div class="gig-card qualified" style="padding: 16px; margin-bottom: 0;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <span style="font-size: 0.74rem; font-weight: 700; color: var(--color-forest);">${gig.client}</span>
            <strong style="color: var(--color-forest); font-size: 1rem;">${gig.budget}</strong>
          </div>
          <h4 style="font-size: 0.95rem; font-weight: 800; color: var(--color-charcoal); margin: 6px 0;">${gig.title}</h4>
          <span style="font-size: 0.74rem; color: #2e9e62; font-weight: 700;">🟢 Verified Candidate Match (${gig.matchPercent}%)</span>
          <button class="btn btn-primary-sm open-teaser-gig-btn" data-gig-id="${gig.id}" style="margin-top: 10px;">Quick Apply →</button>
        </div>
      `;
    });

    teaserContainer.innerHTML = html;

    teaserContainer.querySelectorAll('.open-teaser-gig-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const gigId = btn.getAttribute('data-gig-id');
        openProposalModal(gigId);
      });
    });
  }

  document.getElementById('viewAllQualifiedGigsBtn')?.addEventListener('click', () => {
    window.location.hash = 'jobs-desk';
  });

  document.getElementById('dashBrowseGigsBtn')?.addEventListener('click', () => {
    window.location.hash = 'jobs-desk';
  });

  document.getElementById('exploreSimsBtn')?.addEventListener('click', () => {
    window.location.hash = 'work-desk';
  });

  // =========================================================================
  // SUBMIT PROPOSAL MODAL (PAID GIG APPLICATION)
  // =========================================================================
  function openProposalModal(gigId) {
    const gig = state.gigs.find(g => g.id === gigId);
    if (!gig) return;

    proposalModalTitle.textContent = `Submit Proposal: ${gig.title}`;
    proposalModalClient.textContent = `Client: ${gig.client} • Budget: ${gig.budget}`;
    proposedRateInput.value = gig.budgetValue;

    proposalCoverLetter.value = `Dear ${gig.client} Team,\n\nI am writing to submit my proposal for your ${gig.title}. As a verified analyst on StratumHQ, I recently completed the comprehensive enterprise simulation with an evaluated score of 98/100.\n\nMy approach for your deliverable:\n1. Reconcile raw transactional data and build clean SQL grouping logic.\n2. Develop the executive summary dashboard with actionable cohort retention filters.\n3. Provide complete documentation and a 1-page stakeholder executive brief.\n\nI can deliver the completed project within your timeline. Best regards,\n${state.user.name}`;

    proposalModal.classList.add('show');
  }

  autoGeneratePitchBtn.addEventListener('click', () => {
    proposalCoverLetter.value = `Hello Hiring Team,\n\nMy name is ${state.user.name}. I reviewed your project requirements and have already built and validated the exact SQL and dashboard architecture needed for this deliverable. In my verified StratumHQ enterprise assessment, my queries achieved 98/100 for aggregation accuracy and optimal query indexing.\n\nI am available to start immediately and will guarantee clean, production-ready deliverables with full data validation checks.\n\nSincerely,\n${state.user.name}`;
    showToast('Pitch generated using your verified simulation credentials!');
  });

  proposalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const rate = proposedRateInput.value;

    state.proposals.push({
      gigTitle: proposalModalTitle.textContent.replace('Submit Proposal: ', ''),
      client: proposalModalClient.textContent.split(' • ')[0].replace('Client: ', ''),
      rate: `$${rate}`,
      status: 'Submitted • Awaiting Client Review',
      submittedAt: 'Just now'
    });

    state.user.proposalsSent += 1;
    const propCount = document.getElementById('myProposalsCount');
    if (propCount) propCount.textContent = state.proposals.length;

    updateCertRoadmapOnProposal();

    proposalModal.classList.remove('show');
    awardXp(40, 'Submitted verified freelance gig proposal!');
    showToast('🎉 Proposal sent! Client will review your verified simulation score.', 'success');
  });

  closeProposalModalBtn.addEventListener('click', () => proposalModal.classList.remove('show'));
  cancelProposalBtn.addEventListener('click', () => proposalModal.classList.remove('show'));

  document.getElementById('myProposalsBtn')?.addEventListener('click', () => {
    let list = state.proposals.map(p => `• ${p.gigTitle} (${p.rate}) - Status: ${p.status}`).join('\n');
    alert(`My Active Submitted Proposals:\n\n${list}`);
  });

  // =========================================================================
  // CERTIFICATION CHECKLIST ENGINE
  // =========================================================================
  function updateCertRoadmapOnProposal() {
    const certProgressBar = document.getElementById('certProgressBar');
    const certSubtext = document.getElementById('certSubtext');
    const certRoadmapPct = document.getElementById('certRoadmapPct');
    const certRoadmapBar = document.getElementById('certRoadmapBar');
    const certRoadmapCount = document.getElementById('certRoadmapCount');

    if (certProgressBar) certProgressBar.style.width = '80%';
    if (certSubtext) certSubtext.textContent = '4 of 5 requirements met';
    if (certRoadmapPct) certRoadmapPct.textContent = '80%';
    if (certRoadmapBar) certRoadmapBar.style.width = '80%';
    if (certRoadmapCount) certRoadmapCount.textContent = '4 of 5 requirements met';

    const checklistItems = document.querySelectorAll('.cert-checklist .cert-check-item');
    if (checklistItems.length >= 5) {
      const fifth = checklistItems[4];
      fifth.className = 'cert-check-item completed';
      fifth.querySelector('.check-icon').textContent = '✓';
      fifth.querySelector('.check-icon').classList.remove('circle');
      fifth.querySelector('.check-status-badge').textContent = 'Completed';
      fifth.querySelector('.check-status-badge').className = 'check-status-badge';
    }
  }

  topCertWidget?.addEventListener('click', () => certModal.classList.add('show'));
  viewCertDetailsBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    certModal.classList.add('show');
  });
  closeCertModalBtn?.addEventListener('click', () => certModal.classList.remove('show'));
  closeCertModalFooterBtn?.addEventListener('click', () => certModal.classList.remove('show'));

  // =========================================================================
  // CLAIM LETTER OF RECOMMENDATION & WORKING HOURS CREDENTIAL ENGINE
  // =========================================================================
  const claimRecModal = document.getElementById('claimRecModal');
  const openClaimRecBtn = document.getElementById('openClaimRecBtn');
  const closeClaimRecModalBtn = document.getElementById('closeClaimRecModalBtn');
  const demoFastTrackRecBtn = document.getElementById('demoFastTrackRecBtn');
  const claimRecCopyLinkBtn = document.getElementById('claimRecCopyLinkBtn');
  const claimRecViewCertBtn = document.getElementById('claimRecViewCertBtn');
  const claimRecDownloadBtn = document.getElementById('claimRecDownloadBtn');

  let recDemoUnlocked = true; // default to unlocked for presentation readiness

  function updateRecModalUI() {
    const candidateName = state.user?.name || 'Jordan Vance';
    const cand1 = document.getElementById('recLetterCandidateName');
    const cand2 = document.getElementById('recLetterCandidateName2');
    const cand3 = document.getElementById('recLetterCandidateName3');
    if (cand1) cand1.textContent = candidateName;
    if (cand2) cand2.textContent = candidateName;
    if (cand3) cand3.textContent = candidateName.split(' ')[0] || candidateName;

    const streakVal = document.getElementById('recStreakVal');
    const streakPct = document.getElementById('recStreakPct');
    const streakFill = document.getElementById('recStreakFill');
    const hoursVal = document.getElementById('recHoursVal');
    const hoursPct = document.getElementById('recHoursPct');
    const hoursFill = document.getElementById('recHoursFill');
    const recBadge = document.getElementById('recEligibleBadge');
    const mechStreak = document.getElementById('mechStreakDisplay');
    const mechHours = document.getElementById('mechHoursDisplay');
    const toggleBtn = document.getElementById('demoFastTrackRecBtn');

    if (recDemoUnlocked) {
      if (streakVal) streakVal.textContent = '90';
      if (streakPct) streakPct.textContent = '100% (Eligible!)';
      if (streakFill) streakFill.style.width = '100%';
      if (hoursVal) hoursVal.textContent = '360';
      if (hoursPct) hoursPct.textContent = '100%';
      if (hoursFill) hoursFill.style.width = '100%';
      if (recBadge) {
        recBadge.textContent = '✓ 90 / 90 Days • Unlocked & Ready!';
        recBadge.className = 'mech-status-pill highlight-pill';
      }
      if (mechStreak) mechStreak.textContent = '90-Day Streak';
      if (mechHours) mechHours.textContent = '360 hrs';
      if (toggleBtn) toggleBtn.textContent = '⚡ Demo: Switch to 4-Day Streak';
    } else {
      if (streakVal) streakVal.textContent = '4';
      if (streakPct) streakPct.textContent = '4.4%';
      if (streakFill) streakFill.style.width = '4.4%';
      if (hoursVal) hoursVal.textContent = '16';
      if (hoursPct) hoursPct.textContent = '4.4%';
      if (hoursFill) hoursFill.style.width = '4.4%';
      if (recBadge) {
        recBadge.textContent = '4 / 90 Days (In Progress)';
        recBadge.className = 'mech-status-pill';
      }
      if (mechStreak) mechStreak.textContent = '4-Day Streak';
      if (mechHours) mechHours.textContent = '16 hrs';
      if (toggleBtn) toggleBtn.textContent = '⚡ Demo: Toggle 90-Day Streak (Unlocked)';
    }
  }

  openClaimRecBtn?.addEventListener('click', () => {
    updateRecModalUI();
    claimRecModal?.classList.add('show');
  });

  closeClaimRecModalBtn?.addEventListener('click', () => {
    claimRecModal?.classList.remove('show');
  });

  claimRecModal?.addEventListener('click', (e) => {
    if (e.target === claimRecModal) {
      claimRecModal.classList.remove('show');
    }
  });

  demoFastTrackRecBtn?.addEventListener('click', () => {
    recDemoUnlocked = !recDemoUnlocked;
    updateRecModalUI();
    if (recDemoUnlocked) {
      showToast('🎉 90-Day Streak Unlocked! Official Recommendation Letter is ready to claim.', 'success');
      awardXp(50, '3-Month Consistency Milestone Achieved!');
    } else {
      showToast('Reset to current live state (4-Day streak, 16 verified hours).');
    }
  });

  claimRecViewCertBtn?.addEventListener('click', () => {
    claimRecModal?.classList.remove('show');
    certModal?.classList.add('show');
  });

  claimRecCopyLinkBtn?.addEventListener('click', () => {
    const dummyUrl = 'https://skillbridge.org/verify/SKB-REC-2026-98421';
    navigator.clipboard?.writeText(dummyUrl).then(() => {
      showToast('📋 Public Verification Link copied to clipboard!');
    }).catch(() => {
      showToast('📋 Verification URL: ' + dummyUrl);
    });
  });

  claimRecDownloadBtn?.addEventListener('click', () => {
    showToast('📥 Preparing official signed Recommendation Letter PDF...', 'success');
    setTimeout(() => {
      window.print();
    }, 600);
  });

  // =========================================================================
  // UPGRADE TO PRO MODAL
  // =========================================================================
  upgradeProSidebarBtn?.addEventListener('click', () => upgradeProModal.classList.add('show'));
  bannerSeePlansBtn?.addEventListener('click', () => upgradeProModal.classList.add('show'));
  closeUpgradeModalBtn?.addEventListener('click', () => upgradeProModal.classList.remove('show'));

  confirmUpgradeBtn?.addEventListener('click', () => {
    state.user.plan = 'Pro';
    userPlanDisplay.textContent = 'Pro';
    userPlanDisplay.className = 'badge badge-tier pro';
    upgradeProModal.classList.remove('show');
    awardXp(100, 'Upgraded to StratumHQ Pro! All 8 enterprise sandboxes unlocked.');
    showToast('🌟 Welcome to Pro! Full enterprise simulations & client intros unlocked.', 'success');
  });

  // =========================================================================
  // FREELANCE RATE CALCULATOR MODAL (Accessible from Jobs Desk)
  // =========================================================================
  freelancerRateCalcBtn?.addEventListener('click', () => {
    rateCalcModal.classList.add('show');
  });
  closeRateCalcModalBtn?.addEventListener('click', () => {
    rateCalcModal.classList.remove('show');
  });

  const desiredIncome = document.getElementById('desiredIncome');
  const billableHours = document.getElementById('billableHours');
  const businessOverhead = document.getElementById('businessOverhead');

  function calculateRates() {
    if (!desiredIncome) return;
    const income = parseFloat(desiredIncome.value);
    const hoursPerWk = parseFloat(billableHours.value);
    const overheadPct = parseFloat(businessOverhead.value);

    document.getElementById('incomeValDisplay').textContent = `$${income.toLocaleString()} / month`;
    document.getElementById('hoursValDisplay').textContent = `${hoursPerWk} hours / week`;
    document.getElementById('overheadValDisplay').textContent = `${overheadPct}% buffer`;

    const monthlyHours = hoursPerWk * 4.2;
    const grossMonthlyNeeded = income / (1 - (overheadPct / 100));

    const hourlyRate = grossMonthlyNeeded / monthlyHours;
    const projectRate = hourlyRate * 40;
    const annualRevenue = grossMonthlyNeeded * 12;

    document.getElementById('calcHourlyRate').textContent = `$${hourlyRate.toFixed(2)} / hr`;
    document.getElementById('calcProjectRate').textContent = `$${Math.round(projectRate).toLocaleString()}`;
    document.getElementById('calcAnnualRevenue').textContent = `$${Math.round(annualRevenue).toLocaleString()}`;
  }

  desiredIncome?.addEventListener('input', calculateRates);
  billableHours?.addEventListener('input', calculateRates);
  businessOverhead?.addEventListener('input', calculateRates);

  // =========================================================================
  // LIVE DESK INVESTIGATION TICKET & TIMER
  // =========================================================================
  let timerSeconds = 14 * 60 + 28;
  const timerDigits = document.getElementById('liveDeskTimer');

  setInterval(() => {
    if (timerSeconds > 0) {
      timerSeconds--;
      const mins = Math.floor(timerSeconds / 60);
      const secs = timerSeconds % 60;
      if (timerDigits) {
        timerDigits.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }
    }
  }, 1000);

  document.getElementById('runLiveSqlBtn')?.addEventListener('click', () => {
    showToast('Live telemetry query re-executed. Apex Freight identified as primary carrier delay.');
  });

  document.getElementById('submitLiveTicketBtn')?.addEventListener('click', () => {
    const rec = document.getElementById('liveTicketRec').value.trim();
    if (!rec) {
      alert('Please enter a 1-sentence recommendation for the COO before submitting!');
      return;
    }

    awardXp(80, 'Resolved live ticket LIV-409 for Veloce Freight COO Marcus Vance!');
    showToast('🎉 COO Response: "Excellent triage. Rerouting carrier dispatches now. Great work!"', 'success');
    document.getElementById('liveTicketRec').value = '';
  });

  // =========================================================================
  // INTERN DESK DAY 3 CHALLENGE
  // =========================================================================
  document.getElementById('startInternDay3Btn')?.addEventListener('click', () => {
    const answer = prompt(
      'Intern Challenge Day 3:\nWhen designing an executive dashboard for a VP, what should appear at the very top?\n\n1: Raw transactions data table\n2: 3-4 High-level KPI summary cards with trend badges\n3: A 3D pie chart\n\nEnter 1, 2, or 3:'
    );
    if (answer === '2') {
      awardXp(80, 'Passed Intern Desk Day 3 Challenge!');
      document.getElementById('startInternDay3Btn').parentElement.innerHTML = '<span>✓ Passed with 100%</span><span class="xp-tag">+80 XP</span>';
    } else if (answer) {
      alert('Not quite! Executive stakeholders need High-Level KPI summary cards first before drilling down into detail.');
    }
  });

  // =========================================================================
  // BREAK ROOM FLOATING CHAT WIDGET
  // =========================================================================
  breakRoomToggleBtn?.addEventListener('click', () => {
    breakRoomDrawer?.classList.toggle('show');
  });

  closeBreakRoomBtn?.addEventListener('click', () => {
    breakRoomDrawer?.classList.remove('show');
  });

  openFloorChatBtn?.addEventListener('click', () => {
    breakRoomDrawer?.classList.add('show');
  });

  function sendBreakRoomMessage() {
    const text = breakRoomInput?.value?.trim();
    if (!text) return;

    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-msg';
    msgDiv.innerHTML = `
      <span class="chat-author">${escapeHtml(state.user.name)} (You)</span>
      <p class="chat-text">${escapeHtml(text)}</p>
      <span class="chat-time">Just now</span>
    `;

    breakRoomMessages?.appendChild(msgDiv);
    if (breakRoomInput) breakRoomInput.value = '';
    if (breakRoomMessages) breakRoomMessages.scrollTop = breakRoomMessages.scrollHeight;

    setTimeout(() => {
      const replyDiv = document.createElement('div');
      replyDiv.className = 'chat-msg highlight';
      replyDiv.innerHTML = `
        <span class="chat-author">Liam S. (London)</span>
        <p class="chat-text">Great insight, ${escapeHtml(state.user.name.split(' ')[0])}! The client feedback loop on SkillBridge is super helpful for closing gigs.</p>
        <span class="chat-time">Just now</span>
      `;
      breakRoomMessages?.appendChild(replyDiv);
      if (breakRoomMessages) breakRoomMessages.scrollTop = breakRoomMessages.scrollHeight;
    }, 2500);
  }

  sendBreakRoomBtn?.addEventListener('click', sendBreakRoomMessage);
  breakRoomInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendBreakRoomMessage();
  });

  document.querySelectorAll('.reaction-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('active');
      const countSpan = btn.querySelector('.react-count');
      if (countSpan) {
        let count = parseInt(countSpan.textContent, 10);
        count = btn.classList.contains('active') ? count + 1 : count - 1;
        countSpan.textContent = count;
      }
    });
  });

  function prependCommunityActivity(name, action, score, time) {
    const feed = document.getElementById('communityFeedList');
    if (!feed) return;

    const item = document.createElement('div');
    item.className = 'activity-item';
    item.innerHTML = `
      <div class="activity-avatar-circle" style="background-color: #e2ede5; color: #243d32;">${state.user.initials}</div>
      <div class="activity-content">
        <p class="activity-text">
          <strong>${escapeHtml(name)}</strong> ${action}
        </p>
        <div class="activity-meta">
          <span class="activity-score">${score}</span>
          <span class="activity-tag">Verified</span>
          <span class="activity-time">${time}</span>
          <button class="reaction-btn">👏 <span class="react-count">1</span></button>
        </div>
      </div>
    `;

    feed.prepend(item);
  }

  document.getElementById('feedbackBtn')?.addEventListener('click', () => {
    const feedback = prompt('Share your thoughts or suggest a company simulation you would like to see:');
    if (feedback) {
      awardXp(15, 'Thank you for your feedback!');
    }
  });

  document.getElementById('signOutBtn')?.addEventListener('click', () => {
    showToast('Signed out of StratumHQ session. Local profile preserved.');
  });

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // =========================================================================
  // SMOOTH SLIDING SKILLS BRIDGE BANNER CAROUSEL
  // =========================================================================
  const smoothBannerSlider = document.getElementById('smoothBannerSlider');
  const smoothSliderTrack = document.getElementById('smoothSliderTrack');
  const smoothSlideCounter = document.getElementById('smoothSlideCounter');
  const smoothPrevBtn = document.getElementById('smoothPrevBtn');
  const smoothNextBtn = document.getElementById('smoothNextBtn');
  const smoothPlayBtn = document.getElementById('smoothPlayBtn');
  const smoothPlayIcon = document.getElementById('smoothPlayIcon');
  const smoothProgressBar = document.getElementById('smoothProgressBar');
  const smoothDots = document.querySelectorAll('.smooth-dot');
  const smoothSlides = document.querySelectorAll('.smooth-slide');
  const smoothFloorChatBtn = document.getElementById('smoothFloorChatBtn');

  if (smoothBannerSlider && smoothSliderTrack && smoothSlides.length > 0) {
    let currentSlide = 0;
    const totalSlides = smoothSlides.length;
    let isAutoPlaying = true;
    let slideTimer = null;
    const autoPlayInterval = 5500; // 5.5 seconds per slide

    function updateSlider(index) {
      currentSlide = (index + totalSlides) % totalSlides;
      
      // Smooth continuous translateX transition
      smoothSliderTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
      
      // Update Slide Counter (01 / 04)
      if (smoothSlideCounter) {
        smoothSlideCounter.textContent = `0${currentSlide + 1} / 0${totalSlides}`;
      }

      // Update progress bar width
      if (smoothProgressBar) {
        const pct = ((currentSlide + 1) / totalSlides) * 100;
        smoothProgressBar.style.width = `${pct}%`;
      }

      // Update interactive dots
      smoothDots.forEach((dot, idx) => {
        if (idx === currentSlide) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });
    }

    function nextSlide() {
      updateSlider(currentSlide + 1);
    }

    function prevSlide() {
      updateSlider(currentSlide - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      slideTimer = setInterval(nextSlide, autoPlayInterval);
      isAutoPlaying = true;
      if (smoothPlayIcon) smoothPlayIcon.textContent = '⏸';
      if (smoothPlayBtn) smoothPlayBtn.setAttribute('title', 'Pause auto-sliding');
    }

    function stopAutoPlay() {
      if (slideTimer) {
        clearInterval(slideTimer);
        slideTimer = null;
      }
      isAutoPlaying = false;
      if (smoothPlayIcon) smoothPlayIcon.textContent = '▶';
      if (smoothPlayBtn) smoothPlayBtn.setAttribute('title', 'Resume auto-sliding');
    }

    // Controls
    smoothNextBtn?.addEventListener('click', () => {
      nextSlide();
      if (isAutoPlaying) startAutoPlay();
    });

    smoothPrevBtn?.addEventListener('click', () => {
      prevSlide();
      if (isAutoPlaying) startAutoPlay();
    });

    smoothPlayBtn?.addEventListener('click', () => {
      if (isAutoPlaying) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });

    smoothDots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        updateSlider(idx);
        if (isAutoPlaying) startAutoPlay();
      });
    });

    // Pause on hover, resume on leave
    smoothBannerSlider.addEventListener('mouseenter', () => {
      if (isAutoPlaying && slideTimer) {
        clearInterval(slideTimer);
      }
    });

    smoothBannerSlider.addEventListener('mouseleave', () => {
      if (isAutoPlaying) {
        clearInterval(slideTimer);
        slideTimer = setInterval(nextSlide, autoPlayInterval);
      }
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    smoothBannerSlider.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    smoothBannerSlider.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;
      if (Math.abs(swipeDistance) > 40) {
        if (swipeDistance < 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        if (isAutoPlaying) startAutoPlay();
      }
    }

    // Connect Floor Chat Button
    smoothFloorChatBtn?.addEventListener('click', () => {
      breakRoomDrawer?.classList.add('show');
    });

    // Initial state
    updateSlider(0);
    startAutoPlay();
  }

  calculateRates();
  renderDashboardTeaserGigs();
});
