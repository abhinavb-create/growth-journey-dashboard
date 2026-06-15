/* ═══════════════════════════════════════════════
   Growth Journey Calculator  app.js  v3
   Visual overhaul:
   • Sidebar + main-panel manager layout
   • Inline skill rows (rating + comment same row)
   • Improved journey map (next-step + goal tags)
   • Time-period chart filter
   • Real-time snapshots (no forced "cycle" language)
═══════════════════════════════════════════════ */

// ── Constants ─────────────────────────────────────
const LEVELS = ['JA','A','SA','AM','M','SM'];
const LEVEL_NAMES = {JA:'Junior Associate',A:'Associate',SA:'Senior Associate',AM:'Associate Manager',M:'Manager',SM:'Senior Manager'};
const LEVEL_COLORS = {JA:'#7C3AED',A:'#2563EB',SA:'#059669',AM:'#D97706',M:'#DC2626',SM:'#9D174D'};
const THRESHOLDS = {JA:70,A:72,SA:75,AM:78,M:82,SM:null};
const LEADERSHIP_WEIGHT = {JA:0,A:0,SA:.10,AM:.25,M:.40,SM:.50};

const SKILLS = [
  {key:'sales',        label:'Sales Skills',       sub:'Pipeline, closures, upsell'},
  {key:'reporting',    label:'Reporting',           sub:'Accuracy, timeliness, insight'},
  {key:'maturity',     label:'Maturity',            sub:'Decision-making, judgement'},
  {key:'independence', label:'Independence',        sub:'Ownership vs escalation'},
  {key:'ai_adoption',  label:'AI Adoption',         sub:'Tools, initiatives, upskilling'},
  {key:'cross_fn',     label:'Cross-functional',    sub:'Collaboration, bridging gaps'},
  {key:'escalation',   label:'Escalation Quality',  sub:'When, how, resolution speed'},
  {key:'communication',label:'Communication',       sub:'Clarity, follow-ups, async'},
  {key:'enthusiasm',   label:'Enthusiasm',          sub:'Energy, initiative, ownership'},
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

// ── Framework context per skill × level ────────────
const SKILL_CONTEXT = {
  sales:{JA:'Shadow AMs; support pipeline basics',A:'Manage small accounts end-to-end',SA:'Own mid-tier accounts; upsell awareness',AM:'Team pipeline accountability; P&L awareness',M:'Full P&L ownership; strategic accounts',SM:'Segment strategy; enterprise relationships'},
  reporting:{JA:'Daily reports using templates; accuracy',A:'Accurate reports; minimal errors',SA:'Insight-led; identify trends proactively',AM:'Coach team reporting; build dashboards',M:'Strategic narrative reporting to leadership',SM:'C-suite & board-level reporting'},
  maturity:{JA:'Reactive; seek guidance frequently',A:'Growing maturity; handles routine issues',SA:'Calm under ambiguity; sets composed example',AM:'Sets tone for team; calm under pressure',M:'High business maturity; drives decisions',SM:'Organisational-level maturity & culture'},
  independence:{JA:'~20% independent; expected at this level',A:'~40% independent; ask when unsure',SA:'~70% independent; escalate complex only',AM:'Delegates fully; owns all outcomes',M:'Full autonomy; sets team direction',SM:'Shapes org direction without input'},
  ai_adoption:{JA:'Intro to AI tools; prompting basics',A:'AI for research & drafts',SA:'AI in daily workflow; 1 initiative owned',AM:'Drive team AI adoption; upskill others',M:'AI strategy for the group',SM:'AI transformation lead for business unit'},
  cross_fn:{JA:'Shadow cross-fn calls',A:'Participate in cross-fn discussions',SA:'Lead a cross-fn project end-to-end',AM:'Bridge functions; resolve cross-fn conflicts',M:'Cross-org influence; trusted partner',SM:'Cross-company influence; joint priorities'},
  escalation:{JA:'Learning when to escalate',A:'Recognise triggers; escalate with context',SA:'Strong judgement; resolves quickly',AM:'Escalation owner; coaches team',M:'Gatekeeper for function',SM:'Critical escalation calls across org'},
  communication:{JA:'Clear writing; misses follow-ups sometimes',A:'Regular follow-ups; some gaps',SA:'Proactive; rare misses; strong async',AM:'Crisp async; no meaningful misses',M:'Executive-level communication',SM:'Board-level stakeholder management'},
  enthusiasm:{JA:'High energy; eager to learn',A:'Self-motivated; meets targets',SA:'Drives team energy; mentors JAs',AM:'Inspires team; holds high standards',M:'Culture driver; attracts talent',SM:'Visionary; sets culture & direction'},
  people:{JA:'No reports — observe team dynamics',A:'Informally guide peers on tasks',SA:'Sponsor JAs; first people-leadership signal',AM:'Manage 2–4 ICs; set expectations',M:'Lead 5–10; accountable for team culture',SM:'Lead managers; own org design'},
  vision:{JA:'Follow team direction; no input expected',A:'Understand goals; connect work to strategy',SA:'Contribute to team strategy with perspective',AM:'Translate vision into team goals',M:'Co-own function strategy; 6–12 month plan',SM:'Own BU vision; 1–3 year strategy'},
  stakeholder:{JA:'Build rapport with manager; low influence',A:'Build credibility with peers & one level up',SA:'Trusted voice in cross-fn; influence peers',AM:'Navigate cross-fn; shape decisions upward',M:'Influence exec stakeholders',SM:'Trusted advisor to C-suite'},
  developing:{JA:'Being developed — be receptive & curious',A:'Seek mentorship; share learnings with JAs',SA:'Formally mentor JAs; run onboarding',AM:'Structured 1:1s; growth plans per direct',M:'Develop AMs; succession plan in place',SM:'Build leadership bench; coaching culture'},
  resilience:{JA:'Recover with manager support — normal',A:'Handle routine pressure independently',SA:'Stay effective under pressure; rally team',AM:'Model calm under crisis; team\'s anchor',M:'Lead through ambiguity without losing team',SM:'Embody resilience; build resilient org'},
  decision:{JA:'Defer to manager; low autonomy expected',A:'Low-stakes decisions solo; escalate larger',SA:'Own domain decisions; escalate complex',AM:'Team-level decisions confidently',M:'High-quality, high-speed; own outcomes fully',SM:'Set decision bar for the org'},
};

// ── Suggested solutions per skill × level ─────────
const SKILL_SOLUTIONS = {
  sales:{JA:'Shadow 3 AM calls; write key observations',A:'Close 1 small account solo; debrief with manager',SA:'Add upsell tracking to pipeline; review weekly',AM:'Run team pipeline review; coach on deal quality',M:'Review P&L vs targets; identify top 3 levers',SM:'Define segment strategy; build flagship account plan'},
  reporting:{JA:'Use template daily for 2 weeks; zero missed fields',A:'Add 1 insight line to each report this week',SA:'Pick 1 data trend; present at stand-up',AM:'Run 30-min reporting clinic with the team',M:'Redesign 1 report to be decision-ready',SM:'Commission external benchmarking for board'},
  maturity:{JA:'Write your reasoning before escalating anything',A:'Handle 2 routine ambiguous situations solo',SA:'Document 3 decisions made under ambiguity',AM:'Post-mortem 1 crisis with written lessons-learned',M:'Draft a decision-rights document for your team',SM:'Run a leadership retrospective on decision quality'},
  independence:{JA:'Complete 1 task fully solo this week',A:'Block manager check-ins to 1/week on routine tasks',SA:'Spend 1 week escalating nothing routine',AM:'Delegate 2 tasks you currently own to a direct',M:'Review where team still escalates to you unnecessarily',SM:'Audit org-wide decision rights; push ownership down'},
  ai_adoption:{JA:'Spend 30 min/day on an AI tool this week',A:'Use AI for a research task; share prompt with team',SA:'Start an AI initiative: document problem + outcome',AM:'Run a 1-hour AI tools session with your team',M:'Build team AI adoption plan with 2 measurable outcomes',SM:'Commission AI transformation roadmap for BU'},
  cross_fn:{JA:'Attend 1 cross-fn meeting; contribute 1 data point',A:'Share an update with 1 adjacent team proactively',SA:'Lead a joint session with 1 cross-fn partner',AM:'Resolve 1 cross-fn friction before it escalates',M:'Broker a joint OKR with an adjacent team lead',SM:'Initiate a company-wide cross-fn working group'},
  escalation:{JA:'Before escalating, write: tried / failed / need',A:'Review last 3 escalations — any solvable solo?',SA:'Document your escalation framework; share with junior',AM:'Review team escalations monthly; find patterns',M:'Set team escalation standards; review quarterly',SM:'Define escalation doctrine for the org'},
  communication:{JA:'Set daily follow-up reminder; nothing open >48h',A:'Audit last week\'s comms — follow up anything stale',SA:'Write 1 async update per week for key stakeholders',AM:'Introduce a team comms standard (async-first)',M:'Prepare a monthly stakeholder comms plan',SM:'Draft a comms framework for external stakeholders'},
  enthusiasm:{JA:'Volunteer for 1 stretch task this week',A:'Share a team win in the channel this week',SA:'Mentor a JA for 30 min; log it formally',AM:'Run an energy check-in with your team',M:'Plan 1 cultural ritual or recognition moment',SM:'Articulate your team\'s purpose story to the org'},
  people:{JA:'Observe how your manager runs 1:1s; note 3 things',A:'Help a peer on something they\'re struggling with',SA:'Run a structured 30-min 1:1 with a JA',AM:'Write a growth plan for each direct this quarter',M:'Identify succession candidate; start dev plan',SM:'Run a talent review and leadership offsite'},
  vision:{JA:'Read team OKRs; write how your work maps to them',A:'Share perspective on 1 priority in next planning',SA:'Write 1-page view on where your area heads in 12M',AM:'Present a team-level strategy to your manager',M:'Co-author the function\'s 6-month strategic plan',SM:'Draft BU 3-year vision; share at leadership forum'},
  stakeholder:{JA:'Send 1 proactive update to manager (no prompting)',A:'Intro yourself to 1 stakeholder outside your team',SA:'Do stakeholder mapping; identify top 5',AM:'Build stakeholder communication calendar for the quarter',M:'Request a skip-level; come with an agenda',SM:'Schedule quarterly advisory sessions with C-suite'},
  developing:{JA:'Ask for 1 specific piece of development feedback today',A:'Share 1 learning with a JA peer this cycle',SA:'Set up a monthly mentoring touchpoint with a JA',AM:'Write a 90-day dev plan for each direct report',M:'Identify 2 high-potential people; sponsor their visibility',SM:'Run formal talent review; identify succession depth'},
  resilience:{JA:'After a setback: write what happened + next step',A:'Handle 1 stressful situation solo before flagging',SA:'Rally team after a miss — write debrief + forward plan',AM:'Share a resilience story with team to normalise it',M:'Lead team through ambiguous change with clear comms',SM:'Publish your personal resilience principles for the org'},
  decision:{JA:'Write your best answer before asking manager',A:'Make 3 low-stakes decisions solo this week',SA:'Document 3 decisions you owned; share rationale',AM:'Run team decision review — where are you deciding for others?',M:'Set a 48h decision-turnaround standard for your team',SM:'Define decision rights across your leadership layer'},
};

// ── Default seed scores ─────────────────────────
const DEFAULT_SCORES = {
  JA:{sales:35,reporting:38,maturity:30,independence:25,ai_adoption:30,cross_fn:25,escalation:28,communication:40,enthusiasm:65,people:0,vision:0,stakeholder:0,developing:0,resilience:35,decision:25},
  A: {sales:52,reporting:55,maturity:50,independence:48,ai_adoption:52,cross_fn:48,escalation:50,communication:58,enthusiasm:70,people:0,vision:0,stakeholder:0,developing:0,resilience:50,decision:45},
  SA:{sales:68,reporting:70,maturity:65,independence:72,ai_adoption:68,cross_fn:65,escalation:68,communication:72,enthusiasm:75,people:55,vision:50,stakeholder:55,developing:52,resilience:65,decision:60},
  AM:{sales:76,reporting:74,maturity:72,independence:80,ai_adoption:75,cross_fn:74,escalation:76,communication:78,enthusiasm:80,people:68,vision:64,stakeholder:66,developing:65,resilience:72,decision:70},
  M: {sales:84,reporting:82,maturity:80,independence:90,ai_adoption:82,cross_fn:80,escalation:84,communication:85,enthusiasm:85,people:78,vision:76,stakeholder:78,developing:75,resilience:80,decision:82},
  SM:{sales:92,reporting:90,maturity:90,independence:95,ai_adoption:90,cross_fn:90,escalation:92,communication:92,enthusiasm:92,people:88,vision:86,stakeholder:88,developing:85,resilience:88,decision:90},
};

const SEED_MEMBERS = [
  {name:'Priya Sharma',level:'SA'},{name:'Rohan Mehta',level:'A'},
  {name:'Ananya Iyer',level:'AM'},{name:'Karan Bose',level:'JA'},
  {name:'Divya Nair',level:'SA'},{name:'Arjun Kapoor',level:'M'},
  {name:'Sneha Reddy',level:'A'},{name:'Vikram Joshi',level:'AM'},
];

function makeCycle(level, offsetDays=0){
  const base = DEFAULT_SCORES[level];
  const j = k => Math.min(100,Math.max(0,base[k]+Math.round((Math.random()-.5)*10)));
  const skills={};  SKILLS.forEach(s=>skills[s.key]=j(s.key));
  const leadership={};LEADERSHIP.forEach(l=>leadership[l.key]=j(l.key));
  const d=new Date(); d.setDate(d.getDate()-offsetDays);
  return {date:d.toISOString().slice(0,10),skills,leadership,note:'',overall:calcOverall(skills,leadership,level),skillComments:{},devPlan:[]};
}
function calcOverall(skills,leadership,level){
  const sw=LEADERSHIP_WEIGHT[level]||0;
  const avgS=Object.values(skills).reduce((a,b)=>a+b,0)/Object.values(skills).length;
  const avgL=Object.values(leadership).reduce((a,b)=>a+b,0)/Object.values(leadership).length;
  return Math.round(avgS*(1-sw)+avgL*sw);
}

// ── Storage ─────────────────────────────────────
const getMembers  = ()=>JSON.parse(localStorage.getItem('gjc_members')||'[]');
const getPending  = ()=>JSON.parse(localStorage.getItem('gjc_pending')||'[]');
const getApproved = ()=>JSON.parse(localStorage.getItem('gjc_approved')||'[]');
const getAuth     = ()=>JSON.parse(localStorage.getItem('gjc_auth')||'{}');
const saveMembers  = d=>localStorage.setItem('gjc_members',JSON.stringify(d));
const savePending  = d=>localStorage.setItem('gjc_pending',JSON.stringify(d));
const saveApproved = d=>localStorage.setItem('gjc_approved',JSON.stringify(d));
const saveAuth     = d=>localStorage.setItem('gjc_auth',JSON.stringify(d));

function seedIfEmpty(){
  if(localStorage.getItem('gjc_seeded')) return;
  const members=SEED_MEMBERS.map((m,i)=>({
    id:'mbr_'+i,name:m.name,level:m.level,
    history:[84,70,56,42,28,14].map(d=>makeCycle(m.level,d)),
  }));
  saveMembers(members);savePending([]);saveApproved([]);
  const auth={manager:{pin:'1234'},members:{}};
  members.forEach(m=>auth.members[m.id]={pin:'0000'});
  saveAuth(auth);
  localStorage.setItem('gjc_seeded','1');
}

// ── Helpers ─────────────────────────────────────
function scoreStatus(s){return s<45?'needs':s<70?'dev':s<85?'track':'high';}
function statusLabel(s){return {needs:'Needs Attention',dev:'Developing',track:'On Track',high:'High Performer'}[s];}
function chipClass(s){return {needs:'chip chip-needs',dev:'chip chip-dev',track:'chip chip-track',high:'chip chip-high'}[s];}
function barColor(s){return {needs:'#DC2626',dev:'#D97706',track:'#059669',high:'#7C3AED'}[s];}
function initials(name){return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}
function nextLevel(lv){const i=LEVELS.indexOf(lv);return i<LEVELS.length-1?LEVELS[i+1]:null;}
function targetLevel(lv){const i=LEVELS.indexOf(lv);return LEVELS[Math.min(i+2,LEVELS.length-1)];}
function getCtx(key,level){return (SKILL_CONTEXT[key]&&SKILL_CONTEXT[key][level])||'';}
function isPromoCandidate(m){
  if(!THRESHOLDS[m.level]) return false;
  const last3=m.history.slice(-3);
  return last3.length>=3&&last3.every(c=>c.overall>=THRESHOLDS[m.level]&&Object.values(c.skills).every(v=>v>=45));
}

// ── Toast ────────────────────────────────────────
function toast(msg,type=''){
  const t=document.getElementById('toast');
  t.textContent=msg; t.className='show'+(type?' t-'+type:'');
  clearTimeout(t._t); t._t=setTimeout(()=>t.className='',2800);
}

// ── Chart instances ──────────────────────────────
let trendChart=null, radarChart=null;

function filterByPeriod(history,period){
  if(period==='all') return history;
  const now=new Date(), cutoff=new Date();
  if(period==='w2') cutoff.setDate(now.getDate()-14);
  else if(period==='m1') cutoff.setMonth(now.getMonth()-1);
  else if(period==='m3') cutoff.setMonth(now.getMonth()-3);
  else if(period==='m6') cutoff.setMonth(now.getMonth()-6);
  else if(period==='y1') cutoff.setFullYear(now.getFullYear()-1);
  const filtered=history.filter(c=>new Date(c.date)>=cutoff);
  return filtered.length>=2?filtered:history.slice(-Math.max(2,Math.ceil(history.length/2)));
}

function drawLineChart(canvasId,history,level,period='all'){
  const ctx=document.getElementById(canvasId); if(!ctx) return;
  if(trendChart){trendChart.destroy();trendChart=null;}
  const data=filterByPeriod(history,period);
  const scores=data.map(c=>c.overall);
  const labels=data.map(c=>c.date.slice(5));
  const thresh=THRESHOLDS[level];
  const datasets=[{
    label:'Score',data:scores,
    borderColor:'#7C3AED',backgroundColor:'rgba(124,58,237,.07)',
    pointBackgroundColor:scores.map(v=>barColor(scoreStatus(v))),
    pointRadius:5,tension:.4,fill:true,borderWidth:2,
  }];
  if(thresh) datasets.push({
    label:'Threshold',data:Array(scores.length).fill(thresh),
    borderColor:'rgba(220,38,38,.5)',borderDash:[5,4],
    pointRadius:0,borderWidth:1.5,fill:false,
  });
  trendChart=new Chart(ctx,{
    type:'line',data:{labels,datasets},
    options:{
      plugins:{legend:{display:false}},
      scales:{
        y:{min:0,max:100,ticks:{stepSize:25,font:{size:10}},grid:{color:'#F3F4F6'}},
        x:{ticks:{font:{size:10},maxRotation:0},grid:{display:false}},
      },
      animation:{duration:300},
    }
  });
}

function drawRadar(canvasId,skills){
  const ctx=document.getElementById(canvasId); if(!ctx) return;
  if(radarChart){radarChart.destroy();radarChart=null;}
  radarChart=new Chart(ctx,{
    type:'radar',
    data:{
      labels:SKILLS.map(s=>s.label.split(' ')[0]),
      datasets:[{data:SKILLS.map(s=>skills[s.key]||0),backgroundColor:'rgba(124,58,237,.12)',borderColor:'#7C3AED',pointBackgroundColor:'#7C3AED',borderWidth:2,pointRadius:3}],
    },
    options:{plugins:{legend:{display:false}},scales:{r:{min:0,max:100,ticks:{stepSize:25,font:{size:9}},pointLabels:{font:{size:10}}}},animation:{duration:280}},
  });
}

// ─────────────────────────────────────────────────
//  JOURNEY MAP v2
// ─────────────────────────────────────────────────
function buildJourneyMap(member){
  const curIdx=LEVELS.indexOf(member.level);
  const last=member.history[member.history.length-1]||{};
  const score=last.overall||0;
  const thresh=THRESHOLDS[member.level];
  const nextLv=nextLevel(member.level);
  const tgtLv=targetLevel(member.level);
  const progressPct=thresh?Math.min(100,Math.round((score/thresh)*100)):100;

  const parts=LEVELS.map((lv,i)=>{
    const isDone=i<curIdx;
    const isCurrent=i===curIdx;
    const isNextStep=lv===nextLv;
    const isGoal=lv===tgtLv&&lv!==nextLv;
    const isConnector=i<LEVELS.length-1;
    const t=THRESHOLDS[lv];

    let nodeClass='jm-node';
    let tag='';
    if(isDone)    {nodeClass+=' done'; }
    if(isCurrent) {nodeClass+=' current'; tag=`<div class="jm-tag tag-current">Current</div>`;}
    if(isNextStep){nodeClass+=' next-step'; tag=`<div class="jm-tag tag-next">Next step</div>`;}
    if(isGoal)    {nodeClass+=' goal'; tag=`<div class="jm-tag tag-goal">Goal</div>`;}

    const scoreLineHTML=isCurrent&&thresh
      ?`<div class="jm-score-line">${score}%<span class="jm-thresh-line">/${thresh}%</span></div>`:'';
    const gapHTML=isNextStep&&t
      ?`<div class="jm-gap-line">+${Math.max(0,t-score)}pts needed</div>`:'';
    const threshHTML=!isCurrent&&t
      ?`<div class="jm-thresh-line">${t}%</div>`:'';

    const progressBar=isCurrent&&thresh?`
      <div class="jm-progress-bar"><div class="jm-progress-fill" style="width:${progressPct}%"></div></div>`:''

    const connClass='jm-conn '+(isDone?'conn-done':isCurrent?'conn-partial':'conn-future');

    return `
      <div class="jm-step">
        <div class="${nodeClass}">${isDone?'✓':lv}</div>
        ${progressBar}
        <div class="jm-label">
          ${tag}
          <div class="jm-lname">${LEVEL_NAMES[lv].replace('Junior ','Jr ').replace('Associate ','Assoc. ').replace('Senior ','Sr ')}</div>
          ${scoreLineHTML}${gapHTML}${threshHTML}
        </div>
      </div>
      ${isConnector?`<div class="${connClass}"></div>`:''}`;
  }).join('');

  return `<div class="jmap">${parts}</div>`;
}

// ─────────────────────────────────────────────────
//  SKILL ROWS (inline: label | slider | score | comment)
// ─────────────────────────────────────────────────
function buildSkillRows(skills,leadership,level,skillComments={}){
  const lw=LEADERSHIP_WEIGHT[level]||0;
  const isLocked=lw===0;

  const skillHTML=SKILLS.map(s=>{
    const v=skills[s.key]||0;
    const isWeak=v<70;
    const st=scoreStatus(v);
    const ctx=getCtx(s.key,level);
    const comment=(skillComments[s.key]||'').replace(/"/g,'&quot;');
    return `
      <div class="sk-row ${isWeak?'sk-weak':''}" id="row_${s.key}">
        <div class="sk-meta">
          <div class="sk-name">${s.label}</div>
          <div class="sk-sub">${s.sub}</div>
          <div class="sk-ctx">${ctx}</div>
        </div>
        <input type="range" class="sk-slider" min="0" max="100" value="${v}"
               id="sk_${s.key}" oninput="syncSlider(this)">
        <div class="sk-score" id="sv_${s.key}" style="color:${barColor(st)}">${v}%</div>
        <input type="text" class="sk-comment ${isWeak?'req':''}" id="sc_${s.key}"
               placeholder="${isWeak?'⚠ Reason required…':'Note (optional)…'}"
               value="${comment}">
      </div>`;
  }).join('');

  const ldHTML=LEADERSHIP.map(l=>{
    const v=leadership[l.key]||0;
    const isWeak=!isLocked&&v<70;
    const st=scoreStatus(v);
    const ctx=isLocked?'Observed informally — not formally scored at JA/A':getCtx(l.key,level);
    const comment=(skillComments[l.key]||'').replace(/"/g,'&quot;');
    return `
      <div class="sk-row ${isLocked?'sk-locked':''} ${!isLocked&&isWeak?'sk-weak':''}" id="row_${l.key}">
        <div class="sk-meta">
          <div class="sk-name">${l.label}</div>
          <div class="sk-sub">${l.sub}</div>
          <div class="sk-ctx ${isLocked?'sk-ctx-locked':''}">${ctx}</div>
        </div>
        <input type="range" class="sk-slider" min="0" max="100" value="${v}"
               id="lk_${l.key}" oninput="syncSlider(this)" ${isLocked?'disabled':''}>
        <div class="sk-score" id="lv_${l.key}" style="color:${isLocked?'#9CA3AF':barColor(st)}">${v}%</div>
        <input type="text" class="sk-comment ${!isLocked&&isWeak?'req':''}" id="sc_${l.key}"
               placeholder="${!isLocked&&isWeak?'⚠ Reason required…':'Note (optional)…'}"
               value="${comment}" ${isLocked?'disabled':''}>
      </div>`;
  }).join('');

  const lwPct=Math.round(lw*100);
  const ldTitle=isLocked
    ?`<span class="sth-locked">Not formally scored at JA/A — observe informally</span>`
    :`<span class="sth-weight">Weighted ${lwPct}% of overall</span>`;

  return `
    <div class="section-card">
      <div class="skill-section-hd">
        <span class="sth-title">9 Skill Dimensions</span>
        <span style="font-size:.72rem;color:var(--g400)">Scores below 70% need a written reason</span>
      </div>
      <div class="skill-table">${skillHTML}</div>
      <div class="skill-section-hd" style="margin-top:0">
        <span class="sth-title">Leadership Capabilities</span>
        ${ldTitle}
      </div>
      <div class="skill-table">${ldHTML}</div>
    </div>`;
}

window.syncSlider=function(el){
  const id=el.id; const isLd=id.startsWith('lk_');
  const key=id.replace(/^(sk|lk)_/,'');
  const valEl=document.getElementById((isLd?'lv_':'sv_')+key);
  const v=parseInt(el.value);
  if(valEl){valEl.textContent=v+'%';valEl.style.color=barColor(scoreStatus(v));}
  const row=document.getElementById('row_'+key);
  if(row){
    row.classList.toggle('sk-weak',v<70&&!el.disabled);
    const ci=row.querySelector('.sk-comment');
    if(ci){ci.classList.toggle('req',v<70&&!el.disabled);ci.placeholder=v<70&&!el.disabled?'⚠ Reason required…':'Note (optional)…';}
  }
  // live overall update
  const m=getMembers().find(x=>x.id===selectedMemberId); if(!m) return;
  const {skills,leadership}=readSliders();
  const score=calcOverall(skills,leadership,m.level);
  const st=scoreStatus(score);
  const od=document.getElementById('overall-live');
  if(od){od.textContent=score+'%';od.style.color=barColor(st);}
  const sl=document.getElementById('status-live');
  if(sl) sl.textContent=statusLabel(st);
  renderDevSection(selectedMemberId,skills,leadership);
};

function readSliders(){
  const skills={},leadership={};
  SKILLS.forEach(s=>{const e=document.getElementById('sk_'+s.key);if(e) skills[s.key]=parseInt(e.value);});
  LEADERSHIP.forEach(l=>{const e=document.getElementById('lk_'+l.key);if(e) leadership[l.key]=parseInt(e.value);});
  return {skills,leadership};
}

// ─────────────────────────────────────────────────
//  DEV PLAN SECTION (dynamic — weak skills only)
// ─────────────────────────────────────────────────
function renderDevSection(memberId,skills,leadership){
  const wrap=document.getElementById('dev-section'); if(!wrap) return;
  const m=getMembers().find(x=>x.id===memberId); if(!m) return;
  const lw=LEADERSHIP_WEIGHT[m.level]||0;
  const last=m.history[m.history.length-1]||{devPlan:[]};
  const existing=(last.devPlan||[]).reduce((acc,d)=>{acc[d.skillKey]=d.managerNote;return acc;},{});

  const weak=[...SKILLS.map(s=>({...s,v:skills[s.key]||0})),
              ...(lw>0?LEADERSHIP.map(l=>({...l,v:leadership[l.key]||0})):[])].filter(s=>s.v<70);

  if(!weak.length){wrap.innerHTML='';return;}

  const rows=weak.map(s=>`
    <div class="dev-row">
      <div class="dev-header">
        <span class="dev-skill-name">${s.label}</span>
        <span class="chip chip-dev">${s.v}%</span>
      </div>
      <div class="dev-suggestion">💡 ${SKILL_SOLUTIONS[s.key]?.[m.level]||'No suggestion available'}</div>
      <input type="text" class="dev-input" id="dp_${s.key}"
             placeholder="Add your specific instruction for this member…"
             value="${(existing[s.key]||'').replace(/"/g,'&quot;')}">
    </div>`).join('');

  wrap.innerHTML=`
    <div class="section-card">
      <div class="skill-section-hd">
        <span class="sth-title">Development Focus</span>
        <span style="font-size:.72rem;color:var(--g400)">${weak.length} skill${weak.length>1?'s':''} below 70%</span>
      </div>
      ${rows}
    </div>`;
}

// ─────────────────────────────────────────────────
//  SAVE SNAPSHOT
// ─────────────────────────────────────────────────
window.saveSnapshot=function(id){
  const members=getMembers();
  const idx=members.findIndex(x=>x.id===id); if(idx<0) return;
  const m=members[idx];
  const {skills,leadership}=readSliders();
  const lw=LEADERSHIP_WEIGHT[m.level]||0;

  // Validate: weak skills need comment
  const all=[...SKILLS,...(lw>0?LEADERSHIP:[])];
  const vals={...skills,...(lw>0?leadership:{})};
  const missing=all.filter(s=>{
    if((vals[s.key]||0)>=70) return false;
    const ci=document.getElementById('sc_'+s.key);
    return !ci||!ci.value.trim();
  });
  if(missing.length){
    toast('Add a reason for: '+missing.map(s=>s.label).join(', '),'err');
    document.getElementById('sc_'+missing[0].key)?.focus();
    return;
  }

  const skillComments={};
  [...SKILLS,...LEADERSHIP].forEach(s=>{const ci=document.getElementById('sc_'+s.key);if(ci&&ci.value.trim()) skillComments[s.key]=ci.value.trim();});

  const devPlan=[];
  [...SKILLS,...LEADERSHIP].forEach(s=>{
    const inp=document.getElementById('dp_'+s.key);
    if(inp&&inp.value.trim()){
      devPlan.push({id:'dp_'+Date.now()+'_'+s.key,skillKey:s.key,skillLabel:s.label,
        suggestion:SKILL_SOLUTIONS[s.key]?.[m.level]||'',managerNote:inp.value.trim(),done:false,doneDate:null});
    }
  });

  const note=document.getElementById('mgr-note')?.value||'';
  const overall=calcOverall(skills,leadership,m.level);
  m.history.push({date:new Date().toISOString().slice(0,10),skills,leadership,note,overall,skillComments,devPlan});
  members[idx]=m; saveMembers(members);
  if(trendChart) drawLineChart('trend-chart',m.history,m.level,chartPeriod);
  renderSidebar();
  toast('Snapshot saved · '+m.name+' · '+overall+'%','ok');
};

// ─────────────────────────────────────────────────
//  MANAGER SHELL
// ─────────────────────────────────────────────────
let selectedMemberId=null;
let chartPeriod='all';
let mgrTab='team'; // 'team'|'queue'|'promo'|'settings'

function renderManager(){
  if(!sessionStorage.getItem('gjc_mgr_authed')){renderLoginGate('manager');return;}
  const root=document.getElementById('view-manager');
  root.innerHTML=`
    <div class="mgr-shell">
      <aside class="mgr-sidebar">
        <div class="sidebar-hd">
          <div>
            <span class="sidebar-title">Team</span>
            <span class="sidebar-count">${getMembers().length}</span>
          </div>
          <div style="display:flex;gap:4px">
            <button class="icon-btn" onclick="showQueue()" title="Pending queue">
              📋${getPending().length?`<span class="badge-count">${getPending().length}</span>`:''}
            </button>
            <button class="icon-btn" onclick="showSettings()" title="Settings">⚙</button>
          </div>
        </div>
        <div class="sidebar-body" id="sidebar-list"></div>
      </aside>
      <div class="mgr-main" id="mgr-main"></div>
    </div>`;
  renderSidebar();
  if(selectedMemberId) renderMemberDetail(selectedMemberId);
  else renderOverview();
}

function renderSidebar(){
  const members=getMembers();
  const el=document.getElementById('sidebar-list'); if(!el) return;
  el.innerHTML=members.map(m=>{
    const last=m.history[m.history.length-1]||{};
    const score=last.overall||0;
    const st=scoreStatus(score);
    const promo=isPromoCandidate(m);
    return `
      <div class="sb-member ${selectedMemberId===m.id?'active':''}" onclick="selectMember('${m.id}')">
        <div class="sb-avatar" style="background:${LEVEL_COLORS[m.level]}">${initials(m.name)}</div>
        <div class="sb-info">
          <div class="sb-name">${m.name} ${promo?'🏆':''}</div>
          <div class="sb-meta">
            <span class="lv lv-${m.level}">${m.level}</span>
            <span class="sb-score" style="color:${barColor(st)}">${score}%</span>
          </div>
          <div class="sb-bar"><div class="sb-bar-fill" style="width:${score}%;background:${barColor(st)}"></div></div>
        </div>
      </div>`;
  }).join('');
}

window.selectMember=function(id){selectedMemberId=id;renderSidebar();renderMemberDetail(id);}

// ── Overview (no member selected) ───────────────
function renderOverview(){
  const members=getMembers();
  const scores=members.map(m=>(m.history[m.history.length-1]||{}).overall||0);
  const avg=Math.round(scores.reduce((a,b)=>a+b,0)/scores.length);
  const onTrack=members.filter(m=>scoreStatus((m.history[m.history.length-1]||{}).overall||0)!=='needs'&&scoreStatus((m.history[m.history.length-1]||{}).overall||0)!=='dev').length;
  const needsAttn=members.filter(m=>scoreStatus((m.history[m.history.length-1]||{}).overall||0)==='needs').length;
  const promoReady=members.filter(m=>isPromoCandidate(m)).length;

  const rows=members.map(m=>{
    const last=m.history[m.history.length-1]||{};
    const score=last.overall||0;
    const st=scoreStatus(score);
    const gap=THRESHOLDS[m.level]?Math.max(0,THRESHOLDS[m.level]-score):null;
    return `
      <tr onclick="selectMember('${m.id}')">
        <td><div style="font-weight:600">${m.name}${isPromoCandidate(m)?' 🏆':''}</div><div style="font-size:.72rem;color:var(--g400)">${last.date||'—'}</div></td>
        <td><span class="lv lv-${m.level}">${m.level}</span></td>
        <td>
          <div class="score-bar-cell">
            <div class="tbl-bar"><div class="tbl-bar-fill" style="width:${score}%;background:${barColor(st)}"></div></div>
            <span class="tbl-score" style="color:${barColor(st)}">${score}%</span>
          </div>
        </td>
        <td><span class="${chipClass(st)}">${statusLabel(st)}</span></td>
        <td style="font-size:.78rem;color:${gap?'var(--amber-d)':'var(--green-d)'}">${gap?'+'+gap+'pts needed':'Ready'}</td>
      </tr>`;
  }).join('');

  document.getElementById('mgr-main').innerHTML=`
    <div class="overview-wrap">
      <div class="kpi-strip">
        <div class="kpi-card"><div class="kpi-label">Team Avg Score</div><div class="kpi-value" style="color:${barColor(scoreStatus(avg))}">${avg}%</div><div class="kpi-sub">${statusLabel(scoreStatus(avg))}</div></div>
        <div class="kpi-card"><div class="kpi-label">On Track +</div><div class="kpi-value" style="color:var(--green)">${onTrack}</div><div class="kpi-sub">of ${members.length} members</div></div>
        <div class="kpi-card"><div class="kpi-label">Needs Attention</div><div class="kpi-value" style="color:var(--red)">${needsAttn}</div><div class="kpi-sub">below 45% on any skill</div></div>
        <div class="kpi-card"><div class="kpi-label">Promo Ready</div><div class="kpi-value" style="color:var(--purple)">${promoReady}</div><div class="kpi-sub">3+ cycles above threshold</div></div>
      </div>
      <div class="section-card">
        <div class="section-hd"><span class="section-title">Team Overview</span><span style="font-size:.72rem;color:var(--g400)">Click any row to view details</span></div>
        <table class="member-table">
          <thead><tr><th>Member</th><th>Level</th><th>Score</th><th>Status</th><th>Gap to Promo</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>`;
}

// ── Member detail ────────────────────────────────
function renderMemberDetail(id){
  const members=getMembers();
  const m=members.find(x=>x.id===id); if(!m) return;
  const last=m.history[m.history.length-1]||{skills:{},leadership:{},note:'',skillComments:{},devPlan:[]};
  const score=last.overall||0;
  const st=scoreStatus(score);
  const lw=LEADERSHIP_WEIGHT[m.level]||0;
  const thresh=THRESHOLDS[m.level];
  const gap=thresh?Math.max(0,thresh-score):0;
  const nl=nextLevel(m.level);

  const main=document.getElementById('mgr-main');
  main.innerHTML=`
    <div class="detail-wrap">
      <!-- Detail header -->
      <div class="detail-hd">
        <button class="detail-hd-back" onclick="clearMember()">← Team</button>
        <div class="sb-avatar" style="background:${LEVEL_COLORS[m.level]};width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:#fff;flex-shrink:0">${initials(m.name)}</div>
        <div>
          <div class="detail-hd-name">${m.name}${isPromoCandidate(m)?' 🏆':''}</div>
          <span class="lv lv-${m.level}">${m.level} · ${LEVEL_NAMES[m.level]}</span>
        </div>
        <div class="detail-hd-right">
          <span class="last-updated">Last updated: ${last.date||'—'}</span>
          <button class="save-snapshot-btn" onclick="saveSnapshot('${m.id}')">Save Snapshot</button>
        </div>
      </div>

      <!-- Detail body -->
      <div class="detail-body">

        <!-- Journey map -->
        <div class="section-card" style="padding:14px 16px 10px">
          <div class="section-hd" style="padding:0 0 10px;border-bottom:1px solid var(--g100)">
            <span class="section-title">Growth Journey</span>
            ${nl?`<span style="font-size:.72rem;color:var(--g400)">Immediate next step: <strong>${nl} · ${LEVEL_NAMES[nl]}</strong></span>`:''}
          </div>
          ${buildJourneyMap(m)}
        </div>

        <!-- Score summary + chart -->
        <div class="section-card">
          <div class="section-hd">
            <span class="section-title">Performance Trend</span>
            <div class="period-tabs">
              ${['w2','m1','m3','m6','y1','all'].map(p=>`<button class="period-tab ${chartPeriod===p?'active':''}" onclick="setPeriod('${p}','${m.id}')">${{w2:'2W',m1:'1M',m3:'3M',m6:'6M',y1:'1Y',all:'All'}[p]}</button>`).join('')}
            </div>
          </div>
          <div class="score-summary" style="margin:12px 16px">
            <div>
              <div class="ss-big" id="overall-live" style="color:${barColor(st)}">${score}%</div>
              <div class="ss-label" id="status-live">${statusLabel(st)}</div>
            </div>
            <div class="ss-divider"></div>
            <div class="ss-stat"><div class="ss-stat-val">${thresh||'—'}%</div><div class="ss-stat-label">Threshold</div></div>
            <div class="ss-stat"><div class="ss-stat-val" style="color:${gap?'var(--amber-d)':'var(--green-d)'}">${gap?'+'+gap+'pts':'Ready'}</div><div class="ss-stat-label">To next level</div></div>
            <div class="ss-stat"><div class="ss-stat-val">${m.history.length}</div><div class="ss-stat-label">Snapshots</div></div>
          </div>
          <div class="chart-body"><canvas id="trend-chart"></canvas></div>
        </div>

        <!-- Skill rows -->
        ${buildSkillRows(last.skills,last.leadership,m.level,last.skillComments)}

        <!-- Dev section (dynamic) -->
        <div id="dev-section"></div>

        <!-- Manager note -->
        <div class="section-card" style="padding:14px 16px">
          <div class="section-hd" style="padding:0 0 10px;border-bottom:1px solid var(--g100)">
            <span class="section-title">Manager Note</span>
            <span style="font-size:.72rem;color:var(--g400)">Specific behaviour observed this period</span>
          </div>
          <textarea class="mgr-note-ta" id="mgr-note" style="margin-top:10px" placeholder="e.g. Priya independently ran the AM onboarding session this week without prompting — strong Developing Others signal.">${last.note||''}</textarea>
        </div>

        <button class="save-snapshot-btn" style="align-self:stretch;padding:11px" onclick="saveSnapshot('${m.id}')">Save Snapshot</button>

      </div>
    </div>`;

  drawLineChart('trend-chart',m.history,m.level,chartPeriod);
  const {skills,leadership}=readSliders();
  renderDevSection(id,skills,leadership);
}

window.setPeriod=function(p,id){
  chartPeriod=p;
  const m=getMembers().find(x=>x.id===id); if(!m) return;
  drawLineChart('trend-chart',m.history,m.level,p);
  // update active tab styling
  document.querySelectorAll('.period-tab').forEach(b=>b.classList.toggle('active',b.textContent==={w2:'2W',m1:'1M',m3:'3M',m6:'6M',y1:'1Y',all:'All'}[p]));
};

window.clearMember=function(){selectedMemberId=null;renderSidebar();renderOverview();}

// ── Queue ─────────────────────────────────────────
window.showQueue=function(){
  mgrTab='queue';
  const pending=getPending();
  const main=document.getElementById('mgr-main');
  if(!pending.length){main.innerHTML='<div class="overview-wrap"><div class="section-card"><div class="empty-state">✅ No pending items</div></div></div>';return;}
  const items=pending.map(p=>`
    <div class="queue-item">
      <div class="qi-icon ${p.type==='achievement'?'qi-ach':'qi-fb'}">${p.type==='achievement'?'🏅':'💬'}</div>
      <div class="qi-body">
        <div class="qi-title">${p.type==='achievement'?`Achievement · ${p.category}`:`Peer Feedback · ${p.feedback_type}`}</div>
        <div class="qi-meta">${p.type==='achievement'?'From: '+p.from:'From: '+p.from+' → '+p.target} · ${p.date}</div>
        <div class="qi-text">${p.text}</div>
        <div class="qi-actions">
          <button class="btn-approve" onclick="approveItem('${p.id}')">✓ Approve</button>
          <button class="btn-reject" onclick="rejectItem('${p.id}')">✕ Remove</button>
        </div>
      </div>
    </div>`).join('');
  main.innerHTML=`<div class="overview-wrap"><div style="display:flex;align-items:center;gap:10px;margin-bottom:16px"><button class="detail-hd-back" onclick="renderOverview()">← Overview</button><span style="font-size:.9rem;font-weight:700">Pending Queue (${pending.length})</span></div><div style="display:flex;flex-direction:column;gap:10px">${items}</div></div>`;
};
window.approveItem=function(id){
  let p=getPending(),a=getApproved();
  const item=p.find(x=>x.id===id); if(!item) return;
  item.approvedDate=new Date().toISOString().slice(0,10);
  savePending(p.filter(x=>x.id!==id)); saveApproved([...a,item]);
  toast('Approved ✓','ok'); showQueue();
};
window.rejectItem=function(id){savePending(getPending().filter(x=>x.id!==id));toast('Removed');showQueue();}

// ── Settings ──────────────────────────────────────
window.showSettings=function(){
  const members=getMembers();
  const rows=members.map(m=>`
    <tr>
      <td><strong>${m.name}</strong></td>
      <td><span class="lv lv-${m.level}">${m.level}</span></td>
      <td><div style="display:flex;gap:6px;align-items:center">
        <input class="pin-reset-input" type="password" inputmode="numeric" maxlength="4" id="pin_${m.id}" placeholder="New PIN">
        <button class="btn-approve" onclick="resetMemberPin('${m.id}')">Set</button>
      </div></td>
    </tr>`).join('');
  const main=document.getElementById('mgr-main');
  main.innerHTML=`
    <div class="overview-wrap">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <button class="detail-hd-back" onclick="renderOverview()">← Overview</button>
        <span style="font-size:.9rem;font-weight:700">Settings</span>
      </div>
      <div class="section-card" style="margin-bottom:16px">
        <div class="section-hd"><span class="section-title">Member PINs</span><span style="font-size:.72rem;color:var(--g400)">Default PIN is 0000</span></div>
        <div style="padding:8px 0">
          <table class="promo-table"><thead><tr><th>Name</th><th>Level</th><th>Reset PIN</th></tr></thead><tbody>${rows}</tbody></table>
        </div>
      </div>
      <div class="section-card">
        <div class="section-hd"><span class="section-title">Manager PIN</span></div>
        <div style="padding:14px 16px;display:flex;gap:8px;align-items:center">
          <input class="pin-reset-input" type="password" inputmode="numeric" maxlength="4" id="pin_manager" placeholder="New PIN">
          <button class="btn-approve" onclick="resetManagerPin()">Update</button>
        </div>
      </div>
    </div>`;
};
window.resetMemberPin=function(id){
  const v=document.getElementById('pin_'+id)?.value;
  if(!v||v.length!==4){toast('PIN must be 4 digits','err');return;}
  const a=getAuth(); if(!a.members) a.members={};
  a.members[id]={pin:v}; saveAuth(a); toast('PIN updated ✓','ok');
};
window.resetManagerPin=function(){
  const v=document.getElementById('pin_manager')?.value;
  if(!v||v.length!==4){toast('PIN must be 4 digits','err');return;}
  const a=getAuth(); a.manager={pin:v}; saveAuth(a); toast('Manager PIN updated ✓','ok');
};

// ─────────────────────────────────────────────────
//  PIN GATE
// ─────────────────────────────────────────────────
function renderLoginGate(role,memberId){
  const isManager=role==='manager';
  const name=memberId?getMemberName(memberId):'';
  const root=document.getElementById('view-'+role.split('-')[0]);
  root.innerHTML=`
    <div class="pin-gate">
      <div class="pin-card">
        <div class="pin-icon">${isManager?'👔':'🔒'}</div>
        <h2>${isManager?'Manager Login':name}</h2>
        <p class="pin-hint">Enter your 4-digit PIN</p>
        <input class="pin-input" id="pin-entry" type="password" inputmode="numeric" maxlength="4" placeholder="••••" autofocus>
        <button class="pin-btn" onclick="checkPin('${role}','${memberId||''}')">Enter</button>
        ${!isManager?`<button style="background:none;border:none;color:var(--g400);font-size:.78rem;margin-top:10px;cursor:pointer" onclick="renderMember()">← Back</button>`:''}
        <div class="pin-error" id="pin-error"></div>
      </div>
    </div>`;
  document.getElementById('pin-entry')?.addEventListener('keydown',e=>{if(e.key==='Enter') checkPin(role,memberId||'');});
}

function getMemberName(id){return getMembers().find(x=>x.id===id)?.name||'';}

window.checkPin=function(role,memberId){
  const val=document.getElementById('pin-entry')?.value||'';
  const auth=getAuth();
  const correct=role==='manager'?auth.manager?.pin||'1234':auth.members?.[memberId]?.pin||'0000';
  if(val===correct){
    if(role==='manager'){sessionStorage.setItem('gjc_mgr_authed','1');renderManager();}
    else{sessionStorage.setItem('gjc_mbr_authed',memberId);loggedInMember=getMembers().find(m=>m.id===memberId);renderMemberDashboard();}
  } else {
    const err=document.getElementById('pin-error'); if(err) err.textContent='Incorrect PIN — try again';
    const inp=document.getElementById('pin-entry');
    inp?.classList.add('shake'); inp&&(inp.value='');
    setTimeout(()=>inp?.classList.remove('shake'),500);
  }
};

// ─────────────────────────────────────────────────
//  MEMBER VIEW
// ─────────────────────────────────────────────────
let loggedInMember=null;

function renderMember(){
  const root=document.getElementById('view-member');
  const authedId=sessionStorage.getItem('gjc_mbr_authed');
  if(authedId&&!loggedInMember) loggedInMember=getMembers().find(m=>m.id===authedId);
  if(loggedInMember){renderMemberDashboard();return;}

  const opts=getMembers().map(m=>`<option value="${m.id}">${m.name} (${m.level})</option>`).join('');
  root.innerHTML=`
    <div class="member-login">
      <div class="pin-card" style="width:340px">
        <div class="pin-icon">🧑‍💼</div>
        <h2>Your Growth Journey</h2>
        <p class="pin-hint">Select your name to continue</p>
        <select style="width:100%;border:1.5px solid var(--g200);border-radius:8px;padding:8px 10px;margin-bottom:12px;font-size:.88rem" id="member-select">
          <option value="">— Select your name —</option>${opts}
        </select>
        <button class="pin-btn" onclick="memberSelectStep()">Continue →</button>
      </div>
    </div>`;
}

window.memberSelectStep=function(){
  const id=document.getElementById('member-select')?.value;
  if(!id){toast('Please select your name','err');return;}
  renderLoginGate('member',id);
};

function renderMemberDashboard(){
  const m=loggedInMember; if(!m) return;
  const last=m.history[m.history.length-1]||{skills:{},leadership:{},skillComments:{},devPlan:[]};
  const score=last.overall||0;
  const st=scoreStatus(score);
  const tgt=targetLevel(m.level);
  const nl=nextLevel(m.level);
  const thresh=THRESHOLDS[m.level];
  const approved=getApproved();
  const myAch=approved.filter(a=>a.type==='achievement'&&a.from===m.name);
  const myFb=approved.filter(a=>a.type==='feedback'&&a.target===m.name);

  const skillRows=SKILLS.map(s=>{
    const v=last.skills[s.key]||0;
    const comment=last.skillComments?.[s.key]||'';
    return `
      <div class="member-skill-row">
        <span class="msr-name">${s.label}</span>
        <div class="msr-bar-wrap"><div class="msr-bar" style="width:${v}%;background:${barColor(scoreStatus(v))}"></div></div>
        <span class="msr-val" style="color:${barColor(scoreStatus(v))}">${v}%</span>
        ${comment?`<span class="msr-comment">${comment}</span>`:''}
      </div>`;
  }).join('');

  const allDev=m.history.flatMap((c,ci)=>(c.devPlan||[]).map(d=>({...d,cycleIdx:ci})));
  const activeDev=allDev.filter(d=>!d.done);
  const devRows=activeDev.length?activeDev.map(d=>`
    <div class="dp-member-row">
      <div class="dp-m-skill">${d.skillLabel}</div>
      ${d.suggestion?`<div class="dp-m-sugg">💡 ${d.suggestion}</div>`:''}
      <div class="dp-m-note">📌 ${d.managerNote}</div>
      <button class="btn-done" onclick="markDone('${m.id}',${d.cycleIdx},'${d.id}')">Mark as Done ✓</button>
    </div>`)
    .join(''):'<div style="font-size:.8rem;color:var(--g400);padding:8px 0">No active items — great work!</div>';

  const achItems=myAch.length?myAch.map(a=>`
    <div class="approved-item">
      <div class="ai-hd"><span class="cat-badge">${a.category}</span></div>
      <div class="ai-text">${a.text}</div><div class="ai-from">${a.date}</div>
    </div>`).join('')
  :'<div style="font-size:.8rem;color:var(--g400);padding:8px 0">Log your first achievement below!</div>';

  const fbItems=myFb.length?myFb.map(f=>`
    <div class="approved-item">
      <div class="ai-hd"><span class="cat-badge ${f.feedback_type==='Positive'?'fb-pos':'fb-con'}">${f.feedback_type}</span><span style="font-size:.7rem;color:var(--g400);margin-left:4px">from ${f.from}</span></div>
      <div class="ai-text">${f.text}</div><div class="ai-from">${f.date}</div>
    </div>`).join('')
  :'<div style="font-size:.8rem;color:var(--g400);padding:8px 0">No approved feedback yet.</div>';

  const root=document.getElementById('view-member');
  root.style.overflowY='auto';
  root.innerHTML=`
    <div class="member-view">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:18px">
        <button class="detail-hd-back" onclick="memberLogout()">← Switch</button>
        <div class="sb-avatar" style="background:${LEVEL_COLORS[m.level]};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:800;color:#fff">${initials(m.name)}</div>
        <div>
          <div style="font-size:1rem;font-weight:800">${m.name}</div>
          <span class="lv lv-${m.level}">${m.level} · ${LEVEL_NAMES[m.level]}</span>
        </div>
      </div>

      <!-- Journey map -->
      <div class="card" style="margin-bottom:14px;padding:12px 14px">
        ${buildJourneyMap(m)}
      </div>

      <!-- Score + growth arrow -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="card" style="text-align:center;padding:18px">
          <div style="font-size:2.5rem;font-weight:900;color:${barColor(st)}">${score}%</div>
          <div style="font-size:.8rem;color:var(--g400);margin-top:3px">${statusLabel(st)}</div>
          <div style="font-size:.7rem;color:var(--g400);margin-top:2px">Threshold: ${thresh?thresh+'%':'Exec review'}${isPromoCandidate(m)?' · 🏆 Promo ready':''}</div>
        </div>
        <div class="card grow-arrow-card">
          <div class="ga-lv"><div class="ga-code" style="color:var(--purple)">${m.level}</div><div class="ga-name">${LEVEL_NAMES[m.level]}</div></div>
          <div class="ga-arrow">→</div>
          ${nl&&nl!==tgt?`<div class="ga-lv"><div class="ga-code" style="color:var(--amber)">${nl}</div><div class="ga-name">${LEVEL_NAMES[nl]}</div></div><div class="ga-arrow">→</div>`:''}
          <div class="ga-lv"><div class="ga-code" style="color:var(--green)">${tgt}</div><div class="ga-name">${LEVEL_NAMES[tgt]}</div></div>
        </div>
      </div>

      <!-- Radar + trend -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="card"><div style="font-size:.72rem;font-weight:700;color:var(--g500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Skill Radar</div><div class="radar-wrap"><canvas id="member-radar"></canvas></div></div>
        <div class="card"><div style="font-size:.72rem;font-weight:700;color:var(--g500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Score Journey</div><div class="chart-wrap"><canvas id="member-trend"></canvas></div></div>
      </div>

      <!-- Skill scores -->
      <div class="card" style="margin-bottom:14px">
        <div style="font-size:.72rem;font-weight:700;color:var(--g500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">Skill Scores & Manager Comments</div>
        ${skillRows}
      </div>

      <!-- Dev plan -->
      <div class="card" style="margin-bottom:14px">
        <div style="font-size:.72rem;font-weight:700;color:var(--g500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">Development Plan <span style="font-weight:400;color:var(--g400)">(${activeDev.length} active)</span></div>
        ${devRows}
      </div>

      <!-- Achievements + feedback -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
        <div class="card"><div style="font-size:.72rem;font-weight:700;color:var(--g500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Achievements</div>${achItems}</div>
        <div class="card"><div style="font-size:.72rem;font-weight:700;color:var(--g500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:8px">Peer Feedback</div>${fbItems}</div>
      </div>

      <!-- Log achievement -->
      <div class="card">
        <div style="font-size:.72rem;font-weight:700;color:var(--g500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:10px">Log an Achievement</div>
        <div class="achieve-form">
          <select id="ach-cat"><option value="">— Select category —</option>${ACHIEVEMENT_CATS.map(c=>`<option>${c}</option>`).join('')}</select>
          <textarea id="ach-text" rows="3" placeholder="Describe the specific achievement, outcome, or initiative…"></textarea>
          <button class="submit-btn" onclick="submitAchievement()">Submit for Manager Review</button>
        </div>
      </div>
    </div>`;

  drawRadar('member-radar',last.skills);
  drawLineChart('member-trend',m.history,m.level,'all');
}

window.memberLogout=function(){loggedInMember=null;sessionStorage.removeItem('gjc_mbr_authed');renderMember();}

window.markDone=function(memberId,cycleIdx,devId){
  const members=getMembers();
  const m=members.find(x=>x.id===memberId); if(!m) return;
  const item=m.history[cycleIdx]?.devPlan?.find(d=>d.id===devId); if(!item) return;
  item.done=true; item.doneDate=new Date().toISOString().slice(0,10);
  saveMembers(members); loggedInMember=m; toast('Marked done ✓','ok'); renderMemberDashboard();
};

window.submitAchievement=function(){
  const cat=document.getElementById('ach-cat')?.value;
  const text=document.getElementById('ach-text')?.value.trim();
  if(!cat){toast('Select a category','err');return;}
  if(!text||text.length<15){toast('Please describe the achievement in more detail','err');return;}
  const p=getPending();
  p.push({id:'p_'+Date.now(),type:'achievement',from:loggedInMember.name,target:loggedInMember.name,category:cat,text,date:new Date().toISOString().slice(0,10)});
  savePending(p); toast('Submitted for manager review ✓','ok');
  document.getElementById('ach-cat').value=''; document.getElementById('ach-text').value='';
};

// ─────────────────────────────────────────────────
//  PEER VIEW
// ─────────────────────────────────────────────────
function renderPeer(){
  const opts=getMembers().map(m=>`<option value="${m.name}">${m.name}</option>`).join('');
  document.getElementById('view-peer').innerHTML=`
    <div class="peer-form-wrap">
      <div style="font-size:.95rem;font-weight:800;margin-bottom:4px">Submit Peer Feedback</div>
      <div style="font-size:.8rem;color:var(--g400);margin-bottom:14px">Goes to manager for review before the recipient sees it.</div>
      <div class="notice-box">ℹ️ You cannot view scores or other profiles. Reference a specific observable behaviour — no generalities or comparisons.</div>
      <div class="peer-form" style="margin-top:14px">
        <div><label>Your name</label><select id="peer-from"><option value="">— Your name —</option>${opts}</select></div>
        <div><label>Feedback for</label><select id="peer-target"><option value="">— Colleague —</option>${opts}</select></div>
        <div><label>Type</label><select id="peer-type"><option value="Positive">Positive — recognise a specific action or result</option><option value="Constructive">Constructive — highlight a development area with example</option></select></div>
        <div><label>Your feedback <span style="font-weight:400;color:var(--g400)">(specific event required, min 30 chars)</span></label><textarea id="peer-text" rows="4" placeholder="e.g. Priya independently ran the AM onboarding session this week without prompting…"></textarea></div>
        <button class="peer-submit" onclick="submitPeer()">Submit Feedback</button>
        <div class="success-msg" id="peer-success">Submitted! Manager will review before it's visible. 🎉</div>
      </div>
    </div>`;
}
window.submitPeer=function(){
  const from=document.getElementById('peer-from')?.value;
  const target=document.getElementById('peer-target')?.value;
  const type=document.getElementById('peer-type')?.value;
  const text=document.getElementById('peer-text')?.value.trim();
  if(!from){toast('Select your name','err');return;}
  if(!target){toast('Select a colleague','err');return;}
  if(from===target){toast('Cannot submit feedback about yourself','err');return;}
  if(!text||text.length<30){toast('Write a specific observation (min 30 chars)','err');return;}
  const p=getPending();
  p.push({id:'p_'+Date.now(),type:'feedback',feedback_type:type,from,target,text,date:new Date().toISOString().slice(0,10)});
  savePending(p);
  document.getElementById('peer-text').value=''; document.getElementById('peer-from').value='';
  const s=document.getElementById('peer-success');s.style.display='block';setTimeout(()=>s.style.display='none',4000);
};

// ─────────────────────────────────────────────────
//  WORKFLOW
// ─────────────────────────────────────────────────
function renderWorkflow(){
  document.getElementById('view-workflow').innerHTML=`
    <div style="padding:20px;overflow-y:auto;height:100%">
      <div class="card" style="padding:14px">
        <div style="font-size:.72rem;font-weight:700;color:var(--g500);text-transform:uppercase;letter-spacing:.04em;margin-bottom:12px">End-to-End Workflow — 5 Swim Lanes</div>
        <img src="workflow.svg" alt="Workflow" style="width:100%;border-radius:6px;border:1px solid var(--g200)">
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────
//  ROLE SWITCHING
// ─────────────────────────────────────────────────
let activeRole='manager';
window.setRole=function(role){
  activeRole=role;
  ['manager','member','peer','workflow'].forEach(v=>{
    document.getElementById('view-'+v).style.display=v===role?'flex':'none';
    document.getElementById('tab-'+v)?.classList.toggle('active',v===role);
  });
  // set flex direction for manager (it has its own shell)
  if(role==='manager') document.getElementById('view-manager').style.flexDirection='column';
  if(role==='manager')  renderManager();
  if(role==='member')   renderMember();
  if(role==='peer')     renderPeer();
  if(role==='workflow') renderWorkflow();
};

// ─────────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  seedIfEmpty();
  setRole('manager');
});
