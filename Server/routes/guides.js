const express = require('express');
const router = express.Router();
const guides = [
  { id: 'data-analytics', title: 'Data Analytics', steps: ['Learn spreadsheet fundamentals', 'Practise SQL queries', 'Analyse a real dataset with Python', 'Build a dashboard', 'Explain findings and recommendations'] },
  { id: 'web-development', title: 'Web Development', steps: ['Learn HTML and CSS', 'Build interactive interfaces with JavaScript', 'Create REST APIs with Node.js and Express', 'Persist data in MongoDB', 'Deploy and document a full-stack project'] },
  { id: 'ui-ux', title: 'UI/UX Design', steps: ['Research user needs', 'Define user flows', 'Wireframe key screens', 'Prototype and test', 'Present design decisions'] }
];
router.get('/', (_req, res) => res.json({ count: guides.length, guides }));
module.exports = router;
