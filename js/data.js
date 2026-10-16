// SkillBridge Data Store - Core Mock Data & State
const initialData = {
  user: {
    name: "Jason Ranti",
    username: "@jasonranti",
    role: "Junior Digital Specialist",
    level: "Level 2 Certified",
    avatar: "assets/images/user_avatar.jpg",
    employabilityScore: 84, // percentage
    streakDays: 7,
    balance: 295.50,
    escrow: 45.00,
    totalEarned: 820.00,
    completedTasksCount: 38,
    verifiedBadgesCount: 6,
    activeTasksCount: 3,
    weeklyActivity: [
      { day: "1-10 Aug", amount: 65, tasks: 4, heightPercent: 45 },
      { day: "11-20 Aug", amount: 110, tasks: 7, heightPercent: 75 },
      { day: "21-30 Aug", amount: 45, tasks: 3, heightPercent: 30 },
      { day: "1-10 Sep", amount: 140, tasks: 9, heightPercent: 95 },
      { day: "11-20 Sep", amount: 80, tasks: 5, heightPercent: 55 }
    ]
  },
  
  categories: [
    { id: "all", name: "All Opportunities", count: 18, icon: "sparkles" },
    { id: "ai-data", name: "AI & Data Annotation", count: 6, icon: "cpu" },
    { id: "design-ui", name: "UI/UX & Design", count: 4, icon: "palette" },
    { id: "web-dev", name: "Web Dev & QA Testing", count: 5, icon: "code" },
    { id: "content", name: "Content & Localization", count: 3, icon: "languages" }
  ],

  learningCategories: [
    {
      id: "cat-ui",
      title: "UI/UX Design",
      progressText: "5/8 completed",
      completed: 5,
      total: 8,
      iconBg: "rgba(124, 77, 255, 0.12)",
      iconColor: "#7c4dff",
      badgeText: "In Progress"
    },
    {
      id: "cat-ai",
      title: "AI Data Labelling",
      progressText: "4/6 completed",
      completed: 4,
      total: 6,
      iconBg: "rgba(236, 72, 153, 0.12)",
      iconColor: "#ec4899",
      badgeText: "High Demand"
    },
    {
      id: "cat-front",
      title: "Front-End QA",
      progressText: "7/10 completed",
      completed: 7,
      total: 10,
      iconBg: "rgba(14, 165, 233, 0.12)",
      iconColor: "#0ea5e9",
      badgeText: "Level 2 Certified"
    }
  ],

  tasks: [
    {
      id: "task-01",
      title: "E-Commerce Image Annotation: Bounding Box Tagging",
      category: "ai-data",
      categoryName: "AI & DATA",
      difficulty: "Beginner Friendly",
      duration: "20-25 mins",
      reward: 18.50,
      image: "assets/images/task_ai.jpg",
      partner: {
        name: "TechNova AI Labs",
        logo: "assets/images/user_avatar.jpg",
        verified: true,
        industry: "Autonomous Retail AI"
      },
      description: "Tag items (handbags, jackets, footwear) on 20 catalog images to improve our visual search algorithm. Fast automated validation.",
      badge: "Fast Pay",
      interactiveType: "annotation",
      instructions: [
        "Review each fashion photo carefully.",
        "Draw or click bounding tags around products.",
        "Assign correct labels: Handbag, Coat, Footwear, Sunglasses.",
        "Submit for automated instant QA review & immediate escrow payout."
      ]
    },
    {
      id: "task-02",
      title: "Mobile App Figma UI Audit & Contrast Accessibility Review",
      category: "design-ui",
      categoryName: "UI/UX DESIGN",
      difficulty: "Intermediate",
      duration: "45 mins",
      reward: 35.00,
      image: "assets/images/task_ui.jpg",
      partner: {
        name: "Apex Digital Studio",
        logo: "assets/images/user_avatar.jpg",
        verified: true,
        industry: "Product Design Agency"
      },
      description: "Inspect 6 key mobile checkout wireframes for WCAG 2.1 color contrast compliance and tap target sizing. Submit recommendations.",
      badge: "High Value",
      interactiveType: "review",
      instructions: [
        "Inspect the 3 main interaction screens provided.",
        "Flag low contrast buttons or inaccessible micro-copy.",
        "Submit 3 actionable UX improvements."
      ]
    },
    {
      id: "task-03",
      title: "Cross-Browser Responsive Bug Reproduction & Smoke Testing",
      category: "web-dev",
      categoryName: "FRONT-END QA",
      difficulty: "Beginner Friendly",
      duration: "30 mins",
      reward: 28.00,
      image: "assets/images/task_code.jpg",
      partner: {
        name: "GlobalFlow Systems",
        logo: "assets/images/user_avatar.jpg",
        verified: true,
        industry: "Enterprise SaaS"
      },
      description: "Verify checkout modal behavior across mobile Safari and desktop Chrome. Document reproduction steps and inspect layout shifts.",
      badge: "Partner Vetted",
      interactiveType: "qa-check",
      instructions: [
        "Run the interactive smoke test simulation.",
        "Check responsiveness on small viewports.",
        "Confirm form submission validation catches missing fields."
      ]
    },
    {
      id: "task-04",
      title: "Mobile Health Onboarding Localization (EN to Swahili / French)",
      category: "content",
      categoryName: "LOCALIZATION",
      difficulty: "Beginner Friendly",
      duration: "35 mins",
      reward: 24.50,
      image: "assets/images/task_ui.jpg",
      partner: {
        name: "AfriHealth Digital",
        logo: "assets/images/user_avatar.jpg",
        verified: true,
        industry: "Telehealth NGO"
      },
      description: "Translate and culturally adapt 12 onboarding cards for rural clinic patient portals. Ensure compassionate medical phrasing.",
      badge: "Social Impact",
      interactiveType: "translate",
      instructions: [
        "Translate standard English clinic prompts.",
        "Verify terminology preserves medical nuance.",
        "Submit for community validator review."
      ]
    },
    {
      id: "task-05",
      title: "AI Chatbot Response Evaluation & Safety Red-Teaming",
      category: "ai-data",
      categoryName: "AI & DATA",
      difficulty: "Intermediate",
      duration: "40 mins",
      reward: 42.00,
      image: "assets/images/task_ai.jpg",
      partner: {
        name: "HyperScale Compute",
        logo: "assets/images/user_avatar.jpg",
        verified: true,
        industry: "Generative AI Infrastructure"
      },
      description: "Rank pairs of model outputs for factual accuracy, polite tone, and safety compliance. Score hallucinations accurately.",
      badge: "High Value",
      interactiveType: "review",
      instructions: [
        "Compare Model A vs Model B answers.",
        "Select which model gave a more helpful and factual response.",
        "Identify any hallucinated facts."
      ]
    },
    {
      id: "task-06",
      title: "Landing Page Micro-Interaction & CSS Animation Polish",
      category: "web-dev",
      categoryName: "FRONT-END DEV",
      difficulty: "Advanced",
      duration: "1.5 hours",
      reward: 60.00,
      image: "assets/images/task_code.jpg",
      partner: {
        name: "Lumina Labs",
        logo: "assets/images/user_avatar.jpg",
        verified: true,
        industry: "Fintech Platform"
      },
      description: "Inspect interactive CSS button hover states, card elevation shadows, and SVG micro-interactions. Fix layout glitches.",
      badge: "Top Tier",
      interactiveType: "qa-check",
      instructions: [
        "Review interactive hover feedback.",
        "Validate CSS transition timings (under 300ms).",
        "Submit pull-request recommendation."
      ]
    }
  ],

  activeLessons: [
    {
      id: "lesson-01",
      mentor: "Padhang Satrio",
      partner: "Apex Digital",
      type: "UI/UX DESIGN",
      badgeColor: "rgba(124, 77, 255, 0.12)",
      textColor: "#7c4dff",
      desc: "Heuristic Evaluation of Mobile Checkout Flows",
      progress: "85%",
      status: "In Progress",
      action: "Resume"
    },
    {
      id: "lesson-02",
      mentor: "Sarah Lin",
      partner: "TechNova AI",
      type: "AI & DATA",
      badgeColor: "rgba(236, 72, 153, 0.12)",
      textColor: "#ec4899",
      desc: "Computer Vision Bounding Box Quality Standards",
      progress: "100%",
      status: "Completed",
      action: "View Badge"
    },
    {
      id: "lesson-03",
      mentor: "Zakir Horizontal",
      partner: "GlobalFlow Systems",
      type: "FRONT-END QA",
      badgeColor: "rgba(14, 165, 233, 0.12)",
      textColor: "#0ea5e9",
      desc: "Writing Actionable Bug Reports for Dev Teams",
      progress: "40%",
      status: "In Progress",
      action: "Resume"
    }
  ],

  mentors: [
    {
      id: "m-1",
      name: "Padhang Satrio",
      title: "Staff Product Designer @ Apex",
      avatar: "assets/images/user_avatar.jpg",
      tasksHired: "42 Youth Hired",
      isFollowing: false
    },
    {
      id: "m-2",
      name: "Zakir Horizontal",
      title: "QA Engineering Lead @ GlobalFlow",
      avatar: "assets/images/user_avatar.jpg",
      tasksHired: "85 Youth Hired",
      isFollowing: true
    },
    {
      id: "m-3",
      name: "Leonardo Samsul",
      title: "AI Training Director @ TechNova",
      avatar: "assets/images/user_avatar.jpg",
      tasksHired: "120 Youth Hired",
      isFollowing: false
    }
  ],

  networkFriends: [
    { name: "Bagas Mahpie", role: "AI Annotator", status: "online" },
    { name: "Sir Dandy", role: "UI Designer", status: "busy" },
    { name: "Jhon Tosan", role: "QA Tester", status: "online" }
  ],

  portfolioCertificates: [
    {
      id: "CERT-SB-8924",
      title: "Verified AI Data Labeler & Quality Specialist",
      issuer: "TechNova AI & SkillBridge Registry",
      date: "October 2026",
      hash: "0x7f4e912bc8...3a9f",
      tasksCount: 24,
      score: "99.2% Accuracy",
      skills: ["Image Annotation", "Bounding Boxes", "Lidar Tagging", "Metadata QA"]
    },
    {
      id: "CERT-SB-3310",
      title: "Junior Web Usability & QA Auditor",
      issuer: "GlobalFlow Systems",
      date: "September 2026",
      hash: "0x3b1c880df9...6e12",
      tasksCount: 14,
      score: "98.5% Client Rating",
      skills: ["Cross-Browser QA", "Bug Documentation", "WCAG Contrast", "Responsive Testing"]
    }
  ],

  partnerWorkspaces: [
    {
      id: "p-01",
      company: "TechNova AI Labs",
      activeGigPool: "$1,450.00 Escrow Deposited",
      openTasks: 18,
      youthEmployed: 42,
      industry: "Machine Learning / Computer Vision"
    },
    {
      id: "p-02",
      company: "Apex Digital Studio",
      activeGigPool: "$2,800.00 Escrow Deposited",
      openTasks: 8,
      youthEmployed: 19,
      industry: "Design & UX Strategy"
    }
  ]
};
