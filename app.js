/* ═══════════════════════════════════════════════════════════
   Growth Journey Calculator  —  app.js  v5
   Navy + Blue palette · Google Sign-In · Reportees grid
   ═══════════════════════════════════════════════════════════ */

/* ── CONFIG — set your Google Client ID here ──────────────
   Get one at https://console.cloud.google.com/ → OAuth 2.0
   Leave blank for email-only demo mode.
   ─────────────────────────────────────────────────────── */
const GOOGLE_CLIENT_ID = '';           // e.g. '123456-abc.apps.googleusercontent.com'
const MANAGER_EMAIL    = '';           // your work Gmail — blank = accept any during demo

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
const LEADERSHIP = [
  { key:'people',      label:'People Leadership' },
  { key:'vision',      label:'Vision & Strategy' },
  { key:'stakeholder', label:'Stakeholder Influence' },
  { key:'developing',  label:'Developing Others' },
  { key:'resilience',  label:'Resilience & Grit' },
  { key:'decision',    label:'Decision Quality' },
];

const AV_COLORS = ['#2563EB','#059669','#D97706','#DC2626','#7C3AED','#0891B2','#BE185D','#065F46'];

/* ── SKILL CONTEXT ──────────────────────────────────────── */
const SK_CTX = {
  sales:        { JA:'Supports deals under guidance', A:'Manages own pipeline', SA:'Owns revenue targets', AM:'Coaches team on sales', M:'Drives team revenue', SM:'Sets org sales strategy' },
  reporting:    { JA:'Pulls standard reports', A:'Builds custom reports', SA:'Defines reporting frameworks', AM:'Derives strategic insights', M:'Governs data quality', SM:'Org-wide analytics vision' },
  maturity:     { JA:'Professional, follows norms', A:'Self-aware in feedback', SA:'Models maturity for juniors', AM:'Handles ambiguity calmly', M:'Leads through uncertainty', SM:'Shapes culture of maturity' },
  independence: { JA:'Needs daily check-ins', A:'Works autonomously on tasks', SA:'Owns projects end-to-end', AM:'Directs others autonomously', M:'Sets direction for function', SM:'Full strategic independence' },
  ai:           { JA:'Uses AI tools with help', A:'Integrates AI in workflow', SA:'Identifies AI opportunities', AM:'Leads AI initiatives', M:'Sets AI adoption strategy', SM:'Drives org-wide AI transformation' },
  xfunc:        { JA:'Works within own team', A:'Collaborates across 1-2 teams', SA:'Partners across multiple functions', AM:'Drives cross-functional projects', M:'Aligns multiple functions', SM:'Builds cross-org partnerships' },
  escalation:   { JA:'Escalates with context', A:'Proposes solutions when escalating', SA:'Resolves most issues independently', AM:'Guides team on escalation judgement', M:'Sets escalation framework', SM:'Resolves strategically, rarely escalates' },
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

/* ── DEFAULT SCORES ─────────────────────────────────────── */
const DEF_SKILLS = {
  JA: { sales:48, reporting:45, maturity:50, independence:42, ai:55, xfunc:40, escalation:48, comms:50, enthusiasm:60 },
  A:  { sales:58, reporting:55, maturity:60, independence:55, ai:62, xfunc:52, escalation:58, comms:62, enthusiasm:68 },
  SA: { sales:68, reporting:65, maturity:70, independence:66, ai:72, xfunc:64, escalation:68, comms:70, enthusiasm:75 },
  AM: { sales:75, reporting:72, maturity:78, independence:74, ai:78, xfunc:72, escalation:75, comms:76, enthusiasm:80 },
  M:  { sales:82, reporting:80, maturity:85, independence:82, ai:84, xfunc:80, escalation:82, comms:84, enthusiasm:88 },
  SM: { sales:88, reporting:86, maturity:90, independence:88, ai:90, xfunc:86, escalation:88, comms:90, enthusiasm:92 },
};
const DEF_LDR = {
  JA: { people:0, vision:0, stakeholder:0, developing:0, resilience:0, decision:0 },
  A:  { people:0, vision:0, stakeholder:0, developing:0, resilience:0, decision:0 },
  SA: { people:58, vision:52, stakeholder:55, developing:50, resilience:62, decision:58 },
  AM: { people:70, vision:65, stakeholder:68, developing:64, resilience:72, decision:70 },
  M:  { people:80, vision:76, stakeholder:78, developing:75, resilience:82, decision:79 },
  SM: { people:88, vision:84, stakeholder:86, developing:83, resilience:88, decision:86 },
};

/* ── SEED ───────────────────────────────────────────────── */
const SEED = [
  { id:'m1', name:'Anam Imteyaz',          level:'JA', email:'anam@example.com',     role:'Emerging Business' },
  { id:'m2', name:'Chandel Yajat',         level:'A',  email:'chandel@example.com',  role:'Enterprise Sales' },
  { id:'m3', name:'Suman Soumya Dash',     level:'AM', email:'suman@example.com',    role:'Startup Hunting' },
  { id:'m4', name:'Harsha Thomas John',    level:'SA', email:'harsha@example.com',   role:'Emerging Business' },
  { id:'m5', name:'Kirubhavani B',         level:'A',  email:'kirub@example.com',    role:'Inside Sales' },
  { id:'m6', name:'Priyanka Pati',         level:'A',  email:'priyanka@example.com', role:'Business Development' },
  { id:'m7', name:'Mary L. Pulamte',       level:'JA', email:'mary@example.com',     role:'Emerging Business Ops' },
  { id:'m8', name:'Milind Singh Bora',     level:'A',  email:'milind@example.com',   role:'Inside Sales' },
];

/* ── STORAGE ─────────────────────────────────────────────── */
function ld(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }
function sv(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
const getMembers  = () => ld('gjc_members', []);
const saveMembers = m  => sv('gjc_members', m);
const getPending  = () => ld('gjc_pending', []);
const savePending = p  => sv('gjc_pending', p);
const getApproved = () => ld('gjc_approved', []);
const saveApproved= a  => sv('gjc_approved', a);

function initData() {
  let mem = getMembers();
  if (!mem.length) {
    mem = SEED.map((s, i) => ({
      ...s,
      color: AV_COLORS[i % AV_COLORS.length],
      history: [90,60,30,0].map(d => makeSnap(s.level, d)),
    }));
    saveMembers(mem);
  } else {
    mem = mem.map((m, i) => ({ color: AV_COLORS[i % AV_COLORS.length], ...m }));
    saveMembers(mem);
  }
}

function makeSnap(level, daysAgo) {
  const d = new Date(); d.setDate(d.getDate() - daysAgo);
  const skills = {}, ldr = {};
  Object.keys(DEF_SKILLS[level]).forEach(k => {
    skills[k] = clamp(DEF_SKILLS[level][k] + rnd(14));
  });
  Object.keys(DEF_LDR[level]).forEach(k => {
    const b = DEF_LDR[level][k];
    ldr[k] = b > 0 ? clamp(b + rnd(14)) : 0;
  });
  return { date: d.toISOString(), skills, leadership: ldr, note:'', comments:{}, overall: calcOverall(skills, ldr, level) };
}
const clamp = v => Math.min(100, Math.max(0, Math.round(v)));
const rnd   = r => Math.round((Math.random() - .5) * r);

/* ── SCORE HELPERS ──────────────────────────────────────── */
function avg(obj) {
  const vals = Object.values(obj).filter(v => v > 0);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
}
function calcOverall(skills, ldr, level) {
  const w = LDR_WEIGHT[level] || 0;
  if (w === 0) return avg(skills);
  const la = avg(Object.fromEntries(Object.entries(ldr).filter(([,v]) => v > 0)));
  return Math.round(avg(skills) * (1 - w) + la * w);
}
function stKey(s) { return s>=85?'high':s>=70?'track':s>=45?'dev':'needs'; }
function stLabel(s) { return {high:'High Performer',track:'On Track',dev:'Developing',needs:'Needs Attention'}[stKey(s)]; }
function stClass(s) { return 'chip chip-'+stKey(s); }
function stColor(s) { return {high:'#059669',track:'#2563EB',dev:'#D97706',needs:'#DC2626'}[stKey(s)]; }
function skColors(v) {
  if (v >= 85) return ['#059669','#D1FAE5'];
  if (v >= 70) return ['#2563EB','#EFF6FF'];
  if (v >= 45) return ['#D97706','#FEF3C7'];
  return ['#DC2626','#FEE2E2'];
}
function isPromo(m) {
  const h = m.history;
  if (h.length < 3) return false;
  const l3 = h.slice(-3);
  if (!l3.every(s => s.overall >= ({JA:70,A:72,SA:75,AM:78,M:82,SM:85}[m.level]))) return false;
  return !Object.values(l3[l3.length-1].skills).some(v => v < 45);
}
function ini(name) { return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase(); }
function fmt(iso) { return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }

/* ── ROUTER ─────────────────────────────────────────────── */
function setRole(role) {
  ['manager','member','peer','workflow'].forEach(r => {
    document.getElementById('view-'+r).style.display = r===role?'':'none';
    document.getElementById('tab-'+r)?.classList.toggle('active', r===role);
  });
  if (role==='manager')  renderManager();
  if (role==='member')   renderMember();
  if (role==='peer')     renderPeer();
  if (role==='workflow') renderWorkflow();
}

/* ── TOAST ──────────────────────────────────────────────── */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── HEADER USER ─────────────────────────────────────────── */
function updateHeaderUser(user) {
  const wrap = document.getElementById('header-user');
  if (!wrap) return;
  if (!user) { wrap.innerHTML = ''; return; }
  const picHtml = user.picture
    ? `<img src="${user.picture}" alt="">`
    : ini(user.name || 'U');
  wrap.innerHTML = `
    <div class="header-avatar">${picHtml}</div>
    <span class="header-name">${(user.name||'').split(' ')[0]}</span>
    <button class="btn-signout" onclick="signOut()">Sign out</button>`;
}

/* ════════════════════════════════════════════════════════
   AUTH  — Google Sign-In + email fallback
   ════════════════════════════════════════════════════════ */
let googleUser = null;

// Called by Google Identity Services after sign-in
function handleGoogleCredential(response) {
  try {
    // Decode JWT payload (no signature check needed for display)
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    googleUser = { name: payload.name, email: payload.email, picture: payload.picture };
    sessionStorage.setItem('gjc_google_user', JSON.stringify(googleUser));
    updateHeaderUser(googleUser);
    // Check if manager
    if (!MANAGER_EMAIL || MANAGER_EMAIL === googleUser.email || MANAGER_EMAIL === '') {
      sessionStorage.setItem('gjc_mgr_authed', '1');
    }
    renderManager();
  } catch(e) { console.error(e); }
}

function signOut() {
  googleUser = null;
  sessionStorage.clear();
  updateHeaderUser(null);
  setRole('manager');
}

function renderManagerAuth(el) {
  const gBtn = GOOGLE_CLIENT_ID
    ? `<div id="g_id_onload"
          data-client_id="${GOOGLE_CLIENT_ID}"
          data-callback="handleGoogleCredential"
          data-auto_prompt="false"></div>
       <div class="g_id_signin" data-type="standard" data-theme="outline"
          data-size="large" data-text="sign_in_with" data-shape="rectangular"
          data-logo_alignment="left" style="width:100%;margin-bottom:10px"></div>`
    : `<button class="google-btn" onclick="demoManagerLogin()">
        <svg viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-21.5 0-1.5-.2-2.7-.5-3.5z"/></svg>
        Sign in with Google
      </button>`;

  el.innerHTML = `
    <div class="auth-overlay">
      <div class="auth-card">
        <div class="auth-logo">📊</div>
        <div class="auth-title">Manager Access</div>
        <div class="auth-sub">Sign in with your work Google account to access the Growth Journey dashboard.</div>
        ${gBtn}
        ${!GOOGLE_CLIENT_ID ? `
        <div class="auth-divider">or enter email</div>
        <input class="auth-input" id="mgr-email" type="email" placeholder="you@company.com">
        <button class="btn-primary" style="width:100%" onclick="emailManagerLogin()">Continue</button>
        <div class="auth-error" id="mgr-err"></div>
        <div class="auth-hint">Demo mode — any email works. Set MANAGER_EMAIL in app.js to restrict access.</div>` : ''}
      </div>
    </div>`;
}

function demoManagerLogin() {
  googleUser = { name:'Abhinav Srivastava', email:'abhinav@company.com', picture:'' };
  sessionStorage.setItem('gjc_google_user', JSON.stringify(googleUser));
  sessionStorage.setItem('gjc_mgr_authed','1');
  updateHeaderUser(googleUser);
  renderManager();
}

function emailManagerLogin() {
  const email = document.getElementById('mgr-email')?.value?.trim();
  if (!email || !email.includes('@')) {
    document.getElementById('mgr-err').textContent = 'Enter a valid email.'; return;
  }
  if (MANAGER_EMAIL && email !== MANAGER_EMAIL) {
    document.getElementById('mgr-err').textContent = 'Not authorised as manager.'; return;
  }
  googleUser = { name: email.split('@')[0], email, picture:'' };
  sessionStorage.setItem('gjc_google_user', JSON.stringify(googleUser));
  sessionStorage.setItem('gjc_mgr_authed','1');
  updateHeaderUser(googleUser);
  renderManager();
}

/* ════════════════════════════════════════════════════════
   MANAGER VIEW
   ════════════════════════════════════════════════════════ */
let teamChart  = null;
let radarChart = null;
let selId      = null;
let period     = 'all';

function renderManager() {
  const el = document.getElementById('view-manager');

  // Restore session
  const storedUser = sessionStorage.getItem('gjc_google_user');
  if (storedUser && !googleUser) {
    googleUser = JSON.parse(storedUser);
    updateHeaderUser(googleUser);
  }

  if (!sessionStorage.getItem('gjc_mgr_authed')) { renderManagerAuth(el); return; }
  initData();
  const mem = getMembers();

  el.innerHTML = `<div class="page">
    <div id="s-kpi"></div>
    <div id="s-chart"></div>
    <div id="s-reportees"></div>
    <div id="s-dive"></div>
    <div id="s-pending"></div>
  </div>`;

  buildKPI(mem);
  buildChart(mem);
  buildReportees(mem);
  buildPending();
}

/* ── KPI ─────────────────────────────────────────────────── */
function buildKPI(mem) {
  const sc    = mem.map(m => m.history[m.history.length-1]?.overall ?? 0);
  const tavg  = Math.round(sc.reduce((a,b)=>a+b,0)/sc.length);
  const high  = sc.filter(s=>s>=85).length;
  const track = sc.filter(s=>s>=70&&s<85).length;
  const needs = sc.filter(s=>s<70).length;
  const promo = mem.filter(isPromo).length;

  document.getElementById('s-kpi').innerHTML = `
    <div class="sec-hd"><div><div class="sec-title">Dashboard Overview</div></div></div>
    <div class="kpi-row">
      <div class="kpi-card" style="--kpi-color:#2563EB">
        <div class="kpi-lbl">Team Average</div>
        <div class="kpi-val">${tavg}<small style="font-size:14px;font-weight:500">%</small></div>
        <div class="kpi-sub">${mem.length} reportees tracked</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#059669">
        <div class="kpi-lbl">High Performers</div>
        <div class="kpi-val">${high}</div>
        <div class="kpi-sub">Score ≥ 85%</div>
        <div class="kpi-pill" style="background:#D1FAE5;color:#065F46">${Math.round(high/mem.length*100)}% of team</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#2563EB">
        <div class="kpi-lbl">On Track</div>
        <div class="kpi-val">${track}</div>
        <div class="kpi-sub">Score 70–84%</div>
        <div class="kpi-pill" style="background:#DBEAFE;color:#1D4ED8">${Math.round(track/mem.length*100)}% of team</div>
      </div>
      <div class="kpi-card" style="--kpi-color:#DC2626">
        <div class="kpi-lbl">Needs Attention</div>
        <div class="kpi-val">${needs}</div>
        <div class="kpi-sub">Score &lt; 70%</div>
        ${needs ? `<div class="kpi-pill" style="background:#FEE2E2;color:#991B1B">⚠ Review needed</div>` : `<div class="kpi-pill" style="background:#D1FAE5;color:#065F46">✓ All clear</div>`}
      </div>
      <div class="kpi-card" style="--kpi-color:#D97706">
        <div class="kpi-lbl">Promo Candidates</div>
        <div class="kpi-val">${promo}</div>
        <div class="kpi-sub">3+ cycles at threshold</div>
        ${promo ? `<div class="kpi-pill" style="background:#FEF3C7;color:#92400E">🏆 Promote now</div>` : ''}
      </div>
    </div>`;
}

/* ── TEAM LINE CHART ─────────────────────────────────────── */
function buildChart(mem) {
  const tabs = ['2W','1M','3M','6M','1Y','All'];
  document.getElementById('s-chart').innerHTML = `
    <div class="sec-hd">
      <div><div class="sec-title">Team Progress</div><div class="sec-subtitle">Score trend across all reportees</div></div>
    </div>
    <div class="chart-card">
      <div class="chart-hd">
        <div>
          <div class="chart-title">Score Timeline</div>
        </div>
        <div class="period-tabs">
          ${tabs.map(p=>`<button class="period-tab${period===(p==='All'?'all':p.toLowerCase())?' active':''}" onclick="setPeriod('${p==='All'?'all':p.toLowerCase()}')">${p}</button>`).join('')}
        </div>
      </div>
      <div class="chart-wrap"><canvas id="teamChart"></canvas></div>
    </div>`;
  drawTeamChart(mem);
}

function setPeriod(p) { period = p; buildChart(getMembers()); }

function drawTeamChart(mem) {
  if (teamChart) { teamChart.destroy(); teamChart = null; }
  const ctx = document.getElementById('teamChart')?.getContext('2d');
  if (!ctx) return;

  const cutoff = new Date();
  if      (period==='2w') cutoff.setDate(cutoff.getDate()-14);
  else if (period==='1m') cutoff.setMonth(cutoff.getMonth()-1);
  else if (period==='3m') cutoff.setMonth(cutoff.getMonth()-3);
  else if (period==='6m') cutoff.setMonth(cutoff.getMonth()-6);
  else if (period==='1y') cutoff.setFullYear(cutoff.getFullYear()-1);
  else cutoff.setFullYear(2000);

  const datasets = mem.map((m, i) => {
    let data = m.history.filter(h => new Date(h.date) >= cutoff);
    if (data.length < 2) data = m.history.slice(-4);
    return {
      label: m.name.split(' ')[0],
      data: data.map(h => ({
        x: new Date(h.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'}),
        y: h.overall,
      })),
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
    data:{ datasets },
    options:{
      responsive:true, maintainAspectRatio:false,
      interaction:{ mode:'index', intersect:false },
      plugins:{
        legend:{ position:'bottom', labels:{ usePointStyle:true, pointStyle:'circle', padding:16, font:{size:11}, color:'#334155' } },
        tooltip:{ backgroundColor:'#0F172A', padding:10, callbacks:{ label:c=>` ${c.dataset.label}: ${c.parsed.y}%` } },
      },
      scales:{
        x:{ type:'category', grid:{display:false}, ticks:{ font:{size:11}, color:'#64748B' }, border:{display:false} },
        y:{ min:0, max:100,
            grid:{ color:'#F1F5F9', drawBorder:false },
            ticks:{ callback:v=>v+'%', font:{size:11}, color:'#64748B', stepSize:20 },
            border:{ display:false },
          },
      },
    },
  });
}

/* ── REPORTEES GRID ──────────────────────────────────────── */
function buildReportees(mem) {
  const cards = mem.map(m => {
    const lat   = m.history[m.history.length-1] || {};
    const score = lat.overall ?? 0;
    const col   = stColor(score);
    return `
      <div class="rep-card${selId===m.id?' selected':''}" id="rc-${m.id}"
           style="--rc-color:${col}" onclick="selectMember('${m.id}')">
        <div class="rep-top">
          <div class="rep-av" style="background:${m.color}">${ini(m.name)}</div>
          <div>
            <div class="rep-name">${m.name}</div>
            <div class="rep-role">${m.role || LEVEL_NAMES[m.level]}</div>
          </div>
        </div>
        <div class="rep-score-row">
          <div class="rep-score">${score}%</div>
          <span class="lvl">${m.level}</span>
        </div>
        <div class="rep-bar-bg">
          <div class="rep-bar-fill" style="width:${score}%;background:${col}"></div>
        </div>
        <div class="rep-status" style="margin-top:8px">
          <span class="${stClass(score)}"><span class="chip-dot"></span>${stLabel(score)}</span>
          ${isPromo(m)?'<div class="promo-flag">🏆 Promo Ready</div>':''}
        </div>
      </div>`;
  }).join('');

  document.getElementById('s-reportees').innerHTML = `
    <div class="sec-hd">
      <div><div class="sec-title">My Reportees</div><div class="sec-subtitle">Click a card to open individual deep-dive</div></div>
    </div>
    <div class="reportees-grid">${cards}</div>`;
}

function selectMember(id) {
  selId = id;
  document.querySelectorAll('.rep-card').forEach(c => c.classList.toggle('selected', c.id==='rc-'+id));
  renderDeepDive(id);
  setTimeout(()=>document.getElementById('s-dive')?.scrollIntoView({behavior:'smooth',block:'start'}),60);
}

/* ── DEEP-DIVE ───────────────────────────────────────────── */
function renderDeepDive(id) {
  const mem  = getMembers();
  const m    = mem.find(x=>x.id===id);
  if (!m) return;

  const lat  = m.history[m.history.length-1] || {skills:{},leadership:{},note:'',comments:{}};
  const prev = m.history[m.history.length-2] || null;
  const w    = LDR_WEIGHT[m.level];
  const hasL = w > 0;

  /* Skill rows */
  const skillRows = SKILLS.map((sk,idx)=>{
    const val  = lat.skills[sk.key] ?? 50;
    const cmt  = lat.comments?.[sk.key] ?? '';
    const [c,bg] = skColors(val);
    const slBg = `linear-gradient(to right,${c} ${val}%,#E2E8F0 ${val}%)`;
    const ctx  = SK_CTX[sk.key]?.[m.level] ?? '';
    const hint = SK_SOL[sk.key]?.[m.level] ?? '';
    return `
      <div class="sk-row">
        <div class="sk-name">${sk.label}<small>${ctx}</small></div>
        <div class="sk-mid">
          <div class="sk-slider-row">
            <span class="sk-score-badge" id="bd-${sk.key}" style="--sb-col:${c};--sb-bg:${bg}">${val}%</span>
            <input type="range" class="sk-slider" min="0" max="100" value="${val}"
              id="sl-${sk.key}" data-key="${sk.key}" data-type="skill" data-idx="${idx}"
              oninput="syncSlider(this,'${id}')"
              style="--sl-bg:${slBg};--sb-col:${c}">
          </div>
          <button class="comment-btn${cmt?' has-comment':''}" id="cb-${sk.key}"
            onclick="toggleCmt('cbox-${sk.key}','cb-${sk.key}')">
            <span class="cbtn-icon">${cmt?'✏️':'💬'}</span>
            <span id="cbt-${sk.key}">${cmt?'Edit coaching note':'Add coaching note'}</span>
          </button>
          <div class="comment-box${cmt?' open':''}" id="cbox-${sk.key}">
            <textarea data-key="${sk.key}" data-type="comment"
              placeholder="${hint}">${cmt}</textarea>
            <div class="comment-hint-text">Suggested action: ${hint}</div>
          </div>
        </div>
      </div>`;
  }).join('');

  /* Leadership rows */
  const ldrRows = LEADERSHIP.map((lk)=>{
    const val  = lat.leadership?.[lk.key] ?? 0;
    const cmt  = lat.comments?.['ldr_'+lk.key] ?? '';
    const [c,bg] = skColors(val||50);
    const slBg = hasL ? `linear-gradient(to right,${c} ${val}%,#E2E8F0 ${val}%)` : '#E2E8F0';
    const ctx  = LDR_CTX[lk.key]?.[m.level] ?? 'N/A at this level';
    const hint = LDR_SOL[lk.key]?.[m.level] ?? '';
    return `
      <div class="sk-row${hasL?'':' disabled'}">
        <div class="sk-name">${lk.label}<small>${ctx}</small></div>
        <div class="sk-mid">
          <div class="sk-slider-row">
            <span class="sk-score-badge" id="bd-ldr-${lk.key}" style="--sb-col:${c};--sb-bg:${bg}">${hasL?val+'%':'N/A'}</span>
            ${hasL?`
            <input type="range" class="sk-slider" min="0" max="100" value="${val}"
              id="sl-ldr-${lk.key}" data-key="${lk.key}" data-type="leadership"
              oninput="syncSlider(this,'${id}')"
              style="--sl-bg:${slBg};--sb-col:${c}">` : `<div style="flex:1;height:5px;background:#E2E8F0;border-radius:99px"></div>`}
          </div>
          ${hasL?`
          <button class="comment-btn${cmt?' has-comment':''}" id="cb-ldr-${lk.key}"
            onclick="toggleCmt('cbox-ldr-${lk.key}','cb-ldr-${lk.key}')">
            <span class="cbtn-icon">${cmt?'✏️':'💬'}</span>
            <span id="cbt-ldr-${lk.key}">${cmt?'Edit coaching note':'Add coaching note'}</span>
          </button>
          <div class="comment-box${cmt?' open':''}" id="cbox-ldr-${lk.key}">
            <textarea data-key="ldr_${lk.key}" data-type="comment"
              placeholder="${hint}">${cmt}</textarea>
            <div class="comment-hint-text">Suggested action: ${hint}</div>
          </div>` : ''}
        </div>
      </div>`;
  }).join('');

  /* Dev plan */
  const weak = SKILLS.filter(sk=>(lat.skills[sk.key]??50)<65);
  const devPlan = weak.length ? `
    <div class="devplan">
      <div class="devplan-title">📋 Development Focus — ${weak.length} skill${weak.length>1?'s':''} below 65%</div>
      ${weak.map(sk=>`<div class="devplan-item"><b>${sk.label}</b><span>${SK_SOL[sk.key]?.[m.level]??''}</span></div>`).join('')}
    </div>` : '';

  const radCur = SKILLS.map(sk=>lat.skills[sk.key]??50);
  const radPrv = prev ? SKILLS.map(sk=>prev.skills[sk.key]??50) : null;

  document.getElementById('s-dive').innerHTML = `
    <div class="sec-hd">
      <div><div class="sec-title">Individual Deep-Dive</div></div>
      <button class="btn-ghost btn-sm" onclick="closeDeepDive()">✕ Close</button>
    </div>
    <div class="deep-dive">
      <!-- Header -->
      <div class="dd-hd">
        <div class="dd-member">
          <div class="dd-av" style="background:${m.color}">${ini(m.name)}</div>
          <div>
            <div class="dd-name">${m.name}</div>
            <div class="dd-meta">${LEVEL_NAMES[m.level]} · ${m.level} · ${m.history.length} snapshot${m.history.length!==1?'s':''} · ${m.role||''}</div>
          </div>
        </div>
        <div class="dd-score-wrap">
          <div class="dd-score" id="dd-score">${lat.overall??0}%</div>
          <div class="dd-score-lbl" id="dd-score-lbl">${stLabel(lat.overall??0)}</div>
        </div>
      </div>

      <div class="dd-body">
        <!-- Journey -->
        <div>
          <div class="sec-title" style="margin-bottom:10px">Growth Journey</div>
          ${buildJmap(m)}
        </div>

        <!-- Radar + Skills -->
        <div class="dd-grid">
          <!-- Radar -->
          <div class="radar-panel">
            <div class="radar-panel-title">Skills Web</div>
            <div class="radar-canvas-wrap"><canvas id="radarChart"></canvas></div>
            <div class="radar-leg">
              <div class="radar-leg-item"><div class="radar-leg-dot" style="background:#2563EB"></div>Current</div>
              ${radPrv?'<div class="radar-leg-item"><div class="radar-leg-dot" style="background:#CBD5E1"></div>Previous</div>':''}
            </div>
          </div>

          <!-- Skills col -->
          <div class="skills-col">
            <div class="sk-sec-title">Core Skills (9)</div>
            ${skillRows}

            <div class="ldr-banner">
              🎯 <strong>Leadership weight: ${Math.round(w*100)}%</strong>
              &nbsp;of overall score
              ${!hasL?'— unlocks from Senior Associate (SA)':''}
            </div>

            ${hasL?`<div class="sk-sec-title">Leadership Competencies (6)</div>${ldrRows}`:''}
          </div>
        </div>

        ${devPlan}

        <!-- Save -->
        <div class="save-row">
          <label>Manager Note (optional — saved with snapshot)</label>
          <textarea id="mgr-note" placeholder="Coaching observations, context, agreed next steps…">${lat.note||''}</textarea>
          <div class="save-actions">
            <span style="font-size:11px;color:var(--subtle)">Last snapshot: ${lat.date?fmt(lat.date):'—'}</span>
            <button class="btn-ghost" onclick="closeDeepDive()">Cancel</button>
            <button class="btn-primary" onclick="saveSnapshot('${id}')">💾 Save Snapshot</button>
          </div>
        </div>
      </div>
    </div>`;

  drawRadar(radCur, radPrv);
}

function closeDeepDive() {
  selId = null;
  document.getElementById('s-dive').innerHTML = '';
  document.querySelectorAll('.rep-card').forEach(c=>c.classList.remove('selected'));
}

/* ── JOURNEY MAP ─────────────────────────────────────────── */
function buildJmap(m) {
  const idx = LEVELS.indexOf(m.level);
  return `<div class="jmap">` + LEVELS.map((lv,i)=>{
    const cls = i<idx?'done':i===idx?'current':i===idx+1?'next':i===idx+2?'goal':'';
    const tag = i===idx?'<br><span style="font-size:8px;font-weight:700;color:#2563EB">YOU</span>':
                i===idx+1?'<br><span style="font-size:8px;font-weight:700;color:#D97706">NEXT</span>':
                i===idx+2?'<br><span style="font-size:8px;font-weight:700;color:#059669">GOAL</span>':'';
    return `${i>0?`<div class="jm-conn${i<=idx?' done':''}"></div>`:''}
      <div class="jm-node ${cls}">
        <div class="jm-circle">${lv}</div>
        <div class="jm-lbl">${lv}${tag}</div>
      </div>`;
  }).join('') + `</div>`;
}

/* ── SLIDER SYNC ─────────────────────────────────────────── */
function syncSlider(el, memberId) {
  const val  = +el.value;
  const key  = el.dataset.key;
  const type = el.dataset.type;
  const [c, bg] = skColors(val);
  const slBg = `linear-gradient(to right,${c} ${val}%,#E2E8F0 ${val}%)`;

  el.style.setProperty('--sl-bg', slBg);
  el.style.setProperty('--sb-col', c);

  const bdId = type==='leadership' ? `bd-ldr-${key}` : `bd-${key}`;
  const bd = document.getElementById(bdId);
  if (bd) { bd.textContent=val+'%'; bd.style.setProperty('--sb-col',c); bd.style.setProperty('--sb-bg',bg); }

  // live radar update
  if (radarChart && type==='skill') {
    const idx = +el.dataset.idx;
    if (idx>=0) { radarChart.data.datasets[0].data[idx]=val; radarChart.update('none'); }
  }

  recomputeOverall(memberId);
}

function recomputeOverall(memberId) {
  const m = getMembers().find(x=>x.id===memberId);
  if (!m) return;
  const s={}, l={};
  SKILLS.forEach(sk=>{
    const el=document.getElementById(`sl-${sk.key}`);
    s[sk.key]=el?+el.value:(m.history[m.history.length-1]?.skills[sk.key]??50);
  });
  LEADERSHIP.forEach(lk=>{
    const el=document.getElementById(`sl-ldr-${lk.key}`);
    l[lk.key]=el?+el.value:(m.history[m.history.length-1]?.leadership[lk.key]??0);
  });
  const o=calcOverall(s,l,m.level);
  const se=document.getElementById('dd-score');
  const le=document.getElementById('dd-score-lbl');
  if(se) se.textContent=o+'%';
  if(le) le.textContent=stLabel(o);
}

/* ── COMMENT TOGGLE ──────────────────────────────────────── */
function toggleCmt(boxId, btnId) {
  const box = document.getElementById(boxId);
  const btn = document.getElementById(btnId);
  if (!box) return;
  const open = box.classList.toggle('open');
  if (btn) btn.classList.toggle('has-comment', open || (box.querySelector('textarea')?.value?.trim()?.length>0));
  const lbl = document.getElementById(btnId.replace('cb-','cbt-'));
  if (lbl) lbl.textContent = open ? 'Hide note' : (box.querySelector('textarea')?.value?.trim() ? 'Edit coaching note' : 'Add coaching note');
}

/* ── SAVE SNAPSHOT ──────────────────────────────────────── */
function saveSnapshot(id) {
  const mem = getMembers();
  const m   = mem.find(x=>x.id===id);
  if (!m) return;

  const s={}, l={}, comments={};
  SKILLS.forEach(sk=>{
    const el=document.getElementById(`sl-${sk.key}`);
    s[sk.key]=el?+el.value:(m.history[m.history.length-1]?.skills[sk.key]??50);
  });
  LEADERSHIP.forEach(lk=>{
    const el=document.getElementById(`sl-ldr-${lk.key}`);
    l[lk.key]=el?+el.value:(m.history[m.history.length-1]?.leadership[lk.key]??0);
  });
  document.querySelectorAll('.comment-box textarea').forEach(ta=>{
    if(ta.dataset.key) comments[ta.dataset.key]=ta.value.trim();
  });

  // Validate weak skills need a comment
  const noComment = SKILLS.filter(sk=>(s[sk.key]??50)<45 && !comments[sk.key]);
  if (noComment.length) {
    toast(`⚠ Add a coaching note for: ${noComment.map(x=>x.label).join(', ')}`);
    noComment.forEach(sk=>document.getElementById(`cbox-${sk.key}`)?.classList.add('open'));
    return;
  }

  const note=document.getElementById('mgr-note')?.value?.trim()||'';
  m.history.push({ date:new Date().toISOString(), skills:s, leadership:l, note, comments, overall:calcOverall(s,l,m.level) });
  saveMembers(mem);
  toast('✅ Snapshot saved!');
  const upd=getMembers();
  buildKPI(upd); buildChart(upd); buildReportees(upd); renderDeepDive(id);
}

/* ── RADAR ───────────────────────────────────────────────── */
function drawRadar(current, prev) {
  if (radarChart) { radarChart.destroy(); radarChart=null; }
  const ctx=document.getElementById('radarChart')?.getContext('2d');
  if (!ctx) return;
  const ds=[{
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
  radarChart=new Chart(ctx,{
    type:'radar',
    data:{ labels:SKILLS.map(s=>s.label.split(' ')[0]), datasets:ds },
    options:{
      responsive:true, maintainAspectRatio:true,
      plugins:{ legend:{display:false} },
      scales:{ r:{
        min:0,max:100,
        ticks:{stepSize:25,font:{size:9},backdropColor:'transparent',color:'#94A3B8'},
        grid:{color:'#E2E8F0'},
        angleLines:{color:'#E2E8F0'},
        pointLabels:{font:{size:9.5},color:'#475569'},
      }},
    },
  });
}

/* ── PENDING ─────────────────────────────────────────────── */
function buildPending() {
  const p   = getPending();
  const mem = getMembers();
  const nm  = Object.fromEntries(mem.map(m=>[m.id,m.name]));

  const items = p.length ? p.map(i=>`
    <div class="pending-item">
      <div class="p-icon">${i.type==='achievement'?'🏅':'💬'}</div>
      <div class="p-content">
        <div class="p-who">${nm[i.target]||i.target} · ${i.type==='achievement'?i.category:'Peer feedback from '+(nm[i.from]||i.from)}</div>
        <div class="p-text">${i.text}</div>
        <div class="p-meta">${fmt(i.date)}</div>
      </div>
      <div class="p-actions">
        <button class="btn-sm btn-approve" onclick="approveItem('${i.id}')">Approve</button>
        <button class="btn-sm btn-remove"  onclick="removeItem('${i.id}')">Remove</button>
      </div>
    </div>`).join('')
    : `<div class="empty"><div class="empty-icon">✅</div>No pending items — inbox zero!</div>`;

  document.getElementById('s-pending').innerHTML = `
    <div class="sec-hd"><div class="sec-title">Pending Approvals</div>${p.length?`<span class="badge-cnt">${p.length}</span>`:''}</div>
    <div class="pending-wrap">
      <div class="pending-hd">Approval Queue ${p.length?`<span class="badge-cnt">${p.length}</span>`:''}</div>
      <div>${items}</div>
    </div>`;
}

function approveItem(pid) {
  let p=getPending(); const item=p.find(x=>x.id===pid); if(!item) return;
  savePending(p.filter(x=>x.id!==pid));
  saveApproved([...getApproved(),{...item,approvedDate:new Date().toISOString()}]);
  buildPending(); toast('✅ Approved!');
}
function removeItem(pid) { savePending(getPending().filter(x=>x.id!==pid)); buildPending(); toast('🗑 Removed'); }

/* ════════════════════════════════════════════════════════
   MEMBER VIEW
   ════════════════════════════════════════════════════════ */
function renderMember() {
  const el = document.getElementById('view-member');
  const aid = sessionStorage.getItem('gjc_mbr_authed');
  if (!aid) { renderMbrSelect(el); return; }
  const mem = getMembers();
  const m = mem.find(x=>x.id===aid);
  if (!m) { sessionStorage.removeItem('gjc_mbr_authed'); renderMbrSelect(el); return; }
  renderMbrDash(el, m);
}

function renderMbrSelect(el) {
  const mem = getMembers();
  el.innerHTML = `
    <div class="auth-overlay">
      <div class="auth-card" style="width:400px">
        <div class="auth-logo">🙋</div>
        <div class="auth-title">My Journey</div>
        <div class="auth-sub">Select your name to sign in</div>
        <div class="member-pick-list">
          ${mem.map(m=>`
            <button class="member-pick-btn" onclick="startMbrLogin('${m.id}')">
              <div class="mbr-av-sm" style="background:${m.color}">${ini(m.name)}</div>
              <div>
                <div class="mpb-name">${m.name}</div>
                <div class="mpb-sub">${m.level} · ${LEVEL_NAMES[m.level]}</div>
              </div>
            </button>`).join('')}
        </div>
      </div>
    </div>`;
}

function startMbrLogin(id) {
  const el = document.getElementById('view-member');
  const mem = getMembers();
  const m = mem.find(x=>x.id===id);
  el.innerHTML = `
    <div class="auth-overlay">
      <div class="auth-card">
        <div class="auth-logo">🔑</div>
        <div class="auth-title">${m?.name.split(' ')[0]||''}</div>
        <div class="auth-sub">Sign in with your work Google account</div>
        <button class="google-btn" onclick="demoMbrLogin('${id}')">
          <svg viewBox="0 0 48 48"><path fill="#4285F4" d="M44.5 20H24v8.5h11.8C34.7 33.9 29.8 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 37c-11 0-21 8-21 21.5 0-1.5-.2-2.7-.5-3.5z"/></svg>
          Sign in with Google
        </button>
        <div class="auth-divider">or enter PIN</div>
        <input class="auth-input" id="mbr-pin" type="password" maxlength="4" placeholder="4-digit PIN" oninput="if(this.value.length===4)checkMbrPin('${id}')">
        <div class="auth-error" id="mbr-err"></div>
        <div class="auth-hint">Default PIN: 0000</div>
        <button onclick="renderMbrSelect(document.getElementById('view-member'))"
          style="margin-top:14px;font-size:12px;color:var(--muted);background:none;text-decoration:underline;cursor:pointer;border:none">
          ← Back
        </button>
      </div>
    </div>`;
}

function demoMbrLogin(id) {
  sessionStorage.setItem('gjc_mbr_authed', id);
  renderMember();
}

function checkMbrPin(id) {
  const pin = document.getElementById('mbr-pin')?.value;
  const mem = getMembers();
  const m = mem.find(x=>x.id===id);
  if (m && pin===(m.pin||'0000')) {
    sessionStorage.setItem('gjc_mbr_authed',id); renderMember();
  } else {
    const e=document.getElementById('mbr-err');
    if(e) e.textContent='Incorrect PIN';
    setTimeout(()=>{
      const inp=document.getElementById('mbr-pin');
      if(inp) inp.value='';
      if(e) e.textContent='';
    },1200);
  }
}

function renderMbrDash(el, m) {
  const lat     = m.history[m.history.length-1]||{skills:{},leadership:{}};
  const overall = lat.overall??0;
  const approved= getApproved().filter(a=>a.target===m.id);
  const fbs     = approved.filter(a=>a.type==='feedback');
  const achs    = approved.filter(a=>a.type==='achievement');
  const radData = SKILLS.map(sk=>lat.skills[sk.key]??50);

  el.innerHTML = `
    <div class="mbr-page">
      <div class="mbr-hero">
        <div class="mbr-hero-l">
          <div class="mbr-hero-av" style="background:${m.color}">${ini(m.name)}</div>
          <div>
            <div class="mbr-hero-name">${m.name}</div>
            <div class="mbr-hero-sub">${LEVEL_NAMES[m.level]} · ${m.level}${m.role?' · '+m.role:''}</div>
          </div>
        </div>
        <div class="mbr-hero-score">
          <div class="mbr-score-big">${overall}%</div>
          <div class="mbr-score-lbl">${stLabel(overall)}</div>
        </div>
      </div>

      <div class="mbr-card">
        <div class="mbr-card-hd">Growth Journey</div>
        <div class="mbr-card-body">${buildJmap(m)}</div>
      </div>

      <div class="mbr-card">
        <div class="mbr-card-hd">Skills Web</div>
        <div class="mbr-card-body"><div class="radar-mbr"><canvas id="mbrRadar"></canvas></div></div>
      </div>

      <div class="mbr-card">
        <div class="mbr-card-hd">Approved Achievements</div>
        <div class="mbr-card-body">
          ${achs.length?achs.map(a=>`<div class="ach-row"><span class="ach-cat">${a.category}</span><span>${a.text}</span></div>`).join(''):'<div style="color:var(--muted);font-size:13px">No achievements yet. Log one below!</div>'}
        </div>
      </div>

      <div class="mbr-card">
        <div class="mbr-card-hd">Peer Feedback</div>
        <div class="mbr-card-body">
          ${fbs.length?fbs.map(f=>`<div class="fb-item fb-${f.sentiment||'positive'}">${f.text}<div class="fb-from">From ${f.from} · ${fmt(f.date)}</div></div>`).join(''):'<div style="color:var(--muted);font-size:13px">No feedback yet.</div>'}
        </div>
      </div>

      <div class="mbr-card">
        <div class="mbr-card-hd">Log Achievement</div>
        <div class="mbr-card-body">
          <div class="form-group">
            <label>Category</label>
            <select id="ach-cat">
              <option>Brand/Deal</option><option>AI Initiative</option>
              <option>Cross-functional</option><option>Process Improvement</option>
              <option>Mentoring</option><option>Other</option>
            </select>
          </div>
          <div class="form-group">
            <label>What you did & the impact</label>
            <textarea id="ach-text" placeholder="e.g. Led AI automation that saved 4hrs/week for the team"></textarea>
          </div>
          <button class="btn-primary" onclick="submitAch('${m.id}')">Submit for Approval</button>
        </div>
      </div>

      <button onclick="sessionStorage.removeItem('gjc_mbr_authed');renderMember()"
        class="btn-ghost" style="align-self:flex-start;margin-top:4px">← Switch user</button>
    </div>`;

  setTimeout(()=>{
    const ctx=document.getElementById('mbrRadar')?.getContext('2d');
    if(!ctx) return;
    new Chart(ctx,{
      type:'radar',
      data:{labels:SKILLS.map(s=>s.label.split(' ')[0]),datasets:[{
        label:'Score',data:radData,
        backgroundColor:'rgba(37,99,235,.12)',
        borderColor:'#2563EB',borderWidth:2,
        pointBackgroundColor:'#2563EB',pointRadius:4,
      }]},
      options:{responsive:true,maintainAspectRatio:true,plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{size:9},backdropColor:'transparent',color:'#94A3B8'},grid:{color:'#E2E8F0'},angleLines:{color:'#E2E8F0'},pointLabels:{font:{size:9.5},color:'#475569'}}}},
    });
  },80);
}

function submitAch(id) {
  const cat=document.getElementById('ach-cat')?.value;
  const txt=document.getElementById('ach-text')?.value?.trim();
  if(!txt){toast('⚠ Please describe your achievement');return;}
  savePending([...getPending(),{id:'p'+Date.now(),type:'achievement',target:id,from:id,category:cat,text:txt,date:new Date().toISOString()}]);
  toast('✅ Submitted for manager approval!');
  document.getElementById('ach-text').value='';
}

/* ════════════════════════════════════════════════════════
   PEER VIEW
   ════════════════════════════════════════════════════════ */
function renderPeer() {
  const mem=getMembers();
  const opts=mem.map(m=>`<option value="${m.id}">${m.name} (${m.level})</option>`).join('');
  document.getElementById('view-peer').innerHTML=`
    <div class="peer-page">
      <div class="peer-card">
        <div class="peer-hd">
          <div class="peer-hd-title">Give Peer Feedback</div>
          <div class="peer-hd-sub">Anonymous, specific & constructive</div>
        </div>
        <div class="peer-body">
          <div class="peer-notice">⚠️ You cannot see scores or full profiles. Only the manager views assessments.</div>
          <div class="form-group"><label>Your Name</label><select id="peer-from">${opts}</select></div>
          <div class="form-group"><label>Feedback For</label><select id="peer-target">${opts}</select></div>
          <div class="form-group">
            <label>Type</label>
            <select id="peer-sent">
              <option value="positive">Positive — something they do brilliantly</option>
              <option value="constructive">Constructive — something to improve</option>
            </select>
          </div>
          <div class="form-group">
            <label>Specific Behaviour (min 20 chars)</label>
            <textarea id="peer-text" placeholder="Describe a specific situation and its impact…"></textarea>
          </div>
          <button class="btn-primary" onclick="submitPeer()">Submit Feedback</button>
        </div>
      </div>
    </div>`;
}

function submitPeer() {
  const from=document.getElementById('peer-from')?.value;
  const tgt =document.getElementById('peer-target')?.value;
  const sent=document.getElementById('peer-sent')?.value;
  const txt =document.getElementById('peer-text')?.value?.trim();
  if(!txt||txt.length<20){toast('⚠ Write at least 20 characters describing a specific behaviour.');return;}
  if(from===tgt){toast('⚠ You cannot give feedback to yourself.');return;}
  savePending([...getPending(),{id:'p'+Date.now(),type:'feedback',from,target:tgt,sentiment:sent,text:txt,date:new Date().toISOString()}]);
  toast('✅ Feedback submitted for manager review!');
  document.getElementById('peer-text').value='';
}

/* ════════════════════════════════════════════════════════
   WORKFLOW VIEW
   ════════════════════════════════════════════════════════ */
function renderWorkflow() {
  document.getElementById('view-workflow').innerHTML=`
    <div class="workflow-page">
      <h2>Growth Journey Workflow</h2>
      <img src="workflow.svg" alt="Growth Journey Workflow" style="width:100%;max-width:1100px">
    </div>`;
}

/* ── BOOT ────────────────────────────────────────────────── */
// Load Google Identity Services if Client ID configured
if (GOOGLE_CLIENT_ID) {
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true; s.defer = true;
  document.head.appendChild(s);
}

initData();
setRole('manager');
