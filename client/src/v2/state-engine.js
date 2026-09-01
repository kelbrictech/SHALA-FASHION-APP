import { DOMAINS, POSES, STUDIOS } from '../foundation/schema.js';

export const V2_PAGES = Object.freeze([
  'SPLASH','DEDICATION','LOGIN','REGISTER ACCOUNT','FORGOT PASSWORD','DASHBOARD TEASER','BIRTHDAY GREETING','MAIN DASHBOARD',
  'CREATE ME — FACE','CREATE ME — VITAL STATISTICS','IDENTITY GENERATING','CANON CONFIRMATION','DOUBLE CONFIRM','BODY SELF-SELECTION',
  'WORKSHOP','POSE SELECTION','STUDIO SELECTION','CLOTHES','BAGS','SHOES','ACCESSORIES','ALBUS GENERATING','THE REVEAL','TREND ALERT','FAVORITES','COMPACT UNDERSIDE'
]);

const DOMAIN_PAGE = Object.freeze({ CLOTHES:'CLOTHES', BAGS:'BAGS', SHOES:'SHOES', ACCESSORIES:'ACCESSORIES' });
const CM_PER_IN = 2.54, KG_PER_LB = 0.45359237;
const round = (n,p=2) => Math.round((Number(n)+Number.EPSILON)*10**p)/10**p;

export function createV2State(){
  return {
    page:'SPLASH', returnPage:null,
    profile:{ faceSource:null, heightCm:null, weightKg:null, bustCm:null, waistCm:null, hipsCm:null, canonSeed:null, bodyOverride:null },
    build:{ selectedPose:null, selectedStudio:null, activeDomain:'CLOTHES', references:{CLOTHES:null,BAGS:null,SHOES:null,ACCESSORIES:null}, currentRootMediaId:null, currentReferenceMediaId:null, candidateMediaId:null, pendingReveal:false, referenceEnabled:false, generating:false },
    transient:{ message:null, werk:false, orientationGate:false }
  };
}

export function go(state,page){ if(!V2_PAGES.includes(page)) throw new Error(`Unknown SHALA page: ${page}`); state.page=page; return state; }
export function openContext(state,page){ state.returnPage=state.page; return go(state,page); }
export function returnContext(state){ const p=state.returnPage||'MAIN DASHBOARD'; state.returnPage=null; return go(state,p); }

export function setFaceSource(state,source){ state.profile.faceSource=source||null; return state; }
export function setMetricProfile(state,{heightCm,weightKg,bustCm,waistCm,hipsCm}){
  Object.assign(state.profile,{heightCm:+heightCm,weightKg:+weightKg,bustCm:+bustCm,waistCm:+waistCm,hipsCm:+hipsCm}); return state;
}
export const cmToFtIn = cm => { const inches=Number(cm)/CM_PER_IN; const ft=Math.floor(inches/12); return {ft,in:round(inches-ft*12,1)}; };
export const ftInToCm = (ft,inch) => round((Number(ft)*12+Number(inch))*CM_PER_IN,1);
export const kgToLb = kg => round(Number(kg)/KG_PER_LB,1);
export const lbToKg = lb => round(Number(lb)*KG_PER_LB,1);
export const cmToIn = cm => round(Number(cm)/CM_PER_IN,1);
export const inToCm = inch => round(Number(inch)*CM_PER_IN,1);

export function setCanonSeed(state,seed){ state.profile.canonSeed=seed; return state; }
export function setBodyOverride(state,index){ if(index<1||index>7) throw new Error('Body override must be 1..7'); state.profile.bodyOverride=index; return state; }
export function selectPose(state,pose){ if(!POSES.includes(pose)) throw new Error('Unknown pose'); state.build.selectedPose=pose; return state; }
export function selectStudio(state,studio){ if(!STUDIOS.includes(studio)) throw new Error('Unknown Studio'); state.build.selectedStudio=studio; return state; }
export function setDomain(state,domain){ if(!DOMAINS.includes(domain)) throw new Error('Unknown domain'); state.build.activeDomain=domain; return go(state,DOMAIN_PAGE[domain]); }
export function nextDomain(state){ const i=DOMAINS.indexOf(state.build.activeDomain); if(i<0) throw new Error('Invalid active domain'); if(i===DOMAINS.length-1) return go(state,'THE REVEAL'); return setDomain(state,DOMAINS[i+1]); }
export function setReference(state,domain,mediaId){ if(!DOMAINS.includes(domain)) throw new Error('Unknown domain'); state.build.references[domain]=mediaId||null; state.build.currentReferenceMediaId=mediaId||null; return state; }
export function toggleReference(state,value=!state.build.referenceEnabled){ state.build.referenceEnabled=!!value; return state; }
export function beginGeneration(state){ if(state.build.generating) return false; state.build.generating=true; state.build.candidateMediaId=null; state.build.pendingReveal=false; go(state,'ALBUS GENERATING'); return true; }
export function generationSucceeded(state,candidateMediaId){ state.build.generating=false; state.build.candidateMediaId=candidateMediaId; state.build.pendingReveal=true; return go(state,'THE REVEAL'); }
export function generationFailed(state,message='Generation failed. Try again.'){ state.build.generating=false; state.build.candidateMediaId=null; state.build.pendingReveal=false; state.transient.message=message; return go(state,state.build.activeDomain); }
export function acceptCandidate(state){ if(!state.build.candidateMediaId) throw new Error('No candidate to accept'); state.build.currentRootMediaId=state.build.candidateMediaId; state.build.candidateMediaId=null; state.build.pendingReveal=false; return state; }
export function rejectCandidate(state){ state.build.candidateMediaId=null; state.build.pendingReveal=false; return go(state,state.build.activeDomain); }
export function skipDomain(state){ state.build.currentReferenceMediaId=null; return nextDomain(state); }
export function startAgain(state){ Object.assign(state.build,{selectedPose:null,selectedStudio:null,activeDomain:'CLOTHES',references:{CLOTHES:null,BAGS:null,SHOES:null,ACCESSORIES:null},currentRootMediaId:null,currentReferenceMediaId:null,candidateMediaId:null,pendingReveal:false,referenceEnabled:false,generating:false}); return go(state,'WORKSHOP'); }
export function setOrientationGate(state,{mobile,portrait}){ state.transient.orientationGate=!!(mobile&&portrait&&['THE REVEAL','FAVORITES'].includes(state.page)); return state.transient.orientationGate; }

export { DOMAINS, POSES, STUDIOS };
