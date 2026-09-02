import { DOMAINS, POSES, STUDIOS } from '../foundation/schema.js';

export const V2_PAGES=Object.freeze(['SPLASH','DEDICATION','LOGIN','REGISTER ACCOUNT','FORGOT PASSWORD','DASHBOARD TEASER','BIRTHDAY GREETING','COMPACT CLOSE','COMPACT OPEN','CREATE ME — FACE','CREATE ME — VITAL STATISTICS','IDENTITY GENERATING','CANON CONFIRMATION','DOUBLE CONFIRM','BODY SELF-SELECTION','WORKSHOP','POSE SELECTION','STUDIO SELECTION','CLOTHES','BAGS','SHOES','ACCESSORIES','ALBUS GENERATING','THE REVEAL','TREND ALERT','FAVORITES','COMPACT UNDERSIDE']);
const DOMAIN_PAGE=Object.freeze({CLOTHES:'CLOTHES',BAGS:'BAGS',SHOES:'SHOES',ACCESSORIES:'ACCESSORIES'}),CM_PER_IN=2.54,KG_PER_LB=.45359237,round=(n,p=2)=>Math.round((Number(n)+Number.EPSILON)*10**p)/10**p;
export function createV2State(){return{page:'SPLASH',returnPage:null,profile:{faceSource:null,heightCm:null,weightKg:null,bustCm:null,waistCm:null,hipsCm:null,canonSeed:null,bodyOverride:null},build:{selectedPose:null,selectedStudio:null,activeDomain:'CLOTHES',references:{CLOTHES:null,BAGS:null,SHOES:null,ACCESSORIES:null},currentRootMediaId:null,currentReferenceMediaId:null,candidateMediaId:null,pendingReveal:false,referenceEnabled:false,generating:false},transient:{message:null,werk:false,orientationGate:false}}}
export function go(s,p){if(!V2_PAGES.includes(p))throw new Error(`Unknown SHALA page: ${p}`);s.page=p;return s}
export function openContext(s,p){s.returnPage=s.page;return go(s,p)}
export function returnContext(s){const p=s.returnPage||'COMPACT OPEN';s.returnPage=null;return go(s,p)}
export function setFaceSource(s,x){s.profile.faceSource=x||null;return s}
export function setMetricProfile(s,x){Object.assign(s.profile,{heightCm:+x.heightCm,weightKg:+x.weightKg,bustCm:+x.bustCm,waistCm:+x.waistCm,hipsCm:+x.hipsCm});return s}
export const cmToFtIn=cm=>{const i=Number(cm)/CM_PER_IN,ft=Math.floor(i/12);return{ft,in:round(i-ft*12,1)}},ftInToCm=(ft,i)=>round((Number(ft)*12+Number(i))*CM_PER_IN,1),kgToLb=kg=>round(Number(kg)/KG_PER_LB,1),lbToKg=lb=>round(Number(lb)*KG_PER_LB,1),cmToIn=cm=>round(Number(cm)/CM_PER_IN,1),inToCm=i=>round(Number(i)*CM_PER_IN,1);
export function setCanonSeed(s,x){s.profile.canonSeed=x;return s}
export function setBodyOverride(s,i){if(i<1||i>7)throw new Error('Body override must be 1..7');s.profile.bodyOverride=i;return s}
export function selectPose(s,p){if(!POSES.includes(p))throw new Error(`Unknown pose: ${p}`);s.build.selectedPose=p;return s}
export function selectStudio(s,x){if(!STUDIOS.includes(x))throw new Error(`Unknown Studio: ${x}`);s.build.selectedStudio=x;return s}
export function setDomain(s,d){if(!DOMAINS.includes(d))throw new Error(`Unknown domain: ${d}`);s.build.activeDomain=d;return go(s,DOMAIN_PAGE[d])}
export function nextDomain(s){const i=DOMAINS.indexOf(s.build.activeDomain);if(i<0)throw new Error('Invalid active domain');return i===DOMAINS.length-1?go(s,'THE REVEAL'):setDomain(s,DOMAINS[i+1])}
export function setReference(s,d,id){if(!DOMAINS.includes(d))throw new Error(`Unknown domain: ${d}`);s.build.references[d]=id||null;if(d===s.build.activeDomain)s.build.currentReferenceMediaId=id||null;return s}
export function toggleReference(s,v=!s.build.referenceEnabled){s.build.referenceEnabled=!!v;return s}
export function beginGeneration(s){if(s.build.generating)return false;s.build.generating=true;s.build.candidateMediaId=null;s.build.pendingReveal=false;go(s,'ALBUS GENERATING');return true}
export function generationSucceeded(s,id){s.build.generating=false;s.build.candidateMediaId=id;s.build.pendingReveal=true;return go(s,'THE REVEAL')}
export function generationFailed(s,m='Generation failed. Try again.'){s.build.generating=false;s.build.candidateMediaId=null;s.build.pendingReveal=false;s.transient.message=m;return go(s,s.build.activeDomain)}
export function acceptCandidate(s){if(!s.build.candidateMediaId)throw new Error('No candidate to accept');s.build.currentRootMediaId=s.build.candidateMediaId;s.build.candidateMediaId=null;s.build.pendingReveal=false;return s}
export function rejectCandidate(s){s.build.candidateMediaId=null;s.build.pendingReveal=false;return go(s,s.build.activeDomain)}
export function skipDomain(s){s.build.currentReferenceMediaId=null;return nextDomain(s)}
export function startAgain(s){Object.assign(s.build,{selectedPose:null,selectedStudio:null,activeDomain:'CLOTHES',references:{CLOTHES:null,BAGS:null,SHOES:null,ACCESSORIES:null},currentRootMediaId:null,currentReferenceMediaId:null,candidateMediaId:null,pendingReveal:false,referenceEnabled:false,generating:false});return go(s,'WORKSHOP')}
export function setOrientationGate(s,{mobile,portrait}){s.transient.orientationGate=!!(mobile&&portrait&&['THE REVEAL','FAVORITES'].includes(s.page));return s.transient.orientationGate}
export{DOMAINS,POSES,STUDIOS};
