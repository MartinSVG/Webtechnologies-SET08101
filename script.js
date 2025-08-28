/* TriviaQuest – vanilla JS */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];

const views = {
  home: $('#view-home'),
  quiz: $('#view-quiz'),
  results: $('#view-results'),
  scores: $('#view-scores'),
  about: $('#view-about'),
};

const state = {
  category: null,
  qIndex: 0,
  score: 0,
  order: [],
  current: null,
};

const QUESTIONS = {
  movies: [
    { q: "Who directed 'Inception'?", a: ["Christopher Nolan","Denis Villeneuve","James Cameron","Ridley Scott"], correct: 0 },
    { q: "Which movie won Best Picture (2020 ceremony)?", a: ["Joker","1917","Parasite","Ford v Ferrari"], correct: 2 },
    { q: "The quote 'I'll be back' is from…", a: ["Predator","The Terminator","Commando","Total Recall"], correct: 1 },
    { q: "What color pill does Neo take?", a: ["Blue","Green","Red","Yellow"], correct: 2 },
    { q: "Studio behind the MCU?", a: ["DC Films","Paramount","Marvel Studios","Sony"], correct: 2 },
  ],
  science: [
    { q: "H2O is…", a: ["Hydrogen","Ozone","Water","Hydroxide"], correct: 2 },
    { q: "Earth’s primary energy source:", a: ["The Sun","Geothermal","Lightning","Moon"], correct: 0 },
    { q: "Speed of light ≈", a: ["3×10^8 m/s","3×10^6 m/s","3×10^5 km/s","3×10^7 m/s"], correct: 0 },
    { q: "DNA stands for:", a: ["Deoxyribonucleic Acid","Dicarboxylic Nucleic Acid","Ribonucleic Acid","Dinucleic Acid"], correct: 0 },
    { q: "Nearest planet to the Sun:", a: ["Venus","Mercury","Earth","Mars"], correct: 1 },
  ],
  music: [
    { q: "Number of lines in a staff:", a: ["4","5","6","7"], correct: 1 },
    { q: "Tempo marking: very fast", a: ["Andante","Largo","Presto","Adagio"], correct: 2 },
    { q: "Instrument with 88 keys:", a: ["Piano","Organ","Celesta","Harpsichord"], correct: 0 },
    { q: "Time signature with 3 beats:", a: ["4/4","3/4","6/8","2/4"], correct: 1 },
    { q: "Sharps and flats are:", a: ["Dynamics","Articulations","Accidentals","Timbre"], correct: 2 },
  ],
};

function randomFromAll() {
  const all = Object.values(QUESTIONS).flat();
  // pick 10 random unique
  const idxs = [...all.keys()];
  shuffle(idxs);
  return idxs.slice(0, 10).map(i => all[i]);
}

function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]] } return arr; }

function routeTo(name){
  Object.values(views).forEach(v => v.classList.remove('active'));
  views[name].classList.add('active');
  $$('.nav-btn').forEach(b => b.setAttribute('aria-current', b.dataset.route===name ? 'page':'false'));
  $('#app').focus(); // accessibility: focus main
}

function startQuiz(category){
  state.category = category;
  state.qIndex = 0;
  state.score = 0;

  const bank = category==='random' ? randomFromAll() : QUESTIONS[category];
  state.order = shuffle([...bank]); // copy & shuffle
  renderQuestion();
  routeTo('quiz');
}

function renderQuestion(){
  const total = Math.min(state.order.length, 10);
  const qObj = state.order[state.qIndex];
  state.current = qObj;

  $('#question-text').textContent = `Q${state.qIndex+1}/${total}: ${qObj.q}`;
  const answersUL = $('#answers');
  answersUL.innerHTML = '';
  qObj.a.forEach((text, i) => {
    const li = document.createElement('li');
    li.className = 'answer';
    li.tabIndex = 0;
    li.role = 'button';
    li.textContent = text;
    li.addEventListener('click', () => selectAnswer(li, i));
    li.addEventListener('keydown', (e)=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); selectAnswer(li,i); }});
    answersUL.appendChild(li);
  });

  $('#next-btn').disabled = true;
  setProgress(state.qIndex, total);
}

function setProgress(i,total){
  const pct = Math.round((i/total)*100);
  const bar = $('#progress-bar');
  bar.style.width = `${pct}%`;
  bar.setAttribute('aria-valuenow', String(i));
}

function selectAnswer(li, i){
  if($('#next-btn').disabled === false) return; // prevent double marking
  const correctIdx = state.current.correct;
  const items = $$('#answers .answer');
  items.forEach((el, idx) => {
    if(idx === correctIdx){ el.classList.add('correct'); }
    if(idx === i && i !== correctIdx){ el.classList.add('wrong'); }
    el.setAttribute('aria-disabled','true');
  });
  if(i === correctIdx) state.score++;
  $('#next-btn').disabled = false;
}

function nextQuestion(){
  const total = Math.min(state.order.length, 10);
  state.qIndex++;
  if(state.qIndex < total){
    renderQuestion();
  } else {
    finishQuiz(total);
  }
}

function finishQuiz(total){
  const pct = Math.round((state.score/total)*100);
  $('#score-line').textContent = `You scored ${state.score}/${total} (${pct}%).`;
  saveScore(state.category, state.score, total);
  routeTo('results');
}

function saveScore(category, score, total){
  const key = 'tq:scores';
  const list = JSON.parse(localStorage.getItem(key) || '[]');
  list.push({ ts: Date.now(), category, score, total });
  localStorage.setItem(key, JSON.stringify(list.slice(-50))); // keep last 50
}

function renderScores(){
  const wrap = $('#scores-list');
  const list = JSON.parse(localStorage.getItem('tq:scores') || '[]').reverse();
  if(!list.length){ wrap.innerHTML = `<p class="lead">No scores yet — play a quiz!</p>`; return; }
  wrap.innerHTML = '';
  list.forEach(item=>{
    const d = new Date(item.ts);
    const row = document.createElement('div');
    row.className = 'item';
    row.innerHTML = `<span>${capitalize(item.category)} • ${d.toLocaleString()}</span><strong>${item.score}/${item.total}</strong>`;
    wrap.appendChild(row);
  });
}

function clearScores(){
  localStorage.removeItem('tq:scores');
  renderScores();
}

function shareResults(){
  const text = $('#score-line').textContent + ' #TriviaQuest';
  const shareData = { text, title: 'My TriviaQuest score!' };
  if(navigator.share){
    navigator.share(shareData).catch(()=>{ /* user canceled */ });
  } else {
    navigator.clipboard?.writeText(text);
    alert('Score copied to clipboard! Paste anywhere to share.');
  }
}

function capitalize(s){ return s[0].toUpperCase()+s.slice(1); }

// Event wiring
document.addEventListener('click', (e)=>{
  const start = e.target.closest('[data-start]');
  if(start){ startQuiz(start.dataset.start); }
  const nav = e.target.closest('.nav-btn');
  if(nav){ routeTo(nav.dataset.route); if(nav.dataset.route==='scores') renderScores(); }
});
$('#next-btn').addEventListener('click', nextQuestion);
$('#replay-btn').addEventListener('click', ()=> routeTo('home'));
$('#share-btn').addEventListener('click', shareResults);
$('#clear-scores').addEventListener('click', clearScores);

// Deep linking support via hash (optional small SPA feel)
window.addEventListener('hashchange', ()=>{
  const view = location.hash.replace('#','') || 'home';
  if(views[view]){ routeTo(view); if(view==='scores') renderScores(); }
});
routeTo((location.hash||'#home').replace('#',''));
