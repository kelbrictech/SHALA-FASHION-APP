const S=document.querySelector('#screen'),L=document.querySelector('#screenLabel');
let i=0;
const BDAY_KEY='shala_1e_birthday_opened';
const LANDSCAPE_PAGES=new Set(['THE REVEAL','FAVORITES']);
const bodyTiles=Array.from({length:7},(_,x)=>`<button class="tile">body${x+1}</button>`).join('');
const poseTiles=Array.from({length:10},(_,x)=>`<button class="tile">pose${x+1}</button>`).join('');
const pages=[
['SPLASH',`<div class="centerPage"><div class="logoMark">SHALA</div><div class="box image">page1</div><button class="tapIcon" data-go="1">tap me</button></div>`],
['DEDICATION',`<div class="centerPage"><div class="logoMark small">SHALA</div><h1>Ang app para kay RASYELA</h1><div class="box image">page 2</div></div>`],
['LOGIN',`<h1>Login</h1><div class="box image">page 3</div><label>username<input class="input" type="text" placeholder="username"></label><label>password<input class="input" type="password" placeholder="password"></label><button class="btn yes">open sesame</button><button class="linkBtn" data-go="3">sign me up!</button><button class="linkBtn" data-go="4">I forgot!</button>`],
['REGISTER ACCOUNT',`<h1>Register Account</h1><div class="box image">page 3</div><label>name me<input class="input" type="text"></label><label>lock me<input class="input" type="password"></label><label>double check me<input class="input" type="password"></label><button class="btn yes">all done!</button><button class="linkBtn" data-go="2">bring me back</button>`],
['FORGOT PASSWORD',`<h1>Forgot Password</h1><div class="box image">page 3</div><label>enter magic words<input class="input" type="text"></label><button class="btn yes">pray this works</button><button class="linkBtn" data-go="2">bring me back</button>`],
['DASHBOARD TEASER',`<h1>Dashboard Teaser</h1><div class="box image">page 6</div><button class="btn" data-go="6">envelop clipart</button>`],
['BIRTHDAY GREETING',`<div class="centerPage"><div class="card"><div class="box image">page 7</div><button class="btn yes" id="finishBirthday">heart icon</button></div></div>`],
['MAIN DASHBOARD',`<div class="compact openCompact"><div class="box image">page 8</div><button class="btn">cover flip</button><button class="btn">vertical carousel</button><section class="mirror"><button class="btn" data-go="8">mirror on the wall</button></section><button class="btn">explore</button><button class="btn">trends</button><button class="btn">favorites</button></div>`],
['CREATE ME — FACE',`<h1>Create Me — Face</h1><div class="box image">page 9</div><button class="btn">upload face</button><button class="btn">take a pic</button><button class="btn yes" data-go="9">use this pic</button>`],
['CREATE ME — VITAL STATISTICS',`<h1>Create Me — Vital Statistics</h1><div class="box image">page 9</div><div class="row"><button class="btn">cm</button><button class="btn">ft in</button></div><div class="row"><button class="btn">kg</button><button class="btn">lb</button></div><label>bust<input class="input"></label><label>waist<input class="input"></label><label>hips<input class="input"></label><button class="btn yes" data-go="10">this looks right</button>`],
['IDENTITY GENERATING',`<h1>Identity Generating</h1><div class="box image">page 9</div><p class="muted">ALBUS is doing the math...</p>`],
['CANON CONFIRMATION',`<h1>Does this resemble you?</h1><div class="box image">page 9</div><div class="row"><button class="btn yes">spot on!</button><button class="btn" data-go="12">not quite</button></div>`],
['DOUBLE CONFIRM',`<h1>Really, gurl?</h1><div class="box image">page 9</div><button class="btn">NA-AH!</button><button class="btn">Fine!</button><button class="btn yes" data-go="13">the body tho</button>`],
['BODY SELF-SELECTION',`<h1>Body Self-Selection</h1><div class="box image">page 9</div><div class="grid">${bodyTiles}</div><button class="btn">this one</button><button class="btn yes">yes pls</button><button class="btn">pick again</button>`],
['WORKSHOP',`<h1>Workshop</h1><div class="box image">page 10</div><button class="btn">compact</button><button class="btn">clothes rack</button><button class="btn">try me clothes</button><button class="btn">try me bags</button><button class="btn">shoes rack</button><button class="btn">try me shoes</button><button class="btn">bookshelf</button><button class="btn">try me accessories</button><button class="btn yes">yes pls</button><button class="btn">pick again</button>`],
['POSE SELECTION',`<h1>Pose Selection</h1><div class="box image">page 10</div><div class="poses">${poseTiles}</div><button class="btn yes">yes pls</button><button class="btn">pick again</button><button class="btn">compact</button>`],
['STUDIO SELECTION',`<h1>Studio Selection</h1><div class="box image">page 11</div><div class="studios">${['indoor office','indoor living room','indoor disco','outdoor sunny patio','outdoor golden hour','my studio'].map(x=>`<button class="tile">${x}</button>`).join('')}</div><button class="btn yes">yes pls</button><button class="btn">pick again</button><button class="btn">compact</button>`],
['REFERENCE',`<h1>Add Reference</h1><div class="box image">GARMENT / LOOK REFERENCE</div><button class="btn">SWAP</button><button class="btn yes">GENERATE</button>`],
['ALBUS GENERATING',`<h1>ALBUS is doing the math...</h1><div class="box image">LOCAL V1 GENERATION PLACEHOLDER</div>`],
['THE REVEAL',`<h1>The Reveal</h1><div class="box image">RESULT IMAGE</div><label class="box"><input type="checkbox"> REFERENCE ○</label><button class="btn">⤓ Save to Device</button><button class="btn">♡ Favorite</button><button class="btn yes">↻ Try Another One</button>`],
['TREND ALERT',`<h1>Trend Alert</h1><div class="box image">GACHA → TREND REVEAL</div><button class="btn yes">VIEW / OPEN ↗</button>`],
['FAVORITES',`<h1>Favorites</h1>${[1,2,3].map(x=>`<div class="box">FAVORITE ${x}</div>`).join('')}<button class="btn">START AGAIN</button><button class="btn">NUCLEAR RESET</button>`]
];
function go(n){i=Math.max(0,Math.min(pages.length-1,n));draw()}
function isMobileBrowser(){
 const coarse=window.matchMedia&&window.matchMedia('(hover: none) and (pointer: coarse)').matches;
 const ua=/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent||'');
 return ua||coarse;
}
function isPortrait(){return window.innerHeight>window.innerWidth}
function applyOrientationGate(){
 const pageName=pages[i]?.[0];
 const shouldGate=LANDSCAPE_PAGES.has(pageName)&&isMobileBrowser()&&isPortrait();
 let gate=document.querySelector('#orientationGate');
 if(shouldGate&&!gate){
   gate=document.createElement('div');
   gate.id='orientationGate';
   gate.className='orientation-gate';
   gate.innerHTML='<div class="orientation-card"><div class="rotate-icon">↻</div><h2>Shift to landscape mode</h2><p>Rotate your phone to continue.</p></div>';
   document.body.appendChild(gate);
 }
 if(!shouldGate&&gate) gate.remove();
}
function draw(){
 const [n,h]=pages[i];L.textContent=n;S.innerHTML=h;
 S.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>go(Number(el.dataset.go)));
 const birthday=S.querySelector('#finishBirthday');
 if(birthday) birthday.onclick=()=>{localStorage.setItem(BDAY_KEY,'1');go(7)};
 applyOrientationGate();
}
document.querySelector('#back').onclick=()=>go(i-1);
document.querySelector('#next').onclick=()=>go(i+1);
window.addEventListener('resize',applyOrientationGate);
window.addEventListener('orientationchange',applyOrientationGate);
draw();