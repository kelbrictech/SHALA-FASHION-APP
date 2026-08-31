// client/src/framing/state.js
// 1C FRAMING — deterministic runtime skeleton. No UI or external services.
import * as storage from '../foundation/storage.js';
import { DOMAINS, POSES, STUDIOS } from '../foundation/schema.js';

export const SCREENS = Object.freeze({
  FACE:'CREATE_ME_FACE', MEASUREMENTS:'CREATE_ME_MEASUREMENTS', IDENTITY_GENERATING:'CREATE_ME_IDENTITY_GENERATING',
  CANON:'CANON_CONFIRMATION', CANON_CORRECTION:'CANON_CORRECTION', HOME:'MAIN_HOME_COMPACT', WORKSHOP:'WORKSHOP_TRY_ON',
  POSE:'POSE_SELECTION', STUDIO:'STUDIO_SELECTION', REFERENCE:'REFERENCE_ACQUISITION', GENERATING:'ALBUS_GENERATING',
  REVEAL:'THE_REVEAL', TREND:'TREND_ALERT', FAVORITES:'FAVORITES', RECOVERY:'RECOVERY_REQUIRED'
});

const initialBlue=()=>({panX:0,panY:0,zoom:1});
export function initialState(){return {screen:SCREENS.FACE,profile:null,activeBuild:null,comparisonEnabled:false,blueViewport:initialBlue(),trendRevealed:false,werk:false,error:null};}
const copy=s=>({...s,activeBuild:s.activeBuild?{...s.activeBuild}:null,blueViewport:{...s.blueViewport}});
const requireScreen=(s,...allowed)=>{if(!allowed.includes(s.screen))throw new Error('illegal_transition');};
const requireBuild=s=>{if(!s.activeBuild)throw new Error('active_build_required');};

export async function hydrate(){
  const meta=await storage.initStorage();
  if(meta.recoveryStatus==='SCHEMA_MISMATCH') return {...initialState(),screen:SCREENS.RECOVERY,error:'schema_mismatch_recovery_required'};
  const profile=await storage.loadProfile();
  const activeBuild=await storage.loadActiveBuild();
  if(activeBuild?.pendingReveal) return {...initialState(),profile,activeBuild,comparisonEnabled:Boolean(activeBuild.comparisonEnabled),screen:SCREENS.REVEAL};
  if(activeBuild){
    const screen=deriveBuildScreen(activeBuild);
    return {...initialState(),profile,activeBuild,comparisonEnabled:Boolean(activeBuild.comparisonEnabled),screen};
  }
  return {...initialState(),profile,screen:profile?.selectedCanonId&&profile?.personalizedRootMediaPointer?SCREENS.HOME:SCREENS.FACE};
}

function deriveBuildScreen(b){
  if(b.pendingReveal)return SCREENS.REVEAL;
  if(b.candidateMediaPointer)return SCREENS.GENERATING;
  if(b.currentReferenceMediaPointer)return SCREENS.REFERENCE;
  if(b.selectedStudioId)return SCREENS.REFERENCE;
  if(b.selectedPoseId)return SCREENS.STUDIO;
  if(b.selectedDomain)return SCREENS.POSE;
  return SCREENS.WORKSHOP;
}
async function persistBuild(s){if(s.activeBuild)await storage.saveActiveBuild(s.activeBuild);return s;}

export async function transition(state,event,payload={}){
  const s=copy(state);
  switch(event){
    case 'FACE_ACCEPTED': requireScreen(s,SCREENS.FACE); s.screen=SCREENS.MEASUREMENTS; return s;
    case 'MEASUREMENTS_ACCEPTED': requireScreen(s,SCREENS.MEASUREMENTS); s.screen=SCREENS.IDENTITY_GENERATING; return s;
    case 'IDENTITY_READY': requireScreen(s,SCREENS.IDENTITY_GENERATING); s.screen=SCREENS.CANON; return s;
    case 'CANON_NO': requireScreen(s,SCREENS.CANON); s.screen=SCREENS.CANON_CORRECTION; return s;
    case 'CANON_CORRECTED': requireScreen(s,SCREENS.CANON_CORRECTION); s.screen=SCREENS.CANON; return s;
    case 'CANON_YES': requireScreen(s,SCREENS.CANON); if(!payload.profile)throw new Error('profile_required'); await storage.saveProfile(payload.profile); s.profile=await storage.loadProfile(); s.screen=SCREENS.HOME; return s;
    case 'OPEN_WORKSHOP': requireScreen(s,SCREENS.HOME); s.activeBuild={selectedDomain:null,selectedPoseId:null,selectedStudioId:null,currentRootMediaPointer:s.profile?.personalizedRootMediaPointer||null,currentReferenceMediaPointer:null,candidateMediaPointer:null,pendingReveal:false,comparisonEnabled:false}; s.screen=SCREENS.WORKSHOP; return persistBuild(s);
    case 'SELECT_DOMAIN': requireScreen(s,SCREENS.WORKSHOP); if(!DOMAINS.includes(payload.domain))throw new Error('invalid_domain'); requireBuild(s); s.activeBuild.selectedDomain=payload.domain; s.screen=SCREENS.POSE; return persistBuild(s);
    case 'SELECT_POSE': requireScreen(s,SCREENS.POSE); if(!POSES.includes(payload.poseId))throw new Error('invalid_pose'); requireBuild(s); s.activeBuild.selectedPoseId=payload.poseId; s.screen=SCREENS.STUDIO; return persistBuild(s);
    case 'SELECT_STUDIO': requireScreen(s,SCREENS.STUDIO); if(!STUDIOS.includes(payload.studioId))throw new Error('invalid_studio'); requireBuild(s); s.activeBuild.selectedStudioId=payload.studioId; s.screen=SCREENS.REFERENCE; return persistBuild(s);
    case 'SET_REFERENCE': requireScreen(s,SCREENS.REFERENCE); requireBuild(s); if(!payload.pointer||payload.pointer===s.activeBuild.currentRootMediaPointer)throw new Error('invalid_reference'); s.activeBuild.currentReferenceMediaPointer=payload.pointer; return persistBuild(s);
    case 'SWAP_REFERENCE': requireScreen(s,SCREENS.REFERENCE,SCREENS.REVEAL); requireBuild(s); if(!payload.pointer||payload.pointer===s.activeBuild.currentRootMediaPointer)throw new Error('invalid_reference'); s.activeBuild.currentReferenceMediaPointer=payload.pointer; s.activeBuild.candidateMediaPointer=null; s.activeBuild.pendingReveal=false; s.screen=SCREENS.REFERENCE; return persistBuild(s);
    case 'BEGIN_GENERATION': requireScreen(s,SCREENS.REFERENCE); requireBuild(s); if(!s.activeBuild.currentReferenceMediaPointer)throw new Error('reference_required'); s.activeBuild.candidateMediaPointer=null; s.screen=SCREENS.GENERATING; return persistBuild(s);
    case 'CANDIDATE_READY': requireScreen(s,SCREENS.GENERATING); requireBuild(s); if(!payload.pointer||payload.pointer===s.activeBuild.currentRootMediaPointer)throw new Error('invalid_candidate'); s.activeBuild.candidateMediaPointer=payload.pointer; return persistBuild(s);
    case 'CANDIDATE_PASS': requireScreen(s,SCREENS.GENERATING); requireBuild(s); if(!s.activeBuild.candidateMediaPointer)throw new Error('candidate_required'); s.activeBuild.currentRootMediaPointer=s.activeBuild.candidateMediaPointer; s.activeBuild.candidateMediaPointer=null; s.activeBuild.pendingReveal=true; s.screen=SCREENS.REVEAL; return persistBuild(s);
    case 'CANDIDATE_FAIL': requireScreen(s,SCREENS.GENERATING); requireBuild(s); s.activeBuild.candidateMediaPointer=null; s.screen=SCREENS.REFERENCE; return persistBuild(s);
    case 'TOGGLE_COMPARISON': requireScreen(s,SCREENS.REVEAL); requireBuild(s); s.comparisonEnabled=!s.comparisonEnabled; s.activeBuild.comparisonEnabled=s.comparisonEnabled; return persistBuild(s);
    case 'TRY_ANOTHER': requireScreen(s,SCREENS.REVEAL); requireBuild(s); s.activeBuild.currentReferenceMediaPointer=null; s.activeBuild.candidateMediaPointer=null; s.activeBuild.pendingReveal=false; s.screen=SCREENS.REFERENCE; return persistBuild(s);
    case 'FAVORITE': requireScreen(s,SCREENS.REVEAL); return {...s,favorites:await storage.addFavorite(payload.favorite)};
    case 'START_AGAIN': await storage.startAgain(); return {...initialState(),profile:s.profile,screen:s.profile?SCREENS.HOME:SCREENS.FACE};
    case 'NUCLEAR_RESET': await storage.nuclearReset(); return initialState();
    case 'OPEN_TREND': requireScreen(s,SCREENS.HOME); s.screen=SCREENS.TREND; return s;
    case 'REVEAL_TREND': requireScreen(s,SCREENS.TREND); s.trendRevealed=true; return s;
    case 'RETURN_FROM_EXTERNAL': requireScreen(s,SCREENS.TREND); return s;
    case 'OPEN_FAVORITES': requireScreen(s,SCREENS.HOME); s.screen=SCREENS.FAVORITES; return s;
    case 'RETURN_HOME': requireScreen(s,SCREENS.TREND,SCREENS.FAVORITES); s.screen=SCREENS.HOME; return s;
    case 'SET_BLUE_VIEWPORT': if(!Number.isFinite(payload.panX)||!Number.isFinite(payload.panY)||!Number.isFinite(payload.zoom)||payload.zoom<=0)throw new Error('invalid_viewport'); s.blueViewport={panX:payload.panX,panY:payload.panY,zoom:payload.zoom}; return s;
    case 'COMPLETE_BUILD': requireScreen(s,SCREENS.REVEAL); s.werk=true; return s;
    case 'CLEAR_WERK': s.werk=false; return s;
    case 'BACK': if(s.screen===SCREENS.GENERATING)throw new Error('navigation_locked'); throw new Error('back_transition_not_defined');
    default: throw new Error('unknown_event');
  }
}
