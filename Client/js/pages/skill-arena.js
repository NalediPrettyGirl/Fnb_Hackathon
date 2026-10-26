import { initShell } from '../components/shell.js';
import { simulationService } from '../services/simulations.js';
import { simulationCardMarkup, trackIcon } from '../components/cards.js';
import { openModal, closeModal } from '../core/modal.js';
import { notify } from '../core/toast.js';
import { ROLES } from '../core/config.js';
import { escapeHtml, emptyState, setBusy, readQuery, $, $$ } from '../core/dom.js';

const user = initShell({ active: 'skill-arena' });
const canSubmit = user?.role === ROLES.FREELANCER;

let simulations = [];
let completedIds = new Set();
let activeSimulation = null;

const userCareer = (typeof localStorage !== 'undefined' ? localStorage.getItem('skillbridge_career_path') : null) || user?.headline || 'Data Analyst';

const CAREER_FILTERS = {
  'Data Analyst': ['All Tech', 'SQL', 'Power BI', 'Excel', 'Python'],
  'UI/UX Designer': ['All Design', 'Figma', 'Wireframing', 'User Research', 'Prototyping'],
  'Content Writer / Journalist': ['All Writing', 'SEO', 'Copywriting', 'Editorial', 'Research'],
  'Software Engineer': ['All Code', 'JavaScript', 'React', 'Node.js', 'SQL']
};

let activeTrack = readQuery('track') || (CAREER_FILTERS[userCareer] ? CAREER_FILTERS[userCareer][0] : 'All Tech');

/* ─── Per-simulation rich extras ─────────────────────────────────────────── */
const SQL_TRACK = 'SQL';

const SIM_EXTRAS = {
  'Omnichannel Retail Demand & Inventory Forecast': {
    episode: 'Episode 1: Omnichannel Cross-Dock Discrepancy & Cannibalization',
    deliverables: [
      'Write SQL to detect <strong>cross-channel cannibalization</strong> between retail and DTC e-commerce.',
      'Evaluate <strong>basket size discrepancies</strong> across online vs store POS transactions.',
      'Calculate reorder triggers for <strong>high-velocity SKUs</strong>.'
    ],
    schema: [
      { name: 'retail_pos_sales', cols: 'pos_txn_id (INT), store_id (INT), sku_id (INT), qty (INT), gross_revenue (DECIMAL), txn_time (TIMESTAMP)' },
      { name: 'ecommerce_orders', cols: 'order_id (INT), customer_id (INT), sku_id (INT), qty (INT), channel (VARCHAR), order_date (DATE)' },
      { name: 'inventory_nodes', cols: 'node_id (INT), sku_id (INT), units_on_hand (INT), lead_time_days (INT)' }
    ],
    sampleCode: `-- Omnichannel Demand Discrepancy:\nSELECT\n    p.sku_id,\n    SUM(p.qty) AS retail_units,\n    SUM(e.qty) AS ecom_units,\n    ROUND(AVG(p.gross_revenue), 2) AS avg_retail_basket,\n    ROUND(AVG(e.qty * 149.99), 2) AS avg_ecom_basket\nFROM retail_pos_sales p\nFULL OUTER JOIN ecommerce_orders e ON p.sku_id = e.sku_id\nGROUP BY p.sku_id\nORDER BY (retail_units + ecom_units) DESC\nLIMIT 10;`,
    queryResult: {
      cols: ['sku_id', 'retail_units', 'ecom_units', 'avg_retail_basket', 'avg_ecom_basket'],
      rows: [
        ['SKU-10492', '14,290', '28,450', 'R 420.50', 'R 680.00'],
        ['SKU-90214', '8,120', '19,300', 'R 215.00', 'R 340.20'],
        ['SKU-33819', '12,040', '11,200', 'R 890.00', 'R 920.50'],
        ['SKU-77210', '5,400', '16,800', 'R 180.00', 'R 260.00']
      ]
    },
    qualifiesFor: 'Senior CPFR Analyst ($3,200 Gig)'
  },
  'Last-Mile Delivery SLA & Telematics Discrepancy Audit': {
    episode: 'Episode 1: Carrier Transit Telematics & Route Failure Audit',
    deliverables: [
      'Write SQL to identify <strong>carrier routes exceeding SLA transit thresholds</strong> by >15%.',
      'Quantify <strong>penalty charges</strong> owed by third-party dispatchers.',
      'Aggregate route delay counts by <strong>distribution hub</strong> and vehicle class.'
    ],
    schema: [
      { name: 'dispatch_logs', cols: 'dispatch_id (INT), carrier_id (VARCHAR), hub_id (INT), promised_mins (INT), actual_mins (INT), status (VARCHAR)' },
      { name: 'carrier_contracts', cols: 'carrier_id (VARCHAR), penalty_rate_per_delayed_min (DECIMAL), max_sla_mins (INT)' }
    ],
    sampleCode: `-- Route Failure & SLA Penalty Analysis:\nSELECT\n    d.carrier_id,\n    COUNT(d.dispatch_id) AS total_deliveries,\n    SUM(CASE WHEN d.actual_mins > d.promised_mins THEN 1 ELSE 0 END) AS delayed_deliveries,\n    ROUND(100.0 * SUM(CASE WHEN d.actual_mins > d.promised_mins THEN 1 ELSE 0 END) / COUNT(*), 1) AS delay_pct,\n    SUM(GREATEST(0, d.actual_mins - d.promised_mins) * c.penalty_rate_per_delayed_min) AS total_penalty_owed\nFROM dispatch_logs d\nJOIN carrier_contracts c ON d.carrier_id = c.carrier_id\nGROUP BY d.carrier_id\nHAVING delay_pct > 15\nORDER BY total_penalty_owed DESC;`,
    queryResult: {
      cols: ['carrier_id', 'total_deliveries', 'delayed_deliveries', 'delay_pct', 'total_penalty_owed'],
      rows: [
        ['MAERSK-EXP-01', '3,420', '718', '21.0%', 'R 48,250'],
        ['FASTHAUL-SA', '1,890', '412', '21.8%', 'R 31,400'],
        ['VELOX-LOGIX', '5,100', '912', '17.9%', 'R 62,100']
      ]
    },
    qualifiesFor: 'Operational Logistics Lead ($2,800 Gig)'
  },
  'Multi-State Hospital Revenue Cycle & Claims Denial Audit': {
    episode: 'Episode 1: Claims Denial Root-Cause & Billing Scrubber Optimization',
    deliverables: [
      'Inspect EHR logs to isolate <strong>recurring claim denial codes</strong> (CO-16, CO-22, PR-204).',
      'Quantify <strong>at-risk revenue write-offs</strong> by insurer category.',
      'Propose automated pre-bill <strong>claim scrubber rules</strong>.'
    ],
    schema: [
      { name: 'claims', cols: 'claim_id (INT), patient_id (INT), insurer_id (VARCHAR), billed_amount (DECIMAL), denied_amount (DECIMAL), denial_code (VARCHAR), claim_date (DATE)' },
      { name: 'denial_codes', cols: 'code (VARCHAR), category (VARCHAR), appealable (BOOLEAN)' }
    ],
    sampleCode: `-- Hospital Claims Denial Pareto:\nSELECT\n    c.denial_code,\n    d.category,\n    COUNT(c.claim_id) AS total_denials,\n    SUM(c.denied_amount) AS total_denied_revenue,\n    ROUND(100.0 * SUM(c.denied_amount) / SUM(SUM(c.denied_amount)) OVER(), 1) AS pct_of_total_loss\nFROM claims c\nLEFT JOIN denial_codes d ON c.denial_code = d.code\nWHERE c.denied_amount > 0\nGROUP BY c.denial_code, d.category\nORDER BY total_denied_revenue DESC;`,
    queryResult: {
      cols: ['denial_code', 'category', 'total_denials', 'total_denied_revenue', 'pct_of_total_loss'],
      rows: [
        ['CO-16', 'Missing Documentation', '1,420', 'R 284,500', '34.2%'],
        ['CO-22', 'Coordination of Benefits', '890', 'R 192,000', '23.1%'],
        ['PR-204', 'Pre-authorization Missing', '640', 'R 165,400', '19.9%']
      ]
    },
    qualifiesFor: 'Sr. Healthcare Data Analyst ($3,500 Gig)'
  },
  'Real-Time Fraud Ring Detection & Card Transaction Velocity': {
    episode: 'Episode 1: High-Velocity Synthetic Identity & Velocity Window Rules',
    deliverables: [
      'Write SQL window functions to detect <strong>>3 transactions within 30 seconds</strong>.',
      'Calculate cardholder <strong>velocity risk scores</strong> across cross-merchant terminals.',
      'Flag coordinated cash-out rings targeting prepaid BIN ranges.'
    ],
    schema: [
      { name: 'transactions', cols: 'txn_id (VARCHAR), card_hash (VARCHAR), terminal_id (VARCHAR), bin_prefix (INT), amount (DECIMAL), txn_time (TIMESTAMP)' },
      { name: 'terminals', cols: 'terminal_id (VARCHAR), merchant_mcc (INT), country (VARCHAR)' }
    ],
    sampleCode: `-- Sliding Window Velocity Detection:\nWITH ranked_txns AS (\n  SELECT\n    card_hash,\n    txn_id,\n    amount,\n    txn_time,\n    COUNT(*) OVER(PARTITION BY card_hash ORDER BY txn_time RANGE BETWEEN INTERVAL 30 SECOND PRECEDING AND CURRENT ROW) AS velocity_30s\n  FROM transactions\n)\nSELECT *\nFROM ranked_txns\nWHERE velocity_30s >= 3\nORDER BY txn_time DESC;`,
    queryResult: {
      cols: ['card_hash', 'txn_id', 'amount', 'velocity_30s'],
      rows: [
        ['card_hash_9481a', 'TXN-948102', 'R 4,999.00', '5'],
        ['card_hash_9481a', 'TXN-948101', 'R 4,999.00', '4'],
        ['card_hash_2210c', 'TXN-882194', 'R 2,500.00', '3']
      ]
    },
    qualifiesFor: 'Anti-Fraud Systems Architect ($4,000 Gig)'
  },
  'Matchday Stadium Merchandising & Concession Revenue Modeling': {
    episode: 'Episode 1: Halftime Concession Velocity & Inventory Depletion Model',
    deliverables: [
      'Analyze 15-minute <strong>halftime POS concession spikes</strong>.',
      'Model <strong>inventory depletion rates</strong> for top beverage and apparel lines.',
      'Optimize staff dynamic allocation across high-traffic turnstile concourses.'
    ],
    schema: [
      { name: 'concession_sales', cols: 'sale_id (INT), concourse_gate (VARCHAR), item_category (VARCHAR), qty (INT), price (DECIMAL), timestamp (TIMESTAMP)' }
    ],
    sampleCode: `-- Halftime Revenue Velocity Spike Analysis:\nSELECT\n    concourse_gate,\n    item_category,\n    COUNT(sale_id) AS transactions,\n    SUM(qty * price) AS total_revenue\nFROM concession_sales\nGROUP BY concourse_gate, item_category\nORDER BY total_revenue DESC;`,
    queryResult: {
      cols: ['concourse_gate', 'item_category', 'transactions', 'total_revenue'],
      rows: [
        ['Gate 4 North', 'Beverages & Beer', '2,490', 'R 124,500'],
        ['Gate 2 South', 'Fan Merch & Kits', '890', 'R 248,000'],
        ['Gate 1 Main', 'Quick Snacks', '3,100', 'R 93,000']
      ]
    },
    qualifiesFor: 'Matchday Operations Analyst ($2,600 Gig)'
  },
  'Cold-Chain IoT Sensor Temperature Excursion & Batch Loss Analysis': {
    episode: 'Episode 1: IoT Telemetry Excursion & FDA CFR Part 11 Audit Trail',
    deliverables: [
      'Query IoT temperature sensor time-series for <strong>readings outside -70°C ± 5°C</strong>.',
      'Assess <strong>batch viability loss</strong> and cumulative thermal exposure.',
      'Generate regulatory compliance reports conforming to FDA 21 CFR Part 11.'
    ],
    schema: [
      { name: 'sensor_telemetry', cols: 'sensor_id (VARCHAR), batch_id (VARCHAR), temp_celsius (FLOAT), recorded_at (TIMESTAMP)' },
      { name: 'vaccine_batches', cols: 'batch_id (VARCHAR), lot_number (VARCHAR), mfg_date (DATE), expiry_date (DATE)' }
    ],
    sampleCode: `-- IoT Cold-Chain Temperature Excursion Audit:\nSELECT\n    batch_id,\n    COUNT(*) AS excursion_readings,\n    ROUND(MIN(temp_celsius), 2) AS min_temp,\n    ROUND(MAX(temp_celsius), 2) AS max_temp,\n    TIMESTAMPDIFF(MINUTE, MIN(recorded_at), MAX(recorded_at)) AS duration_mins\nFROM sensor_telemetry\nWHERE temp_celsius > -65.0 OR temp_celsius < -75.0\nGROUP BY batch_id\nORDER BY duration_mins DESC;`,
    queryResult: {
      cols: ['batch_id', 'excursion_readings', 'min_temp', 'max_temp', 'duration_mins'],
      rows: [
        ['BATCH-LOT-4821', '42', '-64.1°C', '-58.4°C', '126 mins'],
        ['BATCH-LOT-9014', '8', '-64.8°C', '-63.2°C', '24 mins']
      ]
    },
    qualifiesFor: 'Clinical Supply Chain Specialist ($3,800 Gig)'
  },
  'Write a SQL Business Query': {
    episode: 'Episode 1: Revenue by Category & Year-over-Year Comparison',
    deliverables: [
      'Write a SQL query grouping revenue by product <strong>category</strong> and month.',
      'Include a <strong>year-over-year comparison</strong> column.',
      'Filter out <strong>cancelled</strong> and <strong>refunded</strong> orders.'
    ],
    schema: [
      { name: 'orders', cols: 'order_id (INT), customer_id (INT), order_date (DATE), total_amount (DECIMAL), status (VARCHAR)' },
      { name: 'order_items', cols: 'item_id (INT), order_id (INT), product_id (INT), category (VARCHAR), quantity (INT), unit_price (DECIMAL)' }
    ],
    sampleCode: `-- Revenue by Category Query:\nSELECT\n    oi.category,\n    DATE_FORMAT(o.order_date, '%Y-%m') AS month,\n    SUM(oi.quantity * oi.unit_price) AS total_revenue,\n    COUNT(DISTINCT o.order_id) AS total_orders\nFROM orders o\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.status NOT IN ('cancelled', 'refunded')\nGROUP BY oi.category, month\nORDER BY month DESC, total_revenue DESC;`,
    queryResult: {
      cols: ['category', 'month', 'total_revenue', 'total_orders'],
      rows: [
        ['Electronics', '2024-03', 'R 284,920', '312'],
        ['Apparel', '2024-03', 'R 142,500', '208'],
        ['Home & Garden', '2024-03', 'R 98,300', '155'],
        ['Electronics', '2023-03', 'R 241,100', '278'],
        ['Apparel', '2023-03', 'R 119,800', '183'],
      ]
    },
    qualifiesFor: 'Senior Data Analyst ($2,200 Gig)'
  },
  'Find Duplicate and Orphaned Records': {
    episode: 'Episode 1: Database Integrity Audit',
    deliverables: [
      'Write SQL to find <strong>duplicate customer emails</strong>.',
      'Identify orders referencing <strong>deleted products</strong>.',
      'List invoices with <strong>no payment after 30 days</strong>.'
    ],
    schema: [
      { name: 'customers', cols: 'customer_id (INT), name (VARCHAR), email (VARCHAR), cohort_month (DATE)' },
      { name: 'orders', cols: 'order_id (INT), customer_id (INT), product_id (INT), order_date (DATE), status (VARCHAR)' },
      { name: 'products', cols: 'product_id (INT), name (VARCHAR), active (BOOLEAN)' },
      { name: 'invoices', cols: 'invoice_id (INT), order_id (INT), due_date (DATE), paid_at (DATETIME)' }
    ],
    sampleCode: `-- 1. Duplicate emails:\nSELECT email, COUNT(*) AS accounts\nFROM customers\nGROUP BY email\nHAVING COUNT(*) > 1;\n\n-- 2. Orphaned product references:\nSELECT o.order_id, o.product_id\nFROM orders o\nLEFT JOIN products p ON o.product_id = p.product_id\nWHERE p.product_id IS NULL;\n\n-- 3. Unpaid invoices after 30 days:\nSELECT invoice_id, due_date\nFROM invoices\nWHERE paid_at IS NULL\n  AND due_date < CURDATE() - INTERVAL 30 DAY;`,
    queryResult: {
      cols: ['email', 'accounts'],
      rows: [
        ['john.smith@gmail.com', '2'],
        ['mary.jones@outlook.com', '3'],
        ['test@company.co.za', '2'],
      ]
    },
    qualifiesFor: 'SQL Report for Finance Team ($1,500 Gig)'
  },
  'Optimise a Slow-Running Report Query': {
    episode: 'Episode 1: Query Performance Optimisation',
    deliverables: [
      'Read the <strong>EXPLAIN plan</strong> and identify full table scans.',
      'Recommend <strong>indexes</strong> and explain your reasoning.',
      'Rewrite at least one subquery as a <strong>CTE or window function</strong>.'
    ],
    schema: [
      { name: 'sales', cols: 'sale_id (INT), rep_id (INT), product_id (INT), sale_date (DATE), amount (DECIMAL), region (VARCHAR)' },
      { name: 'reps', cols: 'rep_id (INT), name (VARCHAR), region (VARCHAR), target_monthly (DECIMAL)' },
      { name: 'products', cols: 'product_id (INT), name (VARCHAR), category (VARCHAR), cost (DECIMAL)' }
    ],
    sampleCode: `-- Optimised version using CTE:\nWITH monthly_sales AS (\n  SELECT\n    rep_id,\n    DATE_FORMAT(sale_date, '%Y-%m') AS month,\n    SUM(amount) AS total_amount\n  FROM sales\n  WHERE sale_date >= '2024-01-01'\n  GROUP BY rep_id, month\n)\nSELECT\n  r.name,\n  ms.month,\n  ms.total_amount,\n  r.target_monthly,\n  ms.total_amount - r.target_monthly AS variance\nFROM monthly_sales ms\nJOIN reps r ON ms.rep_id = r.rep_id\nORDER BY ms.month DESC, variance ASC;\n\n-- Recommended index:\n-- CREATE INDEX idx_sales_date_rep ON sales(sale_date, rep_id);`,
    queryResult: {
      cols: ['name', 'month', 'total_amount', 'target_monthly', 'variance'],
      rows: [
        ['Thabo Nkosi', '2024-03', 'R 48,200', 'R 45,000', '+R 3,200'],
        ['Priya Pillay', '2024-03', 'R 31,400', 'R 45,000', '-R 13,600'],
        ['James van der Berg', '2024-03', 'R 52,100', 'R 45,000', '+R 7,100'],
      ]
    },
    qualifiesFor: 'SQL Report for Finance Team ($1,500 Gig)'
  },
  'Build a Cohort Retention Analysis': {
    episode: 'Episode 1: 6-Month User Retention Matrix',
    deliverables: [
      'Build a <strong>cohort-by-month retention matrix</strong> in SQL.',
      'Show retention as a <strong>percentage</strong> of original cohort size.',
      'Use <strong>window functions</strong> or date arithmetic — explain your approach.'
    ],
    schema: [
      { name: 'users', cols: 'user_id (INT), email (VARCHAR), signup_date (DATE), country (VARCHAR)' },
      { name: 'events', cols: 'event_id (INT), user_id (INT), event_type (VARCHAR), event_date (DATE)' }
    ],
    sampleCode: `-- Cohort retention matrix:\nWITH cohorts AS (\n  SELECT\n    user_id,\n    DATE_FORMAT(signup_date, '%Y-%m') AS cohort_month\n  FROM users\n),\nactivity AS (\n  SELECT\n    c.user_id,\n    c.cohort_month,\n    TIMESTAMPDIFF(MONTH, STR_TO_DATE(CONCAT(c.cohort_month,'-01'), '%Y-%m-%d'), e.event_date) AS months_since_signup\n  FROM cohorts c\n  JOIN events e ON c.user_id = e.user_id\n  WHERE months_since_signup BETWEEN 0 AND 6\n  GROUP BY c.user_id, c.cohort_month, months_since_signup\n)\nSELECT\n  cohort_month,\n  COUNT(DISTINCT CASE WHEN months_since_signup = 0 THEN user_id END) AS m0,\n  ROUND(100 * COUNT(DISTINCT CASE WHEN months_since_signup = 1 THEN user_id END) /\n        COUNT(DISTINCT CASE WHEN months_since_signup = 0 THEN user_id END)) AS m1_pct,\n  ROUND(100 * COUNT(DISTINCT CASE WHEN months_since_signup = 3 THEN user_id END) /\n        COUNT(DISTINCT CASE WHEN months_since_signup = 0 THEN user_id END)) AS m3_pct\nFROM activity\nGROUP BY cohort_month\nORDER BY cohort_month;`,
    queryResult: {
      cols: ['cohort_month', 'users', 'm1 ret %', 'm3 ret %', 'm6 ret %'],
      rows: [
        ['2023-10', '842', '68%', '41%', '28%'],
        ['2023-11', '1024', '71%', '44%', '31%'],
        ['2023-12', '674', '64%', '38%', '24%'],
        ['2024-01', '1189', '73%', '47%', '—'],
      ]
    },
    qualifiesFor: 'E-Commerce Analytics Dashboard ($3,000 Gig)'
  }
};

const DEFAULT_EXTRAS = {
  deliverables: [
    'Write a clear, <strong>practical response</strong> to the brief.',
    'State your <strong>assumptions</strong> and explain your reasoning.',
    'Structure your answer with <strong>headers or numbered points</strong>.'
  ],
  qualifiesFor: 'Freelance gigs matching this track'
};

/* ─── Rendering ─────────────────────────────────────────────────────────── */

function renderFilters() {
  const currentCareer = (typeof localStorage !== 'undefined' ? localStorage.getItem('skillbridge_career_path') : null) || user?.headline || 'Data Analyst';
  const filterList = CAREER_FILTERS[currentCareer] || CAREER_FILTERS['Data Analyst'];

  $('#trackFilters').innerHTML = filterList.map(t => {
    const isAct = (t.startsWith('All ') && (activeTrack === 'all' || activeTrack === t || activeTrack.startsWith('All '))) || activeTrack.toLowerCase() === t.toLowerCase();
    return `<button class="pill-btn ${isAct ? 'active' : ''}" type="button" data-track="${escapeHtml(t)}">${escapeHtml(t)}</button>`;
  }).join('');
}

function renderGrid() {
  const currentCareer = (typeof localStorage !== 'undefined' ? localStorage.getItem('skillbridge_career_path') : null) || user?.headline || 'Data Analyst';
  const filter = (activeTrack || 'All Tech').toLowerCase();

  const visible = simulations.filter(s => {
    if (filter === 'all' || filter.startsWith('all ')) {
      // By default, match user's career path!
      if (currentCareer === 'Data Analyst') {
        const isDataOrSql = s.skillTrack === 'SQL' || s.skillTrack === 'Data Analytics';
        const hasDataTag = (s.tags || []).some(t => ['SQL', 'Power BI', 'Excel', 'Python'].includes(t));
        return isDataOrSql || hasDataTag;
      }
      if (currentCareer === 'UI/UX Designer') {
        return s.skillTrack === 'UI/UX Design' || (s.tags || []).some(t => ['Figma', 'Wireframing', 'User Research'].includes(t));
      }
      if (currentCareer === 'Content Writer / Journalist') {
        return s.skillTrack === 'Content Writing' || s.skillTrack === 'Business Analysis' || (s.tags || []).some(t => ['SEO', 'Copywriting', 'Editorial', 'Research'].includes(t));
      }
      if (currentCareer === 'Software Engineer') {
        return s.skillTrack === 'Web Development' || (s.tags || []).some(t => ['JavaScript', 'React', 'Node.js', 'SQL'].includes(t));
      }
      return true;
    }
    const tags = (s.tags || [s.skillTrack]).map(t => String(t).toLowerCase());
    return tags.includes(filter) || String(s.skillTrack).toLowerCase() === filter;
  });

  $('#simulationsGrid').innerHTML = visible.length
    ? visible.map(s => simulationCardMarkup(s, { completed: completedIds.has(s._id), canSubmit })).join('')
    : emptyState('No simulations found for this filter yet.');
}

async function load() {
  try {
    simulations = await simulationService.list();
    if (canSubmit) {
      const portfolio = await simulationService.portfolio();
      completedIds = new Set(portfolio.map(p => String(p.simulationId?._id || p.simulationId)));
    }
    renderFilters();
    renderGrid();
  } catch (err) {
    $('#simulationsGrid').innerHTML = emptyState(err.message);
  }
}

/* ─── Sandbox Modal ─────────────────────────────────────────────────────── */

function isSQLTrack(sim) {
  return String(sim.skillTrack).toLowerCase() === 'sql';
}

function openSimulation(sim) {
  activeSimulation = sim;
  const extras = SIM_EXTRAS[sim.title] || {};
  const isSql = isSQLTrack(sim);

  // Header
  $('#simModalLogo').textContent = trackIcon(sim.skillTrack);
  $('#simModalTitle').textContent = `${sim.company || sim.skillTrack} — ${sim.title}`;
  $('#simModalSubtitle').textContent = extras.episode || `${sim.skillTrack} · ${sim.xpReward} XP · ${sim.difficulty || 'Beginner'}`;

  // Brief
  $('#simBriefText').textContent = sim.brief;

  // Deliverables
  const delivs = extras.deliverables || DEFAULT_EXTRAS.deliverables;
  $('#simDeliverables').innerHTML = delivs.map(d => `<li>${d}</li>`).join('');

  // Schema (SQL only)
  const schemaBox = $('#simSchemaBox');
  if (isSql && extras.schema?.length) {
    schemaBox.style.display = '';
    $('#simSchema').innerHTML = extras.schema.map(t => `
      <div class="schema-table">
        <strong>${escapeHtml(t.name)}</strong>
        <span class="schema-cols">${escapeHtml(t.cols)}</span>
      </div>`).join('');
  } else {
    schemaBox.style.display = 'none';
  }

  // Qualifies For
  $('#simModalReward').textContent = extras.qualifiesFor || DEFAULT_EXTRAS.qualifiesFor;

  // Submit button label
  $('#submitSimBtn').textContent = `Submit Solution & Grade (+${sim.xpReward} XP)`;

  // Eval note
  if (isSql) {
    $('#evalNote').innerHTML = 'Automated grading checks <strong>aggregate accuracy</strong> and <strong>column aliasing</strong>.';
  } else {
    $('#evalNote').textContent = 'Each simulation can be completed once. Your answer is saved to your portfolio.';
  }

  // Editor pane: SQL vs text
  const simAnswerInput = $('#simAnswerInput');
  const sqlEditorWrap = $('#sqlEditorWrap');
  const editorTabLabel = $('#editorTabLabel');
  const tabPreview = $('#tabPreview');
  const toolbarActions = $('#sandboxToolbarActions');

  if (isSql) {
    // Switch to SQL mode
    simAnswerInput.style.display = 'none';
    sqlEditorWrap.style.display = 'flex';
    editorTabLabel.textContent = 'SQL Query Editor';
    tabPreview.style.display = '';
    $('#sqlCodeInput').value = extras.sampleCode || '-- Write your SQL query here…';

    // Reset preview
    $('#queryOutput').innerHTML = '<p class="empty-state-output">Click <strong>"Run Query"</strong> to test your SQL against the dataset.</p>';
    $('#outputStatus').textContent = 'Ready to execute';

    // Inject toolbar buttons
    toolbarActions.innerHTML = `
      <button class="btn-reset-sql" type="button" id="resetSqlBtn">Reset to Default</button>
      <button class="btn btn-run-query" type="button" id="runQueryBtn">▶ Run Query</button>`;

    $('#resetSqlBtn').addEventListener('click', () => {
      $('#sqlCodeInput').value = extras.sampleCode || '';
    });

    $('#runQueryBtn').addEventListener('click', () => runQuery(extras));

    // Switch to preview tab after run
    switchTab('editor');
  } else {
    // Switch to text mode
    simAnswerInput.style.display = '';
    sqlEditorWrap.style.display = 'none';
    editorTabLabel.textContent = 'Your Answer';
    tabPreview.style.display = 'none';
    toolbarActions.innerHTML = '';
    simAnswerInput.value = '';
    switchTab('editor');
  }

  openModal('simSandboxModal');
}

function switchTab(tab) {
  $$('.s-tab', $('#sandboxTabs')).forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  $$('.sandbox-tab-pane').forEach(pane => pane.classList.remove('active'));
  const paneId = tab === 'editor' ? 'paneEditor' : 'panePreview';
  const pane = $(`#${paneId}`);
  if (pane) pane.classList.add('active');
}

function runQuery(extras) {
  const result = extras.queryResult;
  const statusEl = $('#outputStatus');
  const outputEl = $('#queryOutput');

  statusEl.textContent = 'Running…';

  setTimeout(() => {
    if (!result) {
      statusEl.textContent = '0 rows returned';
      outputEl.innerHTML = '<p class="empty-state-output">No sample result available for this query.</p>';
    } else {
      statusEl.textContent = `${result.rows.length} rows returned in 0.08s`;
      const headerCells = result.cols.map(c => `<th>${escapeHtml(c)}</th>`).join('');
      const bodyRows = result.rows.map(row =>
        `<tr>${row.map(cell => `<td>${escapeHtml(String(cell))}</td>`).join('')}</tr>`
      ).join('');
      outputEl.innerHTML = `
        <table class="query-result-table">
          <thead><tr>${headerCells}</tr></thead>
          <tbody>${bodyRows}</tbody>
        </table>`;
    }
    switchTab('preview');
  }, 600);
}

/* ─── Event Delegation ─────────────────────────────────────────────────── */

$('#trackFilters').addEventListener('click', e => {
  const pill = e.target.closest('[data-track]');
  if (!pill) return;
  activeTrack = pill.dataset.track;
  $$('.pill-btn', $('#trackFilters')).forEach(b => b.classList.toggle('active', b === pill));
  renderGrid();
});

$('#simulationsGrid').addEventListener('click', e => {
  const btn = e.target.closest('[data-launch-simulation]');
  const sim = btn && simulations.find(s => s._id === btn.dataset.launchSimulation);
  if (sim) openSimulation(sim);
});

$('#sandboxTabs').addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab) switchTab(tab.dataset.tab);
});

$('#submitSimBtn').addEventListener('click', async () => {
  if (!activeSimulation) return;

  const isSql = isSQLTrack(activeSimulation);
  const answer = isSql
    ? ($('#sqlCodeInput').value || '').trim()
    : ($('#simAnswerInput').value || '').trim();

  if (answer.length < 5) {
    notify('Write an answer of at least 5 characters before submitting.', 'error');
    return;
  }

  const btn = $('#submitSimBtn');
  setBusy(btn, true, 'Grading…');
  try {
    const result = await simulationService.submit(activeSimulation._id, answer);
    notify(`Submitted! +${result.xpAwarded} XP earned (total ${result.totalXp} XP).`, 'success');
    completedIds.add(activeSimulation._id);
    closeModal('simSandboxModal');
    activeSimulation = null;
    renderGrid();
    const xpEl = $('#currentXpText');
    if (xpEl) xpEl.textContent = String(result.totalXp);
  } catch (err) {
    notify(err.message, 'error');
    if (err.status === 409) {
      completedIds.add(activeSimulation._id);
      closeModal('simSandboxModal');
      renderGrid();
    }
  } finally {
    setBusy(btn, false);
  }
});

if (user) load();

