/* ═══════════════════════════════════════════════
   Growth Journey Calculator — app.js  v2.0
   Enhancements:
   1. PIN login per individual + score justification comments
   2. Growth line chart + weak-area surfacing
   3. Skill-gap development plans with solutions
   4. Level-relevant skill context labels
═══════════════════════════════════════════════ */

// ── Level / threshold constants ─────────────────
const LEVELS = ['JA','A','SA','AM','M','SM'];
const LEVEL_NAMES = {JA:'Junior Associate',A:'Associate',SA:'Senior Associate',AM:'Associate Manager',M:'Manager',SM:'Senior Manager'};
const THRESHOLDS = {JA:70,A:72,SA:75,AM:78,M:82,SM:null};
const LEADERSHIP_WEIGHT = {JA:0,A:0,SA:0.10,AM:0.25,M:0.40,SM:0.50};

// ── Skill definitions ───────────────────────────
const SKILLS = [
  {key:'sales',        label:'Sales Skills',         sub:'Pipeline, closures, upsell'},
  {key:'reporting',    label:'Reporting',             sub:'Accuracy, timeliness, insight'},
  {key:'maturity',     label:'Maturity',              sub:'Decision-making, judgement'},
  {key:'independence', label:'Independence',          sub:'Ownership vs escalation'},
  {key:'ai_adoption',  label:'AI Adoption',           sub:'Tools, initiatives, upskilling'},
  {key:'cross_fn',     label:'Cross-functional',      sub:'Collaboration, bridging gaps'},
  {key:'escalation',   label:'Escalation Quality',    sub:'When, how, resolution speed'},
  {key:'communication',label:'Communication',         sub:'Clarity, follow-ups, async'},
  {key:'enthusiasm',   label:'Enthusiasm',            sub:'Energy, initiative, ownership'},
];
const LEADERSHIP = [
  {key:'people',      label:'People Leadership',    sub:'Motivate, manage, retain'},
  {key:'vision',      label:'Vision & Strategy',    sub:'Direction, purpose, long-range'},
  {key:'stakeholder', label:'Stakeholder Influence',sub:'Trust, shape decisions'},
  {key:'developing',  label:'Developing Others',    sub:'Coach, mentor, grow'},
  {key:'resilience',  label:'Resilience & Grit',    sub:'Calm under pressure'},
  {key:'decision',    label:'Decision Quality',     sub:'Speed, accuracy, ownership'},
];
const ACHIEVEMENT_CATS = ['Brand / Deal','AI Initiative','Cross-functional','Process Improvement','Mentoring','Other'];

// ── Feature 4: Level-relevant skill context ──────
const SKILL_CONTEXT = {
  sales: {
    JA:'Learn pipeline basics; shadow senior AMs on calls',
    A: 'Manage small accounts end-to-end with guidance',
    SA:'Own mid-tier accounts independently; upsell awareness',
    AM:'Manage team pipeline; coach closures; P&L awareness',
    M: 'Full P&L ownership; strategic accounts & targets',
    SM:'Business-unit revenue strategy; enterprise relationships',
  },
  reporting: {
    JA:'Daily activity reports using templates; accuracy focus',
    A: 'Accurate reports with minimal errors; meets deadlines',
    SA:'Insight-led reporting; identify trends proactively',
    AM:'Coach team on reporting; build dashboards & cadence',
    M: 'Strategic reporting to leadership; own the narrative',
    SM:'C-suite and board-level reporting; external benchmarks',
  },
  maturity: {
    JA:'Reactive; seek guidance frequently on ambiguous situations',
    A: 'Growing maturity; handle routine issues independently',
    SA:'Handle ambiguity calmly; set a composed example',
    AM:'Calm under pressure; set the tone for the team',
    M: 'High business maturity; drive consequential decisions',
    SM:'Organisational-level maturity; shape culture & norms',
  },
  independence: {
    JA:'~20% independent; high reliance on team is expected',
    A: '~40% independent; ask when unsure is the right signal',
    SA:'~70% independent; escalate only genuinely complex calls',
    AM:'Delegates effectively; full ownership of outcomes',
    M: 'Full autonomy; sets team direction without prompting',
    SM:'Shapes org direction; rarely needs external input',
  },
  ai_adoption: {
    JA:'Intro to AI tools; prompting basics and experimentation',
    A: 'Use AI for research, drafts, and routine tasks',
    SA:'AI embedded in daily workflow; own at least 1 initiative',
    AM:'Drive AI adoption across the team; upskill others',
    M: 'AI strategy for the group; sponsor transformation projects',
    SM:'AI transformation lead; set direction for the business unit',
  },
  cross_fn: {
    JA:'Shadow cross-functional calls; observe how teams interact',
    A: 'Participate in cross-fn discussions; build relationships',
    SA:'Lead a cross-fn project or initiative end-to-end',
    AM:'Bridge functions; resolve cross-fn conflicts proactively',
    M: 'Cross-org influence; trusted partner across all teams',
    SM:'Cross-company influence; shape joint priorities',
  },
  escalation: {
    JA:'Learning when to escalate; rarely escalates correctly yet',
    A: 'Recognise escalation triggers; escalate with context',
    SA:'Strong escalation judgement; resolves fast once raised',
    AM:'Escalation owner for team; coaches others on when/how',
    M: 'Gatekeeper for function; escalates only business-critical',
    SM:'Critical escalation decisions across the organisation',
  },
  communication: {
    JA:'Clear written comms; misses follow-ups occasionally',
    A: 'Regular follow-ups; some communication gaps remain',
    SA:'Proactive comms; rare misses; strong async effectiveness',
    AM:'Crisp async comms; no meaningful misses; models clarity',
    M: 'Executive-level communication; narrative-driven',
    SM:'Board-level stakeholder communication & management',
  },
  enthusiasm: {
    JA:'High energy, eager to learn — a core signal at entry level',
    A: 'Self-motivated; consistently meets targets',
    SA:'Drives team energy; informally mentors JAs',
    AM:'Inspires team; holds high standards; role-models culture',
    M: 'Culture driver; attracts and retains top talent',
    SM:'Visionary; sets culture and long-range direction',
  },
  people: {
    JA:'No direct reports — observe team dynamics informally',
    A: 'Informally guide peers on tasks; no formal reports yet',
    SA:'Sponsor JAs informally; first people-leadership signal',
    AM:'Manage 2–4 ICs directly; set expectations & review',
    M: 'Lead team of 5–10; accountable for performance & culture',
    SM:'Lead managers; own org design and team health',
  },
  vision: {
    JA:'Follow team direction; no strategic input expected yet',
    A: 'Understand team goals; connect your work to strategy',
    SA:'Contribute to team strategy with informed perspective',
    AM:'Translate manager vision into team-level goals & plans',
    M: 'Co-own function strategy; 6–12 month directional plan',
    SM:'Own business-unit vision; shape 1–3 year strategy',
  },
  stakeholder: {
    JA:'Build rapport with your direct manager; low influence',
    A: 'Build credibility with immediate peers and one level up',
    SA:'Trusted voice in cross-fn discussions; influence peers',
    AM:'Navigate across functions; shape decisions one level up',
    M: 'Influence executive stakeholders; trusted across business',
    SM:'Trusted advisor to C-suite; shape org-wide priorities',
  },
  developing: {
    JA:'You are being developed — be receptive and curious',
    A: 'Actively seek mentorship; share learnings with JAs',
    SA:'Formally mentor JAs; run onboarding for new joiners',
    AM:'Structured 1:1s; build a growth plan for each direct',
    M: 'Develop AMs for leadership; succession plan in place',
    SM:'Build the leadership bench; create a coaching culture',
  },
  resilience: {
    JA:'Recover from setbacks with manager support — normal at this level',
    A: 'Handle routine pressure independently; bounce back fast',
    SA:'Stay effective under sustained pressure; rally team energy',
    AM:'Model calm under crisis; team looks to you for stability',
    M: 'Lead through ambiguity and org change without losing momentum',
    SM:'Embody resilience as a leadership trait; build a resilient org',
  },
  decision: {
    JA:'Defer decisions to manager; low autonomy is expected',
    A: 'Make low-stakes decisions independently; escalate larger',
    SA:'Own decisions in your domain; escalate genuinely complex',
    AM:'Own team-level decisions confidently; rare escalations',
    M: 'High-quality, high-speed decisions; own outcomes fully',
    SM:'Set the decision-making bar for the org; rarely wrong on big calls',
  },
};

// ── Feature 3: Skill-gap solutions per level ─────
const SKILL_SOLUTIONS = {
  sales: {
    JA:'Shadow 3 senior AM calls this cycle; write up key observations',
    A: 'Close 1 small account solo; debrief with manager on process',
    SA:'Add upsell tracking to your pipeline view; review weekly',
    AM:'Run a team pipeline review; coach 1 person on deal quality',
    M: 'Review P&L against targets; identify top 3 revenue levers',
    SM:'Define segment strategy; build a flagship account plan',
  },
  reporting: {
    JA:'Use the template every day for 2 weeks; zero missed fields',
    A: 'Move beyond fill-in — add 1 insight line to each report',
    SA:'Pick 1 trend in the data this cycle; present it at stand-up',
    AM:'Run a 30-min reporting clinic with the team this week',
    M: 'Redesign 1 report to be decision-ready for leadership',
    SM:'Commission an external benchmarking report for the board',
  },
  maturity: {
    JA:'Write down your decision before escalating; share the reasoning',
    A: 'Handle 2 routine ambiguous situations solo before escalating',
    SA:'Document 3 decisions you made under ambiguity this cycle',
    AM:'Post-mortem 1 team crisis with a written lessons-learned note',
    M: 'Draft a decision-rights document for your team',
    SM:'Run a leadership retrospective on org-level decision quality',
  },
  independence: {
    JA:'Complete 1 task fully solo this cycle; share the output',
    A: 'Block manager check-ins to 1 per week on routine tasks',
    SA:'Spend 1 week without escalating anything routine',
    AM:'Delegate 2 tasks you currently own to a direct report',
    M: 'Review where the team is still escalating to you unnecessarily',
    SM:'Audit org-wide decision rights; push ownership 1 level down',
  },
  ai_adoption: {
    JA:'Spend 30 min/day using an AI tool for your core task this week',
    A: 'Use AI for a research or draft task; share your prompt with the team',
    SA:'Start an AI initiative: document the problem, tool, and outcome',
    AM:'Run a 1-hour AI tools session with your team this cycle',
    M: 'Build a team AI adoption plan with 2 measurable outcomes',
    SM:'Commission an AI transformation roadmap for the business unit',
  },
  cross_fn: {
    JA:'Attend 1 cross-fn meeting and contribute 1 relevant data point',
    A: 'Proactively share an update with 1 adjacent team this cycle',
    SA:'Lead a joint session with 1 cross-fn partner this month',
    AM:'Resolve 1 cross-fn friction point before it escalates',
    M: 'Broker a joint OKR with an adjacent team lead',
    SM:'Initiate a company-wide cross-fn program or working group',
  },
  escalation: {
    JA:'Before escalating, write: what you tried, why it failed, what you need',
    A: 'Review the last 3 escalations — should any have been resolved solo?',
    SA:'Document your escalation framework; share with 1 junior',
    AM:'Review team escalations monthly; identify patterns',
    M: 'Set team escalation standards; review in retro quarterly',
    SM:'Define escalation doctrine for the organisation',
  },
  communication: {
    JA:'Set a daily follow-up reminder; no open items for >48 hours',
    A: 'Audit last week\'s comms — what didn\'t get a response? Follow up now',
    SA:'Write a 1-page async update every cycle for your key stakeholders',
    AM:'Introduce a team communication standard (e.g. async-first)',
    M: 'Prepare a monthly stakeholder communication plan',
    SM:'Draft a communications framework for external stakeholders',
  },
  enthusiasm: {
    JA:'Volunteer for 1 stretch task this cycle — something outside your JD',
    A: 'Share a win (yours or a peer\'s) in the team channel this week',
    SA:'Mentor a JA for 30 min this cycle — log it as a formal check-in',
    AM:'Run an energy/morale check-in with your team this week',
    M: 'Plan 1 cultural ritual or recognition moment for the team',
    SM:'Articulate your team\'s purpose story — share with the org',
  },
  people: {
    JA:'Observe how your manager runs 1:1s; note 3 things you\'d replicate',
    A: 'Help a peer on a task they\'re struggling with; document the assist',
    SA:'Run a structured 30-min 1:1 with a JA this cycle',
    AM:'Build a written growth plan for each direct report this quarter',
    M: 'Identify your succession candidate; start a development plan',
    SM:'Run a leadership offsite or talent review for your org',
  },
  vision: {
    JA:'Read the team\'s quarterly OKRs and write how your work maps to them',
    A: 'Share your perspective on 1 team priority in the next planning session',
    SA:'Write a 1-page view on where your area should be in 12 months',
    AM:'Present a team-level strategy to your manager for feedback',
    M: 'Co-author the function\'s 6-month strategic plan',
    SM:'Draft the BU\'s 3-year vision and share it at a leadership forum',
  },
  stakeholder: {
    JA:'Send 1 proactive update to your manager this week (no prompting)',
    A: 'Intro yourself to 1 stakeholder outside your immediate team',
    SA:'Run a stakeholder mapping exercise; identify your top 5',
    AM:'Build a stakeholder communication calendar for the quarter',
    M: 'Request a skip-level with a senior leader; come with an agenda',
    SM:'Schedule a quarterly advisory session with C-suite stakeholders',
  },
  developing: {
    JA:'Ask your manager for 1 specific piece of development feedback today',
    A: 'Share 1 learning from this cycle with a JA peer',
    SA:'Set up a monthly mentoring touchpoint with a JA; log it',
    AM:'Write a 90-day development plan for each direct report',
    M: 'Identify 2 high-potential people; start sponsoring their visibility',
    SM:'Run a formal talent review; identify succession depth across the org',
  },
  resilience: {
    JA:'After a setback, write: what happened, what you learned, next step',
    A: 'Handle 1 stressful situation solo before flagging to manager',
    SA:'Rally team energy after a miss — write the debrief and forward plan',
    AM:'Share a personal resilience story with your team to normalise it',
    M: 'Lead the team through an ambiguous org change with a clear comms plan',
    SM:'Write and publish your personal resilience principles for the org',
  },
  decision: {
    JA:'Before asking your manager, write down the decision and your best answer',
    A: 'Make 3 low-stakes decisions this cycle without seeking approval',
    SA:'Document 3 decisions you owned this cycle; share rationale',
    AM:'Run a team decision review — identify where you\'re deciding for others',
    M: 'Set a 48-hour decision-turnaround standard for your team',
    SM:'Define decision rights and accountability across your leadership layer',
  },
};

// ── Default seeding scores ───────────────────────
const DEFAULT_SCORES = {
  JA:{ sales:35,reporting:38,maturity:30,independence:25,ai_adoption:30,cross_fn:25,escalation:28,communication:40,enthusiasm:65, people:0,vision:0,stakeholder:0,developing:0,resilience:35,decision:25 },
  A: { sales:52,reporting:55,maturity:50,independence:48,ai_adoption:52,cross_fn:48,escalation:50,communication:58,enthusiasm:70, people:0,vision:0,stakeholder:0,developing:0,resilience:50,decision:45 },
  SA:{ sales:68,reporting:70,maturity:65,independence:72,ai_adoption:68,cross_fn:65,escalation:68,communication:72,enthusiasm:75, people:55,vision:50,stakeholder:55,developing:52,resilience:65,decision:60 },
  AM:{ sales:76,reporting:74,maturity:72,independence:80,ai_adoption:75,cross_fn:74,escalation:76,communication:78,enthusiasm:80, people:68,vision:64,stakeholder:66,developing:65,resilience:72,decision:70 },
  M: { sales:84,reporting:82,maturity:80,independence:90,ai_adoption:82,cross_fn:80,escalation:84,communication:85,enthusiasm:85, people:78,vision:76,stakeholder:78,developing:75,resilience:80,decision:82 },
  SM:{ sales:92,reporting:90,maturity:90,independence:95,ai_adoption:90,cross_fn:90,escalation:92,communication:92,enthusiasm:92, people:88,vision:86,stakeholder:88,developing:85,resilience:88,decision:90 },
};

const SEED_MEMBERS = [
  {name:'Priya Sharma',level:'SA'},{name:'Rohan Mehta',level:'A'},
  {name:'Ananya Iyer',level:'AM'},{name:'Karan Bose',level:'JA'},
  {name:'Divya Nair',level:'SA'},{name:'Arjun Kapoor',level:'M'},
  {name:'Sneha Reddy',level:'A'},{name:'Vikram Joshi',level:'AM'},
];

function makeCycle(level, offsetDays=0){
  const base = DEFAULT_SCORES[level];
  const jitter = k => Math.min(100,Math.max(0,base[k]+Math.round((Math.random()-.5)*8)));
  const skills={};  SKILLS.forEach(s=>skills[s.key]=jitter(s.key));
  const leadership={};LEADERSHIP.forEach(l=>leadership[l.key]=jitter(l.key));
  const d=new Date(); d.setDate(d.getDate()-offsetDays);
  const overall=calcOverall(skills,leadership,level);
  return {date:d.toISOString().slice(0,10),skills,leadership,note:'',overall,skillComments:{},devPlan:[]};
}
function calcOverall(skills,leadership,level){
  const sw=LEADERSHIP_WEIGHT[level]||0;
  const avgS=Object.values(skills).reduce((a,b)=>a+b,0)/Object.values(skills).length;
  const avgL=Object.values(leadership).reduce((a,b)=>a+b,0)/Object.values(leadership).length;
  return Math.round(avgS*(1-sw)+avgL*sw);
}

// ── Storage helpers ──────────────────────────────
const getMembers  = ()=>JSON.parse(localStorage.getItem('gjc_members')||'[]');
const getPending  = ()=>JSON.parse(localStorage.getItem('gjc_pending')||'[]');
const getApproved = ()=>JSON.parse(localStorage.getItem('gjc_approved')||'[]');
const getAuth     = ()=>JSON.parse(localStorage.getItem('gjc_auth')||'{}');
const saveMembers  = d=>localStorage.setItem('gjc_members', JSON.stringify(d));
const savePending  = d=>localStorage.setItem('gjc_pending', JSON.stringify(d));
const saveApproved = d=>localStorage.setItem('gjc_approved',JSON.stringify(d));
const saveAuth     = d=>localStorage.setItem('gjc_auth',    JSON.stringify(d));

function seedIfEmpty(){
  if(localStorage.getItem('gjc_seeded')) return;
  const members = SEED_MEMBERS.map((m,i)=>({
    id:'mbr_'+i, name:m.name, level:m.level,
    history:[84,70,56,42,28,14].map(d=>makeCycle(m.level,d)),
  }));
  saveMembers(members);
  savePending([]);
  saveApproved([]);
  // seed auth — manager PIN 1234, each member 0000
  const auth={manager:{pin:'1234'},members:{}};
  members.forEach(m=>auth.members[m.id]={pin:'0000'});
  saveAuth(auth);
  localStorage.setItem('gjc_seeded','1');
}

// ── Score / status helpers ───────────────────────
function scoreStatus(s){return s<45?'needs':s<70?'developing':s<85?'on-track':'high';}
function statusLabel(s){return {needs:'Needs Attention',developing:'Developing','on-track':'On Track',high:'High Performer'}[s];}
function statusClass(s){return {needs:'st-needs',developing:'st-developing','on-track':'st-on-track',high:'st-high'}[s];}
function barColor(s){return {needs:'#DC2626',developing:'#D97706','on-track':'#059669',high:'#7C3AED'}[s];}
function isPromoCandidate(member){
  if(!THRESHOLDS[member.level]) return false;
  const last3=member.history.slice(-3);
  if(last3.length<3) return false;
  return last3.every(c=>c.overall>=THRESHOLDS[member.level]&&Object.values(c.skills).every(v=>v>=45));
}
function nextLevel(level){const i=LEVELS.indexOf(level);return i<LEVELS.length-1?LEVELS[i+1]:null;}
function targetLevel(level){const i=LEVELS.indexOf(level);return LEVELS[Math.min(i+2,LEVELS.length-1)];}
function getSkillContext(key,level){return (SKILL_CONTEXT[key]&&SKILL_CONTEXT[key][level])||'';}

// ── Toast ────────────────────────────────────────
function toast(msg,type='info'){
  const t=document.getElementById('toast');
  t.textContent=msg;
  t.className='show '+(type==='error'?'toast-error':type==='ok'?'toast-ok':'');
  clearTimeout(t._timer);
  t._timer=setTimeout(()=>{t.className='';},2800);
}

// ═══════════════════════════════════════════════
//  FEATURE 1 — PIN LOGIN
// ═══════════════════════════════════════════════
function renderLoginGate(role, memberId, onSuccess){
  const root=document.getElementById('view-'+role.split('-')[0]);
  const auth=getAuth();
  const isManager=role==='manager';
  const label=isManager?'Manager':'Your';

  root.innerHTML=`
    <div class="pin-card">
      <div class="pin-icon">${isManager?'👔':'🧑‍💼'}</div>
      <h2>${isManager?'Manager Login':'Member Login'}</h2>
      ${!isManager?`<p class="pin-sub">${getMemberName(memberId)}</p>`:''}
      <p class="pin-hint">Enter your 4-digit PIN</p>
      <input class="pin-input" id="pin-entry" type="password" inputmode="numeric" maxlength="4" placeholder="••••" autofocus>
      <button class="pin-btn" onclick="checkPin('${role}','${memberId||''}')">Enter</button>
      <div class="pin-error" id="pin-error"></div>
    </div>`;

  const inp=document.getElementById('pin-entry');
  inp.addEventListener('keydown',e=>{if(e.key==='Enter') checkPin(role,memberId||'');});
}

function getMemberName(id){
  const m=getMembers().find(x=>x.id===id);
  return m?m.name:'';
}

window.checkPin=function(role,memberId){
  const val=document.getElementById('pin-entry').value;
  const auth=getAuth();
  let correct;
  if(role==='manager') correct=auth.manager?.pin||'1234';
  else correct=auth.members?.[memberId]?.pin||'0000';

  if(val===correct){
    if(role==='manager') sessionStorage.setItem('gjc_mgr_authed','1');
    else sessionStorage.setItem('gjc_mbr_authed',memberId);
    // call back into the right flow
    if(role==='manager') renderManager();
    else { loggedInMember=getMembers().find(m=>m.id===memberId); renderMemberDashboard(); }
  } else {
    const err=document.getElementById('pin-error');
    err.textContent='Incorrect PIN. Try again.';
    const inp=document.getElementById('pin-entry');
    inp.classList.add('shake'); inp.value='';
    setTimeout(()=>inp.classList.remove('shake'),500);
  }
};

// ═══════════════════════════════════════════════
//  CHARTS
// ═══════════════════════════════════════════════
let trendChart=null,radarChart=null;

function drawLineChart(canvasId,history,level){
  const ctx=document.getElementById(canvasId);
  if(!ctx) return;
  if(trendChart){trendChart.destroy();trendChart=null;}
  const data=history.map(c=>c.overall);
  const labels=history.map(c=>c.date.slice(5));
  const thresh=THRESHOLDS[level];
  const datasets=[{
    label:'Overall Score',data,
    borderColor:'#7C3AED',backgroundColor:'rgba(124,58,237,.08)',
    pointBackgroundColor:data.map(v=>barColor(scoreStatus(v))),
    pointRadius:5,tension:.35,fill:true,borderWidth:2,
  }];
  if(thresh) datasets.push({
    label:'Promo Threshold',
    data:Array(data.length).fill(thresh),
    borderColor:'#DC2626',borderDash:[5,4],
    pointRadius:0,borderWidth:1.5,fill:false,
  });
  trendChart=new Chart(ctx,{
    type:'line',data:{labels,datasets},
    options:{
      plugins:{legend:{display:false}},
      scales:{y:{min:0,max:100,ticks:{stepSize:25,font:{size:10}},grid:{color:'#F3F4F6'}},x:{ticks:{font:{size:10}},grid:{display:false}}},
      animation:{duration:350},
    }
  });
}

function drawRadar(canvasId,skills,level){
  const ctx=document.getElementById(canvasId);
  if(!ctx) return;
  if(radarChart){radarChart.destroy();radarChart=null;}
  radarChart=new Chart(ctx,{
    type:'radar',
    data:{
      labels:SKILLS.map(s=>s.label.split(' ')[0]),
      datasets:[{
        data:SKILLS.map(s=>skills[s.key]||0),
        backgroundColor:'rgba(124,58,237,.15)',borderColor:'#7C3AED',
        pointBackgroundColor:'#7C3AED',borderWidth:2,pointRadius:3,
      }],
    },
    options:{plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{size:9}},pointLabels:{font:{size:11}}}},animation:{duration:300}},
  });
}

// ── Journey Map ──────────────────────────────────
function buildJourneyMap(member){
  const curIdx=LEVELS.indexOf(member.level);
  const nodes=LEVELS.map((lv,i)=>{
    const done=i<curIdx;
    const current=i===curIdx;
    const thresh=THRESHOLDS[lv]?THRESHOLDS[lv]+'%':'Exec';
    return `<div class="jm-node">
      <div class="jm-circle ${done?'jm-done':current?'jm-current':'jm-future'}">
        ${done?'✓':current?'●':''}
      </div>
      <div class="jm-label">
        <strong>${lv}</strong><br>
        <span>${thresh}</span>
      </div>
    </div>${i<LEVELS.length-1?'<div class="jm-line '+(done?'jm-line-done':'')+'"></div>':''}`;
  }).join('');
  return `<div class="journey-map">${nodes}</div>`;
}

// ═══════════════════════════════════════════════
//  MANAGER VIEW
// ═══════════════════════════════════════════════
let activeManagerTab='team';
let selectedMemberId=null;

function renderManager(){
  if(!sessionStorage.getItem('gjc_mgr_authed')){
    renderLoginGate('manager',null,null); return;
  }
  const root=document.getElementById('view-manager');
  root.innerHTML=`
    <div class="inner-tabs">
      <button class="inner-tab ${activeManagerTab==='team'?'active':''}" onclick="setManagerTab('team')">Team Overview</button>
      <button class="inner-tab ${activeManagerTab==='queue'?'active':''}" onclick="setManagerTab('queue')">Pending Queue<span class="badge-count" id="queue-count">0</span></button>
      <button class="inner-tab ${activeManagerTab==='promo'?'active':''}" onclick="setManagerTab('promo')">Promotion Candidates</button>
      <button class="inner-tab ${activeManagerTab==='settings'?'active':''}" onclick="setManagerTab('settings')">⚙ Settings</button>
    </div>
    <div id="mgr-tab-content"></div>
  `;
  refreshQueueBadge();
  renderManagerTabContent();
}
window.setManagerTab=function(tab){activeManagerTab=tab;renderManager();}

function refreshQueueBadge(){
  const el=document.getElementById('queue-count');
  if(el) el.textContent=getPending().length;
}

function renderManagerTabContent(){
  const root=document.getElementById('mgr-tab-content');
  if(activeManagerTab==='team')     root.innerHTML=buildTeamView();
  if(activeManagerTab==='queue')    root.innerHTML=buildQueueView();
  if(activeManagerTab==='promo')    root.innerHTML=buildPromoView();
  if(activeManagerTab==='settings') root.innerHTML=buildSettingsView();
  if(activeManagerTab==='team'&&selectedMemberId){
    const el=document.getElementById('detail-panel');
    if(el){el.classList.add('open');openDetail(selectedMemberId,true);}
  }
}

// ── Team overview ────────────────────────────────
function buildTeamView(){
  const members=getMembers();
  const cards=members.map(m=>{
    const last=m.history[m.history.length-1]||{};
    const score=last.overall||0;
    const st=scoreStatus(score);
    const promo=isPromoCandidate(m);
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
        <div style="margin-top:8px">${buildJourneyMap(m)}</div>
      </div>`;
  }).join('');
  return `
    <div id="overview-section">
      <div class="section-header"><span class="section-title">Team Members (${members.length})</span></div>
      <div class="member-grid">${cards}</div>
    </div>
    <div id="detail-panel" class="${selectedMemberId?'open':''}"></div>`;
}

// ── Member detail ────────────────────────────────
window.openDetail=function(id,skipRender=false){
  selectedMemberId=id;
  if(!skipRender){renderManager();return;}
  const members=getMembers();
  const m=members.find(x=>x.id===id); if(!m) return;
  const last=m.history[m.history.length-1]||{skills:{},leadership:{},note:'',skillComments:{},devPlan:[]};
  const lw=LEADERSHIP_WEIGHT[m.level]||0;
  const isLocked=lw===0;
  const promo=isPromoCandidate(m);
  const sc=last.skillComments||{};

  // Build skill rows with context label + comment field
  const skillRows=SKILLS.map(s=>{
    const v=last.skills[s.key]||0;
    const isWeak=v<70;
    const ctx=getSkillContext(s.key,m.level);
    return `
      <div class="slider-row ${isWeak?'slider-weak':''}">
        <div class="slider-label">
          ${s.label}<small>${s.sub}</small>
          <span class="skill-ctx">${ctx}</span>
        </div>
        <input type="range" min="0" max="100" value="${v}" oninput="syncSlider(this)" id="sk_${s.key}">
        <span class="slider-val" id="sv_${s.key}" style="color:${barColor(scoreStatus(v))}">${v}%</span>
      </div>
      <div class="comment-row ${isWeak?'comment-required':''}">
        <input type="text" class="comment-input" id="sc_${s.key}"
          placeholder="${isWeak?'⚠ Reason required for score below 70%':'Add a note (optional)…'}"
          value="${(sc[s.key]||'').replace(/"/g,'&quot;')}">
      </div>`;
  }).join('');

  const ldRows=LEADERSHIP.map(l=>{
    const v=last.leadership[l.key]||0;
    const isWeak=!isLocked&&v<70;
    const ctx=isLocked?'Not formally scored at JA/A — observed informally':getSkillContext(l.key,m.level);
    const weightPct=Math.round(lw*100);
    return `
      <div class="slider-row ${isLocked?'slider-locked':''} ${isWeak?'slider-weak':''}">
        <div class="slider-label">
          ${l.label}<small>${l.sub}</small>
          <span class="skill-ctx ${isLocked?'ctx-locked':''}">${ctx}</span>
        </div>
        <input type="range" min="0" max="100" value="${v}" oninput="syncSlider(this)" id="lk_${l.key}" ${isLocked?'disabled':''}>
        <span class="slider-val" id="lv_${l.key}" style="color:${isLocked?'#9CA3AF':barColor(scoreStatus(v))}">${v}%</span>
      </div>
      ${!isLocked?`<div class="comment-row ${isWeak?'comment-required':''}">
        <input type="text" class="comment-input" id="sc_${l.key}"
          placeholder="${isWeak?'⚠ Reason required for score below 70%':'Add a note (optional)…'}"
          value="${(sc[l.key]||'').replace(/"/g,'&quot;')}">
      </div>`:''}`;
  }).join('');

  const weightMsg=isLocked
    ?'Leadership not formally scored at JA/A — observed informally only.'
    :`Leadership weighted at <strong>${Math.round(lw*100)}%</strong> of overall score at ${m.level} level.`;

  const panel=document.getElementById('detail-panel');
  panel.innerHTML=`
    <div class="card mt-20">
      <div class="detail-header">
        <button class="back-btn" onclick="closeDetail()">← Back to Team</button>
        <div>
          <div class="detail-title">${m.name} ${promo?'🏆':''}</div>
          <span class="level-badge lv-${m.level}">${m.level} · ${LEVEL_NAMES[m.level]}</span>
        </div>
      </div>

      ${buildJourneyMap(m)}

      <div class="detail-grid mt-20">
        <div>
          <div class="sliders-section">
            <h3 class="sec-heading">9 Skill Dimensions</h3>
            <p class="sec-sub">Scores below 70% require a comment explaining the rating.</p>
            ${skillRows}
          </div>
          <div class="leadership-section mt-20">
            <h3 class="sec-heading">Leadership Capabilities</h3>
            <div class="weight-banner">${weightMsg}</div>
            ${ldRows}
          </div>

          <!-- Dev plan section — dynamically populated -->
          <div id="dev-plan-section" class="mt-20"></div>

          <div class="note-section mt-20">
            <h3 class="sec-heading">Manager Note (this cycle)</h3>
            <textarea id="mgr-note" placeholder="Write a specific observation for this bi-weekly cycle — be concrete, not general…">${last.note||''}</textarea>
            <button class="save-btn" onclick="saveCycle('${m.id}')">Save Cycle Snapshot</button>
          </div>
        </div>

        <div class="right-col">
          <div class="card card-sm overall-score-card">
            <div class="overall-num" id="overall-display" style="color:${barColor(scoreStatus(last.overall||0))}">${last.overall||0}%</div>
            <div class="overall-label" id="overall-status-label">${statusLabel(scoreStatus(last.overall||0))}</div>
            <div style="font-size:.72rem;color:var(--gray-400);margin-top:4px">Promo threshold: ${THRESHOLDS[m.level]?THRESHOLDS[m.level]+'%':'Exec review'}</div>
            ${promo?'<div class="promo-banner">✅ Threshold sustained 3+ cycles — ready for promotion discussion</div>':''}
          </div>
          <div class="card card-sm">
            <div class="sec-heading" style="margin-bottom:8px">Score Journey</div>
            <div class="chart-wrap"><canvas id="trend-chart"></canvas></div>
          </div>
          <div id="weak-area-panel"></div>
        </div>
      </div>
    </div>`;

  drawLineChart('trend-chart',m.history,m.level);
  updateOverallLive(m);
  renderDevPlanSection(id);
  renderWeakAreaPanel(id);
};

window.syncSlider=function(el){
  const id=el.id;
  const type=id.startsWith('sk_')?'sk':'lk';
  const key=id.replace(/^(sk|lk)_/,'');
  const dispId=type==='sk'?'sv_'+key:'lv_'+key;
  const disp=document.getElementById(dispId);
  const v=parseInt(el.value);
  if(disp){disp.textContent=v+'%';disp.style.color=barColor(scoreStatus(v));}
  // toggle weak highlight
  const row=el.closest('.slider-row');
  if(row) row.classList.toggle('slider-weak',v<70);
  const commentRow=el.closest('.slider-row')?.nextElementSibling;
  if(commentRow&&commentRow.classList.contains('comment-row')){
    commentRow.classList.toggle('comment-required',v<70);
    const inp=commentRow.querySelector('.comment-input');
    if(inp) inp.placeholder=v<70?'⚠ Reason required for score below 70%':'Add a note (optional)…';
  }
  const members=getMembers();
  const m=members.find(x=>x.id===selectedMemberId);
  if(m){updateOverallLive(m);renderDevPlanSection(selectedMemberId);}
};

function readCurrentSliders(){
  const skills={},leadership={};
  SKILLS.forEach(s=>{const el=document.getElementById('sk_'+s.key);if(el) skills[s.key]=parseInt(el.value);});
  LEADERSHIP.forEach(l=>{const el=document.getElementById('lk_'+l.key);if(el) leadership[l.key]=parseInt(el.value);});
  return {skills,leadership};
}

function updateOverallLive(m){
  const {skills,leadership}=readCurrentSliders();
  const score=calcOverall(skills,leadership,m.level);
  const st=scoreStatus(score);
  const od=document.getElementById('overall-display');
  const os=document.getElementById('overall-status-label');
  if(od){od.textContent=score+'%';od.style.color=barColor(st);}
  if(os) os.textContent=statusLabel(st);
}

// ── Dev plan section (dynamic) ───────────────────
function renderDevPlanSection(memberId){
  const wrap=document.getElementById('dev-plan-section');
  if(!wrap) return;
  const members=getMembers();
  const m=members.find(x=>x.id===memberId); if(!m) return;
  const {skills,leadership}=readCurrentSliders();
  const last=m.history[m.history.length-1]||{devPlan:[]};
  const existing=(last.devPlan||[]).reduce((acc,d)=>{acc[d.skillKey]=d.managerNote;return acc;},{});

  const weakSkills=[...SKILLS.map(s=>({...s,v:skills[s.key]||0,group:'skill'})),...LEADERSHIP.map(l=>({...l,v:leadership[l.key]||0,group:'leadership'}))]
    .filter(s=>s.v<70 && !(s.group==='leadership'&&LEADERSHIP_WEIGHT[m.level]===0));

  if(!weakSkills.length){wrap.innerHTML='';return;}

  const rows=weakSkills.map(s=>{
    const suggestion=SKILL_SOLUTIONS[s.key]?.[m.level]||'';
    const saved=existing[s.key]||'';
    return `
      <div class="dev-plan-row">
        <div class="dp-skill-header">
          <span class="dp-skill-name">${s.label}</span>
          <span class="status-chip st-developing">${s.v}%</span>
        </div>
        <div class="dp-suggestion">💡 Suggested: ${suggestion}</div>
        <textarea class="dp-note" id="dp_${s.key}" rows="2"
          placeholder="Add your specific instruction or expectation for this cycle…">${saved}</textarea>
      </div>`;
  }).join('');

  wrap.innerHTML=`
    <div class="dev-plan-section-wrap">
      <h3 class="sec-heading">Development Plan <span style="font-weight:400;color:var(--gray-400)">(${weakSkills.length} skill${weakSkills.length>1?'s':''} need attention)</span></h3>
      <p class="sec-sub">Suggestions pre-filled from the framework. Add your specific instruction per skill.</p>
      ${rows}
    </div>`;
}

// ── Weak area panel (right column) ──────────────
function renderWeakAreaPanel(memberId){
  const wrap=document.getElementById('weak-area-panel');
  if(!wrap) return;
  const members=getMembers();
  const m=members.find(x=>x.id===memberId); if(!m) return;
  const last=m.history[m.history.length-1]||{skills:{},leadership:{}};
  const nl=nextLevel(m.level);
  if(!nl){wrap.innerHTML='';return;}

  const weakSkills=[...SKILLS.map(s=>({...s,v:last.skills[s.key]||0})),...LEADERSHIP.map(l=>({...l,v:last.leadership[l.key]||0}))]
    .filter(s=>s.v<70).slice(0,4);
  if(!weakSkills.length){wrap.innerHTML='';return;}

  const items=weakSkills.map(s=>`
    <div class="wa-item">
      <div class="wa-skill">${s.label} <span class="status-chip st-developing">${s.v}%</span></div>
      <div class="wa-next">At ${nl}: ${getSkillContext(s.key,nl)}</div>
    </div>`).join('');

  wrap.innerHTML=`
    <div class="card card-sm">
      <div class="sec-heading" style="margin-bottom:8px">⚠ Weak Areas vs ${nl} Expectations</div>
      ${items}
    </div>`;
}

// ── Save cycle ───────────────────────────────────
window.saveCycle=function(id){
  const members=getMembers();
  const idx=members.findIndex(x=>x.id===id); if(idx<0) return;
  const m=members[idx];
  const {skills,leadership}=readCurrentSliders();
  const lw=LEADERSHIP_WEIGHT[m.level]||0;

  // Validate: weak skills must have a comment
  const allSkills=[...SKILLS,...(lw>0?LEADERSHIP:[])];
  const allVals={...skills,...(lw>0?leadership:{})};
  const missing=allSkills.filter(s=>{
    const v=allVals[s.key]||0;
    if(v>=70) return false;
    const inp=document.getElementById('sc_'+s.key);
    return !inp||!inp.value.trim();
  });
  if(missing.length){
    toast(`Please add a reason for: ${missing.map(s=>s.label).join(', ')}`, 'error');
    missing.forEach(s=>{
      const inp=document.getElementById('sc_'+s.key);
      if(inp){inp.classList.add('input-error');inp.focus();}
    });
    return;
  }

  // Collect comments
  const skillComments={};
  [...SKILLS,...LEADERSHIP].forEach(s=>{
    const inp=document.getElementById('sc_'+s.key);
    if(inp&&inp.value.trim()) skillComments[s.key]=inp.value.trim();
  });

  // Collect dev plan
  const devPlan=[];
  [...SKILLS,...LEADERSHIP].forEach(s=>{
    const ta=document.getElementById('dp_'+s.key);
    if(ta&&ta.value.trim()){
      devPlan.push({
        id:'dp_'+Date.now()+'_'+s.key,
        skillKey:s.key,
        skillLabel:s.label,
        suggestion:SKILL_SOLUTIONS[s.key]?.[m.level]||'',
        managerNote:ta.value.trim(),
        done:false,doneDate:null,
      });
    }
  });

  const note=document.getElementById('mgr-note')?.value||'';
  const overall=calcOverall(skills,leadership,m.level);
  const cycle={date:new Date().toISOString().slice(0,10),skills,leadership,note,overall,skillComments,devPlan};
  m.history.push(cycle);
  members[idx]=m; saveMembers(members);
  drawLineChart('trend-chart',m.history,m.level);
  toast('Cycle saved — '+m.name+' · '+overall+'%','ok');
  renderWeakAreaPanel(id);
};

window.closeDetail=function(){selectedMemberId=null;renderManager();}

// ── Queue view ───────────────────────────────────
function buildQueueView(){
  const pending=getPending();
  if(!pending.length) return '<div class="empty-state">✅ All caught up — no pending items.</div>';
  const items=pending.map(p=>{
    const icon=p.type==='achievement'?'🏅':'💬';
    const iconClass=p.type==='achievement'?'qi-achievement':'qi-feedback';
    const title=p.type==='achievement'?`Achievement · ${p.category}`:`Peer Feedback · ${p.feedback_type}`;
    const meta=p.type==='achievement'?`From: ${p.from}`:`From: ${p.from} → ${p.target}`;
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
window.approveItem=function(id){
  let pending=getPending(),approved=getApproved();
  const item=pending.find(p=>p.id===id); if(!item) return;
  pending=pending.filter(p=>p.id!==id);
  item.approvedDate=new Date().toISOString().slice(0,10);
  approved.push(item);
  savePending(pending);saveApproved(approved);
  toast('Item approved ✓','ok'); renderManagerTabContent();
};
window.removeItem=function(id){
  savePending(getPending().filter(p=>p.id!==id));
  toast('Item removed'); renderManagerTabContent();
};

// ── Promo view ───────────────────────────────────
function buildPromoView(){
  const candidates=getMembers().filter(m=>isPromoCandidate(m));
  if(!candidates.length) return '<div class="empty-state">No promotion candidates yet. Members need 3+ consecutive cycles above threshold with all skills ≥ 45%.</div>';
  const rows=candidates.map(m=>{
    const last=m.history[m.history.length-1]||{};
    const nl=nextLevel(m.level);
    return `<tr>
      <td><strong>${m.name}</strong></td>
      <td><span class="level-badge lv-${m.level}">${m.level}</span></td>
      <td><span style="font-weight:700;color:var(--green)">${last.overall||0}%</span></td>
      <td>${THRESHOLDS[m.level]}%</td>
      <td>${nl?`<span class="level-badge lv-${nl}">${nl}</span>`:'—'}</td>
      <td><span class="status-chip st-high">Ready</span></td>
    </tr>`;
  }).join('');
  return `<div class="card"><table class="promo-table">
    <thead><tr><th>Name</th><th>Current</th><th>Score</th><th>Threshold</th><th>Target</th><th>Status</th></tr></thead>
    <tbody>${rows}</tbody>
  </table></div>`;
}

// ── Settings view (PIN management) ──────────────
function buildSettingsView(){
  const members=getMembers();
  const auth=getAuth();
  const rows=members.map(m=>`
    <tr>
      <td><strong>${m.name}</strong></td>
      <td><span class="level-badge lv-${m.level}">${m.level}</span></td>
      <td>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="password" inputmode="numeric" maxlength="4" class="pin-reset-input" id="pin_${m.id}" placeholder="New PIN">
          <button class="btn-approve" onclick="resetMemberPin('${m.id}')">Set PIN</button>
        </div>
      </td>
    </tr>`).join('');
  return `
    <div class="card">
      <h3 class="sec-heading">Member PIN Management</h3>
      <p class="sec-sub" style="margin-bottom:16px">Default PIN for all members is <code>0000</code>. Reset here after onboarding.</p>
      <table class="promo-table">
        <thead><tr><th>Name</th><th>Level</th><th>Set PIN</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="card mt-20">
      <h3 class="sec-heading">Manager PIN</h3>
      <div style="display:flex;gap:8px;align-items:center;margin-top:12px;max-width:280px">
        <input type="password" inputmode="numeric" maxlength="4" class="pin-reset-input" id="pin_manager" placeholder="New manager PIN">
        <button class="btn-approve" onclick="resetManagerPin()">Update</button>
      </div>
    </div>`;
}
window.resetMemberPin=function(id){
  const val=document.getElementById('pin_'+id)?.value;
  if(!val||val.length!==4){toast('PIN must be exactly 4 digits','error');return;}
  const auth=getAuth();
  if(!auth.members) auth.members={};
  auth.members[id]={pin:val};
  saveAuth(auth); toast('PIN updated ✓','ok');
};
window.resetManagerPin=function(){
  const val=document.getElementById('pin_manager')?.value;
  if(!val||val.length!==4){toast('PIN must be exactly 4 digits','error');return;}
  const auth=getAuth();
  auth.manager={pin:val};
  saveAuth(auth); toast('Manager PIN updated ✓','ok');
};

// ═══════════════════════════════════════════════
//  MEMBER VIEW
// ═══════════════════════════════════════════════
let loggedInMember=null;

function renderMember(){
  const root=document.getElementById('view-member');
  // Step 1: choose name
  const members=getMembers();
  const opts=members.map(m=>`<option value="${m.id}">${m.name} (${m.level})</option>`).join('');
  root.innerHTML=`
    <div class="pin-card">
      <div class="pin-icon">🧑‍💼</div>
      <h2>Your Growth Journey</h2>
      <p class="pin-hint">Select your name, then enter your PIN.</p>
      <select class="name-select" id="member-select">
        <option value="">— Select your name —</option>${opts}
      </select>
      <button class="login-btn" onclick="memberSelectStep()">Continue</button>
    </div>`;
}

window.memberSelectStep=function(){
  const id=document.getElementById('member-select').value;
  if(!id){toast('Please select your name','error');return;}
  // Show PIN entry
  const root=document.getElementById('view-member');
  const auth=getAuth();
  const memberName=getMemberName(id);
  root.innerHTML=`
    <div class="pin-card">
      <div class="pin-icon">🔒</div>
      <h2>${memberName}</h2>
      <p class="pin-hint">Enter your 4-digit PIN</p>
      <input class="pin-input" id="pin-entry" type="password" inputmode="numeric" maxlength="4" placeholder="••••" autofocus>
      <button class="pin-btn" onclick="checkPin('member','${id}')">Enter</button>
      <button style="background:none;border:none;color:var(--gray-400);font-size:.8rem;margin-top:8px;cursor:pointer" onclick="renderMember()">← Back</button>
      <div class="pin-error" id="pin-error"></div>
    </div>`;
  document.getElementById('pin-entry').addEventListener('keydown',e=>{if(e.key==='Enter') checkPin('member',id);});
};

function renderMemberDashboard(){
  const m=loggedInMember;
  if(!m) return;
  const root=document.getElementById('view-member');
  const last=m.history[m.history.length-1]||{skills:{},leadership:{},skillComments:{},devPlan:[]};
  const score=last.overall||0;
  const st=scoreStatus(score);
  const tgt=targetLevel(m.level);

  const approved=getApproved();
  const myAchievements=approved.filter(a=>a.type==='achievement'&&a.from===m.name);
  const myFeedback=approved.filter(a=>a.type==='feedback'&&a.target===m.name);

  // Skill scores with manager comments
  const skillDetail=SKILLS.map(s=>{
    const v=last.skills[s.key]||0;
    const comment=last.skillComments?.[s.key]||'';
    const st2=scoreStatus(v);
    const ctx=getSkillContext(s.key,m.level);
    return `
      <div class="member-skill-row">
        <div class="msr-left">
          <span class="msr-name">${s.label}</span>
          <span class="msr-ctx">${ctx}</span>
        </div>
        <div class="msr-right">
          <div class="msr-bar-wrap">
            <div class="msr-bar" style="width:${v}%;background:${barColor(st2)}"></div>
          </div>
          <span class="msr-val" style="color:${barColor(st2)}">${v}%</span>
        </div>
        ${comment?`<div class="msr-comment">💬 Manager: "${comment}"</div>`:''}
      </div>`;
  }).join('');

  // Dev plan items
  const allDevPlan=m.history.flatMap((c,ci)=>(c.devPlan||[]).map(d=>({...d,cycleDate:c.date,cycleIdx:ci})));
  const activeDevPlan=allDevPlan.filter(d=>!d.done);
  const doneDevPlan=allDevPlan.filter(d=>d.done);

  const devPlanRows=activeDevPlan.length?activeDevPlan.map(d=>`
    <div class="dp-member-row">
      <div class="dp-skill-header">
        <span class="dp-skill-name">${d.skillLabel}</span>
        <span class="status-chip st-developing">Active</span>
      </div>
      ${d.suggestion?`<div class="dp-suggestion">💡 Framework: ${d.suggestion}</div>`:''}
      <div class="dp-manager-note">📌 Manager says: ${d.managerNote}</div>
      <button class="btn-done" onclick="markDevItemDone('${m.id}',${d.cycleIdx},'${d.id}')">Mark as Done ✓</button>
    </div>`)
    .join('')
  :'<div class="empty-state" style="padding:16px">No active development items — great work!</div>';

  // Achievements
  const achieveItems=myAchievements.length?myAchievements.map(a=>`
    <div class="approved-item">
      <div class="ai-header"><span class="cat-badge">${a.category}</span></div>
      <div class="ai-text">${a.text}</div>
      <div class="ai-from">${a.date}</div>
    </div>`).join('')
  :'<div class="empty-state" style="padding:16px">Log your first achievement below!</div>';

  // Feedback
  const fbItems=myFeedback.length?myFeedback.map(f=>`
    <div class="approved-item">
      <div class="ai-header">
        <span class="cat-badge ${f.feedback_type==='Positive'?'fb-positive':'fb-constructive'}">${f.feedback_type}</span>
        <span style="font-size:.75rem;color:var(--gray-400)">from ${f.from}</span>
      </div>
      <div class="ai-text">${f.text}</div>
      <div class="ai-from">${f.date}</div>
    </div>`).join('')
  :'<div class="empty-state" style="padding:16px">No approved peer feedback yet.</div>';

  root.innerHTML=`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
      <button class="back-btn" onclick="memberLogout()">← Switch Member</button>
      <div>
        <div style="font-size:1.1rem;font-weight:800">${m.name}</div>
        <span class="level-badge lv-${m.level}">${m.level} · ${LEVEL_NAMES[m.level]}</span>
      </div>
    </div>

    <!-- Journey map -->
    <div class="card card-sm mb-16">${buildJourneyMap(m)}</div>

    <!-- Score + growth arrow -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card overall-score-card">
        <div class="overall-num" style="color:${barColor(st)}">${score}%</div>
        <div class="overall-label">${statusLabel(st)}</div>
        <div style="font-size:.72rem;color:var(--gray-400);margin-top:4px">Threshold: ${THRESHOLDS[m.level]?THRESHOLDS[m.level]+'%':'Exec review'}${isPromoCandidate(m)?' · 🏆 Promo ready!':''}</div>
      </div>
      <div class="card growth-arrow-card">
        <div class="ga-level"><div class="ga-code" style="color:var(--purple)">${m.level}</div><div class="ga-name">${LEVEL_NAMES[m.level]}</div></div>
        <div class="ga-arrow">→</div>
        <div class="ga-level ga-target"><div class="ga-code">${tgt}</div><div class="ga-name">${LEVEL_NAMES[tgt]}</div></div>
      </div>
    </div>

    <!-- Charts -->
    <div style="display:grid;grid-template-columns:280px 1fr;gap:16px;margin-bottom:16px">
      <div class="card card-sm"><div class="sec-heading mb-8">Skill Radar</div><div class="radar-wrap"><canvas id="member-radar"></canvas></div></div>
      <div class="card card-sm"><div class="sec-heading mb-8">Score Journey</div><div class="chart-wrap" style="height:220px"><canvas id="member-trend"></canvas></div></div>
    </div>

    <!-- Skills with comments -->
    <div class="card card-sm mb-16">
      <div class="sec-heading mb-12">Your Skill Scores & Manager Comments</div>
      ${skillDetail}
    </div>

    <!-- Dev plan -->
    <div class="card card-sm mb-16">
      <div class="sec-heading mb-8">Your Development Plan <span style="font-weight:400;color:var(--gray-400)">(${activeDevPlan.length} active)</span></div>
      ${devPlanRows}
      ${doneDevPlan.length?`<div style="margin-top:12px;font-size:.78rem;color:var(--gray-400)">${doneDevPlan.length} item(s) completed ✓</div>`:''}
    </div>

    <!-- Two column: achievements + feedback -->
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div class="card card-sm"><div class="sec-heading mb-8">Achievements</div><div class="approved-list">${achieveItems}</div></div>
      <div class="card card-sm"><div class="sec-heading mb-8">Peer Feedback</div><div class="approved-list">${fbItems}</div></div>
    </div>

    <!-- Log achievement -->
    <div class="card card-sm">
      <div class="sec-heading mb-12">Log an Achievement</div>
      <div class="achieve-form">
        <select id="ach-cat"><option value="">— Select category —</option>${ACHIEVEMENT_CATS.map(c=>`<option>${c}</option>`).join('')}</select>
        <textarea id="ach-text" rows="3" placeholder="Describe the specific achievement, outcome, or initiative…"></textarea>
        <button class="submit-btn" onclick="submitAchievement()">Submit for Manager Review</button>
      </div>
    </div>`;

  drawRadar('member-radar',last.skills,m.level);
  drawLineChart('member-trend',m.history,m.level);
}

window.memberLogout=function(){
  loggedInMember=null;
  sessionStorage.removeItem('gjc_mbr_authed');
  renderMember();
};

window.markDevItemDone=function(memberId,cycleIdx,devPlanId){
  const members=getMembers();
  const m=members.find(x=>x.id===memberId); if(!m) return;
  const cycle=m.history[cycleIdx]; if(!cycle) return;
  const item=cycle.devPlan?.find(d=>d.id===devPlanId); if(!item) return;
  item.done=true; item.doneDate=new Date().toISOString().slice(0,10);
  saveMembers(members);
  loggedInMember=m;
  toast('Marked as done ✓','ok');
  renderMemberDashboard();
};

window.submitAchievement=function(){
  const cat=document.getElementById('ach-cat').value;
  const text=document.getElementById('ach-text').value.trim();
  if(!cat){toast('Please select a category','error');return;}
  if(text.length<15){toast('Please describe your achievement in more detail','error');return;}
  const pending=getPending();
  pending.push({id:'p_'+Date.now(),type:'achievement',from:loggedInMember.name,target:loggedInMember.name,category:cat,text,date:new Date().toISOString().slice(0,10)});
  savePending(pending);
  toast('Submitted for manager review ✓','ok');
  document.getElementById('ach-cat').value='';
  document.getElementById('ach-text').value='';
};

// ═══════════════════════════════════════════════
//  PEER VIEW
// ═══════════════════════════════════════════════
function renderPeer(){
  const members=getMembers();
  const opts=members.map(m=>`<option value="${m.name}">${m.name}</option>`).join('');
  document.getElementById('view-peer').innerHTML=`
    <div class="card" style="max-width:560px;margin:0 auto;padding:28px">
      <div style="font-size:1rem;font-weight:800;margin-bottom:4px">Submit Peer Feedback</div>
      <div style="font-size:.82rem;color:var(--gray-400);margin-bottom:20px">Feedback goes to the manager for review before it's visible to the recipient.</div>
      <div class="notice-box mb-16">ℹ️ You cannot see scores or profiles. Feedback must reference a specific observable behaviour — no generalities or personal comparisons.</div>
      <div class="peer-form">
        <div><label>Your name</label><select id="peer-from"><option value="">— Your name —</option>${opts}</select></div>
        <div><label>Feedback for</label><select id="peer-target"><option value="">— Colleague —</option>${opts}</select></div>
        <div><label>Type</label>
          <select id="peer-type">
            <option value="Positive">Positive — recognise a specific action or result</option>
            <option value="Constructive">Constructive — highlight a development area with example</option>
          </select>
        </div>
        <div><label>Your feedback <span style="font-weight:400;color:var(--gray-400)">(min 30 characters, specific event required)</span></label>
          <textarea id="peer-text" rows="4" placeholder="e.g. Priya independently ran the AM onboarding session this week without prompting — strong initiative signal."></textarea>
        </div>
        <button class="peer-submit" onclick="submitPeerFeedback()">Submit Feedback</button>
        <div class="success-msg" id="peer-success">Feedback submitted! Your manager will review it before it's visible. 🎉</div>
      </div>
    </div>`;
}
window.submitPeerFeedback=function(){
  const from=document.getElementById('peer-from').value;
  const target=document.getElementById('peer-target').value;
  const type=document.getElementById('peer-type').value;
  const text=document.getElementById('peer-text').value.trim();
  if(!from){toast('Please select your name','error');return;}
  if(!target){toast('Please select a colleague','error');return;}
  if(from===target){toast('You cannot submit feedback about yourself','error');return;}
  if(text.length<30){toast('Please write a specific observation (min 30 characters)','error');return;}
  const pending=getPending();
  pending.push({id:'p_'+Date.now(),type:'feedback',feedback_type:type,from,target,text,date:new Date().toISOString().slice(0,10)});
  savePending(pending);
  document.getElementById('peer-text').value='';
  document.getElementById('peer-from').value='';
  const s=document.getElementById('peer-success');s.style.display='block';setTimeout(()=>s.style.display='none',4000);
};

// ── Workflow tab ─────────────────────────────────
function renderWorkflow(){
  document.getElementById('view-workflow').innerHTML=`
    <div class="card" style="padding:16px">
      <div class="sec-heading mb-12">End-to-End Workflow — 5 Swim Lanes</div>
      <img src="workflow.svg" alt="Growth Journey Workflow" style="width:100%;border-radius:8px;border:1px solid var(--gray-200)">
    </div>`;
}

// ═══════════════════════════════════════════════
//  ROLE SWITCHING
// ═══════════════════════════════════════════════
let activeRole='manager';
const VIEWS=['manager','member','peer','workflow'];

window.setRole=function(role){
  activeRole=role;
  VIEWS.forEach(v=>{
    document.getElementById('view-'+v).style.display=v===role?'block':'none';
    const btn=document.getElementById('tab-'+v);
    if(btn) btn.classList.toggle('active',v===role);
  });
  if(role==='manager')  renderManager();
  if(role==='member')   { const authedId=sessionStorage.getItem('gjc_mbr_authed'); if(authedId&&!loggedInMember){loggedInMember=getMembers().find(m=>m.id===authedId);} loggedInMember?renderMemberDashboard():renderMember(); }
  if(role==='peer')     renderPeer();
  if(role==='workflow') renderWorkflow();
};

// ── Boot ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  seedIfEmpty();
  setRole('manager');
});
