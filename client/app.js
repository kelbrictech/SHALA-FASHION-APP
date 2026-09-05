const A=window.SHALA_ASSETS||{};
for(let i=1;i<=8;i++){
  const page=document.getElementById('p'+i);
  if(page&&A['p'+i]) page.style.backgroundImage=`url(${A['p'+i]})`;
}
const pages=[1,2,3,4,5,6,7,8].map(n=>document.getElementById('p'+n));
let cur=1;
let dedicationTimer=null;
function go(n){
  pages.forEach((p,i)=>p.classList.toggle('active',i===n-1));
  cur=n;
  if(dedicationTimer){clearTimeout(dedicationTimer);dedicationTimer=null;}
  if(n===2) dedicationTimer=setTimeout(()=>{if(cur===2)go(3)},3000);
}
function birthdayLocked(){return localStorage.getItem('shala_birthday_heart_tapped')==='true'||localStorage.getItem('shala_dashboard_teaser_locked')==='true';}
function identityAccepted(){return localStorage.getItem('shala_identity_source_accepted')==='true'||localStorage.getItem('shala_create_me_face_locked')==='true';}
function loginRoute(){
  if(!birthdayLocked()) return go(6);
  if(!identityAccepted()) return go(8);
  // Page 14 COMPACT CLOSED is not yet reconstructed in this live stack.
  // Do not invent a destination: keep Page 8 available until Page 14 is wired.
  return go(8);
}
document.getElementById('p1').onclick=()=>go(2);
document.getElementById('signup').onclick=()=>go(4);
document.getElementById('forgot').onclick=()=>go(5);
document.getElementById('key').onclick=loginRoute;
document.getElementById('open').onclick=()=>{
  const u=document.getElementById('login-user').value.trim();
  const p=document.getElementById('login-pass').value;
  if(!u||!p)return;
  const a=JSON.parse(localStorage.getItem('shala_account')||'null');
  if(a&&a.username===u&&a.password===p)loginRoute();
};
document.getElementById('bring-back').onclick=()=>go(3);
document.getElementById('forgot-back').onclick=()=>go(3);
const regName=document.getElementById('reg-name'),regPass=document.getElementById('reg-pass'),regCheck=document.getElementById('reg-check');
document.getElementById('all-done').onclick=()=>{
  const u=regName.value.trim(),p=regPass.value,c=regCheck.value;
  if(!u||!p||p!==c)return;
  localStorage.setItem('shala_account',JSON.stringify({username:u,password:p}));
  go(3);
};
// Final recovery-passphrase mechanics are deliberately deferred.
document.getElementById('pray').onclick=()=>{};
document.getElementById('envelope').onclick=()=>go(7);
document.getElementById('heart').onclick=()=>{
  localStorage.setItem('shala_birthday_heart_tapped','true');
  localStorage.setItem('shala_dashboard_teaser_locked','true');
  localStorage.setItem('shala_birthday_card_locked','true');
  setTimeout(()=>go(8),3000);
};
const file=document.getElementById('file'),mirrorimg=document.getElementById('mirrorimg'),usepic=document.getElementById('usepic'),cam=document.getElementById('cam'),video=document.getElementById('video');
let candidate=null,stream=null;
function setCandidate(src){candidate=src;mirrorimg.src=src;mirrorimg.style.display='block';usepic.disabled=false;usepic.setAttribute('aria-disabled','false');}
document.getElementById('upload').onclick=()=>{file.removeAttribute('capture');file.click();};
file.onchange=e=>{const f=e.target.files&&e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>setCandidate(r.result);r.readAsDataURL(f);e.target.value='';};
document.getElementById('take').onclick=async()=>{
  try{
    stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
    video.srcObject=stream;cam.style.display='flex';
  }catch(e){file.setAttribute('capture','user');file.click();}
};
function stopCamera(){if(stream)stream.getTracks().forEach(t=>t.stop());stream=null;cam.style.display='none';video.srcObject=null;}
document.getElementById('cancel').onclick=stopCamera;
document.getElementById('shutter').onclick=()=>{
  if(!video.videoWidth)return;
  const c=document.createElement('canvas');c.width=video.videoWidth;c.height=video.videoHeight;
  c.getContext('2d').drawImage(video,0,0);setCandidate(c.toDataURL('image/jpeg',.92));stopCamera();
};
usepic.onclick=()=>{
  if(!candidate)return;
  localStorage.setItem('shala_identity_source_accepted','true');
  window.__SHALA_ACCEPTED_IDENTITY_SOURCE__=candidate;
  // Acceptance is wired; forward destination remains intentionally unassigned.
};
go(1);
