/* ═══════════════════════════════════════════════
   Growth Journey Calculator — app.js
   All logic: data model, rendering, charts
═══════════════════════════════════════════════ */

// ── Constants ──────────────────────────────────
const LEVELS = ['JA','A','SA','AM','M','SM'];
const LEVEL_NAMES = {JA:'Junior Associate',A:'Associate',SA:'Senior Associate',AM:'Associate Manager',M:'Manager',SM:'Senior Manager'};
const THRESHOLDS = {JA:70,A:72,SA:75,AM:78,M:82,SM:null};
const LEADERSHIP_WEIGHT = {JA:0,A:0,SA:0.10,AM:0.25,M:0.40,SM:0.50};

const SKILLS = [
  {key:'sales',        label:'Sales Skills',         sub:'Pipeline, closures, upsell'},
  {key:'reporting',    label:'Reporting',             sub:'Accuracy, timeliness, insight'},
  {key:'maturity',     label:'Maturity',              sub:'Decision-making, judgement'},
  {key:'independence', label:'Independence',           sub:'Ownership vs escalation'},
  {key:'ai_adoption',  label:'AI Adoption',           sub:'Tools, initiatives, upskilling'},
  {key:'cross_fn',     label:'Cross-functional',      sub:'Collaboration, bridging gaps'},
  {key:'escalation',   label:'Escalation Quality',    sub:'When, how, resolution speed'},
  {key:'communication',label:'Communication',         sub:'Clarity, follow-ups, async'},
  {key:'enthusiasm',   label:'Enthusiasm',            sub:'Energy, initiative, ownership'},
];
const LEADERSHIP = [
  {key:'people',      label:'People Leadership',   sub:'Motivate, manage, retain'},
  {key:'vision',      label:'Vision & Strategy',   sub:'Direction, purpose, long-range'},
  {key:'stakeholder', label:'Stakeholder Influence',sub:'Trust, shape decisions'},
  {key:'developing',  label:'Developing Others',   sub:'Coach, mentor, grow'},
  {key:'resilience',  label:'Resilience & Grit',   sub:'Calm under pressure'},
  {key:'decision',    label:'Decision Quality',    sub:'Speed, accuracy, ownership'},
];
const ACHIEVEMENT_CATS = ['Brand / Deal','AI Initiative','Cross-functional','Process Improvement','Mentoring','Other'];

// ── Default skill/leadership values per level ──
const DEFAULT_SCORES = {
  JA:{ sales:35,reporting:38,maturity:30,independence:25,ai_adoption:30,cross_fn:25,escalation:28,communication:40,enthusiasm:65, people:0,vision:0,stakeholder:0,developing:0,resilience:35,decision:25 },
  A: { sales:52,reporting:55,maturity:50,independence:48,ai_adoption:52,cross_fn:48,escalation:50,communication:58,enthusiasm:70, people:0,vision:0,stakeholder:0,developing:0,resilience:50,decision:45 },
  SA:{ sales:68,reporting:70,maturity:65,independence:72,ai_adoption:68,cross_fn:65,escalation:68,communication:72,enthusiasm:75, people:55,vision:50,stakeholder:55,developing:52,resilience:65,decision:60 },
  AM:{ sales:76,reporting:74,maturity:72,independence:80,ai_adoption:75,cross_fn:74,escalation:76,communication:78,enthusiasm:80, people:68,vision:64,stakeholder:66,developing:65,resilience:72,decision:70 },
  M: { sales:84,reporting:82,maturity:80,independence:90,ai_adoption:82,cross_fn:80,escalation:84,communication:85,enthusiasm:85, people:78,vision:76,stakeholder:78,developing:75,resilience:80,decision:82 },
  SM:{ sales:92,reporting:90,maturity:90,independence:95,ai_adoption:90,cross_fn:90,escalation:92,communication:92,enthusiasm:92, people:88,vision:86,stakeholder:88,developing:85,resilience:88,decision:90 },
};

// ── Seed data ──────────────────────────────────
const SEED_MEMBERS = [
  {name:'Priya Sharma',    level:'SA'},
  {name:'Rohan Mehta',     level:'A'},
  {name:'Ananya Iyer',     level:'AM'},
  {name:'Karan Bose',      level:'JA'},
  {name:'Divya Nair',      level:'SA'},
  {name:'Arjun Kapoor',    level:'M'},
  {name:'Sneha Reddy',     level:'A'},
  {name:'Vikram Joshi',    level:'AM'},
];

function makeCycle(level, offsetDays=0){
  const base = DEFAULT_SCORES[level];
  const jitter = k => Math.min(100, Math.max(0, base[k] + Math.round((Math.random()-.5)*8)));
  const skills={}; SKILLS.forEach(s=>skills[s.key]=jitter(s.key));
  const leadership={}; LEADERSHIP.forEach(l=>leadership[l.key]=jitter(l.key));
  const d = new Date(); d.setDate(d.getDate()-offsetDays);
  return { date: d.toISOString().slice(0,10), skills, leadership, note:'', overall: calcOverall(skills,leadership,level) };
}
function calcOverall(skills, leadership, level){
  const sw = LEADERSHIP_WEIGHT[level]||0;
  const avgS = Object.values(skills).reduce((a,b)=>a+b,0)/Object.values(skills).length;
  const avgL = Object.values(leadership).reduce((a,b)=>a+b,0)/Object.values(leadership).length;
  return Math.round(avgS*(1-sw) + avgL*sw);
}

function seedIfEmpty(){
  if(localStorage.getItem('gjc_seeded')) return;
  const members = SEED_MEMBERS.map((m,i)=>({
    id: 'mbr_'+i,
    name: m.name,
    level: m.level,
    history: [makeCycle(m.level,84),makeCycle(m.level,70),makeCycle(m.level,56),makeCycle(m.level,42),makeCycle(m.level,28),makeCycle(m.level,14)],
  }));
  localStorage.setItem('gjc_members', JSON.stringify(members));
  localStorage.setItem('gjc_pending', JSON.stringify([]));
  localStorage.setItem('gjc_approved', JSON.stringify([]));
  localStorage.setItem('gjc_seeded','1');
}

// ── Storage helpers ────────────────────────────
const getMembers  = () => JSON.parse(localStorage.getItem('gjc_members')||'[]');
const getPending  = () => JSON.parse(localStorage.getItem('gjc_pending')||'[]');
const getApproved = () => JSON.parse(localStorage.getItem('gjc_approved')||'[]');
const saveMembers  = d => localStorage.setItem('gjc_members',  JSON.stringify(d));
const savePending  = d => localStorage.setItem('gjc_pending',  JSON.stringify(d));
const saveApproved = d => localStorage.setItem('gjc_approved', JSON.stringify(d));

// ── Status helpers ─────────────────────────────
function scoreStatus(s){ return s<45?'needs':s<70?'developing':s<85?'on-track':'high'; }
function statusLabel(s){ return {needs:'Needs Attention',developing:'Developing','on-track':'On Track',high:'High Performer'}[s]; }
function statusClass(s){ return {needs:'st-needs',developing:'st-developing','on-track':'st-on-track',high:'st-high'}[s]; }
function barColor(s){ return {needs:'#DC2626',developing:'#D97706','on-track':'#059669',high:'#7C3AED'}[s]; }

function isPromoCandidate(member){
  if(!THRESHOLDS[member.level]) return false;
  const thresh = THRESHOLDS[member.level];
  const last3 = member.history.slice(-3);
  if(last3.length < 3) return false;
  return last3.every(c => {
    if(c.overall < thresh) return false;
    return Object.values(c.skills).every(v=>v>=45);
  });
}
function nextLevel(level){ const i=LEVELS.indexOf(level); return i<LEVELS.length-1?LEVELS[i+1]:null; }
function targetLevel(level){ const i=LEVELS.indexOf(level); return LEVELS[Math.min(i+2,LEVELS.length-1)]; }

// ── Toast ──────────────────────────────────────
function toast(msg){ const t=document.getElementById('toast'); t.textContent=msg; t.classList.add('show'); setTimeout(()=>t.classList.remove('show'),2500); }

// ── Charts (Chart.js) ──────────────────────────
let trendChart=null, radarChart=null;
function drawTrend(canvasId, history){
  const ctx = document.getElementById(canvasId);
  if(!ctx) return;
  if(trendChart){ trendChart.destroy(); trendChart=null; }
  const last6 = history.slice(-6);
  trendChart = new Chart(ctx,{
    type:'bar',
    data:{ labels: last6.map(c=>c.date.slice(5)), datasets:[{ data:last6.map(c=>c.overall), backgroundColor: last6.map(c=>barColor(scoreStatus(c.overall))), borderRadius:4, borderSkipped:false }] },
    options:{ plugins:{legend:{display:false}}, scales:{ y:{min:0,max:100,ticks:{stepSize:25,font:{size:10}},grid:{color:'#F3F4F6'}}, x:{ticks:{font:{size:10}},grid:{display:false}} }, animation:{duration:400} }
  });
}
function drawRadar(canvasId, skills, level){
  const ctx = document.getElementById(canvasId);
  if(!ctx) return;
  if(radarChart){ radarChart.destroy(); radarChart=null; }
  radarChart = new Chart(ctx,{
    type:'radar',
    data:{
      labels: SKILLS.map(s=>s.label.split(' ')[0]),
      datasets:[{ data: SKILLS.map(s=>skills[s.key]||0), backgroundColor:'rgba(124,58,237,.15)', borderColor:'#7C3AED', pointBackgroundColor:'#7C3AED', borderWidth:2, pointRadius:3 }]
    },
    options:{ plugins:{legend:{display:false}}, scales:{ r:{min:0,max:100,ticks:{stepSize:25,font:{size:9}},pointLabels:{font:{size:11}}} }, animation:{duration:300} }
  });
}

// ═══════════════════════════════════════════════
//  MANAGER VIEW
// ═══════════════════════════════════════════════
let activeManagerTab = 'team';
let selectedMemberId = null;

function renderManager(){
  const root = document.getElementById('view-manager');
  root.innerHTML = `
    <div class="inner-tabs">
      <button class="inner-tab ${activeManagerTab==='team'?'active':''}" onclick="setManagerTab('team')">Team Overview</button>
      <button class="inner-tab ${activeManagerTab==='queue'?'active':''}" onclick="setManagerTab('queue')">Pending Queue<span class="badge-count" id="queue-count">0</span></button>
      <button class="inner-tab ${activeManagerTab==='promo'?'active':''}" onclick="setManagerTab('promo')">Promotion Candidates</button>
    </div>
    <div id="mgr-tab-content"></div>
  `;
  refreshQueueBadge();
  renderManagerTabContent();
}
window.setManagerTab = function(tab){ activeManagerTab=tab; renderManager(); }

function refreshQueueBadge(){
  const el = document.getElementById('queue-count');
  if(el) el.textContent = getPending().length;
}

function renderManagerTabContent(){
  const root = document.getElementById('mgr-tab-content');
  if(activeManagerTab==='team')  root.innerHTML = buildTeamView();
  if(activeManagerTab==='queue') root.innerHTML = buildQueueView();
  if(activeManagerTab==='promo') root.innerHTML = buildPromoView();

  // re-attach detail if one was selected
  if(activeManagerTab==='team' && selectedMemberId){
    const el = document.getElementById('detail-panel');
    if(el){ el.classList.add('open'); openDetail(selectedMemberId, true); }
  }
}

function buildTeamView(){
  const members = getMembers();
  const cards = members.map(m=>{
    const last = m.history[m.history.length-1] || {};
    const score = last.overall || 0;
    const st = scoreStatus(score);
    const promo = isPromoCandidate(m);
    return `
      <div class="member-card ${selectedMemberId===m.id?'selected':''}" onclick="openDetail('${m.id}')">
        ${promo?'<span class="promo-badge">🏆 Promo Ready</span>':''}
        <div class="member-name">${m.name}</div>
        <span class="level-badge lv-${m.level}">${m.level} · ${LEVEL_NAMES[m.level]}</span>
        <div class="score-row">
          <span class="score-num" style="color:${barColor(st)}">${score}%</span>
          <span class="status-chip ${statusClass(st)}">${statusLabel(st)}</span>
        </div>
        <div class="mini-bar"><div class="mini-bar-fill" style="width:${score}%;background:${barColor(st)}"></div></div>
      </div>`;
  }).join('');
  return `
    <div id="overview-section">
      <div class="section-header"><span class="section-title">Team Members (${members.length})</span></div>
      <div class="member-grid">${cards}</div>
    </div>
    <div id="detail-panel" class="${selectedMemberId?'open':''}"></div>
  `;
}

window.openDetail = function(id, skipRender=false){
  selectedMemberId = id;
  if(!skipRender){ renderManager(); return; }
  const members = getMembers();
  const m = members.find(x=>x.id===id); if(!m) return;
  const last = m.history[m.history.length-1] || { skills:{}, leadership:{}, note:'' };
  const lw = LEADERSHIP_WEIGHT[m.level]||0;
  const isLocked = lw===0;
  const promo = isPromoCandidate(m);

  const skillRows = SKILLS.map(s=>`
    <div class="slider-row">
      <div class="slider-label">${s.label}<small>${s.sub}</small></div>
      <input type="range" min="0" max="100" value="${last.skills[s.key]||0}" oninput="syncSlider(this)" id="sk_${s.key}">
      <span class="slider-val" id="sv_${s.key}">${last.skills[s.key]||0}%</span>
    </div>`).join('');

  const ldRows = LEADERSHIP.map(l=>`
    <div class="slider-row">
      <div class="slider-label">${l.label}<small>${l.sub}</small></div>
      <input type="range" min="0" max="100" value="${last.leadership[l.key]||0}" oninput="syncSlider(this)" id="lk_${l.key}" ${isLocked?'disabled':''}>
      <span class="slider-val" id="lv_${l.key}">${last.leadership[l.key]||0}%</span>
    </div>`).join('');

  const weightMsg = isLocked
    ? 'Leadership not formally scored at JA/A — observed informally only.'
    : `Leadership weighted at <strong>${Math.round(lw*100)}%</strong> of overall score at ${m.level} level.`;

  const panel = document.getElementById('detail-panel');
  panel.innerHTML = `
    <div class="card mt-20">
      <div class="detail-header">
        <button class="back-btn" onclick="closeDetail()">← Back</button>
        <div>
          <div class="detail-title">${m.name} ${promo?'🏆':''}</div>
          <span class="level-badge lv-${m.level}">${m.level} · ${LEVEL_NAMES[m.level]}</span>
        </div>
      </div>
      <div class="detail-grid">
        <div>
          <div class="sliders-section">
            <h3>9 Skill Dimensions</h3>
            ${skillRows}
          </div>
          <div class="leadership-section ${isLocked?'locked':''}">
            <h3 class="sliders-section" style="font-size:.85rem;font-weight:700;color:var(--gray-600);text-transform:uppercase;letter-spacing:.05em;margin-bottom:10px;margin-top:24px">Leadership Capabilities</h3>
            <div class="weight-banner">${weightMsg}</div>
            ${ldRows}
          </div>
          <div class="note-section">
            <h3 style="font-size:.85rem;font-weight:700;color:var(--gray-600);margin-bottom:8px">Manager Note (this cycle)</h3>
            <textarea id="mgr-note" placeholder="Write a specific observation for this bi-weekly cycle…">${last.note||''}</textarea>
            <button class="save-btn" onclick="saveCycle('${m.id}')">Save Cycle Snapshot</button>
          </div>
        </div>
        <div class="right-col">
          <div class="card card-sm overall-score-card">
            <div class="overall-num" id="overall-display" style="color:${barColor(scoreStatus(last.overall||0))}">${last.overall||0}%</div>
            <div class="overall-label" id="overall-status-label">${statusLabel(scoreStatus(last.overall||0))}</div>
            <div style="font-size:.72rem;color:var(--gray-400);margin-top:4px">Threshold: ${THRESHOLDS[m.level]?THRESHOLDS[m.level]+'%':'Exec review'}</div>
            ${promo?'<div style="margin-top:10px;background:var(--green-light);color:var(--green-dark);padding:6px 10px;border-radius:8px;font-size:.78rem;font-weight:600">✅ Promotion threshold sustained 3+ cycles</div>':''}
          </div>
          <div class="card card-sm">
            <div style="font-size:.82rem;font-weight:700;margin-bottom:8px">Score Trend (last 6 cycles)</div>
            <div class="chart-wrap"><canvas id="trend-chart"></canvas></div>
          </div>
        </div>
      </div>
    </div>
  `;
  drawTrend('trend-chart', m.history);
  // live overall recompute
  updateOverallLive(m);
}

window.syncSlider = function(el){
  const id = el.id;
  const type = id.startsWith('sk_')?'sk':'lk';
  const key = id.replace(/^(sk|lk)_/,'');
  const displayId = type==='sk'?'sv_'+key:'lv_'+key;
  const disp = document.getElementById(displayId);
  if(disp) disp.textContent = el.value+'%';
  const members = getMembers();
  const m = members.find(x=>x.id===selectedMemberId);
  if(m) updateOverallLive(m);
}

function readCurrentSliders(){
  const skills={}, leadership={};
  SKILLS.forEach(s=>{ const el=document.getElementById('sk_'+s.key); if(el) skills[s.key]=parseInt(el.value); });
  LEADERSHIP.forEach(l=>{ const el=document.getElementById('lk_'+l.key); if(el) leadership[l.key]=parseInt(el.value); });
  return {skills,leadership};
}

function updateOverallLive(m){
  const {skills,leadership} = readCurrentSliders();
  const score = calcOverall(skills, leadership, m.level);
  const st = scoreStatus(score);
  const od = document.getElementById('overall-display');
  const os = document.getElementById('overall-status-label');
  if(od){ od.textContent=score+'%'; od.style.color=barColor(st); }
  if(os) os.textContent=statusLabel(st);
}

window.saveCycle = function(id){
  const members = getMembers();
  const idx = members.findIndex(x=>x.id===id); if(idx<0) return;
  const m = members[idx];
  const {skills,leadership} = readCurrentSliders();
  const note = document.getElementById('mgr-note')?.value||'';
  const overall = calcOverall(skills,leadership,m.level);
  const cycle = { date: new Date().toISOString().slice(0,10), skills, leadership, note, overall };
  m.history.push(cycle);
  members[idx]=m; saveMembers(members);
  drawTrend('trend-chart',m.history);
  toast('Cycle saved for '+m.name+' — score: '+overall+'%');
}

window.closeDetail = function(){ selectedMemberId=null; renderManager(); }

function buildQueueView(){
  const pending = getPending();
  if(!pending.length) return '<div class="empty-state">✅ No pending items — all caught up!</div>';
  const items = pending.map(p=>{
    const icon = p.type==='achievement'?'🏅':'💬';
    const iconClass = p.type==='achievement'?'qi-achievement':'qi-feedback';
    const title = p.type==='achievement' ? `Achievement · ${p.category}` : `Peer Feedback · ${p.feedback_type}`;
    const meta = p.type==='achievement' ? `From: ${p.from}` : `From: ${p.from} → ${p.target}`;
    return `
      <div class="queue-item">
        <div class="qi-icon ${iconClass}">${icon}</div>
        <div class="qi-body">
          <div class="qi-title">${title}</div>
          <div class="qi-meta">${meta} · ${p.date}</div>
          <div class="qi-text">${p.text}</div>
          <div class="qi-actions">
            <button class="btn-approve" onclick="approveItem('${p.id}')">✓ Approve</button>
            <button class="btn-remove" onclick="removeItem('${p.id}')">✕ Remove</button>
          </div>
        </div>
      </div>`;
  }).join('');
  return `<div class="queue-list">${items}</div>`;
}

window.approveItem = function(id){
  let pending = getPending(); let approved = getApproved();
  const item = pending.find(p=>p.id===id); if(!item) return;
  pending = pending.filter(p=>p.id!==id);
  item.approvedDate = new Date().toISOString().slice(0,10);
  approved.push(item);
  savePending(pending); saveApproved(approved);
  toast('Item approved ✓');
  renderManagerTabContent();
}
window.removeItem = function(id){
  let pending = getPending().filter(p=>p.id!==id);
  savePending(pending); toast('Item removed');
  renderManagerTabContent();
}

function buildPromoView(){
  const members = getMembers();
  const candidates = members.filter(m=>isPromoCandidate(m));
  if(!candidates.length) return '<div class="empty-state">No promotion candidates at this time. Members need 3+ consecutive cycles above threshold with all skills ≥ 45%.</div>';
  const rows = candidates.map(m=>{
    const last = m.history[m.history.length-1]||{};
    const next = nextLevel(m.level);
    return `<tr>
      <td><strong>${m.name}</strong></td>
      <td><span class="level-badge lv-${m.level}">${m.level}</span></td>
      <td>${last.overall||0}%</td>
      <td>${THRESHOLDS[m.level]}%</td>
      <td>${next?`<span class="level-badge lv-${next}">${next}</span>`:'—'}</td>
      <td>✅ Ready</td>
    </tr>`;
  }).join('');
  return `
    <div class="card">
      <table class="promo-table">
        <thead><tr><th>Name</th><th>Current Level</th><th>Overall Score</th><th>Threshold</th><th>Target Level</th><th>Status</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>`;
}

// ═══════════════════════════════════════════════
//  MEMBER VIEW
// ═══════════════════════════════════════════════
let loggedInMember = null;

function renderMember(){
  const root = document.getElementById('view-member');
  if(!loggedInMember){
    const members = getMembers();
    const opts = members.map(m=>`<option value="${m.id}">${m.name} (${m.level})</option>`).join('');
    root.innerHTML = `
      <div class="member-login">
        <div style="font-size:2.5rem;margin-bottom:12px">🧑‍💼</div>
        <h2>View Your Growth Journey</h2>
        <p>Select your name to see your profile, scores, and achievements.</p>
        <select class="name-select" id="member-select"><option value="">— Select your name —</option>${opts}</select>
        <button class="login-btn" onclick="memberLogin()">View My Journey</button>
      </div>`;
    return;
  }
  const m = loggedInMember;
  const last = m.history[m.history.length-1]||{skills:{},leadership:{},note:''};
  const score = last.overall||0;
  const st = scoreStatus(score);
  const tgt = targetLevel(m.level);
  const tgtName = LEVEL_NAMES[tgt];
  const approved = getApproved();
  const myAchievements = approved.filter(a=>a.type==='achievement'&&a.from===m.name);
  const myFeedback = approved.filter(a=>a.type==='feedback'&&a.target===m.name);

  const achieveItems = myAchievements.length ? myAchievements.map(a=>`
    <div class="approved-item">
      <div class="ai-header"><span class="cat-badge">${a.category}</span></div>
      <div class="ai-text">${a.text}</div>
      <div class="ai-from">${a.date}</div>
    </div>`).join('') : '<div class="empty-state" style="padding:20px">No approved achievements yet. Log one below!</div>';

  const fbItems = myFeedback.length ? myFeedback.map(f=>`
    <div class="approved-item">
      <div class="ai-header"><span class="cat-badge ${f.feedback_type==='Positive'?'fb-positive':'fb-constructive'}">${f.feedback_type}</span><span style="font-size:.75rem;color:var(--gray-400)">from ${f.from}</span></div>
      <div class="ai-text">${f.text}</div>
      <div class="ai-from">${f.date}</div>
    </div>`).join('') : '<div class="empty-state" style="padding:20px">No approved peer feedback yet.</div>';

  root.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <button class="back-btn" onclick="memberLogout()">← Switch Member</button>
      <div>
        <div style="font-size:1.1rem;font-weight:800">${m.name}</div>
        <span class="level-badge lv-${m.level}">${m.level} · ${LEVEL_NAMES[m.level]}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
      <div class="card overall-score-card">
        <div class="overall-num" style="color:${barColor(st)}">${score}%</div>
        <div class="overall-label">${statusLabel(st)}</div>
        <div style="font-size:.72rem;color:var(--gray-400);margin-top:4px">Threshold: ${THRESHOLDS[m.level]?THRESHOLDS[m.level]+'%':'Exec review'} · ${isPromoCandidate(m)?'🏆 Promo candidate!':''}</div>
      </div>
      <div class="card growth-arrow-card">
        <div class="ga-level"><div class="ga-code" style="color:var(--purple)">${m.level}</div><div class="ga-name">${LEVEL_NAMES[m.level]}</div></div>
        <div class="ga-arrow">→</div>
        <div class="ga-level ga-target"><div class="ga-code">${tgt}</div><div class="ga-name">${tgtName}</div></div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:300px 1fr;gap:20px;margin-bottom:20px">
      <div class="card card-sm"><div style="font-size:.82rem;font-weight:700;margin-bottom:8px">Skill Radar</div><div class="radar-wrap"><canvas id="member-radar"></canvas></div></div>
      <div style="display:flex;flex-direction:column;gap:16px">
        <div class="card card-sm"><div style="font-size:.85rem;font-weight:700;margin-bottom:10px">Approved Achievements</div><div class="approved-list">${achieveItems}</div></div>
        <div class="card card-sm"><div style="font-size:.85rem;font-weight:700;margin-bottom:10px">Peer Feedback</div><div class="approved-list">${fbItems}</div></div>
      </div>
    </div>
    <div class="card card-sm">
      <div style="font-size:.85rem;font-weight:700;margin-bottom:12px">Log an Achievement</div>
      <div class="achieve-form">
        <select id="ach-cat"><option value="">— Select category —</option>${ACHIEVEMENT_CATS.map(c=>`<option>${c}</option>`).join('')}</select>
        <textarea id="ach-text" rows="3" placeholder="Describe the specific achievement, outcome, or initiative…"></textarea>
        <button class="submit-btn" onclick="submitAchievement()">Submit for Manager Review</button>
      </div>
    </div>
  `;
  drawRadar('member-radar', last.skills, m.level);
}

window.memberLogin = function(){
  const id = document.getElementById('member-select').value;
  if(!id){ toast('Please select your name'); return; }
  const m = getMembers().find(x=>x.id===id);
  if(m){ loggedInMember=m; renderMember(); }
}
window.memberLogout = function(){ loggedInMember=null; renderMember(); }

window.submitAchievement = function(){
  const cat = document.getElementById('ach-cat').value;
  const text = document.getElementById('ach-text').value.trim();
  if(!cat){ toast('Please select a category'); return; }
  if(!text){ toast('Please describe your achievement'); return; }
  const pending = getPending();
  pending.push({ id:'p_'+Date.now(), type:'achievement', from:loggedInMember.name, target:loggedInMember.name, category:cat, text, date:new Date().toISOString().slice(0,10) });
  savePending(pending);
  toast('Achievement submitted for manager review ✓');
  document.getElementById('ach-cat').value='';
  document.getElementById('ach-text').value='';
}

// ═══════════════════════════════════════════════
//  PEER VIEW
// ═══════════════════════════════════════════════
function renderPeer(){
  const members = getMembers();
  const opts = members.map(m=>`<option value="${m.name}">${m.name}</option>`).join('');
  document.getElementById('view-peer').innerHTML = `
    <div class="card" style="max-width:560px;margin:0 auto;padding:28px">
      <div style="font-size:1rem;font-weight:800;margin-bottom:4px">Submit Peer Feedback</div>
      <div style="font-size:.82rem;color:var(--gray-400);margin-bottom:20px">Your feedback goes to the manager for review before it's visible to the recipient.</div>
      <div class="notice-box" style="margin-bottom:20px">ℹ️ You cannot see scores or other members' profiles. Feedback requires a specific observable behaviour — no generalities or personal attacks.</div>
      <div class="peer-form">
        <div><label>Your name</label><select id="peer-from"><option value="">— Select your name —</option>${opts}</select></div>
        <div><label>Feedback for</label><select id="peer-target"><option value="">— Select colleague —</option>${opts}</select></div>
        <div><label>Feedback type</label>
          <select id="peer-type">
            <option value="Positive">Positive — recognise a specific action or result</option>
            <option value="Constructive">Constructive — highlight a development area with example</option>
          </select>
        </div>
        <div><label>Your feedback <span style="font-weight:400;color:var(--gray-400)">(specific behaviour or event required)</span></label>
          <textarea id="peer-text" rows="4" placeholder="e.g. Priya independently ran the AM onboarding session this week without prompting…"></textarea>
        </div>
        <button class="peer-submit" onclick="submitPeerFeedback()">Submit Feedback</button>
        <div class="success-msg" id="peer-success">Feedback submitted! Your manager will review it before it becomes visible. 🎉</div>
      </div>
    </div>`;
}

window.submitPeerFeedback = function(){
  const from   = document.getElementById('peer-from').value;
  const target = document.getElementById('peer-target').value;
  const type   = document.getElementById('peer-type').value;
  const text   = document.getElementById('peer-text').value.trim();
  if(!from)  { toast('Please select your name'); return; }
  if(!target){ toast('Please select a colleague'); return; }
  if(from===target){ toast('You cannot submit feedback about yourself'); return; }
  if(!text || text.length < 20){ toast('Please write a specific observation (min 20 characters)'); return; }
  const pending = getPending();
  pending.push({ id:'p_'+Date.now(), type:'feedback', feedback_type:type, from, target, text, date:new Date().toISOString().slice(0,10) });
  savePending(pending);
  document.getElementById('peer-text').value='';
  document.getElementById('peer-from').value='';
  const s=document.getElementById('peer-success'); s.style.display='block'; setTimeout(()=>s.style.display='none',4000);
}

// ═══════════════════════════════════════════════
//  WORKFLOW VIEW
// ═══════════════════════════════════════════════
function renderWorkflow(){
  document.getElementById('view-workflow').innerHTML = `
    <div class="card" style="padding:16px">
      <div style="font-size:.85rem;font-weight:700;margin-bottom:12px;color:var(--gray-600)">End-to-End Workflow — 5 Swim Lanes</div>
      <img src="workflow.svg" alt="Growth Journey Workflow" style="width:100%;border-radius:8px;border:1px solid var(--gray-200)">
    </div>`;
}

// ═══════════════════════════════════════════════
//  ROLE / TAB SWITCHING
// ═══════════════════════════════════════════════
let activeRole = 'manager';
const VIEWS = ['manager','member','peer','workflow'];

window.setRole = function(role){
  activeRole = role;
  VIEWS.forEach(v=>{
    document.getElementById('view-'+v).style.display = v===role?'block':'none';
    const btn = document.getElementById('tab-'+v);
    if(btn) btn.classList.toggle('active', v===role);
  });
  if(role==='manager')  renderManager();
  if(role==='member')   renderMember();
  if(role==='peer')     renderPeer();
  if(role==='workflow') renderWorkflow();
}

// ── Boot ───────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  seedIfEmpty();
  setRole('manager');
});
