
const Gig = require('../models/Gig');
const Application = require('../models/Application');
const Submission = require('../models/Submission');

// Maps simulation skill tracks to related gig skill labels.
// These are explicit matching rules, not AI-generated assessments.
const SKILL_TRACK_MAP = {
  'data analytics': [
    'data analytics',
    'excel',
    'data cleaning',
    'data analysis',
    'reporting',
    'python',
    'data visualization',
    'dashboard'
  ],
  sql: [
    'sql',
    'database querying',
    'database',
    'data analysis',
    'reporting'
  ],
  'web development': [
    'web development',
    'html',
    'css',
    'javascript',
    'responsive design',
    'node.js',
    'express',
    'mongodb',
    'rest api'
  ],
  'ui/ux design': [
    'ui/ux design',
    'ui ux',
    'ui design',
    'ux design',
    'user research',
    'wireframing',
    'prototyping',
    'user testing',
    'figma'
  ],
  'business analysis': [
    'business analysis',
    'requirements analysis',
    'process mapping',
    'reporting',
    'stakeholder communication',
    'data analysis'
  ]
};

// Normalizes labels so capitalization and surrounding whitespace
// do not prevent a skill from matching.
function normalizeSkill(skill) {
  return String(skill || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

// Builds a set of skills associated with completed simulation tracks.
function buildSkillEvidence(submissions) {
  const skills = new Set();
  const tracks = new Set();

  for (const submission of submissions) {
    const simulation = submission.simulationId;

    // A deleted or unavailable simulation cannot provide track evidence.
    if (!simulation || !simulation.skillTrack) continue;

    const track = normalizeSkill(simulation.skillTrack);
    tracks.add(simulation.skillTrack.trim());

    // The track itself remains evidence, even if it has no mapping.
    skills.add(track);

    const relatedSkills = SKILL_TRACK_MAP[track] || [];

    for (const skill of relatedSkills) {
      skills.add(normalizeSkill(skill));
    }
  }

  return {
    skills,
    tracks: [...tracks].sort()
  };
}

// Scores one gig using the number of required skills that match.
// Returns null when the gig has no usable required-skill information.
function scoreGig(gig, skillEvidence) {
  const requiredSkills = [
    ...new Set(
      (gig.skills || [])
        .map(normalizeSkill)
        .filter(Boolean)
    )
  ];

  if (requiredSkills.length === 0) {
    return {
      matchPercentage: null,
      matchedSkills: [],
      missingSkills: [],
      matchStatus: 'insufficient_skill_data'
    };
  }

  const matchedSkills = requiredSkills.filter(skill =>
    skillEvidence.skills.has(skill)
  );

  const missingSkills = requiredSkills.filter(skill =>
    !skillEvidence.skills.has(skill)
  );

  return {
    matchPercentage: Math.round(
      (matchedSkills.length / requiredSkills.length) * 100
    ),
    matchedSkills,
    missingSkills,
    matchStatus: 'scored'
  };
}

// Returns open gigs relevant to a specific freelancer.
async function getMatches(userId, logger) {
  logger?.info(
    { userId: String(userId) },
    'Generating SkillBridge Match recommendations'
  );

  // Load completed simulations and their skill-track metadata.
  const submissions = await Submission.find({ userId })
    .select('simulationId completedAt')
    .populate('simulationId', 'title skillTrack')
    .lean();

  const skillEvidence = buildSkillEvidence(submissions);

  // Identify gigs the freelancer has already applied to.
  const existingApplications = await Application.find({ userId })
    .distinct('gigId');

  const appliedGigIds = new Set(
    existingApplications.map(id => String(id))
  );

  // Only open gigs that have not already received this freelancer's
  // application are eligible for recommendation.
  const gigs = await Gig.find({ status: 'open' })
    .populate('postedBy', 'name')
    .sort({ createdAt: -1 })
    .lean();

  const matches = gigs
    .filter(gig => !appliedGigIds.has(String(gig._id)))
    .map(gig => {
      const score = scoreGig(gig, skillEvidence);

      return {
        gig: {
          _id: gig._id,
          title: gig.title,
          description: gig.description,
          budget: gig.budget,
          skills: gig.skills || [],
          status: gig.status,
          postedBy: gig.postedBy,
          createdAt: gig.createdAt
        },
        ...score
      };
    })
    // Scored gigs first, highest percentage first.
    // Unscored gigs remain visible but cannot claim a match percentage.
    .sort((a, b) => {
      const scoreA = a.matchPercentage;
      const scoreB = b.matchPercentage;

      if (scoreA === null && scoreB !== null) return 1;
      if (scoreA !== null && scoreB === null) return -1;

      if (scoreA !== scoreB) {
        return (scoreB ?? 0) - (scoreA ?? 0);
      }

      return new Date(b.gig.createdAt || 0) -
        new Date(a.gig.createdAt || 0);
    });

  logger?.info(
    {
      userId: String(userId),
      completedSimulations: submissions.length,
      evidenceTracks: skillEvidence.tracks.length,
      recommendedGigs: matches.length
    },
    'SkillBridge Match recommendations generated'
  );

  return {
    summary: {
      completedSimulations: submissions.length,
      evidenceTracks: skillEvidence.tracks,
      eligibleGigs: matches.length
    },
    matches
  };
}

module.exports = {
  getMatches
};
