/* ═══════════════════════════════════════════════════════════
   Growth Journey Calculator  —  app.js  v4
   ═══════════════════════════════════════════════════════════ */

/* ── FRAMEWORK DATA ──────────────────────────────────────── */
const LEVELS      = ['JA','A','SA','AM','M','SM'];
const LEVEL_NAMES = { JA:'Junior Associate', A:'Associate', SA:'Senior Associate', AM:'Associate Manager', M:'Manager', SM:'Senior Manager' };
const THRESHOLDS  = { JA:70, A:72, SA:75, AM:78, M:82, SM:85 };
const LEADERSHIP_WEIGHT = { JA:0, A:0, SA:.10, AM:.25, M:.40, SM:.50 };

const SKILLS = [
  { key:'sales',        label:'Sales & Revenue' },
  { key:'reporting',    label:'Reporting & Analytics' },
  { key:'maturity',     label:'Professional Maturity' },
  { key:'independence', label:'Independence' },
  { key:'ai',           label:'AI Adoption' },
  { key:'xfunc',        label:'Cross-functional' },
  { key:'escalation',   label:'Escalation Quality' },
  { key:'comms',        label:'Communication' },
  { key:'enthusiasm',   label:'Enthusiasm' },
];
const LEADERSHIP = [
  { key:'people',      label:'People Leadership' },
  { key:'vision',      label:'Vision & Strategy' },
  { key:'stakeholder', label:'Stakeholder Influence' },
  { key:'developing',  label:'Developing Others' },
  { key:'resilience',  label:'Resilience & Grit' },
  { key:'decision',    label:'Decision Quality' },
];

const AVATAR_COLORS = ['#6366F1','#10B981','#F59E0B','#F43F5E','#3B82F6','#8B5CF6','#06B6D4','#EC4899'];

/* ── SKILL CONTEXT ──────────────────────────────────────── */
const SKILL_CONTEXT = {
  sales:        { JA:'Supports deals under guidance', A:'Manages pipeline independently', SA:'Owns revenue targets', AM:'Coaches team on sales', M:'Drives team revenue growth', SM:'Sets org-level sales strategy' },
  reporting:    { JA:'Pulls standard reports', A:'Builds custom reports', SA:'Defines reporting frameworks', AM:'Derives insights for strategy', M:'Governs data quality across team', SM:'Creates org-wide reporting vision' },
  maturity:     { JA:'Professional, follows norms', A:'Self-aware in feedback', SA:'Models maturity for juniors', AM:'Handles ambiguity calmly', M:'Leads through uncertainty', SM:'Shapes culture of maturity' },
  independence: { JA:'Needs check-ins daily', A:'Works autonomously on tasks', SA:'Owns projects end-to-end', AM:'Directs others with autonomy', M:'Sets direction for function', SM:'Operates with full strategic independence' },
  ai:           { JA:'Uses AI tools with help', A:'Integrates AI in daily workflow', SA:'Identifies AI opportunities', AM:'Leads AI initiatives for team', M:'Sets AI adoption strategy', SM:'Drives org-wide AI transformation' },
  xfunc:        { JA:'Works within own team', A:'Collaborates across 1-2 functions', SA:'Partners across multiple teams', AM:'Drives cross-functional projects', M:'Aligns multiple functions', SM:'Builds cross-org partnerships' },
  escalation:   { JA:'Escalates with context', A:'Proposes solutions when escalating', SA:'Resolves most issues independently', AM:'Guides team on escalation judgement', M:'Sets escalation framework', SM:'Rarely needs to escalate; resolves strategically' },
  comms:        { JA:'Clear written & verbal basics', A:'Adapts style to audience', SA:'Influences through communication', AM:'Communicates vision to team', M:'Communicates externally & upward effectively', SM:'Represents org in high-stakes forums' },
  enthusiasm:   { JA:'Shows up positively', A:'Proactively contributes ideas', SA:'Energises team & drives initiatives', AM:'Builds team morale and culture', M:'Champions culture across function', SM:'Is a brand ambassador for the org' },
};
const LEADERSHIP_CONTEXT = {
  people:      { JA:'N/A', A:'N/A', SA:'Begins mentoring juniors', AM:'Manages 1-3 direct reports', M:'Leads team of 5-10', SM:'Leads managers' },
  vision:      { JA:'N/A', A:'N/A', SA:'Understands team goals', AM:'Sets team objectives', M:'Drives function strategy', SM:'Shapes org direction' },
  stakeholder: { JA:'N/A', A:'N/A', SA:'Manages key stakeholders', AM:'Influences senior stakeholders', M:'Partners with leadership', SM:'Board-level relationships' },
  developing:  { JA:'N/A', A:'N/A', SA:'Provides peer coaching', AM:'Runs development plans', M:'Builds leaders within team', SM:'Creates talent pipeline' },
  resilience:  { JA:'N/A', A:'N/A', SA:'Bounces back quickly', AM:'Models resilience under pressure', M:'Sustains team performance in crisis', SM:'Organisational resilience architect' },
  decision:    { JA:'N/A', A:'N/A', SA:'Makes sound independent calls', AM:'Decides under ambiguity', M:'High-stakes decision-making', SM:'Enterprise-level decisions' },
};

/* ── DEVELOPMENT SOLUTIONS ──────────────────────────────── */
const SKILL_SOLUTIONS = {
  sales:        { JA:'Shadow 2 senior calls/week', A:'Own 3 accounts end-to-end', SA:'Set and hit personal revenue target', AM:'Run weekly pipeline reviews with team', M:'Design team incentive structure', SM:'Create sales playbook for org' },
  reporting:    { JA:'Complete Data Basics course', A:'Build one dashboard from scratch', SA:'Define team reporting SLAs', AM:'Present data insights to leadership monthly', M:'Audit team data quality quarterly', SM:'Roll out org-wide analytics platform' },
  maturity:     { JA:'Seek feedback after each client call', A:'Practice structured self-reflection weekly', SA:'Lead by example in difficult conversations', AM:'Take on a stretch assignment outside comfort zone', M:'Coach team through change', SM:'Define maturity standards for org' },
  independence: { JA:'Complete one task with zero check-ins', A:'Own a week-long project solo', SA:'Deliver quarter goal with minimal oversight', AM:'Set OKRs for team independently', M:'Define function roadmap', SM:'Lead org-wide initiative autonomously' },
  ai:           { JA:'Try 2 new AI tools this month', A:'Replace one manual process with AI', SA:'Run team demo of AI workflow', AM:'Set AI adoption goal for team', M:'Launch AI pilot project', SM:'Publish AI strategy for org' },
  xfunc:        { JA:'Join one cross-team meeting', A:'Collaborate on shared project', SA:'Drive one cross-functional initiative', AM:'Lead cross-team working group', M:'Own cross-functional OKRs', SM:'Build partnership framework across functions' },
  escalation:   { JA:'Always include context + attempted solution', A:'Present 2 options when escalating', SA:'Resolve before escalating by default', AM:'Create escalation decision tree for team', M:'Monthly review of team escalation patterns', SM:'Set escalation policy for org' },
  comms:        { JA:'Write one crisp email per stakeholder type', A:'Present in 2 cross-team meetings', SA:'Create communications template for team', AM:'Run monthly team all-hands', M:'Quarterly leadership update deck', SM:'Keynote at org all-hands' },
  enthusiasm:   { JA:'Volunteer for one initiative', A:'Submit one improvement idea per month', SA:'Champion a new initiative from scratch', AM:'Create team recognition rituals', M:'Launch culture programme', SM:'Be visible face of org values' },
};
const LEADERSHIP_SOLUTIONS = {
  people:      { SA:'Start 1:1s with one junior weekly', AM:'Read "Radical Candor", give structured feedback', M:'Complete leadership coaching programme', SM:'Build succession plan for each direct report' },
  vision:      { SA:'Write team vision doc for next quarter', AM:'Run team strategy session', M:'Create 6-month function roadmap', SM:'Co-create org 3-year strategy with exec' },
  stakeholder: { SA:'Map top 5 stakeholders and meet monthly', AM:'Present to VP-level quarterly', M:'Join cross-org steering committee', SM:'Build exec relationships proactively' },
  developing:  { SA:'Create development plan for one junior', AM:'Run monthly skills workshops', M:'Design team rotation programme', SM:'Launch mentorship programme across org' },
  resilience:  { SA:'Journal after setbacks; identify patterns', AM:'Lead through one major change project', M:'Run resilience workshops for team', SM:'Shape org change management capability' },
  decision:    { SA:'Document reasoning for major decisions', AM:'Use RACI for all team decisions', M:'Review decision quality monthly in retros', SM:'Implement decision-making framework org-wide' },
};

/* ── DEFAULT SCORES BY LEVEL ────────────────────────────── */
const DEFAULT_SCORES = {
  JA: { sales:48, reporting:45, maturity:50, independence:42, ai:55, xfunc:40, escalation:48, comms:50, enthusiasm:60 },
  A:  { sales:58, reporting:55, maturity:60, independence:55, ai:62, xfunc:52, escalation:58, comms:62, enthusiasm:68 },
  SA: { sales:68, reporting:65, maturity:70, independence:66, ai:72, xfunc:64, escalation:68, comms:70, enthusiasm:75 },
  AM: { sales:75, reporting:72, maturity:78, independence:74, ai:78, xfunc:72, escalation:75, comms:76, enthusiasm:80 },
  M:  { sales:82, reporting:80, maturity:85, independence:82, ai:84, xfunc:80, escalation:82, comms:84, enthusiasm:88 },
  SM: { sales:88, reporting:86, maturity:90, independence:88, ai:90, xfunc:86, escalation:88, comms:90, enthusiasm:92 },
};
const DEFAULT_LEADERSHIP = {
  JA: { people:0,  vision:0,  stakeholder:0,  developing:0,  resilience:0,  decision:0  },
  A:  { people:0,  vision:0,  stakeholder:0,  developing:0,  resilience:0,  decision:0  },
  SA: { people:58, vision:52, stakeholder:55, developing:50, resilience:62, decision:58 },
  AM: { people:70, vision:65, stakeholder:68, developing:64, resilience:72, decision:70 },
  M:  { people:80, vision:76, stakeholder:78, developing:75, resilience:82, decision:79 },
  SM: { people:88, vision:84, stakeholder:86, developing:83, resilience:88, decision:86 },
};

/* ── SEED DATA ──────────────────────────────────────────── */
const SEED_MEMBERS = [
  { id:'m1', name:'Priya Sharma',  level:'SA', pin:'0000' },
  { id:'m2', name:'Rohan Mehta',   level:'A',  pin:'0000' },
  { id:'m3', name:'Ananya Iyer',   level:'AM', pin:'0000' },
  { id:'m4', name:'Karan Patel',   level:'JA', pin:'0000' },
  { id:'m5', name:'Divya Nair',    level:'SA', pin:'0000' },
  { id:'m6', name:'Arjun Singh',   level:'M',  pin:'0000' },
  { id:'m7', name:'Sneha Rao',     level:'A',  pin:'0000' },
  { id:'m8', name:'Vikram Gupta',  level:'AM', pin:'0000' },
];

/* ── STORAGE ────────────────────────────────────────────── */
function load(key, def) { try { return JSON.parse(localStorage.getItem(key)) ?? def; } catch { return def; } }
function save(key, val)  { localStorage.setItem(key, JSON.stringify(val)); }
function getMembers()    { return load('gjc_members', []); }
function saveMembers(m)  { save('gjc_members', m); }
function getPending()    { return load('gjc_pending', []); }
function savePending(p)  { save('gjc_pending', p); }
function getApproved()   { return load('gjc_approved', []); }
function saveApproved(a) { save('gjc_approved', a); }

function initData() {
  let members = getMembers();
  if (!members.length) {
    members = SEED_MEMBERS.map((s, i) => {
      const snaps = [];
      // seed 4 historical snapshots spread over ~3 months
      [90, 60, 30, 0].forEach(daysAgo => snaps.push(makeSnap(s.level, daysAgo)));
      return { ...s, color: AVATAR_COLORS[i % AVATAR_COLORS.length], history: snaps };
    });
    saveMembers(members);
  } else {
    members = members.map((m, i) => ({ color: AVATAR_COLORS[i % AVATAR_COLORS.length], ...m }));
    saveMembers(members);
  }
}

function makeSnap(level, daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const skills = {};
  const leadership = {};
  Object.keys(DEFAULT_SCORES[level]).forEach(k => {
    skills[k] = Math.min(100, Math.max(0, DEFAULT_SCORES[level][k] + Math.round((Math.random() - .5) * 12)));
  });
  Object.keys(DEFAULT_LEADERSHIP[level]).forEach(k => {
    const base = DEFAULT_LEADERSHIP[level][k];
    leadership[k] = base > 0 ? Math.min(100, Math.max(0, base + Math.round((Math.random() - .5) * 12))) : 0;
  });
  return { date: d.toISOString(), skills, leadership, note: '', comments: {}, overall: calcOverall(skills, leadership, level) };
}

/* ── SCORE HELPERS ──────────────────────────────────────── */
function avg(obj) {
  const vals = Object.values(obj).filter(v => v > 0);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}
function calcOverall(skills, leadership, level) {
  const w = LEADERSHIP_WEIGHT[level] || 0;
  if (w === 0) return avg(skills);
  const ldrVals = Object.values(leadership).filter(v => v > 0);
  const avgL = ldrVals.length ? ldrVals.reduce((a, b) => a + b, 0) / ldrVals.length : 0;
  return Math.round(avg(skills) * (1 - w) + avgL * w);
}
function scoreStatus(s) {
  if (s >= 85) return 'high';
  if (s >= 70) return 'track';
  if (s >= 45) return 'dev';
  return 'needs';
}
function statusLabel(s) {
  return { high:'High Performer', track:'On Track', dev:'Developing', needs:'Needs Attention' }[scoreStatus(s)];
}
function statusClass(s) {
  return { high:'st-high', track:'st-track', dev:'st-dev', needs:'st-needs' }[scoreStatus(s)];
}
function statusColor(s) {
  return { high:'#10B981', track:'#3B82F6', dev:'#F59E0B', needs:'#F43F5E' }[scoreStatus(s)];
}
function skColor(v) {
  if (v >= 85) return ['#10B981', '#ECFDF5'];
  if (v >= 70) return ['#3B82F6', '#EFF6FF'];
  if (v >= 45) return ['#F59E0B', '#FFFBEB'];
  return ['#F43F5E', '#FFF1F2'];
}
function isPromoCandidate(member) {
  const h = member.history;
  if (h.length < 3) return false;
  const last3 = h.slice(-3);
  const thr = THRESHOLDS[member.level];
  if (!last3.every(s => s.overall >= thr)) return false;
  return !Object.values(last3[last3.length - 1].skills).some(v => v < 45);
}
function initials(name) { return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
function fmtDate(iso)   { return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }); }

/* ── ROUTER ─────────────────────────────────────────────── */
let currentRole = 'manager';
function setRole(role) {
  currentRole = role;
  ['manager','member','peer','workflow'].forEach(r => {
    document.getElementById('view-' + r).style.display = r === role ? '' : 'none';
    document.getElementById('tab-' + r)?.classList.toggle('active', r === role);
  });
  if (role === 'manager')  renderManager();
  if (role === 'member')   renderMember();
  if (role === 'peer')     renderPeer();
  if (role === 'workflow') renderWorkflow();
}

/* ── TOAST ──────────────────────────────────────────────── */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ════════════════════════════════════════════════════════
   MANAGER VIEW
   ════════════════════════════════════════════════════════ */
let teamChartInst   = null;
let radarChartInst  = null;
let selectedMemberId = null;
let chartPeriod     = 'all';

function renderManager() {
  const el = document.getElementById('view-manager');
  if (!sessionStorage.getItem('gjc_mgr_authed')) { renderManagerPin(el); return; }
  initData();
  const members = getMembers();
  el.innerHTML = `<div class="mgr-page">
    <div id="kpi-section"></div>
    <div id="team-chart-section"></div>
    <div id="team-scoring-section"></div>
    <div id="deep-dive-section"></div>
    <div id="pending-section"></div>
  </div>`;
  buildKPISection(members);
  buildTeamChartSection(members);
  buildTeamScoringSection(members);
  buildPendingSection();
}

/* ── KPI CUTS ───────────────────────────────────────────── */
function buildKPISection(members) {
  const scores = members.map(m => m.history[m.history.length - 1]?.overall ?? 0);
  const teamAvg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const high   = scores.filter(s => s >= 85).length;
  const track  = scores.filter(s => s >= 70 && s < 85).length;
  const needs  = scores.filter(s => s < 70).length;
  const promo  = members.filter(isPromoCandidate).length;

  document.getElementById('kpi-section').innerHTML = `
    <div class="section-label">Dashboard Cuts</div>
    <div class="kpi-row">
      <div class="kpi-card" style="--accent:#6366F1">
        <div class="kpi-label">Team Average</div>
        <div class="kpi-value">${teamAvg}<span style="font-size:16px;font-weight:500">%</span></div>
        <div class="kpi-sub">${members.length} members tracked</div>
      </div>
      <div class="kpi-card" style="--accent:#10B981">
        <div class="kpi-label">High Performers</div>
        <div class="kpi-value">${high}</div>
        <div class="kpi-sub">Score ≥ 85%</div>
        <span class="kpi-badge" style="background:#ECFDF5;color:#065F46">${Math.round(high/members.length*100)}% of team</span>
      </div>
      <div class="kpi-card" style="--accent:#3B82F6">
        <div class="kpi-label">On Track</div>
        <div class="kpi-value">${track}</div>
        <div class="kpi-sub">Score 70–84%</div>
        <span class="kpi-badge" style="background:#EFF6FF;color:#1D4ED8">${Math.round(track/members.length*100)}% of team</span>
      </div>
      <div class="kpi-card" style="--accent:#F43F5E">
        <div class="kpi-label">Needs Attention</div>
        <div class="kpi-value">${needs}</div>
        <div class="kpi-sub">Score &lt; 70%</div>
        ${needs ? `<span class="kpi-badge" style="background:#FFF1F2;color:#9F1239">⚠ Review needed</span>` : `<span class="kpi-badge" style="background:#ECFDF5;color:#065F46">✓ All clear</span>`}
      </div>
      <div class="kpi-card" style="--accent:#F59E0B">
        <div class="kpi-label">Promo Candidates</div>
        <div class="kpi-value">${promo}</div>
        <div class="kpi-sub">Threshold sustained 3+ cycles</div>
        ${promo ? `<span class="kpi-badge" style="background:#FEF3C7;color:#92400E">🏆 Ready to promote</span>` : ''}
      </div>
    </div>`;
}

/* ── TEAM CHART ─────────────────────────────────────────── */
function buildTeamChartSection(members) {
  const tabs = ['2W','1M','3M','6M','1Y','All'];
  document.getElementById('team-chart-section').innerHTML = `
    <div class="section-label">Team Progress</div>
    <div class="chart-card">
      <div class="chart-header">
        <div class="chart-title">Score Trend — All Members</div>
        <div class="period-tabs">
          ${tabs.map(p => `<button class="period-tab${(chartPeriod===p.toLowerCase()||(chartPeriod==='all'&&p==='All'))?' active':''}" onclick="setTeamPeriod('${p.toLowerCase()}')">${p}</button>`).join('')}
        </div>
      </div>
      <div class="chart-wrap"><canvas id="teamChart"></canvas></div>
    </div>`;
  drawTeamChart(members);
}

function setTeamPeriod(p) {
  chartPeriod = p;
  buildTeamChartSection(getMembers());
}

function drawTeamChart(members) {
  if (teamChartInst) { teamChartInst.destroy(); teamChartInst = null; }
  const ctx = document.getElementById('teamChart')?.getContext('2d');
  if (!ctx) return;

  const cutoff = new Date();
  if      (chartPeriod === '2w') cutoff.setDate(cutoff.getDate() - 14);
  else if (chartPeriod === '1m') cutoff.setMonth(cutoff.getMonth() - 1);
  else if (chartPeriod === '3m') cutoff.setMonth(cutoff.getMonth() - 3);
  else if (chartPeriod === '6m') cutoff.setMonth(cutoff.getMonth() - 6);
  else if (chartPeriod === '1y') cutoff.setFullYear(cutoff.getFullYear() - 1);
  else cutoff.setFullYear(2000);

  const datasets = members.map((m, i) => {
    let filtered = m.history.filter(h => new Date(h.date) >= cutoff);
    if (filtered.length < 2) filtered = m.history.slice(-4);
    return {
      label: m.name.split(' ')[0],
      data: filtered.map(h => ({
        x: new Date(h.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' }),
        y: h.overall,
      })),
      borderColor: m.color || AVATAR_COLORS[i % AVATAR_COLORS.length],
      backgroundColor: (m.color || AVATAR_COLORS[i % AVATAR_COLORS.length]) + '18',
      tension: .4, borderWidth: 2, pointRadius: 4, fill: false,
    };
  });

  teamChartInst = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      interaction: { mode:'index', intersect:false },
      plugins: {
        legend: { position:'bottom', labels:{ usePointStyle:true, padding:14, font:{size:11} } },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y}%` } },
      },
      scales: {
        x: { type:'category', grid:{display:false}, ticks:{font:{size:11}} },
        y: { min:0, max:100, grid:{color:'#F1F5F9'}, ticks:{ callback:v=>v+'%', font:{size:11} } },
      },
    },
  });
}

/* ── TEAM SCORING TABLE ─────────────────────────────────── */
function buildTeamScoringSection(members) {
  const rows = members.map(m => {
    const latest = m.history[m.history.length - 1] || {};
    const score  = latest.overall ?? 0;
    const [col]  = skColor(score);
    const isPromo = isPromoCandidate(m);
    return `
      <tr data-id="${m.id}" onclick="selectMember('${m.id}')" ${selectedMemberId===m.id?'class="selected-row"':''}>
        <td>
          <div class="member-cell">
            <div class="member-avatar-sm" style="background:${m.color}">${initials(m.name)}</div>
            <div>
              <div class="member-cell-name">${m.name}</div>
              <div class="member-cell-level">${LEVEL_NAMES[m.level]}</div>
            </div>
          </div>
        </td>
        <td><span class="lvl-badge">${m.level}</span></td>
        <td>
          <div class="score-bar-wrap">
            <div class="score-bar-bg">
              <div class="score-bar-fill" style="width:${score}%;background:${col}"></div>
            </div>
            <div class="score-num" style="color:${col}">${score}%</div>
          </div>
        </td>
        <td>
          <span class="status-chip ${statusClass(score)}">
            <span class="dot"></span>${statusLabel(score)}
          </span>
          ${isPromo ? '<span class="promo-flag" style="margin-left:6px">🏆 Promo Ready</span>' : ''}
        </td>
        <td>${latest.date ? fmtDate(latest.date) : '—'}</td>
        <td style="text-align:center">${m.history.length}</td>
      </tr>`;
  }).join('');

  document.getElementById('team-scoring-section').innerHTML = `
    <div class="section-label">Team Scoring</div>
    <div class="team-table-wrap">
      <div class="team-table-hd">
        <div class="chart-title">All Members · Click any row to deep-dive ↓</div>
      </div>
      <table class="team-table">
        <thead>
          <tr>
            <th>Member</th><th>Level</th>
            <th style="width:240px">Score</th>
            <th>Status</th><th>Last Snapshot</th>
            <th style="text-align:center">Snapshots</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

function selectMember(id) {
  selectedMemberId = id;
  document.querySelectorAll('.team-table tbody tr').forEach(r =>
    r.classList.toggle('selected-row', r.dataset.id === id)
  );
  renderDeepDive(id);
  setTimeout(() => document.getElementById('deep-dive-section')?.scrollIntoView({ behavior:'smooth', block:'start' }), 60);
}

/* ── DEEP-DIVE ──────────────────────────────────────────── */
function renderDeepDive(id) {
  const members = getMembers();
  const m = members.find(x => x.id === id);
  if (!m) return;

  const latest  = m.history[m.history.length - 1] || { skills:{}, leadership:{}, note:'', comments:{} };
  const prev    = m.history[m.history.length - 2] || null;
  const overall = latest.overall ?? 0;
  const w       = LEADERSHIP_WEIGHT[m.level];
  const hasLdr  = w > 0;

  const skillCards = SKILLS.map((sk, idx) => {
    const val     = latest.skills[sk.key] ?? 50;
    const comment = latest.comments?.[sk.key] ?? '';
    const [col, bg] = skColor(val);
    const ctx  = SKILL_CONTEXT[sk.key]?.[m.level] ?? '';
    const hint = SKILL_SOLUTIONS[sk.key]?.[m.level] ?? '';
    const slBg = `linear-gradient(to right,${col} ${val}%,#E2E8F0 ${val}%)`;
    return `
      <div class="skill-card" id="sc-${sk.key}"
           style="--sk-color:${col};--sk-bg:${bg};--slider-bg:${slBg}">
        <div class="skill-card-top">
          <div class="skill-card-name">${sk.label}</div>
          <div class="skill-score-badge" id="badge-${sk.key}">${val}%</div>
        </div>
        <div class="skill-context">${ctx}</div>
        <div class="skill-slider-wrap">
          <input type="range" class="skill-slider" min="0" max="100" value="${val}"
            data-key="${sk.key}" data-idx="${idx}" data-type="skill"
            oninput="syncSlider(this,'${id}')"
            style="--sk-color:${col};--slider-bg:${slBg}">
        </div>
        <button class="comment-toggle-btn" onclick="toggleComment('cbox-${sk.key}',this)">
          <span class="toggle-icon">${comment ? '✏️' : '💬'}</span>
          <span>${comment ? 'Edit Comment' : 'Add Comment'}</span>
        </button>
        <div class="comment-box${comment ? ' open' : ''}" id="cbox-${sk.key}">
          <textarea data-key="${sk.key}" data-type="comment"
            placeholder="${hint}">${comment}</textarea>
          <div class="comment-hint">Suggested action: ${hint}</div>
        </div>
      </div>`;
  }).join('');

  const ldrCards = LEADERSHIP.map(lk => {
    const val     = latest.leadership?.[lk.key] ?? 0;
    const comment = latest.comments?.['ldr_' + lk.key] ?? '';
    const [col, bg] = skColor(val || 50);
    const ctx  = LEADERSHIP_CONTEXT[lk.key]?.[m.level] ?? 'N/A';
    const hint = LEADERSHIP_SOLUTIONS[lk.key]?.[m.level] ?? '';
    const slBg = hasLdr ? `linear-gradient(to right,${col} ${val}%,#E2E8F0 ${val}%)` : '#E2E8F0';
    return `
      <div class="skill-card${hasLdr ? '' : ' disabled'}" id="sc-ldr-${lk.key}"
           style="--sk-color:${col};--sk-bg:${bg};--slider-bg:${slBg}">
        <div class="skill-card-top">
          <div class="skill-card-name">${lk.label}</div>
          <div class="skill-score-badge" id="badge-ldr-${lk.key}">${hasLdr ? val + '%' : 'N/A'}</div>
        </div>
        <div class="skill-context">${ctx}</div>
        ${hasLdr ? `
        <div class="skill-slider-wrap">
          <input type="range" class="skill-slider" min="0" max="100" value="${val}"
            data-key="${lk.key}" data-idx="0" data-type="leadership"
            oninput="syncSlider(this,'${id}')"
            style="--sk-color:${col};--slider-bg:${slBg}">
        </div>
        <button class="comment-toggle-btn" onclick="toggleComment('cbox-ldr-${lk.key}',this)">
          <span class="toggle-icon">${comment ? '✏️' : '💬'}</span>
          <span>${comment ? 'Edit Comment' : 'Add Comment'}</span>
        </button>
        <div class="comment-box${comment ? ' open' : ''}" id="cbox-ldr-${lk.key}">
          <textarea data-key="ldr_${lk.key}" data-type="comment"
            placeholder="${hint}">${comment}</textarea>
          <div class="comment-hint">Suggested action: ${hint}</div>
        </div>` : ''}
      </div>`;
  }).join('');

  // dev plan
  const weakSkills = SKILLS.filter(sk => (latest.skills[sk.key] ?? 50) < 65);
  const devPlan = weakSkills.length ? `
    <div class="devplan-card">
      <div class="devplan-title">📋 Development Focus Areas</div>
      ${weakSkills.map(sk => `
        <div class="devplan-item">
          <strong>${sk.label}</strong>
          <span>${SKILL_SOLUTIONS[sk.key]?.[m.level] ?? ''}</span>
        </div>`).join('')}
    </div>` : '';

  const radarCurrent = SKILLS.map(sk => latest.skills[sk.key] ?? 50);
  const radarPrev    = prev ? SKILLS.map(sk => prev.skills[sk.key] ?? 50) : null;

  document.getElementById('deep-dive-section').innerHTML = `
    <div class="section-label">Individual Deep-Dive</div>
    <div class="deep-dive">
      <!-- Header -->
      <div class="deep-dive-hd">
        <div class="dive-member">
          <div class="dive-avatar" style="background:${m.color}">${initials(m.name)}</div>
          <div>
            <div class="dive-name">${m.name}</div>
            <div class="dive-meta">${LEVEL_NAMES[m.level]} · ${m.level} · ${m.history.length} snapshot${m.history.length!==1?'s':''}</div>
          </div>
        </div>
        <div class="dive-overall">
          <div class="dive-score" id="dive-score">${overall}%</div>
          <div class="dive-score-label" id="dive-score-lbl">${statusLabel(overall)}</div>
        </div>
      </div>

      <div class="deep-dive-body">
        <!-- Journey -->
        <div>
          <div class="section-label" style="margin-bottom:10px">Growth Journey</div>
          ${buildJourneyMap(m)}
        </div>

        <!-- Radar + skills -->
        <div class="dive-grid">
          <div class="radar-card">
            <div class="radar-card-title">Skills Web</div>
            <div class="radar-wrap"><canvas id="radarChart"></canvas></div>
            <div class="radar-legend">
              <div class="radar-legend-item"><div class="radar-legend-dot" style="background:#6366F1"></div>Current</div>
              ${radarPrev ? '<div class="radar-legend-item"><div class="radar-legend-dot" style="background:#CBD5E1"></div>Previous</div>' : ''}
            </div>
          </div>

          <div class="skills-section">
            <div class="skill-section-label">Core Skills</div>
            <div class="skill-cards-grid">${skillCards}</div>

            <div class="ldr-banner">
              🎯 <strong>Leadership Weight: ${Math.round(w * 100)}%</strong> of overall score
              ${!hasLdr ? '— unlocks from Senior Associate (SA) onwards' : ''}
            </div>

            ${hasLdr ? `
            <div class="skill-section-label">Leadership Competencies</div>
            <div class="skill-cards-grid">${ldrCards}</div>` : ''}
          </div>
        </div>

        ${devPlan}

        <!-- Manager note & save -->
        <div class="save-row">
          <label>Manager Note (saved with snapshot)</label>
          <textarea id="mgr-note" placeholder="Coaching notes, context, next steps…">${latest.note || ''}</textarea>
          <div class="save-actions">
            <button class="btn-ghost" onclick="document.getElementById('deep-dive-section').innerHTML=''">Close</button>
            <button class="btn-primary" onclick="saveSnapshot('${id}')">💾 Save Snapshot</button>
          </div>
        </div>
      </div>
    </div>`;

  drawRadar(radarCurrent, radarPrev);
}

/* ── JOURNEY MAP ────────────────────────────────────────── */
function buildJourneyMap(member) {
  const idx = LEVELS.indexOf(member.level);
  return `<div class="jmap">` + LEVELS.map((lv, i) => {
    let cls = '';
    if (i < idx) cls = 'done';
    else if (i === idx) cls = 'current';
    else if (i === idx + 1) cls = 'next-step';
    else if (i === idx + 2) cls = 'goal';
    const tag = i === idx ? '<br><span style="font-size:9px;color:#6366F1;font-weight:700">YOU</span>' :
                i === idx+1 ? '<br><span style="font-size:9px;color:#F59E0B;font-weight:700">NEXT</span>' :
                i === idx+2 ? '<br><span style="font-size:9px;color:#10B981;font-weight:700">GOAL</span>' : '';
    return `
      ${i > 0 ? `<div class="jm-connector${i <= idx ? ' done' : ''}"></div>` : ''}
      <div class="jm-node ${cls}">
        <div class="jm-circle">${lv}</div>
        <div class="jm-label">${lv}${tag}</div>
      </div>`;
  }).join('') + `</div>`;
}

/* ── SLIDER SYNC ────────────────────────────────────────── */
function syncSlider(el, memberId) {
  const val  = parseInt(el.value);
  const key  = el.dataset.key;
  const type = el.dataset.type;
  const [col, bg] = skColor(val);
  const slBg = `linear-gradient(to right,${col} ${val}%,#E2E8F0 ${val}%)`;

  el.style.setProperty('--slider-bg', slBg);
  el.style.setProperty('--sk-color', col);

  const badgeId = type === 'leadership' ? `badge-ldr-${key}` : `badge-${key}`;
  const badge = document.getElementById(badgeId);
  if (badge) { badge.textContent = val + '%'; badge.style.background = bg; badge.style.color = col; }

  const cardId = type === 'leadership' ? `sc-ldr-${key}` : `sc-${key}`;
  const card = document.getElementById(cardId);
  if (card) { card.style.setProperty('--sk-color', col); card.style.borderLeftColor = col; }

  // live radar update (skills only)
  if (radarChartInst && type === 'skill') {
    const idx = SKILLS.findIndex(s => s.key === key);
    if (idx >= 0) { radarChartInst.data.datasets[0].data[idx] = val; radarChartInst.update('none'); }
  }

  recomputeOverall(memberId);
}

function recomputeOverall(memberId) {
  const members = getMembers();
  const m = members.find(x => x.id === memberId);
  if (!m) return;
  const skills = {};
  SKILLS.forEach(sk => {
    const el = document.querySelector(`input[data-key="${sk.key}"][data-type="skill"]`);
    skills[sk.key] = el ? parseInt(el.value) : (m.history[m.history.length-1]?.skills[sk.key] ?? 50);
  });
  const leadership = {};
  LEADERSHIP.forEach(lk => {
    const el = document.querySelector(`input[data-key="${lk.key}"][data-type="leadership"]`);
    leadership[lk.key] = el ? parseInt(el.value) : (m.history[m.history.length-1]?.leadership[lk.key] ?? 0);
  });
  const o = calcOverall(skills, leadership, m.level);
  const scoreEl = document.getElementById('dive-score');
  const lblEl   = document.getElementById('dive-score-lbl');
  if (scoreEl) scoreEl.textContent = o + '%';
  if (lblEl)   lblEl.textContent   = statusLabel(o);
}

/* ── TOGGLE COMMENT BOX ─────────────────────────────────── */
function toggleComment(boxId, btn) {
  const box = document.getElementById(boxId);
  if (!box) return;
  const open = box.classList.toggle('open');
  const icon = btn.querySelector('.toggle-icon');
  const lbl  = btn.querySelector('span:last-child');
  if (icon) icon.textContent = open ? '✏️' : '💬';
  if (lbl)  lbl.textContent  = open ? 'Hide Comment' : (lbl.textContent.includes('Edit') ? 'Edit Comment' : 'Add Comment');
}

/* ── SAVE SNAPSHOT ──────────────────────────────────────── */
function saveSnapshot(id) {
  const members = getMembers();
  const m = members.find(x => x.id === id);
  if (!m) return;

  const skills = {};
  SKILLS.forEach(sk => {
    const el = document.querySelector(`input[data-key="${sk.key}"][data-type="skill"]`);
    skills[sk.key] = el ? parseInt(el.value) : (m.history[m.history.length-1]?.skills[sk.key] ?? 50);
  });
  const leadership = {};
  LEADERSHIP.forEach(lk => {
    const el = document.querySelector(`input[data-key="${lk.key}"][data-type="leadership"]`);
    leadership[lk.key] = el ? parseInt(el.value) : (m.history[m.history.length-1]?.leadership[lk.key] ?? 0);
  });

  // Collect comments
  const comments = {};
  document.querySelectorAll('.comment-box textarea').forEach(ta => {
    if (ta.dataset.key) comments[ta.dataset.key] = ta.value.trim();
  });

  // Validate: weak skills (< 45) must have comment
  const weakNoComment = SKILLS.filter(sk => (skills[sk.key] ?? 50) < 45 && !comments[sk.key]);
  if (weakNoComment.length) {
    toast(`⚠ Add a comment for: ${weakNoComment.map(s => s.label).join(', ')}`);
    weakNoComment.forEach(sk => document.getElementById(`cbox-${sk.key}`)?.classList.add('open'));
    return;
  }

  const note    = document.getElementById('mgr-note')?.value?.trim() ?? '';
  const overall = calcOverall(skills, leadership, m.level);
  m.history.push({ date: new Date().toISOString(), skills, leadership, note, comments, overall });
  saveMembers(members);
  toast('✅ Snapshot saved!');

  const updatedMembers = getMembers();
  buildKPISection(updatedMembers);
  buildTeamChartSection(updatedMembers);
  buildTeamScoringSection(updatedMembers);
  renderDeepDive(id);
}

/* ── RADAR ──────────────────────────────────────────────── */
function drawRadar(current, prev) {
  if (radarChartInst) { radarChartInst.destroy(); radarChartInst = null; }
  const ctx = document.getElementById('radarChart')?.getContext('2d');
  if (!ctx) return;
  const datasets = [{
    label: 'Current', data: current,
    backgroundColor: 'rgba(99,102,241,.15)',
    borderColor: '#6366F1', borderWidth: 2,
    pointBackgroundColor: '#6366F1', pointRadius: 4,
  }];
  if (prev) {
    datasets.push({
      label: 'Previous', data: prev,
      backgroundColor: 'rgba(203,213,225,.08)',
      borderColor: '#CBD5E1', borderWidth: 1.5,
      pointBackgroundColor: '#CBD5E1', pointRadius: 3,
      borderDash: [4, 3],
    });
  }
  radarChartInst = new Chart(ctx, {
    type: 'radar',
    data: { labels: SKILLS.map(s => s.label.split(' ')[0]), datasets },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { stepSize: 25, font:{size:10}, backdropColor:'transparent', color:'#94A3B8' },
          grid: { color:'#E2E8F0' },
          angleLines: { color:'#E2E8F0' },
          pointLabels: { font:{size:10}, color:'#475569' },
        },
      },
    },
  });
}

/* ── PENDING SECTION ────────────────────────────────────── */
function buildPendingSection() {
  const pending = getPending();
  const members = getMembers();
  const nameMap = Object.fromEntries(members.map(m => [m.id, m.name]));

  const items = pending.length ? pending.map(p => `
    <div class="pending-item">
      <div class="pending-type-icon">${p.type === 'achievement' ? '🏅' : '💬'}</div>
      <div class="pending-content">
        <div class="pending-who">${nameMap[p.target] || p.target} · ${p.type === 'achievement' ? p.category : 'Peer Feedback from ' + (nameMap[p.from] || p.from)}</div>
        <div class="pending-text">${p.text}</div>
        <div class="pending-meta">${fmtDate(p.date)}</div>
      </div>
      <div class="pending-actions">
        <button class="btn-approve" onclick="approveItem('${p.id}')">Approve</button>
        <button class="btn-remove"  onclick="removeItem('${p.id}')">Remove</button>
      </div>
    </div>`).join('') : `<div class="empty-state"><div class="empty-icon">✅</div>No pending items — inbox zero!</div>`;

  document.getElementById('pending-section').innerHTML = `
    <div class="section-label">Pending Approvals</div>
    <div class="pending-section">
      <div class="pending-hd">
        <div class="pending-hd-title">Approval Queue</div>
        ${pending.length ? `<span class="badge-count">${pending.length}</span>` : ''}
      </div>
      <div class="pending-list">${items}</div>
    </div>`;
}

function approveItem(pid) {
  let pending = getPending();
  const item = pending.find(p => p.id === pid);
  if (!item) return;
  savePending(pending.filter(p => p.id !== pid));
  const approved = getApproved();
  approved.push({ ...item, approvedDate: new Date().toISOString() });
  saveApproved(approved);
  buildPendingSection();
  toast('✅ Approved!');
}
function removeItem(pid) {
  savePending(getPending().filter(p => p.id !== pid));
  buildPendingSection();
  toast('🗑 Removed');
}

/* ── MANAGER PIN ────────────────────────────────────────── */
function renderManagerPin(el) {
  el.innerHTML = `
    <div class="pin-overlay">
      <div class="pin-card">
        <div class="pin-icon">🔐</div>
        <h2>Manager Access</h2>
        <p>Enter your 4-digit PIN to continue</p>
        <div class="pin-dots" id="mgr-dots">
          ${[0,1,2,3].map(() => '<div class="pin-dot"></div>').join('')}
        </div>
        <div class="pin-keypad">
          ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-key" onclick="mgrKey(${n})">${n}</button>`).join('')}
          <button class="pin-key wide" onclick="mgrKey(0)">0</button>
          <button class="pin-key" onclick="mgrBack()">⌫</button>
        </div>
        <div class="pin-error" id="mgr-pin-err"></div>
        <div style="margin-top:14px;font-size:11px;color:var(--subtle)">Default PIN: 1234</div>
      </div>
    </div>`;
  window._mgrPin = '';
}
function mgrKey(n) {
  if ((window._mgrPin || '').length >= 4) return;
  window._mgrPin = (window._mgrPin || '') + n;
  updatePinDots('mgr-dots', window._mgrPin.length);
  if (window._mgrPin.length === 4) checkMgrPin();
}
function mgrBack() {
  window._mgrPin = (window._mgrPin || '').slice(0, -1);
  updatePinDots('mgr-dots', window._mgrPin.length);
}
function updatePinDots(id, count) {
  document.querySelectorAll(`#${id} .pin-dot`).forEach((d, i) => d.classList.toggle('filled', i < count));
}
function checkMgrPin() {
  const stored = load('gjc_mgr_pin', '1234');
  if (window._mgrPin === stored) {
    sessionStorage.setItem('gjc_mgr_authed', '1');
    renderManager();
  } else {
    const errEl = document.getElementById('mgr-pin-err');
    if (errEl) errEl.textContent = 'Incorrect PIN — try again';
    setTimeout(() => {
      window._mgrPin = '';
      updatePinDots('mgr-dots', 0);
      if (errEl) errEl.textContent = '';
    }, 1200);
  }
}

/* ════════════════════════════════════════════════════════
   MEMBER VIEW
   ════════════════════════════════════════════════════════ */
function renderMember() {
  const el = document.getElementById('view-member');
  const authedId = sessionStorage.getItem('gjc_mbr_authed');
  if (!authedId) { renderMemberSelect(el); return; }
  const members = getMembers();
  const m = members.find(x => x.id === authedId);
  if (!m) { sessionStorage.removeItem('gjc_mbr_authed'); renderMemberSelect(el); return; }
  renderMemberDashboard(el, m);
}

function renderMemberSelect(el) {
  const members = getMembers();
  el.innerHTML = `
    <div class="member-select-overlay">
      <div class="member-select-card">
        <h2>My Journey</h2>
        <p>Select your name to sign in</p>
        <div class="member-pick-grid">
          ${members.map(m => `
            <button class="member-pick-btn" onclick="startMemberLogin('${m.id}')">
              <div class="member-avatar-sm" style="background:${m.color}">${initials(m.name)}</div>
              <div>
                <div style="font-weight:600">${m.name}</div>
                <div style="font-size:11px;color:var(--muted)">${m.level} · ${LEVEL_NAMES[m.level]}</div>
              </div>
            </button>`).join('')}
        </div>
      </div>
    </div>`;
}

function startMemberLogin(id) {
  const el = document.getElementById('view-member');
  el.innerHTML = `
    <div class="pin-overlay">
      <div class="pin-card">
        <div class="pin-icon">🔑</div>
        <h2>Enter PIN</h2>
        <p>Your personal 4-digit PIN</p>
        <div class="pin-dots" id="mbr-dots">
          ${[0,1,2,3].map(() => '<div class="pin-dot"></div>').join('')}
        </div>
        <div class="pin-keypad">
          ${[1,2,3,4,5,6,7,8,9].map(n => `<button class="pin-key" onclick="mbrKey(${n},'${id}')">${n}</button>`).join('')}
          <button class="pin-key wide" onclick="mbrKey(0,'${id}')">0</button>
          <button class="pin-key" onclick="mbrBack()">⌫</button>
        </div>
        <div class="pin-error" id="mbr-pin-err"></div>
        <div style="margin-top:10px;font-size:11px;color:var(--subtle)">Default PIN: 0000</div>
        <button onclick="renderMemberSelect(document.getElementById('view-member'))"
          style="margin-top:12px;font-size:12px;color:var(--muted);background:none;text-decoration:underline;border:none;cursor:pointer">
          ← Back to member list
        </button>
      </div>
    </div>`;
  window._mbrPin = '';
  window._mbrId  = id;
}
function mbrKey(n, id) {
  if ((window._mbrPin || '').length >= 4) return;
  window._mbrPin = (window._mbrPin || '') + n;
  updatePinDots('mbr-dots', window._mbrPin.length);
  if (window._mbrPin.length === 4) checkMbrPin(id);
}
function mbrBack() {
  window._mbrPin = (window._mbrPin || '').slice(0, -1);
  updatePinDots('mbr-dots', window._mbrPin.length);
}
function checkMbrPin(id) {
  const members = getMembers();
  const m = members.find(x => x.id === id);
  if (m && window._mbrPin === (m.pin || '0000')) {
    sessionStorage.setItem('gjc_mbr_authed', id);
    renderMember();
  } else {
    const errEl = document.getElementById('mbr-pin-err');
    if (errEl) errEl.textContent = 'Incorrect PIN — try again';
    setTimeout(() => {
      window._mbrPin = '';
      updatePinDots('mbr-dots', 0);
      if (errEl) errEl.textContent = '';
    }, 1200);
  }
}

function renderMemberDashboard(el, m) {
  const latest   = m.history[m.history.length - 1] || { skills:{}, leadership:{} };
  const overall  = latest.overall ?? 0;
  const approved = getApproved().filter(a => a.target === m.id);
  const feedback = approved.filter(a => a.type === 'feedback');
  const achs     = approved.filter(a => a.type === 'achievement');
  const radarData = SKILLS.map(sk => latest.skills[sk.key] ?? 50);

  el.innerHTML = `
    <div class="member-page">
      <div class="mbr-hero">
        <div class="mbr-hero-left">
          <div class="mbr-big-av" style="background:${m.color}">${initials(m.name)}</div>
          <div>
            <div class="mbr-hero-name">${m.name}</div>
            <div class="mbr-hero-sub">${LEVEL_NAMES[m.level]} · ${m.level}</div>
          </div>
        </div>
        <div class="mbr-hero-score">
          <div class="mbr-score-big">${overall}%</div>
          <div class="mbr-score-lbl">${statusLabel(overall)}</div>
        </div>
      </div>

      <div class="mbr-section">
        <div class="mbr-section-hd">Growth Journey</div>
        <div class="mbr-section-body">${buildJourneyMap(m)}</div>
      </div>

      <div class="mbr-section">
        <div class="mbr-section-hd">Skills Web</div>
        <div class="mbr-section-body">
          <div class="radar-full"><canvas id="mbrRadar"></canvas></div>
        </div>
      </div>

      <div class="mbr-section">
        <div class="mbr-section-hd">Approved Achievements</div>
        <div class="mbr-section-body">
          ${achs.length ? achs.map(a => `
            <div class="ach-item">
              <span class="ach-cat">${a.category}</span>
              <span>${a.text}</span>
            </div>`).join('') : '<div style="color:var(--muted);font-size:13px">No achievements yet. Log one below!</div>'}
        </div>
      </div>

      <div class="mbr-section">
        <div class="mbr-section-hd">Peer Feedback</div>
        <div class="mbr-section-body">
          ${feedback.length ? feedback.map(f => `
            <div class="feedback-item feedback-${f.sentiment || 'positive'}">
              ${f.text}
              <div class="feedback-who">From ${f.from} · ${fmtDate(f.date)}</div>
            </div>`).join('') : '<div style="color:var(--muted);font-size:13px">No feedback yet.</div>'}
        </div>
      </div>

      <div class="mbr-section">
        <div class="mbr-section-hd">Log an Achievement</div>
        <div class="mbr-section-body">
          <div class="form-group">
            <label>Category</label>
            <select id="ach-cat">
              <option>Brand/Deal</option><option>AI Initiative</option>
              <option>Cross-functional</option><option>Process Improvement</option>
              <option>Mentoring</option><option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>What did you do and what was the impact?</label>
            <textarea id="ach-text" placeholder="e.g. Led cross-team AI automation that saved 4hrs/week"></textarea>
          </div>
          <button class="btn-primary" onclick="submitAchievement('${m.id}')">Submit for Approval</button>
        </div>
      </div>

      <button onclick="sessionStorage.removeItem('gjc_mbr_authed');renderMember()"
        class="btn-ghost" style="align-self:flex-start">← Switch User</button>
    </div>`;

  setTimeout(() => {
    const ctx = document.getElementById('mbrRadar')?.getContext('2d');
    if (!ctx) return;
    new Chart(ctx, {
      type: 'radar',
      data: {
        labels: SKILLS.map(s => s.label.split(' ')[0]),
        datasets: [{
          label: 'Score', data: radarData,
          backgroundColor: 'rgba(99,102,241,.15)',
          borderColor: '#6366F1', borderWidth: 2,
          pointBackgroundColor: '#6366F1', pointRadius: 4,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: true,
        plugins: { legend:{ display:false } },
        scales: { r: { min:0, max:100, ticks:{stepSize:25,font:{size:10},backdropColor:'transparent',color:'#94A3B8'}, grid:{color:'#E2E8F0'}, angleLines:{color:'#E2E8F0'}, pointLabels:{font:{size:10},color:'#475569'} } },
      },
    });
  }, 80);
}

function submitAchievement(id) {
  const cat  = document.getElementById('ach-cat')?.value;
  const text = document.getElementById('ach-text')?.value?.trim();
  if (!text) { toast('⚠ Please describe your achievement'); return; }
  const pending = getPending();
  pending.push({ id:'p'+Date.now(), type:'achievement', target:id, from:id, category:cat, text, date:new Date().toISOString() });
  savePending(pending);
  toast('✅ Submitted for manager approval!');
  document.getElementById('ach-text').value = '';
}

/* ════════════════════════════════════════════════════════
   PEER VIEW
   ════════════════════════════════════════════════════════ */
function renderPeer() {
  const el = document.getElementById('view-peer');
  const members = getMembers();
  const opts = members.map(m => `<option value="${m.id}">${m.name} (${m.level})</option>`).join('');
  el.innerHTML = `
    <div class="peer-page">
      <div class="peer-card">
        <div class="peer-card-hd">
          <div class="peer-card-title">Give Peer Feedback</div>
          <div class="peer-card-sub">Anonymous, specific & constructive</div>
        </div>
        <div class="peer-card-body">
          <div class="peer-notice">
            ⚠️ You cannot see scores or profiles. Only the manager reviews full assessments.
          </div>
          <div class="form-group">
            <label>Your Name</label>
            <select id="peer-from">${opts}</select>
          </div>
          <div class="form-group">
            <label>Feedback For</label>
            <select id="peer-target">${opts}</select>
          </div>
          <div class="form-group">
            <label>Type</label>
            <select id="peer-sentiment">
              <option value="positive">Positive — something they do brilliantly</option>
              <option value="constructive">Constructive — something to work on</option>
            </select>
          </div>
          <div class="form-group">
            <label>Specific Behaviour (min 20 characters)</label>
            <textarea id="peer-text" placeholder="Describe a specific situation and its impact…"></textarea>
          </div>
          <button class="btn-primary" onclick="submitPeer()">Submit Feedback</button>
        </div>
      </div>
    </div>`;
}

function submitPeer() {
  const from      = document.getElementById('peer-from')?.value;
  const target    = document.getElementById('peer-target')?.value;
  const sentiment = document.getElementById('peer-sentiment')?.value;
  const text      = document.getElementById('peer-text')?.value?.trim();
  if (!text || text.length < 20) { toast('⚠ Write at least 20 characters describing a specific behaviour.'); return; }
  if (from === target) { toast('⚠ You cannot give feedback to yourself.'); return; }
  const pending = getPending();
  pending.push({ id:'p'+Date.now(), type:'feedback', from, target, sentiment, text, date:new Date().toISOString() });
  savePending(pending);
  toast('✅ Feedback submitted for manager review!');
  document.getElementById('peer-text').value = '';
}

/* ════════════════════════════════════════════════════════
   WORKFLOW VIEW
   ════════════════════════════════════════════════════════ */
function renderWorkflow() {
  document.getElementById('view-workflow').innerHTML = `
    <div class="workflow-page">
      <h2>Growth Journey Workflow</h2>
      <img src="workflow.svg" alt="Growth Journey Workflow" style="width:100%;max-width:1100px">
    </div>`;
}

/* ── BOOT ───────────────────────────────────────────────── */
initData();
setRole('manager');
