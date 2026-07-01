/* ═══════════════════════════════════════════════════════════
   Growth Journey Calculator  —  app.js  v6
   Navy + Blue palette · Google Sign-In · Reportees grid
   Coaching notes, highlights, period avg, improvement badges
   ═══════════════════════════════════════════════════════════ */

/* ── CONFIG ──────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════
   CONFIG — fill these in after creating Google OAuth creds
   ══════════════════════════════════════════════════════════
   1. Go to console.cloud.google.com → APIs & Services → Credentials
   2. Create OAuth 2.0 Client ID (Web application)
   3. Add Authorised JavaScript origin: https://abhinavb-create.github.io
   4. Paste the Client ID below
   5. Set MANAGER_EMAIL to your Google account email
   ═════════════════════════════════════════════════════════ */
const GOOGLE_CLIENT_ID = '988966755183-sar1mqrhpv8o3hkt0lh4sjrnmir6sqcr.apps.googleusercontent.com';
const MANAGER_EMAIL    = 'abhinav.b@razorpay.com';   // ← your email
const DATA_VERSION     = '11';  // bump this whenever seed data changes → auto-clears stale localStorage

/* ── FRAMEWORK ───────────────────────────────────────────── */
const LEVELS      = ['JA','A','SA','AM','M','SM'];
const LEVEL_NAMES = { JA:'Junior Associate', A:'Associate', SA:'Senior Associate', AM:'Associate Manager', M:'Manager', SM:'Senior Manager' };
const THRESHOLDS  = { JA:70, A:72, SA:75, AM:78, M:82, SM:85 };
const LDR_WEIGHT  = { JA:0,  A:0,  SA:.10, AM:.25, M:.40, SM:.50 };

const SKILLS = [
  { key:'sales',        label:'Sales & Revenue' },
  { key:'reporting',    label:'Reporting & Analytics' },
  { key:'maturity',     label:'Professional Maturity' },
  { key:'independence', label:'Independence' },
  { key:'ai',           label:'AI Adoption' },
  { key:'xfunc',        label:'Cross-functional' },
  { key:'escalation',   label:'Escalation Quality' },
  { key:'comms',        label:'Communication' },
  { key:'enthusiasm',   label:'Enthusiasm & Drive' },
];

/* Ops role: same keys, different labels + context */
const SKILLS_OPS = [
  { key:'sales',        label:'Process Quality' },
  { key:'reporting',    label:'Reporting & Documentation' },
  { key:'maturity',     label:'Professional Maturity' },
  { key:'independence', label:'Ownership & Independence' },
  { key:'ai',           label:'AI & Tool Adoption' },
  { key:'xfunc',        label:'Cross-functional Coordination' },
  { key:'escalation',   label:'Escalation Quality' },
  { key:'comms',        label:'Communication' },
  { key:'enthusiasm',   label:'SLA Adherence & Drive' },
];

const SK_CTX_OPS = {
  sales:        { JA:'Follows process checklists accurately', A:'Owns end-to-end process with minimal errors', SA:'Identifies and closes process gaps', AM:'Designs and governs operational processes', M:'Sets ops quality standards org-wide', SM:'Shapes ops excellence strategy' },
  reporting:    { JA:'Fills standard templates correctly', A:'Produces accurate and timely reports', SA:'Builds reporting frameworks for ops', AM:'Derives ops insights from data', M:'Governs data quality across function', SM:'Org-wide ops analytics vision' },
  maturity:     { JA:'Professional, follows norms', A:'Self-aware under pressure', SA:'Models maturity for juniors', AM:'Handles ambiguity calmly', M:'Leads through uncertainty', SM:'Shapes culture of maturity' },
  independence: { JA:'Needs daily check-ins', A:'Manages own workload autonomously', SA:'Owns ops projects end-to-end', AM:'Directs team autonomously', M:'Sets direction for ops function', SM:'Full strategic independence' },
  ai:           { JA:'Uses ops tools with guidance', A:'Integrates AI/automation in workflow', SA:'Identifies automation opportunities', AM:'Leads ops automation initiatives', M:'Sets AI-ops strategy', SM:'Drives org-wide ops transformation' },
  xfunc:        { JA:'Coordinates within own team', A:'Collaborates with 1-2 teams on ops tasks', SA:'Partners across functions on process', AM:'Drives cross-functional ops projects', M:'Aligns multiple functions on ops', SM:'Builds cross-org ops partnerships' },
  escalation:   { JA:'Escalates frequently — still learning ops judgement', A:'Escalates with context and proposed fix', SA:'Resolves most ops issues independently', AM:'Rarely escalates; coaches team', M:'Almost never escalates; sets policy', SM:'Escalation is an exception' },
  comms:        { JA:'Clear structured updates', A:'Adapts communication to stakeholder', SA:'Influences through clear ops communication', AM:'Communicates ops vision to team', M:'Effective upward and external comms', SM:'Represents ops in high-stakes forums' },
  enthusiasm:   { JA:'Meets SLAs consistently', A:'Exceeds SLAs, flags risks early', SA:'Improves SLA frameworks', AM:'Drives SLA culture in team', M:'Sets SLA standards for function', SM:'Defines org SLA benchmarks' },
};

/* Returns the right skill list for a member */
function memberSkills(m) { return (m && m.role_type === 'ops') ? SKILLS_OPS : SKILLS; }
function memberSkCtx(m)  { return (m && m.role_type === 'ops') ? SK_CTX_OPS : SK_CTX; }
const LEADERSHIP = [
  { key:'people',      label:'People Leadership' },
  { key:'vision',      label:'Vision & Strategy' },
  { key:'stakeholder', label:'Stakeholder Influence' },
  { key:'developing',  label:'Developing Others' },
  { key:'resilience',  label:'Resilience & Grit' },
  { key:'decision',    label:'Decision Quality' },
];

const AV_COLORS = ['#2563EB','#059669','#D97706','#DC2626','#7C3AED','#0891B2','#BE185D','#065F46','#D97706'];

/* ── SKILL CONTEXT ──────────────────────────────────────── */
const SK_CTX = {
  sales:        { JA:'Supports deals under guidance', A:'Manages own pipeline', SA:'Owns revenue targets', AM:'Coaches team on sales', M:'Drives team revenue', SM:'Sets org sales strategy' },
  reporting:    { JA:'Pulls standard reports', A:'Builds custom reports', SA:'Defines reporting frameworks', AM:'Derives strategic insights', M:'Governs data quality', SM:'Org-wide analytics vision' },
  maturity:     { JA:'Professional, follows norms', A:'Self-aware in feedback', SA:'Models maturity for juniors', AM:'Handles ambiguity calmly', M:'Leads through uncertainty', SM:'Shapes culture of maturity' },
  independence: { JA:'Needs daily check-ins', A:'Works autonomously on tasks', SA:'Owns projects end-to-end', AM:'Directs others autonomously', M:'Sets direction for function', SM:'Full strategic independence' },
  ai:           { JA:'Uses AI tools with help', A:'Integrates AI in workflow', SA:'Identifies AI opportunities', AM:'Leads AI initiatives', M:'Sets AI adoption strategy', SM:'Drives org-wide AI transformation' },
  xfunc:        { JA:'Works within own team', A:'Collaborates across 1-2 teams', SA:'Partners across multiple functions', AM:'Drives cross-functional projects', M:'Aligns multiple functions', SM:'Builds cross-org partnerships' },
  escalation:   { JA:'Escalates frequently — still building judgement', A:'Escalates with context & proposed solutions', SA:'Occasionally escalates; resolves most independently', AM:'Rarely escalates; guides team on judgement', M:'Almost never escalates; sets escalation policy', SM:'Escalation is an exception — resolves at org level' },
  comms:        { JA:'Clear written & verbal basics', A:'Adapts style to audience', SA:'Influences through communication', AM:'Communicates vision to team', M:'Effective upward & external comms', SM:'Represents org in high-stakes forums' },
  enthusiasm:   { JA:'Shows up positively', A:'Contributes ideas proactively', SA:'Energises team & drives initiatives', AM:'Builds morale and culture', M:'Champions culture across function', SM:'Brand ambassador for org' },
};
const LDR_CTX = {
  people:      { SA:'Begins mentoring juniors', AM:'Manages 1-3 direct reports', M:'Leads team of 5-10', SM:'Leads managers' },
  vision:      { SA:'Understands team goals', AM:'Sets team objectives', M:'Drives function strategy', SM:'Shapes org direction' },
  stakeholder: { SA:'Manages key stakeholders', AM:'Influences senior stakeholders', M:'Partners with leadership', SM:'Board-level relationships' },
  developing:  { SA:'Provides peer coaching', AM:'Runs development plans', M:'Builds leaders within team', SM:'Creates talent pipeline' },
  resilience:  { SA:'Bounces back quickly', AM:'Models resilience under pressure', M:'Sustains team in crisis', SM:'Organisational resilience architect' },
  decision:    { SA:'Makes sound independent calls', AM:'Decides under ambiguity', M:'High-stakes decision-making', SM:'Enterprise-level decisions' },
};

/* ── DEVELOPMENT SOLUTIONS ──────────────────────────────── */
const SK_SOL = {
  sales:        { JA:'Shadow 2 senior calls per week', A:'Own 3 accounts end-to-end', SA:'Set & hit a personal revenue target', AM:'Run weekly pipeline reviews with the team', M:'Design a team incentive structure', SM:'Create the sales playbook for the org' },
  reporting:    { JA:'Complete a Data Basics course', A:'Build one dashboard from scratch', SA:'Define team reporting SLAs', AM:'Present data insights to leadership monthly', M:'Audit team data quality quarterly', SM:'Roll out org-wide analytics platform' },
  maturity:     { JA:'Seek feedback after each client call', A:'Practice structured self-reflection weekly', SA:'Lead by example in difficult conversations', AM:'Take a stretch assignment outside comfort zone', M:'Coach team through change', SM:'Define maturity standards for org' },
  independence: { JA:'Complete one task with zero check-ins', A:'Own a week-long project solo', SA:'Deliver quarter goal with minimal oversight', AM:'Set OKRs for team independently', M:'Define function roadmap', SM:'Lead org-wide initiative autonomously' },
  ai:           { JA:'Try 2 new AI tools this month', A:'Replace one manual process with AI', SA:'Run a team demo of your AI workflow', AM:'Set AI adoption goal for team', M:'Launch an AI pilot project', SM:'Publish the AI strategy for org' },
  xfunc:        { JA:'Join one cross-team meeting', A:'Collaborate on a shared project', SA:'Drive one cross-functional initiative', AM:'Lead a cross-team working group', M:'Own cross-functional OKRs', SM:'Build a partnership framework across functions' },
  escalation:   { JA:'Always include context + what you tried', A:'Present 2 options when escalating', SA:'Resolve before escalating by default', AM:'Create an escalation decision tree for team', M:'Monthly review of team escalation patterns', SM:'Set escalation policy for the org' },
  comms:        { JA:'Write one crisp email per stakeholder type', A:'Present in 2 cross-team meetings', SA:'Create a comms template for the team', AM:'Run monthly team all-hands', M:'Quarterly leadership update deck', SM:'Keynote at org all-hands' },
  enthusiasm:   { JA:'Volunteer for one initiative', A:'Submit one improvement idea per month', SA:'Champion a new initiative from scratch', AM:'Create team recognition rituals', M:'Launch a culture programme', SM:'Be the visible face of org values' },
};
const LDR_SOL = {
  people:      { SA:'Start 1:1s with one junior weekly', AM:'Read "Radical Candor"; give structured feedback', M:'Complete a leadership coaching programme', SM:'Build succession plan for each direct report' },
  vision:      { SA:'Write a team vision doc for next quarter', AM:'Run a team strategy session', M:'Create a 6-month function roadmap', SM:'Co-create org 3-year strategy with exec' },
  stakeholder: { SA:'Map top 5 stakeholders; meet them monthly', AM:'Present to VP-level quarterly', M:'Join a cross-org steering committee', SM:'Build exec relationships proactively' },
  developing:  { SA:'Create a development plan for one junior', AM:'Run monthly skills workshops', M:'Design a team rotation programme', SM:'Launch org-wide mentorship programme' },
  resilience:  { SA:'Journal after setbacks; identify patterns', AM:'Lead through one major change project', M:'Run resilience workshops for team', SM:'Shape org change management capability' },
  decision:    { SA:'Document reasoning for major decisions', AM:'Use RACI for all team decisions', M:'Review decision quality monthly in retros', SM:'Implement a decision-making framework org-wide' },
};

/* ── DEFAULT SCORES — all start at 0, earned through manager ratings & approved achievements ── */
var _z = { sales:0, reporting:0, maturity:0, independence:0, ai:0, xfunc:0, escalation:0, comms:0, enthusiasm:0 };
const DEF_SKILLS = { JA:_z, A:_z, SA:_z, AM:_z, M:_z, SM:_z };
var _zl = { people:0, vision:0, stakeholder:0, developing:0, resilience:0, decision:0 };
const DEF_LDR = { JA:_zl, A:_zl, SA:_zl, AM:_zl, M:_zl, SM:_zl };

/* ── SEED ───────────────────────────────────────────────── */
/* ── Team member real emails — must match their Google account ── */
const SEED = [
  { id:'m1', name:'Anam Imteyaz',       level:'JA', role:'Junior Associate, Emerging Business',        email:'anam.imteyaz@razorpay.com',    pod_leader:false },
  { id:'m2', name:'Chandel Yajat',      level:'A',  role:'Associate, Enterprise Sales',               email:'yajat.chandel@razorpay.com',   pod_leader:false },
  { id:'m3', name:'Suman Soumya Dash',  level:'AM', role:'Associate Manager, Startup Hunting',        email:'suman.dash@razorpay.com',      pod_leader:true  },
  { id:'m4', name:'Harsha Thomas John', level:'SA', role:'Senior Associate, Emerging Business',       email:'harsha.john@razorpay.com',     pod_leader:true  },
  { id:'m5', name:'Kirubhavani B',      level:'A',  role:'Associate, Inside Sales',                   email:'kirubhavani.b@razorpay.com',   pod_leader:false },
  { id:'m6', name:'Nishi Agarwal',      level:'AM', role:'Associate Manager, Emerging Business',      email:'nishi.agarwal@razorpay.com',   pod_leader:true  },
  { id:'m7', name:'Mary L. Pulamte',    level:'JA', role:'Junior Associate, Business Operations',     email:'mary.pulamte@razorpay.com',    pod_leader:false, role_type:'ops' },
  { id:'m8', name:'Milind Singh Bora',  level:'A',  role:'Associate, Inside Sales',                   email:'milind.bora@razorpay.com',     pod_leader:true  },
  { id:'m9', name:'Priyanka Pati',      level:'A',  role:'Associate, Business Development',           email:'priyanka.pati@razorpay.com',   pod_leader:false },
];
/* NOTE: Update emails above to match each person's actual Google/Razorpay email */

/* POD Leader leadership weights — override default LDR_WEIGHT by level */
const POD_LDR_WEIGHT = { JA:0.10, A:0.15, SA:0.20, AM:0.30, M:0.40, SM:0.50 };

/* ── STORAGE ─────────────────────────────────────────────── */
function ld(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch(e) { return d; } }
function sv(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
const getMembers   = function() { return ld('gjc_members', []); };
const saveMembers  = function(m) { sv('gjc_members', m); };
const getPending   = function() { return ld('gjc_pending', []); };
const savePending  = function(p) { sv('gjc_pending', p); };
const getApproved  = function() { return ld('gjc_approved', []); };
const saveApproved = function(a) { sv('gjc_approved', a); };
const getCoaching  = function() { return ld('gjc_coaching', {}); };
const saveCoaching = function(obj) { sv('gjc_coaching', obj); };
const getHighlights  = function() { return ld('gjc_highlights', {}); };
const saveHighlights = function(obj) { sv('gjc_highlights', obj); };

function initData() {
  // Auto-clear stale data when DATA_VERSION changes
  var storedVersion = localStorage.getItem('gjc_data_version');
  if (storedVersion !== DATA_VERSION) {
    localStorage.removeItem('gjc_members');
    localStorage.removeItem('gjc_pending');
    localStorage.removeItem('gjc_approved');
    localStorage.removeItem('gjc_coaching');
    localStorage.removeItem('gjc_highlights');
    localStorage.setItem('gjc_data_version', DATA_VERSION);
  }

  var mem = getMembers();
  if (!mem.length) {
    mem = SEED.map(function(s, i) {
      return Object.assign({}, s, {
        color: AV_COLORS[i % AV_COLORS.length],
        history: [90,60,30,0].map(function(d) { return makeSnap(s.level, d); }),
      });
    });
    saveMembers(mem);
  } else {
    mem = mem.map(function(m, i) { return Object.assign({ color: AV_COLORS[i % AV_COLORS.length] }, m); });
    saveMembers(mem);
  }

  applyAIScores();
}

/* ── AI SCORE INTEGRATION ─────────────────────────────────── */

/* Map from analyser skill keys → dashboard skill keys */
var AI_SKILL_KEY_MAP = {
  'sales':            'sales',
  'reporting':        'reporting',
  'maturity':         'maturity',
  'independence':     'independence',
  'ai_adoption':      'ai',
  'cross_functional': 'xfunc',
  'escalation':       'escalation',
  'communication':    'comms',
  'enthusiasm':       'enthusiasm',
};
var AI_LDR_KEY_MAP = {
  'people_leadership':     'people',
  'vision_strategy':       'vision',
  'stakeholder_influence': 'stakeholder',
  'developing_others':     'developing',
  'resilience':            'resilience',
  'decision_quality':      'decision',
};

function getAIEnabled() {
  return ld('gjc_ai_enabled', true);
}

function toggleAIScoring() {
  var enabled = !getAIEnabled();
  sv('gjc_ai_enabled', enabled);
  var label = document.getElementById('ai-toggle-label');
  if (label) label.textContent = enabled ? 'ON' : 'OFF';
  var btn = document.getElementById('ai-toggle-btn');
  if (btn) btn.classList.toggle('ai-toggle-off', !enabled);
  if (enabled) {
    applyAIScores();
    toast('🤖 AI scores enabled');
  } else {
    toast('AI scores hidden — showing manual scores only');
  }
  // Re-render if we're on the manager view
  var mem = getMembers();
  if (mem.length) renderManager();
}

function applyAIScores() {
  if (!getAIEnabled()) return;

  var aiScores = window.AI_SCORES;
  if (!aiScores || typeof aiScores !== 'object') return;

  var names = Object.keys(aiScores);
  if (!names.length) return;

  var mem = getMembers();
  if (!mem.length) return;

  var today = new Date().toISOString().slice(0,10);
  var updated = 0;

  mem = mem.map(function(m) {
    var ai = aiScores[m.name];
    if (!ai) return m;

    // Skip if AI data is stale (older than 7 days)
    var aiDate = ai.last_updated || today;
    var diff = (new Date(today) - new Date(aiDate)) / (1000 * 60 * 60 * 24);
    if (diff > 7) return m;

    // NEVER touch history if the latest snapshot is a manual save (source !== 'ai')
    // Manual saves always win — AI is only a baseline until manager overrides
    var lat = m.history[m.history.length - 1];
    if (lat && lat.source !== 'ai') return m;

    // Find existing AI snapshot for this date
    var lastAiSnap = null;
    for (var i = m.history.length - 1; i >= 0; i--) {
      if (m.history[i].source === 'ai') { lastAiSnap = m.history[i]; break; }
    }

    if (lastAiSnap && lastAiSnap.date && lastAiSnap.date.slice(0,10) === aiDate) {
      // Same date AI snap already exists and is still the latest — update in-place only
      var newHistory = m.history.map(function(h) {
        if (h.source === 'ai' && h.date && h.date.slice(0,10) === aiDate) {
          return buildAISnap(m.level, ai, aiDate, m.pod_leader);
        }
        return h;
      });
      return Object.assign({}, m, { history: newHistory });
    }

    // No AI snap yet, or new date — append as baseline only (no manual snap exists)
    var snap = buildAISnap(m.level, ai, aiDate, m.pod_leader);
    var history = m.history.concat([snap]);
    updated++;
    return Object.assign({}, m, { history: history });
  });

  saveMembers(mem);

  if (updated > 0) {
    toast('🤖 AI scores updated for ' + updated + ' member' + (updated === 1 ? '' : 's'));
  }

  // Sync toggle label
  var label = document.getElementById('ai-toggle-label');
  if (label) label.textContent = 'ON';
}

function buildAISnap(level, ai, dateStr, pod_leader) {
  var skills = {};
  var ldr    = {};

  Object.keys(DEF_SKILLS[level] || DEF_SKILLS['A']).forEach(function(dashKey) {
    skills[dashKey] = 0;
  });
  Object.keys(DEF_LDR[level] || DEF_LDR['A']).forEach(function(dashKey) {
    ldr[dashKey] = 0;
  });

  // Map AI skill keys → dashboard skill keys
  if (ai.skills) {
    Object.keys(AI_SKILL_KEY_MAP).forEach(function(aiKey) {
      var dashKey = AI_SKILL_KEY_MAP[aiKey];
      var val = ai.skills[aiKey];
      if (val !== null && val !== undefined && dashKey in skills) {
        skills[dashKey] = Math.max(0, Math.min(100, Math.round(val)));
      }
    });
  }

  // Map AI leadership keys → dashboard leadership keys
  if (ai.leadership) {
    Object.keys(AI_LDR_KEY_MAP).forEach(function(aiKey) {
      var dashKey = AI_LDR_KEY_MAP[aiKey];
      var val = ai.leadership[aiKey];
      if (val !== null && val !== undefined && dashKey in ldr) {
        ldr[dashKey] = Math.max(0, Math.min(100, Math.round(val)));
      }
    });
  }

  var isoDate = dateStr ? new Date(dateStr).toISOString() : new Date().toISOString();
  var overall = calcOverall(skills, ldr, level, pod_leader);

  return {
    date:       isoDate,
    skills:     skills,
    leadership: ldr,
    note:       '🤖 AI-derived from WhatsApp / Gmail / Slack analysis',
    comments:   {},
    overall:    overall,
    source:     'ai',
    ai_meta: {
      sources:    ai.sources || [],
      confidence: ai.confidence || 0,
      last_updated: ai.last_updated || dateStr,
    },
  };
}

function makeSnap(level, daysAgo) {
  var d = new Date(); d.setDate(d.getDate() - daysAgo);
  var skills = {}, ldr = {};
  Object.keys(DEF_SKILLS[level]).forEach(function(k) { skills[k] = 0; });
  Object.keys(DEF_LDR[level]).forEach(function(k) { ldr[k] = 0; });
  return { date: d.toISOString(), skills: skills, leadership: ldr, note:'', comments:{}, overall: 0 };
}
function clamp(v) { return Math.min(100, Math.max(0, Math.round(v))); }
function rnd(r)   { return Math.round((Math.random() - .5) * r); }

/* ── SCORE HELPERS ──────────────────────────────────────── */
function avg(obj) {
  var vals = Object.values(obj).filter(function(v) { return v > 0; });
  return vals.length ? Math.round(vals.reduce(function(a, b) { return a + b; }, 0) / vals.length) : 0;
}
function calcOverall(skills, ldr, level, pod_leader) {
  var w = pod_leader ? (POD_LDR_WEIGHT[level] || LDR_WEIGHT[level] || 0)
                     : (LDR_WEIGHT[level] || 0);
  if (w === 0) return avg(skills);
  var la = avg(Object.fromEntries(Object.entries(ldr).filter(function(e) { return e[1] > 0; })));
  if (!la) return avg(skills);
  return Math.round(avg(skills) * (1 - w) + la * w);
}
function stKey(s) { return s>=85?'high':s>=70?'track':s>=45?'dev':'needs'; }
function stLabel(s) { return {high:'High Performer',track:'On Track',dev:'Developing',needs:'Needs Attention'}[stKey(s)]; }
function stClass(s) { return 'chip chip-'+stKey(s); }
function stColor(s) { return {high:'#059669',track:'#2563EB',dev:'#D97706',needs:'#DC2626'}[stKey(s)]; }
function skColors(v, key) {
  /* Escalation Quality is inverted — lower escalation rate = better = green */
  if (key === 'escalation') {
    if (v <= 15)  return ['#059669','#D1FAE5'];   // rarely escalates → green
    if (v <= 35)  return ['#2563EB','#EFF6FF'];   // sometimes → blue
    if (v <= 55)  return ['#D97706','#FEF3C7'];   // often → amber
    return ['#DC2626','#FEE2E2'];                  // very high → red
  }
  if (v >= 85) return ['#059669','#D1FAE5'];
  if (v >= 70) return ['#2563EB','#EFF6FF'];
  if (v >= 45) return ['#D97706','#FEF3C7'];
  return ['#DC2626','#FEE2E2'];
}
function isPromo(m) {
  var h = m.history;
  if (h.length < 3) return false;
  var l3 = h.slice(-3);
  var thr = {JA:70,A:72,SA:75,AM:78,M:82,SM:85};
  if (!l3.every(function(s) { return s.overall >= thr[m.level]; })) return false;
  return !Object.values(l3[l3.length-1].skills).some(function(v) { return v < 45; });
}
function ini(name) { return name.split(' ').map(function(w) { return w[0]; }).join('').slice(0,2).toUpperCase(); }
function fmt(iso) { return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
function fmtShort(iso) { return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }

/* ── PERIOD AVERAGE ─────────────────────────────────────── */
function periodAvgSkill(member, skillKey) {
  if (!period || period === 'all') return null;
  var cutoff = new Date();
  if      (period === '2w') cutoff.setDate(cutoff.getDate()-14);
  else if (period === '1m') cutoff.setMonth(cutoff.getMonth()-1);
  else if (period === '3m') cutoff.setMonth(cutoff.getMonth()-3);
  else if (period === '6m') cutoff.setMonth(cutoff.getMonth()-6);
  else if (period === '1y') cutoff.setFullYear(cutoff.getFullYear()-1);
  else return null;

  var snaps = member.history.filter(function(h) { return new Date(h.date) >= cutoff; });
  if (!snaps.length) return null;
  var vals = snaps.map(function(h) { return h.skills[skillKey] ?? null; }).filter(function(v) { return v !== null; });
  if (!vals.length) return null;
  return Math.round(vals.reduce(function(a,b) { return a+b; }, 0) / vals.length);
}

/* ── ROUTER ─────────────────────────────────────────────── */
function setRole(role) {
  ['manager','member','peer','workflow'].forEach(function(r) {
    document.getElementById('view-'+r).style.display = r===role?'':'none';
    var tab = document.getElementById('tab-'+r);
    if (tab) tab.classList.toggle('active', r===role);
  });
  if (role==='manager')  renderManager();
  if (role==='member')   renderMember();
  if (role==='peer')     renderPeer();
  if (role==='workflow') renderWorkflow();
}

/* ── TOAST ──────────────────────────────────────────────── */
function toast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(function() { t.classList.remove('show'); }, 2800);
}

/* ════════════════════════════════════════════════════════
   AUTH  — Role-based Google Sign-In
   Roles determined by email after sign-in:
     manager  → MANAGER_EMAIL → full dashboard
     member   → email matches SEED entry → own view only
     peer     → any other verified Google account
   ════════════════════════════════════════════════════════ */
var googleUser = null;

/* Derive role and matched member from an email */
function roleForEmail(email) {
  if (!email) return { role:'peer', member:null };
  var norm = email.toLowerCase().trim();
  if (norm === MANAGER_EMAIL.toLowerCase().trim()) return { role:'manager', member:null };
  var mem = getMembers();
  for (var i = 0; i < mem.length; i++) {
    if (mem[i].email && mem[i].email.toLowerCase().trim() === norm) {
      return { role:'member', member: mem[i] };
    }
  }
  return { role:'peer', member:null };
}

/* Show/hide nav tabs based on role */
function applyNavForRole(role) {
  var tabs = {
    manager:  document.getElementById('tab-manager'),
    member:   document.getElementById('tab-member'),
    peer:     document.getElementById('tab-peer'),
    workflow: document.getElementById('tab-workflow'),
  };
  var aiBtn = document.getElementById('ai-toggle-btn');
  if (role === 'manager') {
    /* Manager sees everything */
    Object.values(tabs).forEach(function(t) { if (t) t.style.display = ''; });
    if (aiBtn) aiBtn.style.display = '';
  } else if (role === 'member') {
    /* Member sees only their tab + workflow */
    if (tabs.manager)  tabs.manager.style.display  = 'none';
    if (tabs.member)   tabs.member.style.display   = '';
    if (tabs.peer)     tabs.peer.style.display     = 'none';
    if (tabs.workflow) tabs.workflow.style.display  = '';
    if (aiBtn) aiBtn.style.display = 'none';
  } else {
    /* Peer sees only peer + workflow */
    if (tabs.manager)  tabs.manager.style.display  = 'none';
    if (tabs.member)   tabs.member.style.display   = 'none';
    if (tabs.peer)     tabs.peer.style.display     = '';
    if (tabs.workflow) tabs.workflow.style.display  = '';
    if (aiBtn) aiBtn.style.display = 'none';
  }
}

function updateHeaderUser(user) {
  var wrap = document.getElementById('header-user');
  if (!wrap) return;
  if (!user) { wrap.innerHTML = ''; return; }
  var picHtml = user.picture
    ? '<img src="'+user.picture+'" alt="">'
    : '<div style="background:var(--blue);color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px">'+ini(user.name||'U')+'</div>';
  wrap.innerHTML = '<div class="header-avatar">'+picHtml+'</div>'
    + '<span class="header-name">'+(user.name||user.email||'').split(' ')[0]+'</span>'
    + '<button class="btn-signout" onclick="signOut()">Sign out</button>';
}

/* Called by Google Identity Services after sign-in */
function handleGoogleCredential(response) {
  try {
    var payload = JSON.parse(atob(response.credential.split('.')[1]));
    googleUser = { name: payload.name, email: payload.email, picture: payload.picture };
    sessionStorage.setItem('gjc_user', JSON.stringify(googleUser));
    afterSignIn(googleUser);
  } catch(e) {
    console.error('Auth error', e);
    showSignIn('Sign-in failed. Please try again.');
  }
}

function afterSignIn(user) {
  updateHeaderUser(user);
  var result = roleForEmail(user.email);
  applyNavForRole(result.role);
  sessionStorage.setItem('gjc_role', result.role);
  if (result.member) sessionStorage.setItem('gjc_member_id', result.member.id);

  /* Hide sign-in overlay */
  var overlay = document.getElementById('signin-overlay');
  if (overlay) overlay.style.display = 'none';

  if (result.role === 'manager') {
    setRole('manager');
  } else if (result.role === 'member') {
    /* Pre-select their member in the member view */
    sessionStorage.setItem('gjc_preselect_member', result.member.id);
    setRole('member');
  } else {
    setRole('peer');
  }
}

function signOut() {
  googleUser = null;
  sessionStorage.clear();
  updateHeaderUser(null);
  showSignIn();
}

/* Show the full-page sign-in overlay */
function showSignIn(errMsg) {
  /* Hide all views, show overlay */
  ['manager','member','peer','workflow'].forEach(function(r) {
    var v = document.getElementById('view-'+r);
    if (v) v.style.display = 'none';
  });
  /* Hide all nav tabs while signed out */
  ['tab-manager','tab-member','tab-peer','tab-workflow'].forEach(function(id) {
    var t = document.getElementById(id); if (t) t.style.display = 'none';
  });
  var aiBtn = document.getElementById('ai-toggle-btn');
  if (aiBtn) aiBtn.style.display = 'none';

  var overlay = document.getElementById('signin-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'signin-overlay';
    document.getElementById('app').appendChild(overlay);
  }
  var needClientId = (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.indexOf('YOUR_GOOGLE') === 0);
  var gsiHtml = needClientId
    ? '<div class="auth-hint" style="color:#DC2626">⚠️ Google Client ID not configured yet.<br>See setup instructions in app.js line 8.</div>'
    : '<div id="g_id_onload" data-client_id="'+GOOGLE_CLIENT_ID+'" data-callback="handleGoogleCredential" data-auto_prompt="true" data-context="signin" data-ux_mode="popup"></div>'
      + '<div class="g_id_signin" data-type="standard" data-theme="outline" data-size="large" data-text="sign_in_with" data-shape="rectangular" data-logo_alignment="left"></div>';

  overlay.innerHTML = '<div class="auth-card">'
    + '<div class="auth-logo">📊</div>'
    + '<div class="auth-title">Growth Journey</div>'
    + '<div class="auth-sub">Sign in with your Razorpay Google account.<br>Your role is set automatically.</div>'
    + gsiHtml
    + (errMsg ? '<div class="auth-error" style="margin-top:12px">'+errMsg+'</div>' : '')
    + '<div class="auth-roles-hint">'
    + '<div>📊 Manager → full dashboard</div>'
    + '<div>🙋 Team member → your profile only</div>'
    + '<div>💬 Others → peer feedback only</div>'
    + '</div>'
    + '</div>';

  overlay.style.display = 'flex';

  /* Re-render GSI button if Google script already loaded */
  if (window.google && window.google.accounts && !needClientId) {
    window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
    window.google.accounts.id.renderButton(overlay.querySelector('.g_id_signin'), { theme:'outline', size:'large', text:'sign_in_with', shape:'rectangular' });
    window.google.accounts.id.prompt();
  }
}

/* ════════════════════════════════════════════════════════
   MANAGER VIEW
   ════════════════════════════════════════════════════════ */
var teamChart  = null;
var radarChart = null;
var selId      = null;
var period     = 'all';

function renderManager() {
  var el = document.getElementById('view-manager');
  initData();
  var mem = getMembers();

  el.innerHTML = '<div class="page">'
    + '<div id="s-kpi"></div>'
    + '<div id="s-chart"></div>'
    + '<div id="s-reportees"></div>'
    + '<div id="s-dive"></div>'
    + '<div id="s-pending"></div>'
    + '</div>';

  buildKPI(mem);
  buildChart(mem);
  buildReportees(mem);
  buildPending();
}

/* ── KPI ─────────────────────────────────────────────────── */
function buildKPI(mem) {
  var sc    = mem.map(function(m) { return m.history[m.history.length-1] ? m.history[m.history.length-1].overall : 0; });
  var tavg  = Math.round(sc.reduce(function(a,b) { return a+b; }, 0) / sc.length);
  var high  = sc.filter(function(s) { return s>=85; }).length;
  var track = sc.filter(function(s) { return s>=70&&s<85; }).length;
  var needs = sc.filter(function(s) { return s<70; }).length;
  var promo = mem.filter(isPromo).length;

  document.getElementById('s-kpi').innerHTML = '<div class="sec-hd"><div><div class="sec-title">Dashboard Overview</div></div></div>'
    + '<div class="kpi-row">'
    + '<div class="kpi-card" style="--kpi-color:#2563EB"><div class="kpi-lbl">Team Average</div><div class="kpi-val">'+tavg+'<small style="font-size:14px;font-weight:500">%</small></div><div class="kpi-sub">'+mem.length+' reportees tracked</div></div>'
    + '<div class="kpi-card" style="--kpi-color:#059669"><div class="kpi-lbl">High Performers</div><div class="kpi-val">'+high+'</div><div class="kpi-sub">Score &ge; 85%</div><div class="kpi-pill" style="background:#D1FAE5;color:#065F46">'+Math.round(high/mem.length*100)+'% of team</div></div>'
    + '<div class="kpi-card" style="--kpi-color:#2563EB"><div class="kpi-lbl">On Track</div><div class="kpi-val">'+track+'</div><div class="kpi-sub">Score 70–84%</div><div class="kpi-pill" style="background:#DBEAFE;color:#1D4ED8">'+Math.round(track/mem.length*100)+'% of team</div></div>'
    + '<div class="kpi-card" style="--kpi-color:#DC2626"><div class="kpi-lbl">Needs Attention</div><div class="kpi-val">'+needs+'</div><div class="kpi-sub">Score &lt; 70%</div>'
    + (needs ? '<div class="kpi-pill" style="background:#FEE2E2;color:#991B1B">⚠ Review needed</div>' : '<div class="kpi-pill" style="background:#D1FAE5;color:#065F46">✓ All clear</div>')
    + '</div>'
    + '<div class="kpi-card" style="--kpi-color:#D97706"><div class="kpi-lbl">Promo Candidates</div><div class="kpi-val">'+promo+'</div><div class="kpi-sub">3+ cycles at threshold</div>'
    + (promo ? '<div class="kpi-pill" style="background:#FEF3C7;color:#92400E">🏆 Promote now</div>' : '')
    + '</div></div>';
}

/* ── TEAM LINE CHART ─────────────────────────────────────── */
function buildChart(mem) {
  var tabs = ['2W','1M','3M','6M','1Y','All'];
  document.getElementById('s-chart').innerHTML = '<div class="sec-hd">'
    + '<div><div class="sec-title">Team Progress</div><div class="sec-subtitle">Score trend across all reportees</div></div>'
    + '</div>'
    + '<div class="chart-card">'
    + '<div class="chart-hd"><div><div class="chart-title">Score Timeline</div></div>'
    + '<div class="period-tabs">'
    + tabs.map(function(p) {
        var pKey = p === 'All' ? 'all' : p.toLowerCase();
        return '<button class="period-tab'+(period===pKey?' active':'')+'" onclick="setPeriod(\''+pKey+'\')">'+p+'</button>';
      }).join('')
    + '</div></div>'
    + '<div class="chart-wrap"><canvas id="teamChart"></canvas></div>'
    + '</div>';
  drawTeamChart(mem);
}

function setPeriod(p) { period = p; buildChart(getMembers()); if (selId) renderDeepDive(selId); }

function drawTeamChart(mem) {
  if (teamChart) { teamChart.destroy(); teamChart = null; }
  var ctx = document.getElementById('teamChart') ? document.getElementById('teamChart').getContext('2d') : null;
  if (!ctx) return;

  var cutoff = new Date();
  if      (period==='2w') cutoff.setDate(cutoff.getDate()-14);
  else if (period==='1m') cutoff.setMonth(cutoff.getMonth()-1);
  else if (period==='3m') cutoff.setMonth(cutoff.getMonth()-3);
  else if (period==='6m') cutoff.setMonth(cutoff.getMonth()-6);
  else if (period==='1y') cutoff.setFullYear(cutoff.getFullYear()-1);
  else cutoff.setFullYear(2000);

  var datasets = mem.map(function(m) {
    var data = m.history.filter(function(h) { return new Date(h.date) >= cutoff; });
    if (data.length < 2) data = m.history.slice(-4);
    return {
      label: m.name.split(' ')[0],
      data: data.map(function(h) { return { x: new Date(h.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}), y: h.overall }; }),
      borderColor: m.color,
      backgroundColor: m.color + '15',
      tension: .35, borderWidth: 2.5,
      pointRadius: 5, pointHoverRadius: 7,
      pointBackgroundColor: m.color,
      pointBorderColor: '#fff', pointBorderWidth: 2,
      fill: false,
    };
  });

  teamChart = new Chart(ctx, {
    type:'line',
    data:{ datasets: datasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ position:'bottom', labels:{ usePointStyle:true, pointStyle:'circle', padding:16, font:{size:11}, color:'#334155' } },
        tooltip:{ backgroundColor:'#0F172A', padding:10, callbacks:{ label:function(c) { return ' '+c.dataset.label+': '+c.parsed.y+'%'; } } },
      },
      scales:{
        x:{ type:'category', grid:{display:false}, ticks:{ font:{size:11}, color:'#64748B' }, border:{display:false} },
        y:{ min:0, max:100,
            grid:{ color:'#F1F5F9', drawBorder:false },
            ticks:{ callback:function(v) { return v+'%'; }, font:{size:11}, color:'#64748B', stepSize:20 },
            border:{ display:false },
          },
      },
    },
  });
}

/* ── REPORTEES GRID ──────────────────────────────────────── */
function buildReportees(mem) {
  var cards = mem.map(function(m) {
    var lat   = m.history[m.history.length-1] || {};
    var score = lat.overall !== undefined ? lat.overall : 0;
    var col   = stColor(score);
    return '<div class="rep-card'+(selId===m.id?' selected':'')+'" id="rc-'+m.id+'"'
      + ' style="--rc-color:'+col+'" onclick="selectMember(\''+m.id+'\')">'
      + '<div class="rep-top">'
      + '<div class="rep-av" style="background:'+m.color+'">'+ini(m.name)+'</div>'
      + '<div><div class="rep-name">'+m.name+(m.pod_leader?'<span class="pod-badge">🏅 POD</span>':'')+(m.role_type==='ops'?'<span class="ops-badge">⚙️ Ops</span>':'')+'</div><div class="rep-role">'+(m.role || LEVEL_NAMES[m.level])+'</div></div>'
      + '</div>'
      + '<div class="rep-score-row"><div class="rep-score">'+score+'%</div><span class="lvl">'+m.level+'</span></div>'
      + '<div class="rep-bar-bg"><div class="rep-bar-fill" style="width:'+score+'%;background:'+col+'"></div></div>'
      + '<div class="rep-status" style="margin-top:8px">'
      + '<span class="'+stClass(score)+'"><span class="chip-dot"></span>'+stLabel(score)+'</span>'
      + (isPromo(m)?'<div class="promo-flag">🏆 Promo Ready</div>':'')
      + '</div></div>';
  }).join('');

  document.getElementById('s-reportees').innerHTML = '<div class="sec-hd">'
    + '<div><div class="sec-title">My Reportees</div><div class="sec-subtitle">Click a card to open individual deep-dive</div></div>'
    + '</div>'
    + '<div class="reportees-grid">'+cards+'</div>';
}

function selectMember(id) {
  selId = id;
  document.querySelectorAll('.rep-card').forEach(function(c) { c.classList.toggle('selected', c.id==='rc-'+id); });
  renderDeepDive(id);
  setTimeout(function() { var el = document.getElementById('s-dive'); if (el) el.scrollIntoView({behavior:'smooth',block:'start'}); }, 60);
}

/* ── COACHING NOTES ──────────────────────────────────────── */
function addCoachingNote(memberId, skillKey) {
  var ta = document.getElementById('cn-input-'+skillKey);
  if (!ta) return;
  var text = ta.value.trim();
  if (!text) { toast('⚠ Write a note first'); return; }
  var coaching = getCoaching();
  if (!coaching[memberId]) coaching[memberId] = {};
  if (!coaching[memberId][skillKey]) coaching[memberId][skillKey] = [];
  coaching[memberId][skillKey].unshift({ text: text, date: new Date().toISOString() });
  saveCoaching(coaching);
  ta.value = '';
  rerenderCoachingLog(memberId, skillKey);
  toast('✅ Note saved');
}

function toggleCoachingLog(skillKey) {
  var log = document.getElementById('cn-log-'+skillKey);
  if (!log) return;
  log.classList.toggle('open');
  var toggle = document.getElementById('cn-toggle-'+skillKey);
  if (toggle) {
    var arrow = toggle.querySelector('.cn-arrow');
    if (arrow) arrow.textContent = log.classList.contains('open') ? '▲' : '▼';
  }
}

function rerenderCoachingLog(memberId, skillKey) {
  var coaching = getCoaching();
  var notes = (coaching[memberId] && coaching[memberId][skillKey]) ? coaching[memberId][skillKey] : [];
  var logEl = document.getElementById('cn-log-'+skillKey);
  if (!logEl) return;
  var wasOpen = logEl.classList.contains('open');

  var notesHtml = notes.length
    ? notes.map(function(n) {
        return '<div class="cn-item"><span class="cn-date">'+fmtShort(n.date)+'</span><span class="cn-text">'+escHtml(n.text)+'</span></div>';
      }).join('')
    : '<div class="cn-item" style="color:var(--subtle);font-style:italic">No notes yet.</div>';

  logEl.innerHTML = '<div class="cn-notes">'+notesHtml+'</div>'
    + '<div class="cn-add">'
    + '<textarea id="cn-input-'+skillKey+'" class="cn-textarea" placeholder="Add coaching note..."></textarea>'
    + '<button class="btn-primary btn-sm" onclick="addCoachingNote(\''+memberId+'\',\''+skillKey+'\')">Add Note</button>'
    + '</div>';

  var toggleEl = document.getElementById('cn-toggle-'+skillKey);
  if (toggleEl) {
    var countSpan = toggleEl.querySelector('.cn-count');
    if (countSpan) countSpan.textContent = '('+notes.length+')';
    var lastSpan = toggleEl.querySelector('.cn-last');
    if (lastSpan) lastSpan.textContent = notes.length ? '· Last: '+fmtShort(notes[0].date) : '';
  }
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── HIGHLIGHTS ──────────────────────────────────────────── */
function addHighlight(memberId, skillKey) {
  var formEl = document.getElementById('hl-form-'+skillKey);
  if (!formEl) return;
  formEl.classList.toggle('open');
}

function saveHighlight(memberId, skillKey) {
  var formEl = document.getElementById('hl-form-'+skillKey);
  if (!formEl) return;
  var textEl = formEl.querySelector('.hl-input-text');
  var typeEl = formEl.querySelector('.hl-input-type');
  var refEl  = formEl.querySelector('.hl-input-ref');
  var text = textEl ? textEl.value.trim() : '';
  var type = typeEl ? typeEl.value : 'client';
  var ref  = refEl  ? refEl.value.trim() : '';
  if (!text) { toast('⚠ Enter highlight text'); return; }

  var highlights = getHighlights();
  if (!highlights[memberId]) highlights[memberId] = {};
  if (!highlights[memberId][skillKey]) highlights[memberId][skillKey] = [];
  highlights[memberId][skillKey].push({ id: 'h'+Date.now(), text: text, type: type, ref: ref, date: new Date().toISOString() });
  saveHighlights(highlights);
  if (textEl) textEl.value = '';
  if (refEl)  refEl.value = '';
  formEl.classList.remove('open');
  rerenderHighlights(memberId, skillKey);
  toast('✅ Highlight saved');
}

function removeHighlight(memberId, skillKey, hlId) {
  var highlights = getHighlights();
  if (!highlights[memberId] || !highlights[memberId][skillKey]) return;
  highlights[memberId][skillKey] = highlights[memberId][skillKey].filter(function(h) { return h.id !== hlId; });
  saveHighlights(highlights);
  rerenderHighlights(memberId, skillKey);
}

function rerenderHighlights(memberId, skillKey) {
  var highlights = getHighlights();
  var hls = (highlights[memberId] && highlights[memberId][skillKey]) ? highlights[memberId][skillKey] : [];
  var wrapEl = document.getElementById('hl-wrap-'+skillKey);
  if (!wrapEl) return;
  var tagsHtml = hls.map(function(h) {
    return '<span class="hl-tag hl-tag-'+h.type+'">'
      + escHtml(h.text)
      + (h.ref ? ' <a href="'+escHtml(h.ref)+'" target="_blank" class="hl-ref">↗</a>' : '')
      + '<button class="hl-x" onclick="removeHighlight(\''+memberId+'\',\''+skillKey+'\',\''+h.id+'\')" title="Remove">×</button>'
      + '</span>';
  }).join('');
  wrapEl.innerHTML = tagsHtml + buildHlAddButtons(memberId, skillKey) + buildHlForm(memberId, skillKey);
}

function buildHlAddButtons(memberId, skillKey) {
  return '<button class="hl-add-btn" onclick="addHighlight(\''+memberId+'\',\''+skillKey+'\')" title="Add highlight">+ Highlight</button>';
}

function buildHlForm(memberId, skillKey) {
  return '<div class="hl-add-form" id="hl-form-'+skillKey+'">'
    + '<input class="hl-input-text" type="text" placeholder="e.g. Razorpay deal, Q2 target">'
    + '<select class="hl-input-type">'
    + '<option value="client">Client</option>'
    + '<option value="deal">Deal</option>'
    + '<option value="achievement">Achievement</option>'
    + '<option value="process">Process</option>'
    + '<option value="reference">Reference</option>'
    + '</select>'
    + '<input class="hl-input-ref" type="url" placeholder="URL (optional)">'
    + '<button class="btn-primary btn-sm" onclick="saveHighlight(\''+memberId+'\',\''+skillKey+'\')">Save</button>'
    + '<button class="btn-ghost btn-sm" onclick="document.getElementById(\'hl-form-'+skillKey+'\').classList.remove(\'open\')">Cancel</button>'
    + '</div>';
}

/* ── DEEP-DIVE ───────────────────────────────────────────── */
function renderDeepDive(id) {
  var mem  = getMembers();
  var m    = null;
  for (var i = 0; i < mem.length; i++) { if (mem[i].id === id) { m = mem[i]; break; } }
  if (!m) return;

  var lat  = m.history[m.history.length-1] || {skills:{},leadership:{},note:'',comments:{}};
  var prev = m.history.length >= 2 ? m.history[m.history.length-2] : null;
  var w    = m.pod_leader ? (POD_LDR_WEIGHT[m.level] || LDR_WEIGHT[m.level] || 0)
                          : (LDR_WEIGHT[m.level] || 0);
  var hasL = w > 0;

  var coaching   = getCoaching();
  var highlights = getHighlights();

  /* Skill cards */
  var skillCards = memberSkills(m).map(function(sk, idx) {
    var val  = lat.skills[sk.key] !== undefined ? lat.skills[sk.key] : 50;
    var prevVal = prev ? (prev.skills[sk.key] !== undefined ? prev.skills[sk.key] : null) : null;
    var colArr = skColors(val, sk.key);
    var c = colArr[0], bg = colArr[1];
    var slBg = 'linear-gradient(to right,'+c+' '+val+'%,#E2E8F0 '+val+'%)';
    var ctx  = (memberSkCtx(m)[sk.key] && memberSkCtx(m)[sk.key][m.level]) ? memberSkCtx(m)[sk.key][m.level] : '';
    var hint = (SK_SOL[sk.key] && SK_SOL[sk.key][m.level]) ? SK_SOL[sk.key][m.level] : '';

    /* Trend badge */
    var trendHtml = '';
    if (prevVal !== null) {
      var diff = val - prevVal;
      if (diff > 0) {
        trendHtml = '<span class="sk-trend-up">↑ +'+diff+'</span>';
      } else if (diff < 0) {
        trendHtml = '<span class="sk-trend-dn">↓ '+diff+'</span>';
      } else {
        trendHtml = '<span class="sk-trend-eq">=</span>';
      }
    }

    /* Period avg badge */
    var avgVal = periodAvgSkill(m, sk.key);
    var avgBadge = (avgVal !== null)
      ? '<span class="sk-avg-badge">Avg '+period.toUpperCase()+': '+avgVal+'%</span>'
      : '';

    /* AI badge — shown when latest snapshot is AI-derived */
    var aiBadge = '';
    if (getAIEnabled() && lat.source === 'ai' && lat.ai_meta) {
      var aiDate = lat.ai_meta.last_updated || (lat.date ? lat.date.slice(0,10) : '');
      var aiSrc  = (lat.ai_meta.sources || []).join(', ') || 'ai';
      var aiConf = lat.ai_meta.confidence ? Math.round(lat.ai_meta.confidence * 100) + '% confidence' : '';
      var aiTip  = 'AI-derived · ' + aiDate + (aiSrc ? ' · sources: ' + aiSrc : '') + (aiConf ? ' · ' + aiConf : '');
      aiBadge = '<span class="sk-ai-badge" title="' + aiTip + '">🤖 AI</span>';
    }

    /* Notes */
    var notes = (coaching[id] && coaching[id][sk.key]) ? coaching[id][sk.key] : [];
    var notesHtml = notes.length
      ? notes.map(function(n) {
          return '<div class="cn-item"><span class="cn-date">'+fmtShort(n.date)+'</span><span class="cn-text">'+escHtml(n.text)+'</span></div>';
        }).join('')
      : '<div class="cn-item" style="color:var(--subtle);font-style:italic">No notes yet.</div>';

    /* Highlights */
    var hls = (highlights[id] && highlights[id][sk.key]) ? highlights[id][sk.key] : [];
    var hlTagsHtml = hls.map(function(h) {
      return '<span class="hl-tag hl-tag-'+h.type+'">'
        + escHtml(h.text)
        + (h.ref ? ' <a href="'+escHtml(h.ref)+'" target="_blank" class="hl-ref">↗</a>' : '')
        + '<button class="hl-x" onclick="removeHighlight(\''+id+'\',\''+sk.key+'\',\''+h.id+'\')" title="Remove">×</button>'
        + '</span>';
    }).join('');

    return '<div class="sk-card">'
      + '<div class="sk-card-hd">'
      + '<div class="sk-card-name">'+sk.label+'<small>'+ctx+'</small></div>'
      + '<div class="sk-card-badges">'+avgBadge+trendHtml+aiBadge+'<span class="sk-score-badge" id="bd-'+sk.key+'" style="--sb-col:'+c+';--sb-bg:'+bg+'">'+val+'%</span></div>'
      + '</div>'
      + '<div class="sk-slider-row">'
      + '<input type="range" class="sk-slider" min="0" max="100" value="'+val+'"'
      + ' id="sl-'+sk.key+'" data-key="'+sk.key+'" data-type="skill" data-idx="'+idx+'"'
      + ' oninput="syncSlider(this,\''+id+'\')"'
      + ' style="--sl-bg:'+slBg+';--sb-col:'+c+'">'
      + '</div>'
      + '<div class="hl-wrap" id="hl-wrap-'+sk.key+'">'
      + hlTagsHtml
      + '<button class="hl-add-btn" onclick="addHighlight(\''+id+'\',\''+sk.key+'\')" title="Add highlight">+ Highlight</button>'
      + buildHlForm(id, sk.key)
      + '</div>'
      + '<div class="cn-toggle" id="cn-toggle-'+sk.key+'" onclick="toggleCoachingLog(\''+sk.key+'\')">'
      + '💬 Coaching Notes <span class="cn-count">('+notes.length+')</span>'
      + ' <span class="cn-last">'+(notes.length ? '· Last: '+fmtShort(notes[0].date) : '')+'</span>'
      + '<span class="cn-arrow" style="margin-left:auto">▼</span>'
      + '</div>'
      + '<div class="cn-log" id="cn-log-'+sk.key+'">'
      + '<div class="cn-notes">'+notesHtml+'</div>'
      + '<div class="cn-add">'
      + '<textarea id="cn-input-'+sk.key+'" class="cn-textarea" placeholder="Add coaching note..."></textarea>'
      + '<button class="btn-primary btn-sm" onclick="addCoachingNote(\''+id+'\',\''+sk.key+'\')">Add Note</button>'
      + '</div>'
      + '</div>'
      + '</div>';
  }).join('');

  /* Leadership rows */
  var ldrRows = LEADERSHIP.map(function(lk) {
    var val  = lat.leadership ? (lat.leadership[lk.key] !== undefined ? lat.leadership[lk.key] : 0) : 0;
    var colArr = skColors(val || 50);
    var c = colArr[0], bg = colArr[1];
    var slBg = hasL ? 'linear-gradient(to right,'+c+' '+val+'%,#E2E8F0 '+val+'%)' : '#E2E8F0';
    var ctx  = (LDR_CTX[lk.key] && LDR_CTX[lk.key][m.level]) ? LDR_CTX[lk.key][m.level] : 'N/A at this level';
    var hint = (LDR_SOL[lk.key] && LDR_SOL[lk.key][m.level]) ? LDR_SOL[lk.key][m.level] : '';
    var cmt  = (lat.comments && lat.comments['ldr_'+lk.key]) ? lat.comments['ldr_'+lk.key] : '';
    return '<div class="sk-row'+(hasL?'':' disabled')+'">'
      + '<div class="sk-name">'+lk.label+'<small>'+ctx+'</small></div>'
      + '<div class="sk-mid">'
      + '<div class="sk-slider-row">'
      + '<span class="sk-score-badge" id="bd-ldr-'+lk.key+'" style="--sb-col:'+c+';--sb-bg:'+bg+'">'+( hasL ? val+'%' : 'N/A')+'</span>'
      + (hasL
          ? '<input type="range" class="sk-slider" min="0" max="100" value="'+val+'"'
            + ' id="sl-ldr-'+lk.key+'" data-key="'+lk.key+'" data-type="leadership"'
            + ' oninput="syncSlider(this,\''+id+'\')"'
            + ' style="--sl-bg:'+slBg+';--sb-col:'+c+'">'
          : '<div style="flex:1;height:5px;background:#E2E8F0;border-radius:99px"></div>')
      + '</div>'
      + (hasL
          ? '<button class="comment-btn'+(cmt?' has-comment':'')+'" id="cb-ldr-'+lk.key+'"'
            + ' onclick="toggleCmt(\'cbox-ldr-'+lk.key+'\',\'cb-ldr-'+lk.key+'\')">'
            + '<span class="cbtn-icon">'+(cmt?'✏️':'💬')+'</span>'
            + '<span id="cbt-ldr-'+lk.key+'">'+(cmt?'Edit coaching note':'Add coaching note')+'</span>'
            + '</button>'
            + '<div class="comment-box'+(cmt?' open':'')+'" id="cbox-ldr-'+lk.key+'">'
            + '<textarea data-key="ldr_'+lk.key+'" data-type="comment" placeholder="'+hint+'">'+cmt+'</textarea>'
            + '<div class="comment-hint-text">Suggested action: '+hint+'</div>'
            + '</div>'
          : '')
      + '</div>'
      + '</div>';
  }).join('');

  /* Dev plan */
  var weak = memberSkills(m).filter(function(sk) { return (lat.skills[sk.key] !== undefined ? lat.skills[sk.key] : 50) < 65; });
  var devPlan = weak.length
    ? '<div class="devplan">'
      + '<div class="devplan-title">📋 Development Focus — '+weak.length+' skill'+(weak.length>1?'s':'')+' below 65%</div>'
      + weak.map(function(sk) {
          return '<div class="devplan-item"><b>'+sk.label+'</b><span>'+((SK_SOL[sk.key]&&SK_SOL[sk.key][m.level])?SK_SOL[sk.key][m.level]:'')+'</span></div>';
        }).join('')
      + '</div>'
    : '';

  var radCur = memberSkills(m).map(function(sk) { return lat.skills[sk.key] !== undefined ? lat.skills[sk.key] : 50; });
  var radPrv = prev ? memberSkills(m).map(function(sk) { return prev.skills[sk.key] !== undefined ? prev.skills[sk.key] : 50; }) : null;

  document.getElementById('s-dive').innerHTML = '<div class="sec-hd">'
    + '<div><div class="sec-title">Individual Deep-Dive</div></div>'
    + '<button class="btn-ghost btn-sm" onclick="closeDeepDive()">✕ Close</button>'
    + '</div>'
    + '<div class="deep-dive">'
    + '<div class="dd-hd">'
    + '<div class="dd-member">'
    + '<div class="dd-av" style="background:'+m.color+'">'+ini(m.name)+'</div>'
    + '<div><div class="dd-name">'+m.name+(m.pod_leader?'<span class="pod-badge">🏅 POD</span>':'')+(m.role_type==='ops'?'<span class="ops-badge">⚙️ Ops</span>':'')+'</div><div class="dd-meta">'+(LEVEL_NAMES[m.level]+' · '+m.level+' · '+m.history.length+' snapshot'+(m.history.length!==1?'s':'')+' · '+(m.role||''))+'</div></div>'
    + '</div>'
    + '<div class="dd-score-wrap"><div class="dd-score" id="dd-score">'+(lat.overall||0)+'%</div><div class="dd-score-lbl" id="dd-score-lbl">'+stLabel(lat.overall||0)+'</div></div>'
    + '</div>'
    + '<div class="dd-body">'
    + '<div><div class="sec-title" style="margin-bottom:10px">Growth Journey</div>'+buildJmap(m)+'</div>'
    + '<div class="dd-grid">'
    + '<div class="radar-panel"><div class="radar-panel-title">Skills Web</div><div class="radar-canvas-wrap"><canvas id="radarChart"></canvas></div>'
    + '<div class="radar-leg"><div class="radar-leg-item"><div class="radar-leg-dot" style="background:#2563EB"></div>Current</div>'
    + (radPrv?'<div class="radar-leg-item"><div class="radar-leg-dot" style="background:#CBD5E1"></div>Previous</div>':'')
    + '</div></div>'
    + '<div class="skills-col">'
    + (m.role_type==='ops' ? '<div class="ops-trajectory-banner">⚙️ <strong>Ops Trajectory</strong> — Skills reflect operational excellence, process quality & SLA delivery. Sales metric replaced by Process Quality.</div>' : '')
    + '<div class="sk-sec-title">Core Skills (9)</div>'
    + skillCards
    + '<div class="ldr-banner">🎯 <strong>Leadership weight: '+Math.round(w*100)+'%</strong> &nbsp;of overall score'
    + (m.pod_leader ? ' &nbsp;<span class="pod-badge">🏅 POD Leader</span>' : '')
    + ((!hasL)?'— unlocks from Senior Associate (SA) or POD Leader':'')+'</div>'
    + (hasL ? '<div class="sk-sec-title">Leadership Competencies (6)</div>'+ldrRows : '')
    + '</div>'
    + '</div>'
    + devPlan
    + '<div class="save-row">'
    + '<label>Manager Note (optional — saved with snapshot)</label>'
    + '<textarea id="mgr-note" placeholder="Coaching observations, context, agreed next steps…">'+(lat.note||'')+'</textarea>'
    + '<div class="save-actions">'
    + '<span style="font-size:11px;color:var(--subtle)">Last snapshot: '+(lat.date?fmt(lat.date):'—')+'</span>'
    + '<button class="btn-ghost" onclick="closeDeepDive()">Cancel</button>'
    + '<button class="btn-primary" onclick="saveSnapshot(\''+id+'\')">💾 Save Snapshot</button>'
    + '</div></div>'
    + '</div></div>';

  drawRadar(radCur, radPrv);
}

function closeDeepDive() {
  selId = null;
  document.getElementById('s-dive').innerHTML = '';
  document.querySelectorAll('.rep-card').forEach(function(c) { c.classList.remove('selected'); });
}

/* ── JOURNEY MAP ─────────────────────────────────────────── */
function buildJmap(m) {
  var idx = LEVELS.indexOf(m.level);
  var html = '<div class="jmap">';
  LEVELS.forEach(function(lv, i) {
    var cls = i<idx?'done':i===idx?'current':i===idx+1?'next':i===idx+2?'goal':'';
    var tag = i===idx?'<br><span style="font-size:8px;font-weight:700;color:#2563EB">YOU</span>'
             :i===idx+1?'<br><span style="font-size:8px;font-weight:700;color:#D97706">NEXT</span>'
             :i===idx+2?'<br><span style="font-size:8px;font-weight:700;color:#059669">GOAL</span>':'';
    if (i > 0) html += '<div class="jm-conn'+(i<=idx?' done':'')+'"></div>';
    html += '<div class="jm-node '+cls+'"><div class="jm-circle">'+lv+'</div><div class="jm-lbl">'+lv+tag+'</div></div>';
  });
  html += '</div>';
  return html;
}

/* ── SLIDER SYNC ─────────────────────────────────────────── */
function syncSlider(el, memberId) {
  var val  = +el.value;
  var key  = el.dataset.key;
  var type = el.dataset.type;
  var colArr = skColors(val, key);
  var c = colArr[0], bg = colArr[1];
  var slBg = 'linear-gradient(to right,'+c+' '+val+'%,#E2E8F0 '+val+'%)';

  el.style.setProperty('--sl-bg', slBg);
  el.style.setProperty('--sb-col', c);

  var bdId = type==='leadership' ? 'bd-ldr-'+key : 'bd-'+key;
  var bd = document.getElementById(bdId);
  if (bd) { bd.textContent=val+'%'; bd.style.setProperty('--sb-col',c); bd.style.setProperty('--sb-bg',bg); }

  if (radarChart && type==='skill') {
    var idx2 = +el.dataset.idx;
    if (idx2>=0) { radarChart.data.datasets[0].data[idx2]=val; radarChart.update('none'); }
  }

  recomputeOverall(memberId);
}

function recomputeOverall(memberId) {
  var m = null;
  var members = getMembers();
  for (var i = 0; i < members.length; i++) { if (members[i].id === memberId) { m = members[i]; break; } }
  if (!m) return;
  var s={}, l={};
  var lat = m.history[m.history.length-1] || {skills:{},leadership:{}};
  memberSkills(m).forEach(function(sk) {
    var el = document.getElementById('sl-'+sk.key);
    s[sk.key] = el ? +el.value : (lat.skills[sk.key] !== undefined ? lat.skills[sk.key] : 50);
  });
  LEADERSHIP.forEach(function(lk) {
    var el = document.getElementById('sl-ldr-'+lk.key);
    l[lk.key] = el ? +el.value : (lat.leadership ? (lat.leadership[lk.key] !== undefined ? lat.leadership[lk.key] : 0) : 0);
  });
  var o = calcOverall(s, l, m.level, m.pod_leader);
  var se = document.getElementById('dd-score');
  var le = document.getElementById('dd-score-lbl');
  if (se) se.textContent = o+'%';
  if (le) le.textContent = stLabel(o);
}

/* ── COMMENT TOGGLE ──────────────────────────────────────── */
function toggleCmt(boxId, btnId) {
  var box = document.getElementById(boxId);
  var btn = document.getElementById(btnId);
  if (!box) return;
  var open = box.classList.toggle('open');
  if (btn) {
    var ta = box.querySelector('textarea');
    btn.classList.toggle('has-comment', open || (ta && ta.value && ta.value.trim().length>0));
  }
  var lbl = document.getElementById(btnId.replace('cb-','cbt-'));
  if (lbl) {
    var ta2 = box.querySelector('textarea');
    lbl.textContent = open ? 'Hide note' : (ta2 && ta2.value && ta2.value.trim() ? 'Edit coaching note' : 'Add coaching note');
  }
}

/* ── SAVE SNAPSHOT ──────────────────────────────────────── */
function saveSnapshot(id) {
  var mem = getMembers();
  var m   = null;
  for (var i = 0; i < mem.length; i++) { if (mem[i].id === id) { m = mem[i]; break; } }
  if (!m) return;

  var s={}, l={}, comments={};
  var lat = m.history[m.history.length-1] || {skills:{},leadership:{}};
  memberSkills(m).forEach(function(sk) {
    var el = document.getElementById('sl-'+sk.key);
    s[sk.key] = el ? +el.value : (lat.skills[sk.key] !== undefined ? lat.skills[sk.key] : 50);
  });
  LEADERSHIP.forEach(function(lk) {
    var el = document.getElementById('sl-ldr-'+lk.key);
    l[lk.key] = el ? +el.value : (lat.leadership ? (lat.leadership[lk.key] !== undefined ? lat.leadership[lk.key] : 0) : 0);
  });
  /* Check coaching notes from the persistent store (gjc_coaching) */
  var coaching = getCoaching();
  var memberNotes = coaching[id] || {};

  /* Also pick up any note currently typed in the textarea (not yet saved via Add Note) */
  memberSkills(m).forEach(function(sk) {
    var taEl = document.getElementById('cn-input-'+sk.key);
    if (taEl && taEl.value.trim()) {
      /* Count unsaved textarea content as an existing note for validation */
      if (!memberNotes[sk.key]) memberNotes[sk.key] = [];
      memberNotes[sk.key] = memberNotes[sk.key].concat([{ text: taEl.value.trim(), _unsaved: true }]);
    }
  });

  var noComment = memberSkills(m).filter(function(sk) {
    var score = s[sk.key] !== undefined ? s[sk.key] : 0;
    var hasNote = memberNotes[sk.key] && memberNotes[sk.key].length > 0;
    return score < 45 && !hasNote;
  });
  if (noComment.length) {
    /* Non-blocking advisory — open the panels but still allow saving */
    toast('💡 Tip: add coaching notes for ' + noComment.map(function(x) { return x.label; }).join(', ') + ' (saved anyway)');
    noComment.forEach(function(sk) {
      var log = document.getElementById('cn-log-'+sk.key);
      var toggle = document.getElementById('cn-toggle-'+sk.key);
      if (log && !log.classList.contains('open')) {
        log.classList.add('open');
        if (toggle) toggle.classList.add('open');
      }
    });
  }

  var noteEl = document.getElementById('mgr-note');
  var note = noteEl ? noteEl.value.trim() : '';
  m.history.push({ date:new Date().toISOString(), skills:s, leadership:l, note:note, comments:comments, overall:calcOverall(s,l,m.level,m.pod_leader) });
  saveMembers(mem);
  toast('✅ Snapshot saved!');
  var upd = getMembers();
  buildKPI(upd); buildChart(upd); buildReportees(upd); renderDeepDive(id);
}

/* ── RADAR ───────────────────────────────────────────────── */
function drawRadar(current, prev) {
  if (radarChart) { radarChart.destroy(); radarChart=null; }
  var ctx = document.getElementById('radarChart') ? document.getElementById('radarChart').getContext('2d') : null;
  if (!ctx) return;
  var ds = [{
    label:'Current', data:current,
    backgroundColor:'rgba(37,99,235,.12)',
    borderColor:'#2563EB', borderWidth:2,
    pointBackgroundColor:'#2563EB', pointRadius:4,
  }];
  if (prev) ds.push({
    label:'Previous', data:prev,
    backgroundColor:'rgba(203,213,225,.07)',
    borderColor:'#CBD5E1', borderWidth:1.5,
    pointBackgroundColor:'#CBD5E1', pointRadius:3,
    borderDash:[4,3],
  });
  radarChart = new Chart(ctx, {
    type:'radar',
    data:{ labels: memberSkills(m).map(function(s) { return s.label.split(' ')[0]; }), datasets:ds },
    options:{
      responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{display:false} },
      scales:{ r:{
        min:0, max:100,
        ticks:{stepSize:25,font:{size:9},backdropColor:'transparent',color:'#94A3B8'},
        grid:{color:'#E2E8F0'},
        angleLines:{color:'#E2E8F0'},
        pointLabels:{font:{size:9.5},color:'#475569'},
      }},
    },
  });
}

/* ── PENDING ─────────────────────────────────────────────── */
/* Rating → score points mapping: 1★=4pts, 2★=8pts, 3★=12pts, 4★=16pts, 5★=20pts */
function ratingToPoints(r) { return (parseInt(r)||0) * 4; }

function skillLabelFromKey(key) {
  if (!key) return '';
  if (key.indexOf('ldr_') === 0) {
    var lk = LEADERSHIP.find(function(x) { return 'ldr_'+x.key === key; });
    return lk ? lk.label+' (Leadership)' : key;
  }
  var sk = SKILLS.find(function(x) { return x.key === key; });
  return sk ? sk.label : key;
}

function buildPending() {
  var p   = getPending();
  var mem = getMembers();
  var nm  = {};
  mem.forEach(function(m) { nm[m.id] = m.name; });

  var items = p.length
    ? p.map(function(item) {
        var isAch = item.type === 'achievement';
        var skillLabel = isAch ? skillLabelFromKey(item.skillKey) : '';
        var stars = item.selfRating ? ['','★','★★','★★★','★★★★','★★★★★'][item.selfRating] : '';
        var pts   = item.selfRating ? '+'+ratingToPoints(item.selfRating)+' pts on approval' : '';

        return '<div class="pending-item" id="pi-'+item.id+'">'
          + '<div class="p-icon">'+(isAch?'🏅':'💬')+'</div>'
          + '<div class="p-content">'
          + '<div class="p-who">'+(nm[item.target]||item.target)
          +   (isAch ? ' · <span class="ach-cat" style="margin-left:4px">'+item.category+'</span>' : ' · Peer feedback from '+(nm[item.from]||item.from))
          +   (skillLabel ? ' · <span class="ach-skill-tag">'+skillLabel+'</span>' : '')
          +   (stars ? ' · <span class="ach-rating">'+stars+'</span>' : '')
          + '</div>'
          + (isAch && item.impact ? '<div class="p-impact"><strong>Impact:</strong> '+item.impact+'</div>' : '')
          + '<div class="p-text">'+item.text+'</div>'
          + (isAch && item.ref ? '<div class="p-ref">📎 <a href="'+item.ref+'" target="_blank">'+item.ref+'</a></div>' : '')
          + (isAch && pts ? '<div class="p-pts">'+pts+' to <em>'+skillLabel+'</em></div>' : '')
          + '<div class="p-meta">'+fmt(item.date)+'</div>'
          /* Manager editable rating override */
          + (isAch ? '<div class="p-edit-row">'
          +   '<label style="font-size:11px;font-weight:600">Adjust rating before approving: </label>'
          +   '<div class="star-row" id="mgr-star-'+item.id+'">'
          +   [1,2,3,4,5].map(function(n) {
                return '<button type="button" class="star-btn'+(n<=(item.selfRating||0)?' active':'')+'" data-val="'+n+'" onclick="setMgrStar(\''+item.id+'\','+n+')">★</button>';
              }).join('')
          +   '</div><input type="hidden" id="mgr-rating-'+item.id+'" value="'+(item.selfRating||0)+'">'
          + '</div>' : '')
          + '</div>'
          + '<div class="p-actions">'
          + '<button class="btn-sm btn-approve" onclick="approveItem(\''+item.id+'\')">✓ Approve</button>'
          + '<button class="btn-sm btn-remove"  onclick="removeItem(\''+item.id+'\')">✕ Reject</button>'
          + '</div></div>';
      }).join('')
    : '<div class="empty"><div class="empty-icon">✅</div>No pending items — inbox zero!</div>';

  document.getElementById('s-pending').innerHTML = '<div class="sec-hd"><div class="sec-title">Pending Approvals</div>'+(p.length?'<span class="badge-cnt">'+p.length+'</span>':'')+'</div>'
    + '<div class="pending-wrap">'
    + '<div class="pending-hd">Approval Queue '+(p.length?'<span class="badge-cnt">'+p.length+'</span>':'')+'</div>'
    + '<div>'+items+'</div>'
    + '</div>';
}

function setMgrStar(pid, n) {
  var inp = document.getElementById('mgr-rating-'+pid);
  if (inp) inp.value = n;
  var row = document.getElementById('mgr-star-'+pid);
  if (row) {
    row.querySelectorAll('.star-btn').forEach(function(b) {
      b.classList.toggle('active', parseInt(b.dataset.val) <= n);
    });
  }
  /* update pts label live */
  var ptEl = document.querySelector('#pi-'+pid+' .p-pts');
  var skEl = document.querySelector('#pi-'+pid+' .p-pts em');
  if (ptEl && skEl) ptEl.innerHTML = '+'+ratingToPoints(n)+' pts on approval to <em>'+skEl.textContent+'</em>';
}

function approveItem(pid) {
  var p = getPending();
  var item = null;
  for (var i = 0; i < p.length; i++) { if (p[i].id === pid) { item = p[i]; break; } }
  if (!item) return;

  /* Read manager-adjusted rating if present */
  var mgrRatingEl = document.getElementById('mgr-rating-'+pid);
  if (mgrRatingEl && mgrRatingEl.value) item.selfRating = parseInt(mgrRatingEl.value) || item.selfRating;

  /* Apply score points to member's latest snapshot */
  if (item.type === 'achievement' && item.skillKey && item.selfRating) {
    var mem = getMembers();
    var pts = ratingToPoints(item.selfRating);
    for (var mi = 0; mi < mem.length; mi++) {
      if (mem[mi].id === item.target) {
        var m = mem[mi];
        /* Clone latest snapshot */
        var lat = m.history[m.history.length-1];
        var newSnap = JSON.parse(JSON.stringify(lat));
        newSnap.date = new Date().toISOString();
        newSnap.note = 'Achievement approved: '+item.category;
        /* Apply to correct skill or leadership */
        if (item.skillKey.indexOf('ldr_') === 0) {
          var lKey = item.skillKey.replace('ldr_','');
          if (newSnap.leadership && newSnap.leadership[lKey] !== undefined) {
            newSnap.leadership[lKey] = Math.min(100, (newSnap.leadership[lKey]||0) + pts);
          }
        } else {
          if (newSnap.skills && newSnap.skills[item.skillKey] !== undefined) {
            newSnap.skills[item.skillKey] = Math.min(100, (newSnap.skills[item.skillKey]||0) + pts);
          }
        }
        newSnap.overall = calcOverall(newSnap.skills, newSnap.leadership, m.level, m.pod_leader);
        m.history.push(newSnap);
        break;
      }
    }
    saveMembers(mem);
  }

  savePending(p.filter(function(x) { return x.id !== pid; }));
  item.approvedDate = new Date().toISOString();
  saveApproved([...getApproved(), item]);

  /* Refresh all sections */
  var updMem = getMembers();
  buildKPI(updMem);
  buildChart(updMem);
  buildReportees(updMem);
  if (selId) renderDeepDive(selId);
  buildPending();
  toast('✅ Approved & score updated!');
}

function removeItem(pid) {
  savePending(getPending().filter(function(x) { return x.id !== pid; }));
  buildPending(); toast('🗑 Rejected');
}

/* ════════════════════════════════════════════════════════
   MEMBER VIEW
   ════════════════════════════════════════════════════════ */
function renderMember() {
  var el = document.getElementById('view-member');
  /* If signed-in via Google and matched to a member, auto-load their profile */
  var preselect = sessionStorage.getItem('gjc_preselect_member');
  var aid = preselect || sessionStorage.getItem('gjc_mbr_authed');
  if (!aid) { renderMbrSelect(el); return; }
  var mem = getMembers();
  var m = null;
  for (var i = 0; i < mem.length; i++) { if (mem[i].id === aid) { m = mem[i]; break; } }
  if (!m) { renderMbrSelect(el); return; }
  sessionStorage.setItem('gjc_mbr_authed', m.id);
  renderMbrDash(el, m);
}

function renderMbrSelect(el) {
  var mem = getMembers();
  el.innerHTML = '<div class="auth-overlay"><div class="auth-card" style="width:400px">'
    + '<div class="auth-logo">🙋</div>'
    + '<div class="auth-title">My Journey</div>'
    + '<div class="auth-sub">Select your name to sign in</div>'
    + '<div class="member-pick-list">'
    + mem.map(function(m) {
        return '<button class="member-pick-btn" onclick="startMbrLogin(\''+m.id+'\')">'
          + '<div class="mbr-av-sm" style="background:'+m.color+'">'+ini(m.name)+'</div>'
          + '<div><div class="mpb-name">'+m.name+'</div><div class="mpb-sub">'+m.level+' · '+LEVEL_NAMES[m.level]+'</div></div>'
          + '</button>';
      }).join('')
    + '</div></div></div>';
}

function startMbrLogin(id) {
  var el = document.getElementById('view-member');
  var mem = getMembers();
  var m = null;
  for (var i = 0; i < mem.length; i++) { if (mem[i].id === id) { m = mem[i]; break; } }
  el.innerHTML = '<div class="auth-overlay"><div class="auth-card">'
    + '<div class="auth-logo">🔑</div>'
    + '<div class="auth-title">'+(m ? m.name.split(' ')[0] : '')+'</div>'
    + '<div class="auth-sub">Sign in with your work Google account</div>'
    + '<button class="google-btn" onclick="demoMbrLogin(\''+id+'\')">'
    + '<svg viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-21.5 0-1.5-.2-2.7-.5-3.5z"/></svg>'
    + 'Sign in with Google</button>'
    + '<div class="auth-divider">or enter PIN</div>'
    + '<input class="auth-input" id="mbr-pin" type="password" maxlength="4" placeholder="4-digit PIN" oninput="if(this.value.length===4)checkMbrPin(\''+id+'\')">'
    + '<div class="auth-error" id="mbr-err"></div>'
    + '<div class="auth-hint">Default PIN: 0000</div>'
    + '<button onclick="renderMbrSelect(document.getElementById(\'view-member\'))" style="margin-top:14px;font-size:12px;color:var(--muted);background:none;text-decoration:underline;cursor:pointer;border:none">← Back</button>'
    + '</div></div>';
}

function demoMbrLogin(id) {
  sessionStorage.setItem('gjc_mbr_authed', id);
  renderMember();
}

function checkMbrPin(id) {
  var pinEl = document.getElementById('mbr-pin');
  var pin = pinEl ? pinEl.value : '';
  var mem = getMembers();
  var m = null;
  for (var i = 0; i < mem.length; i++) { if (mem[i].id === id) { m = mem[i]; break; } }
  if (m && pin===(m.pin||'0000')) {
    sessionStorage.setItem('gjc_mbr_authed',id); renderMember();
  } else {
    var e = document.getElementById('mbr-err');
    if (e) e.textContent = 'Incorrect PIN';
    setTimeout(function() {
      var inp = document.getElementById('mbr-pin');
      if (inp) inp.value = '';
      if (e) e.textContent = '';
    }, 1200);
  }
}

function renderMbrDash(el, m) {
  var lat     = m.history[m.history.length-1] || {skills:{},leadership:{}};
  var overall = lat.overall !== undefined ? lat.overall : 0;
  var approved = getApproved().filter(function(a) { return a.target === m.id; });
  var fbs  = approved.filter(function(a) { return a.type === 'feedback'; });
  var achs = approved.filter(function(a) { return a.type === 'achievement'; });
  var radData = memberSkills(m).map(function(sk) { return lat.skills[sk.key] !== undefined ? lat.skills[sk.key] : 0; });

  var skillOpts = memberSkills(m).map(function(sk) { return '<option value="'+sk.key+'">'+sk.label+'</option>'; }).join('');
  var ldrOpts   = LEADERSHIP.map(function(lk) { return '<option value="ldr_'+lk.key+'">'+lk.label+' (Leadership)</option>'; }).join('');

  var achRows = achs.length ? achs.map(function(a) {
    var skillName = '';
    if (a.skillKey) {
      if (a.skillKey.indexOf('ldr_') === 0) {
        var lk = LEADERSHIP.find(function(x) { return 'ldr_'+x.key === a.skillKey; });
        skillName = lk ? lk.label : '';
      } else {
        var sk = memberSkills(m).find(function(x) { return x.key === a.skillKey; });
        skillName = sk ? sk.label : '';
      }
    }
    return '<div class="ach-card">'
      + '<div class="ach-card-top">'
      + '<span class="ach-cat">'+a.category+'</span>'
      + (skillName ? '<span class="ach-skill-tag">'+skillName+'</span>' : '')
      + (a.selfRating ? '<span class="ach-rating">'+['','★','★★','★★★','★★★★','★★★★★'][a.selfRating||0]+' ('+a.selfRating+'/5)</span>' : '')
      + '</div>'
      + (a.impact ? '<div class="ach-impact"><strong>Impact:</strong> '+a.impact+'</div>' : '')
      + '<div class="ach-detail">'+a.text+'</div>'
      + '<div class="ach-meta">Approved · '+fmt(a.approvedDate||a.date)+'</div>'
      + '</div>';
  }).join('') : '<div style="color:var(--muted);font-size:13px">No achievements yet. Log one below!</div>';

  el.innerHTML = '<div class="mbr-page">'
    /* Hero — score is shown prominently */
    + '<div class="mbr-hero">'
    + '<div class="mbr-hero-l">'
    + '<div class="mbr-hero-av" style="background:'+m.color+'">'+ini(m.name)+'</div>'
    + '<div><div class="mbr-hero-name">'+m.name+'</div><div class="mbr-hero-sub">'+LEVEL_NAMES[m.level]+' · '+m.level+(m.role?' · '+m.role:'')+'</div></div>'
    + '</div>'
    + '<div class="mbr-hero-score">'
    + '<div class="mbr-score-big">'+overall+'%</div>'
    + '<div class="mbr-score-lbl">'+stLabel(overall)+'</div>'
    + '<div style="font-size:10px;color:rgba(255,255,255,.5);margin-top:4px">Overall score</div>'
    + '</div>'
    + '</div>'
    /* Skill scores quick view */
    + '<div class="mbr-card"><div class="mbr-card-hd">My Skill Scores</div><div class="mbr-card-body">'
    + '<div class="mbr-skills-grid">'
    + memberSkills(m).map(function(sk) {
        var v = lat.skills[sk.key] || 0;
        var c = skColors(v, sk.key)[0];
        return '<div class="mbr-skill-item"><div class="mbr-sk-name">'+sk.label+'</div>'
          + '<div class="mbr-sk-bar-bg"><div class="mbr-sk-bar-fill" style="width:'+v+'%;background:'+c+'"></div></div>'
          + '<div class="mbr-sk-score" style="color:'+c+'">'+v+'%</div></div>';
      }).join('')
    + '</div></div></div>'
    /* Journey */
    + '<div class="mbr-card"><div class="mbr-card-hd">Growth Journey</div><div class="mbr-card-body">'+buildJmap(m)+'</div></div>'
    /* Radar */
    + '<div class="mbr-card"><div class="mbr-card-hd">Skills Web</div><div class="mbr-card-body"><div class="radar-mbr"><canvas id="mbrRadar"></canvas></div></div></div>'
    /* Achievements */
    + '<div class="mbr-card"><div class="mbr-card-hd">Approved Achievements</div><div class="mbr-card-body">'+achRows+'</div></div>'
    /* Peer feedback */
    + '<div class="mbr-card"><div class="mbr-card-hd">Peer Feedback</div><div class="mbr-card-body">'
    + (fbs.length ? fbs.map(function(f) { return '<div class="fb-item fb-'+(f.sentiment||'positive')+'">'+f.text+'<div class="fb-from">From '+f.from+' · '+fmt(f.date)+'</div></div>'; }).join('') : '<div style="color:var(--muted);font-size:13px">No feedback yet.</div>')
    + '</div></div>'
    /* Log achievement — rich form */
    + '<div class="mbr-card"><div class="mbr-card-hd">Log Achievement</div><div class="mbr-card-body">'
    + '<div class="ach-form">'
    + '<div class="ach-form-row">'
    + '<div class="form-group"><label>Category</label><select id="ach-cat"><option>Brand/Deal</option><option>AI Initiative</option><option>Cross-functional</option><option>Process Improvement</option><option>Mentoring</option><option>Other</option></select></div>'
    + '<div class="form-group"><label>Skill / Competency Impacted</label><select id="ach-skill"><option value="">— Select skill —</option>'+skillOpts+ldrOpts+'</select></div>'
    + '<div class="form-group"><label>Self-Rating (out of 5)</label>'
    + '<div class="star-row" id="star-row">'
    + [1,2,3,4,5].map(function(n) { return '<button type="button" class="star-btn" data-val="'+n+'" onclick="setStar('+n+')">★</button>'; }).join('')
    + '</div><input type="hidden" id="ach-rating" value="0"></div>'
    + '</div>'
    + '<div class="form-group"><label>Impact — what changed because of this?</label><textarea id="ach-impact" placeholder="e.g. Saved 4 hrs/week for the team, increased deal velocity by 20%..." rows="2"></textarea></div>'
    + '<div class="form-group"><label>Details — what exactly did you do?</label><textarea id="ach-text" placeholder="Describe the situation, actions you took, and specific outcome..." rows="3"></textarea></div>'
    + '<div class="form-group"><label>Reference / Link (optional)</label><input type="text" id="ach-ref" placeholder="https://... or doc name, ticket, deal ID"></div>'
    + '<button class="btn-primary" onclick="submitAch(\''+m.id+'\')">Submit for Manager Approval →</button>'
    + '</div>'
    + '</div></div>'
    + '<button onclick="sessionStorage.removeItem(\'gjc_mbr_authed\');renderMember()" class="btn-ghost" style="align-self:flex-start;margin-top:4px">← Switch user</button>'
    + '</div>';

  setTimeout(function() {
    var ctx = document.getElementById('mbrRadar') ? document.getElementById('mbrRadar').getContext('2d') : null;
    if (!ctx) return;
    new Chart(ctx, {
      type:'radar',
      data:{ labels: memberSkills(m).map(function(s) { return s.label.split(' ')[0]; }), datasets:[{
        label:'Score', data:radData,
        backgroundColor:'rgba(37,99,235,.12)',
        borderColor:'#2563EB', borderWidth:2,
        pointBackgroundColor:'#2563EB', pointRadius:4,
      }]},
      options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{size:9},backdropColor:'transparent',color:'#94A3B8'},grid:{color:'#E2E8F0'},angleLines:{color:'#E2E8F0'},pointLabels:{font:{size:9.5},color:'#475569'}}}},
    });
  }, 80);
}

function setStar(n) {
  document.getElementById('ach-rating').value = n;
  var btns = document.querySelectorAll('.star-btn');
  btns.forEach(function(b) {
    b.classList.toggle('active', parseInt(b.dataset.val) <= n);
  });
}

function submitAch(id) {
  var cat    = (document.getElementById('ach-cat')    || {}).value || '';
  var skill  = (document.getElementById('ach-skill')  || {}).value || '';
  var rating = parseInt((document.getElementById('ach-rating') || {}).value || '0');
  var impact = ((document.getElementById('ach-impact') || {}).value || '').trim();
  var text   = ((document.getElementById('ach-text')   || {}).value || '').trim();
  var ref    = ((document.getElementById('ach-ref')    || {}).value || '').trim();

  if (!text)   { toast('⚠ Please describe what you did in Details.'); return; }
  if (!skill)  { toast('⚠ Please select a skill or competency.'); return; }
  if (!rating) { toast('⚠ Please give a self-rating (1–5 stars).'); return; }
  if (!impact) { toast('⚠ Please describe the impact.'); return; }

  var pending = getPending();
  pending.push({
    id: 'p'+Date.now(), type:'achievement',
    target: id, from: id,
    category: cat, skillKey: skill, selfRating: rating,
    impact: impact, text: text, ref: ref,
    date: new Date().toISOString()
  });
  savePending(pending);
  toast('✅ Submitted for manager approval!');
  /* reset form */
  ['ach-impact','ach-text','ach-ref'].forEach(function(fid) { var el=document.getElementById(fid); if(el) el.value=''; });
  var re=document.getElementById('ach-rating'); if(re) re.value='0';
  document.querySelectorAll('.star-btn').forEach(function(b){b.classList.remove('active');});
  var sk=document.getElementById('ach-skill'); if(sk) sk.value='';
}

/* ════════════════════════════════════════════════════════
   PEER VIEW
   ════════════════════════════════════════════════════════ */
function renderPeer() {
  var mem  = getMembers();
  var opts = mem.map(function(m) { return '<option value="'+m.id+'">'+m.name+' ('+m.level+')</option>'; }).join('');
  document.getElementById('view-peer').innerHTML = '<div class="peer-page">'
    + '<div class="peer-card">'
    + '<div class="peer-hd"><div class="peer-hd-title">Give Peer Feedback</div><div class="peer-hd-sub">Anonymous, specific &amp; constructive</div></div>'
    + '<div class="peer-body">'
    + '<div class="peer-notice">⚠️ You cannot see scores or full profiles. Only the manager views assessments.</div>'
    + '<div class="form-group"><label>Your Name</label><select id="peer-from">'+opts+'</select></div>'
    + '<div class="form-group"><label>Feedback For</label><select id="peer-target">'+opts+'</select></div>'
    + '<div class="form-group"><label>Type</label><select id="peer-sent"><option value="positive">Positive — something they do brilliantly</option><option value="constructive">Constructive — something to improve</option></select></div>'
    + '<div class="form-group"><label>Specific Behaviour (min 20 chars)</label><textarea id="peer-text" placeholder="Describe a specific situation and its impact…"></textarea></div>'
    + '<button class="btn-primary" onclick="submitPeer()">Submit Feedback</button>'
    + '</div></div></div>';
}

function submitPeer() {
  var from = document.getElementById('peer-from') ? document.getElementById('peer-from').value : '';
  var tgt  = document.getElementById('peer-target') ? document.getElementById('peer-target').value : '';
  var sent = document.getElementById('peer-sent') ? document.getElementById('peer-sent').value : '';
  var txtEl = document.getElementById('peer-text');
  var txt  = txtEl ? txtEl.value.trim() : '';
  if (!txt || txt.length < 20) { toast('⚠ Write at least 20 characters describing a specific behaviour.'); return; }
  if (from === tgt) { toast('⚠ You cannot give feedback to yourself.'); return; }
  var pending = getPending();
  pending.push({ id:'p'+Date.now(), type:'feedback', from:from, target:tgt, sentiment:sent, text:txt, date:new Date().toISOString() });
  savePending(pending);
  toast('✅ Feedback submitted for manager review!');
  if (txtEl) txtEl.value = '';
}

/* ════════════════════════════════════════════════════════
   WORKFLOW VIEW
   ════════════════════════════════════════════════════════ */
function renderWorkflow() {
  document.getElementById('view-workflow').innerHTML = '<div class="workflow-page">'
    + '<h2>Growth Journey Workflow</h2>'
    + '<img src="workflow.svg" alt="Growth Journey Workflow" style="width:100%;max-width:1100px">'
    + '</div>';
}

/* ── BOOT ────────────────────────────────────────────────── */
initData();

/* Always load Google Identity Services */
(function() {
  var s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true; s.defer = true;
  s.onload = function() {
    /* Re-init GSI after script loads if overlay is visible */
    var overlay = document.getElementById('signin-overlay');
    var needClientId = (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.indexOf('YOUR_GOOGLE') === 0);
    if (overlay && overlay.style.display !== 'none' && !needClientId && window.google) {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCredential });
      var btn = overlay.querySelector('.g_id_signin');
      if (btn) window.google.accounts.id.renderButton(btn, { theme:'outline', size:'large', text:'sign_in_with', shape:'rectangular' });
      window.google.accounts.id.prompt();
    }
  };
  document.head.appendChild(s);
}());

/* Restore session if user was already signed in */
(function() {
  var stored = sessionStorage.getItem('gjc_user');
  if (stored) {
    try {
      googleUser = JSON.parse(stored);
      afterSignIn(googleUser);
      /* Sync AI toggle */
      var enabled = getAIEnabled();
      var label = document.getElementById('ai-toggle-label');
      var btn   = document.getElementById('ai-toggle-btn');
      if (label) label.textContent = enabled ? 'ON' : 'OFF';
      if (btn)   btn.classList.toggle('ai-toggle-off', !enabled);
      return;
    } catch(e) { sessionStorage.clear(); }
  }
  /* No session — show sign-in */
  showSignIn();
}());
