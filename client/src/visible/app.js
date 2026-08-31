import { boot, dispatch, project } from '../roughins/controller.js';
import * as storage from '../foundation/storage.js';
import { POSES, STUDIOS } from '../foundation/schema.js';

let state = null;
let view = null;

const statusEl = document.getElementById('status');
const screenLabel = document.getElementById('screenLabel');
const controlsEl = document.getElementById('controls');
const blueViewport = document.getElementById('blueViewport');
const studioControls = document.getElementById('studioControls');
const favoritesList = document.getElementById('favoritesList');
const referenceArea = document.getElementById('referenceArea');
const compactArea = document.getElementById('compactArea');

function setStatus(text){ statusEl.textContent = text; }

function render() {
  if (!view) return;
  screenLabel.textContent = `Screen: ${view.screen}`;
  // compact area
  compactArea.innerHTML = '';
  const exploreBtn = document.createElement('button'); exploreBtn.textContent = 'EXPLORE'; exploreBtn.onclick = async ()=>{ const r = await dispatch(state,'OPEN_WORKSHOP'); apply(r); };
  const trendBtn = document.createElement('button'); trendBtn.textContent = 'TREND ALERT'; trendBtn.onclick = ()=>window.open('https://www.google.com/search?q=fashion','_blank');
  compactArea.appendChild(exploreBtn); compactArea.appendChild(trendBtn);

  // favorites
  favoritesList.innerHTML = '';
  if (view.profileSummary) {
    const meta = storage.getMeta().then(m=>m).catch(()=>null);
  }

  // controls vary by screen: provide a small set of wiring buttons
  controlsEl.innerHTML = '';
  const addControl = (label, fn) => { const b = document.createElement('button'); b.textContent = label; b.onclick = async ()=>{ try{ const res = await fn(); apply(res); } catch(e){ alert('Action error: '+e.message); } }; controlsEl.appendChild(b); };

  addControl('FACE_ACCEPTED', async ()=> dispatch(state,'FACE_ACCEPTED'));
  addControl('MEASUREMENTS_ACCEPTED', async ()=> dispatch(state,'MEASUREMENTS_ACCEPTED'));
  addControl('IDENTITY_READY', async ()=> dispatch(state,'IDENTITY_READY'));
  addControl('CANON_YES', async ()=> dispatch(state,'CANON_YES',{ profile: { height:170, weight:65, measurements:{ bust:36, waist:28, hips:38 }, selectedCanonId:'CANON_01', personalizedRootMediaPointer:'root-1', birthdayGiftOpened:false }}));
  addControl('OPEN_WORKSHOP', async ()=> dispatch(state,'OPEN_WORKSHOP'));
  addControl('BEGIN_GENERATION', async ()=> dispatch(state,'BEGIN_GENERATION'));
  addControl('CANDIDATE_READY', async ()=> dispatch(state,'CANDIDATE_READY',{ pointer:'candidate-ui-'+Date.now() }));
  addControl('CANDIDATE_PASS', async ()=> dispatch(state,'CANDIDATE_PASS'));
  addControl('CANDIDATE_FAIL', async ()=> dispatch(state,'CANDIDATE_FAIL'));
  addControl('TOGGLE_COMPARISON', async ()=> dispatch(state,'TOGGLE_COMPARISON'));
  addControl('TRY_ANOTHER', async ()=> dispatch(state,'TRY_ANOTHER'));
  addControl('FAVORITE', async ()=> dispatch(state,'FAVORITE',{ favorite:{ id:'fav-'+Date.now() } }));
  addControl('START_AGAIN', async ()=> dispatch(state,'START_AGAIN'));
  addControl('NUCLEAR_RESET', async ()=> dispatch(state,'NUCLEAR_RESET'));

  // studio controls
  studioControls.innerHTML = '';
  const studioSelect = document.createElement('select');
  for (const s of STUDIOS) {
    const o = document.createElement('option'); o.value = s; o.textContent = s === 'MY_STUDIO' ? 'My Studio' : s; studioSelect.appendChild(o);
  }
  const selectBtn = document.createElement('button'); selectBtn.textContent = 'SELECT_STUDIO'; selectBtn.onclick = async ()=>{
    const res = await dispatch(state,'SELECT_STUDIO',{ studioId: studioSelect.value }); apply(res);
  };
  studioControls.appendChild(studioSelect); studioControls.appendChild(selectBtn);

  // poses
  const poseSelect = document.createElement('select');
  for (const p of POSES){ const o = document.createElement('option'); o.value=p; o.textContent=p; poseSelect.appendChild(o); }
  const selectPose = document.createElement('button'); selectPose.textContent='SELECT_POSE'; selectPose.onclick = async ()=>{ const res = await dispatch(state,'SELECT_POSE',{ poseId: poseSelect.value }); apply(res); };
  studioControls.appendChild(document.createElement('br'));
  studioControls.appendChild(poseSelect); studioControls.appendChild(selectPose);

  // blue viewport content
  blueViewport.textContent = `Root: ${view.activeBuild?.root || '-'} | Reference: ${view.activeBuild?.reference || '-'} | Candidate: ${view.activeBuild?.candidate || '-'}`;

  // reference area and favorites list
  referenceArea.innerHTML = '';
  const setRefBtn = document.createElement('button'); setRefBtn.textContent = 'SET_REFERENCE (ref-ui)'; setRefBtn.onclick = async ()=>{ const res = await dispatch(state,'SET_REFERENCE',{ pointer:'ref-ui-'+Date.now() }); apply(res); };
  const swapRefBtn = document.createElement('button'); swapRefBtn.textContent = 'SWAP_REFERENCE (ref-swap)'; swapRefBtn.onclick = async ()=>{ const res = await dispatch(state,'SWAP_REFERENCE',{ pointer:'ref-swap-'+Date.now() }); apply(res); };
  referenceArea.appendChild(setRefBtn); referenceArea.appendChild(swapRefBtn);

  // favorites list display
  favoritesList.innerHTML = '';
  const favs = await storage.getFavorites();
  for (const f of favs){ const li = document.createElement('li'); li.textContent = JSON.stringify(f); favoritesList.appendChild(li); }
}

function apply(res){
  if (res && res.state) {
    state = res.state; view = res.view || project(state);
  } else if (res && res.screen) {
    // sometimes hydrate returns a plain state
    state = res; view = project(state);
  }
  setStatus('Ready');
  render();
}

(async function init(){
  setStatus('Booting...');
  try{
    const booted = await boot();
    state = booted.state; view = booted.view;
    setStatus('Ready');
    render();
  }catch(e){ setStatus('Boot failed: '+e.message); }
})();
