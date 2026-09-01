import { DOMAINS, POSES, STUDIOS } from '../foundation/schema.js';

export const V2_PAGES = Object.freeze([
  'SPLASH','DEDICATION','LOGIN','REGISTER ACCOUNT','FORGOT PASSWORD','DASHBOARD TEASER','BIRTHDAY GREETING','MAIN DASHBOARD',
  'CREATE ME — FACE','CREATE ME — VITAL STATISTICS','IDENTITY GENERATING','CANON CONFIRMATION','DOUBLE CONFIRM','BODY SELF-SELECTION',
  'WORKSHOP','POSE SELECTION','STUDIO SELECTION','CLOTHES','BAGS','SHOES','ACCESSORIES','ALBUS GENERATING','THE REVEAL','TREND ALERT','FAVORITES','COMPACT UNDERSIDE'
]);

const DOMAIN_PAGE = Object.freeze({ CLOTHES:'CLOTHES', BAGS:'BAGS', SHOES:'SHOES', ACCESSORIES:'ACCESSORIES' });
const CM_PER_IN = 2.54, KG_PER_LB = 0.45359237;
const round = (n,p=2) => Math.round((Number(n)+Number.EPSILON)*10**p)/10**p;

/**
 * createV2State()
 * Factory: initialized state object with all required classes
 */
export function createV2State(){
  return {
    // Navigation
    page:'SPLASH',
    returnPage:null,
    
    // Profile-persistent: once backend connects, normalized and deterministic
    profile:{
      faceSource:null,
      heightCm:null,
      weightKg:null,
      bustCm:null,
      waistCm:null,
      hipsCm:null,
      canonSeed:null,
      bodyOverride:null
    },
    
    // Build-session: active transformation progress, references, root
    build:{
      selectedPose:null,
      selectedStudio:null,
      activeDomain:'CLOTHES',
      references:{CLOTHES:null,BAGS:null,SHOES:null,ACCESSORIES:null},
      currentRootMediaId:null,
      currentReferenceMediaId:null,
      candidateMediaId:null,
      pendingReveal:false,
      referenceEnabled:false,
      generating:false
    },
    
    // Transient: UI state, overlays, validation
    transient:{
      message:null,
      werk:false,
      orientationGate:false
    }
  };
}

/**
 * Navigation primitives
 */

export function go(state,page){
  if(!V2_PAGES.includes(page)) throw new Error(`Unknown SHALA page: ${page}`);
  state.page=page;
  return state;
}

export function openContext(state,page){
  state.returnPage=state.page;
  return go(state,page);
}

export function returnContext(state){
  const p=state.returnPage||'MAIN DASHBOARD';
  state.returnPage=null;
  return go(state,p);
}

/**
 * Profile mutation
 */

export function setFaceSource(state,source){
  state.profile.faceSource=source||null;
  return state;
}

export function setMetricProfile(state,{heightCm,weightKg,bustCm,waistCm,hipsCm}){
  Object.assign(state.profile,{
    heightCm:+heightCm,
    weightKg:+weightKg,
    bustCm:+bustCm,
    waistCm:+waistCm,
    hipsCm:+hipsCm
  });
  return state;
}

/**
 * Measurement normalization: bidirectional, deterministic, round-trip safe
 */

export const cmToFtIn = cm => {
  const inches=Number(cm)/CM_PER_IN;
  const ft=Math.floor(inches/12);
  return {ft,in:round(inches-ft*12,1)};
};

export const ftInToCm = (ft,inch) => round((Number(ft)*12+Number(inch))*CM_PER_IN,1);

export const kgToLb = kg => round(Number(kg)/KG_PER_LB,1);

export const lbToKg = lb => round(Number(lb)*KG_PER_LB,1);

export const cmToIn = cm => round(Number(cm)/CM_PER_IN,1);

export const inToCm = inch => round(Number(inch)*CM_PER_IN,1);

/**
 * Identity resolution and body override
 */

export function setCanonSeed(state,seed){
  state.profile.canonSeed=seed;
  return state;
}

export function setBodyOverride(state,index){
  if(index<1||index>7) throw new Error('Body override must be 1..7');
  state.profile.bodyOverride=index;
  return state;
}

/**
 * Pose and Studio selection: exactly 10 poses, 6 Studios from schema
 */

export function selectPose(state,pose){
  if(!POSES.includes(pose)) throw new Error(`Unknown pose: ${pose}`);
  state.build.selectedPose=pose;
  return state;
}

export function selectStudio(state,studio){
  if(!STUDIOS.includes(studio)) throw new Error(`Unknown Studio: ${studio}`);
  state.build.selectedStudio=studio;
  return state;
}

/**
 * Domain progression: CLOTHES → BAGS → SHOES → ACCESSORIES
 * Do not silently reorder.
 */

export function setDomain(state,domain){
  if(!DOMAINS.includes(domain)) throw new Error(`Unknown domain: ${domain}`);
  state.build.activeDomain=domain;
  return go(state,DOMAIN_PAGE[domain]);
}

export function nextDomain(state){
  const i=DOMAINS.indexOf(state.build.activeDomain);
  if(i<0) throw new Error('Invalid active domain');
  if(i===DOMAINS.length-1) return go(state,'THE REVEAL');
  return setDomain(state,DOMAINS[i+1]);
}

/**
 * Reference management: SWAP, SKIP, reference toggle
 * Active reference change does not mutate accepted root.
 */

export function setReference(state,domain,mediaId){
  if(!DOMAINS.includes(domain)) throw new Error(`Unknown domain: ${domain}`);
  state.build.references[domain]=mediaId||null;
  state.build.currentReferenceMediaId=(domain===state.build.activeDomain)?mediaId||null:state.build.currentReferenceMediaId;
  return state;
}

export function toggleReference(state,value=!state.build.referenceEnabled){
  state.build.referenceEnabled=!!value;
  return state;
}

/**
 * Transformation state safety
 * Candidate ≠ root until accepted.
 * Generation success may create candidate.
 * Rejected/failed generation preserves root.
 * Duplicate submission blocked while generating.
 * Last successful root sacrosanct.
 */

export function beginGeneration(state){
  if(state.build.generating) return false;
  state.build.generating=true;
  state.build.candidateMediaId=null;
  state.build.pendingReveal=false;
  go(state,'ALBUS GENERATING');
  return true;
}

export function generationSucceeded(state,candidateMediaId){
  state.build.generating=false;
  state.build.candidateMediaId=candidateMediaId;
  state.build.pendingReveal=true;
  return go(state,'THE REVEAL');
}

export function generationFailed(state,message='Generation failed. Try again.'){
  state.build.generating=false;
  state.build.candidateMediaId=null;
  state.build.pendingReveal=false;
  state.transient.message=message;
  return go(state,state.build.activeDomain);
}

export function acceptCandidate(state){
  if(!state.build.candidateMediaId) throw new Error('No candidate to accept');
  state.build.currentRootMediaId=state.build.candidateMediaId;
  state.build.candidateMediaId=null;
  state.build.pendingReveal=false;
  return state;
}

export function rejectCandidate(state){
  state.build.candidateMediaId=null;
  state.build.pendingReveal=false;
  return go(state,state.build.activeDomain);
}

/**
 * SKIP: advance without fabricating image; preserves current root
 */

export function skipDomain(state){
  state.build.currentReferenceMediaId=null;
  return nextDomain(state);
}

/**
 * START AGAIN: clear active build, preserve profile identity/body config
 * Do not implement as Nuclear Reset.
 */

export function startAgain(state){
  Object.assign(state.build,{
    selectedPose:null,
    selectedStudio:null,
    activeDomain:'CLOTHES',
    references:{CLOTHES:null,BAGS:null,SHOES:null,ACCESSORIES:null},
    currentRootMediaId:null,
    currentReferenceMediaId:null,
    candidateMediaId:null,
    pendingReveal:false,
    referenceEnabled:false,
    generating:false
  });
  return go(state,'WORKSHOP');
}

/**
 * Orientation contract: desktop/laptop bypass;
 * mobile portrait gate on Reveal and Favorites only;
 * mobile landscape releases gate.
 * Transient display state only; no separate product page.
 */

export function setOrientationGate(state,{mobile,portrait}){
  state.transient.orientationGate=!!(mobile&&portrait&&['THE REVEAL','FAVORITES'].includes(state.page));
  return state.transient.orientationGate;
}

/**
 * Export schema for validation
 */

export { DOMAINS, POSES, STUDIOS };
