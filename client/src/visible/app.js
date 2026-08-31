const S=document.querySelector('#screen'),L=document.querySelector('#screenLabel');
let i=0;
const BDAY_KEY='shala_1e_birthday_opened';
const bodyTiles=Array.from({length:7},(_,x)=>`<button class="tile">BODY ${x+1}</button>`).join('');
const pages=[
['SPLASH',`<div class="centerPage"><div class="logoMark">SHALA</div><p class="muted">V1 visible shell</p><button class="tapIcon" data-go="1">tap me</button></div>`],
['LOGIN',`<h1>Welcome to SHALA</h1><p class="muted">V1 AUTH ROOM — visible structure only. No production credential service is hard-coded here.</p><label>USERNAME<input class="input" type="text" placeholder="username"></label><label>PASSWORD<input class="input" type="password" placeholder="password"></label><button class="btn yes" data-go="4">LOGIN</button><button class="linkBtn" data-go="3">forgot password</button><button class="linkBtn" data-go="2">register account</button>`],
['REGISTER ACCOUNT',`<h1>Create account</h1><p class="muted">Account-creation room only for V1 shell. Production authentication remains a later implementation concern.</p><label>USERNAME<input class="input" type="text" placeholder="choose username"></label><label>PASSWORD<input class="input" type="password" placeholder="create password"></label><label>CONFIRM PASSWORD<input class="input" type="password" placeholder="confirm password"></label><button class="btn yes" data-go="4">CREATE ACCOUNT</button><button class="linkBtn" data-go="1">back to login</button>`],
['FORGOT PASSWORD',`<h1>Forgot password</h1><p class="muted">Recovery room reserved in V1. No live email/reset service is claimed.</p><label>USERNAME / EMAIL<input class="input" type="text" placeholder="account identifier"></label><button class="btn yes">REQUEST RESET</button><button class="linkBtn" data-go="1">back to login</button>`],
['DEDICATION',`<div class="centerPage"><div class="logoMark small">SHALA</div><h1>Ang app para kay RASYELA</h1><div class="dedicationBox">DEDICATION / PERSONAL NOTE AREA</div><button class="btn yes" data-go="5">♡ CONTINUE</button></div>`],
['DASHBOARD TEASER',`<h1>SHALA</h1><div class="box image teaser">STILL IMAGE DASHBOARD TEASER</div><p class="muted">A first glimpse of the SHALA world before entering the Compact.</p><button class="btn yes" data-go="6">ENTER SHALA</button>`],
['CLOSED COMPACT',`<div class="centerPage"><p class="muted">Tap the Compact</p><button class="compact closedCompact" id="openCompact"><h1>SHALA</h1><span>✦</span></button></div>`],
['BIRTHDAY CARD',`<div class="centerPage"><div class="card"><h1>For Rasyela ♡</h1><p>ONE-TIME BIRTHDAY CARD SEQUENCE</p><div class="box">Birthday message / card artwork room</div><button class="btn yes" id="finishBirthday">OPEN SHALA</button></div></div>`],
['MAIN HOME',`<div class="compact openCompact"><h1>SHALA</h1><section class="mirror"><b>MIRROR ON THE WALL</b></section><hr><button class="btn">EXPLORE</button><button class="btn">TRENDS</button><button class="btn">FAVORITES</button></div>`],
['CREATE ME — FACE',`<h1>Create Me</h1><div class="box image">FACE / CAMERA<br>identity source</div><button class="btn yes">USE THIS FACE</button>`],
['CREATE ME — MEASUREMENTS',`<h1>Your measurements</h1><div class="field">HEIGHT <b>5′5″</b> ↔ cm</div><div class="field">WEIGHT <b>58 kg</b> ↔ lb</div><div class="field">BUST / WAIST / HIPS <b>38 / 31 / 37</b></div><button class="btn yes">THIS LOOKS RIGHT</button>`],
['IDENTITY GENERATING',`<h1>Creating you…</h1><div class="box image">ALBUS is doing the math...</div>`],
['CANON CONFIRMATION',`<h1>Does this resemble you?</h1><div class="box image">PERSONALIZED ROOT / CANON</div><div class="row"><button class="btn">NO</button><button class="btn yes">YES</button></div><p class="muted">NO → “Really, gurl?” → “NA-AH!” → manual correction</p>`],
['BODY SELF-SELECTION',`<h1>Which one feels like you?</h1><p class="muted">Founder visual-inspection placeholder: 7 neutral alternatives. Exact superseding presentation UI is intentionally NOT guessed.</p><div class="grid">${bodyTiles}</div><div class="row"><button class="btn">CHOOSE AGAIN</button><button class="btn yes">THIS ONE</button></div>`],
['WORKSHOP',`<h1>What are we trying on?</h1>${['CLOTHES','BAGS','SHOES','ACCESSORIES'].map(x=>`<button class="btn">${x} — TRY ME</button>`).join('')}<p class="muted">Accessories V1: HAT · GLASSES · NECKLACE — one per interaction.</p>`],
['POSE SELECTION',`<h1>Choose a Pose</h1><div class="poses">${Array.from({length:10},(_,x)=>`<button class="tile">POSE ${x+1}</button>`).join('')}</div><div class="row"><button class="btn">CHOOSE AGAIN</button><button class="btn yes">SELECT</button></div>`],
['STUDIO SELECTION',`<h1>Choose a Studio</h1><div class="studio"><div class="blue"><h2>BLUE 1170 × 844</h2>Independent pan / zoom workspace<br>centered against RED 390 × 844</div></div><div class="studios">${['Indoor Office','Indoor Living Room','Indoor Disco','Outdoor Sunny Patio','Outdoor Golden Hour','My Studio'].map(x=>`<button class="tile">${x}</button>`).join('')}</div><div class="row"><button class="btn">CHOOSE AGAIN</button><button class="btn yes">SELECT</button></div>`],
['REFERENCE',`<h1>Add Reference</h1><div class="box image">GARMENT / LOOK REFERENCE</div><button class="btn">SWAP</button><button class="btn yes">GENERATE</button>`],
['ALBUS GENERATING',`<h1>ALBUS is doing the math...</h1><div class="box image">LOCAL V1 GENERATION PLACEHOLDER</div><p class="muted">Back / accidental navigation guarded during active transformation.</p>`],
['THE REVEAL',`<h1>The Reveal</h1><div class="box image">RESULT IMAGE</div><label class="box"><input type="checkbox"> REFERENCE ○</label><button class="btn">⤓ Save to Device</button><button class="btn">♡ Favorite</button><button class="btn yes">↻ Try Another One</button>`],
['TREND ALERT',`<h1>Trend Alert</h1><div class="box image">GACHA → TREND REVEAL</div><button class="btn yes">VIEW / OPEN ↗</button><p class="muted">Google Images · new tab · return preserves reveal state</p>`],
['FAVORITES',`<h1>Favorites</h1>${[1,2,3].map(x=>`<div class="box">FAVORITE ${x}</div>`).join('')}<button class="btn">START AGAIN</button><button class="btn">NUCLEAR RESET</button>`]
];
function go(n){i=Math.max(0,Math.min(pages.length-1,n));draw()}
function draw(){
  const [n,h]=pages[i];L.textContent=n;S.innerHTML=h;
  S.querySelectorAll('[data-go]').forEach(el=>el.onclick=()=>go(Number(el.dataset.go)));
  const compact=S.querySelector('#openCompact');
  if(compact) compact.onclick=()=>go(localStorage.getItem(BDAY_KEY)==='1'?8:7);
  const birthday=S.querySelector('#finishBirthday');
  if(birthday) birthday.onclick=()=>{localStorage.setItem(BDAY_KEY,'1');go(8)};
}
document.querySelector('#back').onclick=()=>go(i-1);
document.querySelector('#next').onclick=()=>go(i+1);
draw();