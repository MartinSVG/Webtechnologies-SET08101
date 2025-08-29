/* TriviaQuest — Clean (vanilla JS) */
const $ = (s, c=document)=>c.querySelector(s);
const $$ = (s, c=document)=>[...c.querySelectorAll(s)];

const views = {home:$('#view-home'),quiz:$('#view-quiz'),results:$('#view-results'),scores:$('#view-scores'),about:$('#view-about')};
const state = {category:null,i:0,score:0,order:[],current:null};

const QUESTIONS={movies:[
 {q:"Who directed 'Inception'?",a:["Christopher Nolan","Denis Villeneuve","James Cameron","Ridley Scott"],correct:0},
 {q:"Which film won Best Picture (2020 ceremony)?",a:["Joker","1917","Parasite","Ford v Ferrari"],correct:2},
 {q:"'I'll be back' is from…",a:["Predator","The Terminator","Commando","Total Recall"],correct:1},
 {q:"What color pill does Neo take?",a:["Blue","Green","Red","Yellow"],correct:2},
 {q:"Studio behind the MCU?",a:["DC Films","Paramount","Marvel Studios","Sony"],correct:2}
],science:[
 {q:"H2O is…",a:["Hydrogen","Ozone","Water","Hydroxide"],correct:2},
 {q:"Earth’s primary energy source:",a:["The Sun","Geothermal","Lightning","Moon"],correct:0},
 {q:"Speed of light ≈",a:["3×10^8 m/s","3×10^6 m/s","3×10^5 km/s","3×10^7 m/s"],correct:0},
 {q:"DNA stands for:",a:["Deoxyribonucleic Acid","Dicarboxylic Nucleic Acid","Ribonucleic Acid","Dinucleic Acid"],correct:0},
 {q:"Nearest planet to the Sun:",a:["Venus","Mercury","Earth","Mars"],correct:1}
],music:[
 {q:"Lines in a staff:",a:["4","5","6","7"],correct:1},
 {q:"Tempo marking: very fast",a:["Andante","Largo","Presto","Adagio"],correct:2},
 {q:"Instrument with 88 keys:",a:["Piano","Organ","Celesta","Harpsichord"],correct:0},
 {q:"Time signature with 3 beats:",a:["4/4","3/4","6/8","2/4"],correct:1},
 {q:"Sharps and flats are:",a:["Dynamics","Articulations","Accidentals","Timbre"],correct:2}
]};

function allRandom(){const all=Object.values(QUESTIONS).flat();const idxs=[...all.keys()];for(let i=idxs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[idxs[i],idxs[j]]=[idxs[j],idxs[i]];}return idxs.slice(0,10).map(i=>all[i]);}
function route(name){Object.values(views).forEach(v=>v.classList.remove('active'));views[name].classList.add('active');$$('.nav').forEach(b=>b.setAttribute('aria-current',b.dataset.route===name?'page':'false'));$('#app').focus();}
function start(cat){state.category=cat;state.i=0;state.score=0;state.order=cat==='random'?allRandom():QUESTIONS[cat];render();route('quiz');}
function render(){const total=Math.min(state.order.length,10);const q=state.order[state.i];state.current=q;$('#q').textContent=`Q${state.i+1}/${total}: ${q.q}`;const list=$('#ans');list.innerHTML='';q.a.forEach((t,idx)=>{const li=document.createElement('li');li.className='answer';li.tabIndex=0;li.role='button';li.textContent=t;li.onclick=()=>pick(li,idx);li.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();pick(li,idx);}};list.appendChild(li);});$('#next').disabled=true;const pct=Math.round((state.i/total)*100);$('#bar').style.width=pct+'%';$('#bar').setAttribute('aria-valuenow',String(state.i));}
function pick(li,idx){if($('#next').disabled===false)return;const c=state.current.correct;$$('#ans .answer').forEach((el,i)=>{if(i===c)el.classList.add('correct');if(i===idx&&i!==c)el.classList.add('wrong');el.setAttribute('aria-disabled','true');});if(idx===c)state.score++;$('#next').disabled=false;}
function nextQ(){const total=Math.min(state.order.length,10);state.i++;if(state.i<total)render();else finish(total);}
function finish(total){const pct=Math.round((state.score/total)*100);$('#scoreline').textContent=`You scored ${state.score}/${total} (${pct}%).`;const key='tq:scores';const list=JSON.parse(localStorage.getItem(key)||'[]');list.push({ts:Date.now(),category:state.category,score:state.score,total});localStorage.setItem(key,JSON.stringify(list.slice(-50)));route('results');}
function renderScores(){const wrap=$('#scores');const list=(JSON.parse(localStorage.getItem('tq:scores')||'[]')).reverse();if(!list.length){wrap.innerHTML='<p class="lead">No scores yet — play a quiz!</p>';return;}wrap.innerHTML='';list.forEach(item=>{const d=new Date(item.ts);const row=document.createElement('div');row.className='item';row.innerHTML=`<span>${item.category} • ${d.toLocaleString()}</span><strong>${item.score}/${item.total}</strong>`;wrap.appendChild(row);});}
function share(){const t=$('#scoreline').textContent+' #TriviaQuest';const d={text:t,title:'My TriviaQuest score!'};if(navigator.share){navigator.share(d).catch(()=>{});}else{navigator.clipboard?.writeText(t);alert('Score copied to clipboard!');}}
document.addEventListener('click',e=>{const s=e.target.closest('[data-start]');if(s)start(s.dataset.start);const n=e.target.closest('.nav');if(n){route(n.dataset.route);if(n.dataset.route==='scores')renderScores();}});
$('#next').addEventListener('click',nextQ);$('#again').addEventListener('click',()=>route('home'));$('#share').addEventListener('click',share);$('#clear').addEventListener('click',()=>{localStorage.removeItem('tq:scores');renderScores();});route('home');
