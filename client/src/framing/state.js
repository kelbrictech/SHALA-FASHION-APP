// client/src/framing/state.js
// CSV-authoritative SHALA V1 runtime framing.
// Authority: SHALAV127pageInteractionsFINAL.csv (27 pages).
import * as storage from '../foundation/storage.js';
import { DOMAINS, POSES, STUDIOS } from '../foundation/schema.js';

export const SCREENS = Object.freeze({
  P1_SPLASH:'P1_SPLASH',
  P2_DEDICATION:'P2_DEDICATION',
  P3_LOGIN:'P3_LOGIN',
  P4_REGISTER:'P4_REGISTER',
  P5_FORGOT_PASSWORD:'P5_FORGOT_PASSWORD',
  P6_DASHBOARD_TEASER:'P6_DASHBOARD_TEASER',
  P7_BIRTHDAY_GREETING:'P7_BIRTHDAY_GREETING',
  P8_COMPACT_CLOSE:'P8_COMPACT_CLOSE',
  P9_COMPACT_OPEN:'P9_COMPACT_OPEN',
  P10_CREATE_FACE:'P10_CREATE_FACE',
  P11_VITAL_STATISTICS:'P11_VITAL_STATISTICS',
  P12_IDENTITY_GENERATING:'P12_IDENTITY_GENERATING',
  P13_CANON_CONFIRMATION:'P13_CANON_CONFIRMATION',
  P14_DOUBLE_CONFIRM:'P14_DOUBLE_CONFIRM',
  P15_BODY_SELF_SELECTION:'P15_BODY_SELF_SELECTION',
  P16_WORKSHOP:'P16_WORKSHOP',
  P17_POSE_SELECTION:'P17_POSE_SELECTION',
  P18_STUDIO_SELECTION:'P18_STUDIO_SELECTION',
  P19_CLOTHES:'P19_CLOTHES',
  P20_BAGS:'P20_BAGS',
  P21_SHOES:'P21_SHOES',
  P22_ACCESSORIES:'P22_ACCESSORIES',
  P23_ALBUS_GENERATING:'P23_ALBUS_GENERATING',
  P24_REVEAL:'P24_REVEAL',
  P25_TREND_ALERT:'P25_TREND_ALERT',
  P26_FAVORITES:'P26_FAVORITES',
  P27_COMPACT_UNDERSIDE:'P27_COMPACT_UNDERSIDE',
  RECOVERY:'RECOVERY_REQUIRED'
});

export const PAGE_NUMBER = Object.freeze(Object.fromEntries(
  Object.entries(SCREENS)
    .filter(([,v])=>/^P\d+_/.test(v))
    .map(([,v])=>[v,Number(/^P(\d+)_/.exec(v)[1])])
));

const STAGE_ORDER=['CLOTHES','BAGS','SHOES','ACCESSORIES'];
const stageScreen={CLOTHES:SCREENS.P19_CLOTHES,BAGS:SCREENS.P20_BAGS,SHOES:SCREENS.P21_SHOES,ACCESSORIES:SCREENS.P22_ACCESSORIES};
const nextStage={CLOTHES:'BAGS',BAGS:'SHOES',SHOES:'ACCESSORIES',ACCESSORIES:null};
const newStage=()=>({sourcePointer:null,appliedPointer:null,skipped:false});
const newBuild=profile=>({
  selectedFocus:null,
  selectedPoseId:null,
  selectedStudioId:null,
  currentRootMediaPointer:profile?.personalizedRootMediaPointer||null,
  stages:Object.fromEntries(STAGE_ORDER.map(k=>[k,newStage()])),
  currentStage:'CLOTHES',
  candidateMediaPointer:null,
  pendingReveal:false,
  comparisonEnabled:false
});
const copy=s=>({
  ...s,
  accountDraft:s.accountDraft?{...s.accountDraft}:null,
  identityDraft:s.identityDraft?{...s.identityDraft}:null,
  activeBuild:s.activeBuild?{
    ...s.activeBuild,
    stages:s.activeBuild.stages?Object.fromEntries(Object.entries(s.activeBuild.stages).map(([k,v])=>[k,{...v}])):undefined
  }:null
});
const requireScreen=(s,...allowed)=>{if(!allowed.includes(s.screen))throw new Error('illegal_transition');};
const requireBuild=s=>{if(!s.activeBuild)throw new Error('active_build_required');};
const requireStage=s=>{requireBuild(s); const k=s.activeBuild.currentStage; if(!STAGE_ORDER.includes(k))throw new Error('stage_required'); return k;};
const persistBuild=async s=>{if(s.activeBuild)await storage.saveActiveBuild(s.activeBuild);return s;};

export function initialState(){
  return {
    screen:SCREENS.P1_SPLASH,
    profile:null,
    accountDraft:null,
    recoveryPhrase:null,
    identityDraft:null,
    selectedBodyType:null,
    activeBuild:null,
    mirrorOpen:false,
    trendRevealed:false,
    favoritesViewHidden:false,
    resetWarning:false,
    error:null
  };
}

export async function hydrate(){
  const meta=await storage.initStorage();
  if(meta.recoveryStatus==='SCHEMA_MISMATCH') return {...initialState(),screen:SCREENS.RECOVERY,error:'schema_mismatch_recovery_required'};
  const profile=await storage.loadProfile();
  const activeBuild=await storage.loadActiveBuild();
  if(activeBuild?.pendingReveal) return {...initialState(),profile,activeBuild,screen:SCREENS.P24_REVEAL};
  return {...initialState(),profile};
}

function mergeIdentityDraft(s,payload){
  s.identityDraft={...(s.identityDraft||{}),...payload};
}

export async function transition(state,event,payload={}){
  const s=copy(state);
  switch(event){
    // P1-P5 account / entry
    case 'TAP_ME':
      requireScreen(s,SCREENS.P1_SPLASH); s.screen=SCREENS.P2_DEDICATION; return s;
    case 'DEDICATION_TIMEOUT':
      requireScreen(s,SCREENS.P2_DEDICATION); s.screen=SCREENS.P3_LOGIN; return s;
    case 'SIGN_ME_UP':
      requireScreen(s,SCREENS.P3_LOGIN); s.screen=SCREENS.P4_REGISTER; return s;
    case 'I_FORGOT':
      requireScreen(s,SCREENS.P3_LOGIN); s.screen=SCREENS.P5_FORGOT_PASSWORD; return s;
    case 'BRING_ME_BACK':
      requireScreen(s,SCREENS.P4_REGISTER,SCREENS.P5_FORGOT_PASSWORD); s.screen=SCREENS.P3_LOGIN; return s;
    case 'REGISTER_SUBMIT':
      requireScreen(s,SCREENS.P4_REGISTER);
      if(!payload.username||!payload.password||payload.password!==payload.confirmPassword) throw new Error('registration_invalid');
      s.accountDraft={username:payload.username,passwordAccepted:true};
      s.recoveryPhrase=payload.recoveryPhrase||'RECOVERY PHRASE GENERATED LOCALLY';
      return s;
    case 'LOGIN_ACCEPTED':
      requireScreen(s,SCREENS.P3_LOGIN);
      if(!payload.username||!payload.password)throw new Error('credentials_required');
      s.screen=SCREENS.P6_DASHBOARD_TEASER; return s;
    case 'RECOVERY_ACCEPTED':
      requireScreen(s,SCREENS.P5_FORGOT_PASSWORD);
      if(!payload.recoveryPhrase)throw new Error('recovery_phrase_required');
      s.screen=SCREENS.P4_REGISTER; return s;

    // P6-P9 birthday compact navigation
    case 'OPEN_ENVELOPE':
      requireScreen(s,SCREENS.P6_DASHBOARD_TEASER); s.screen=SCREENS.P7_BIRTHDAY_GREETING; return s;
    case 'HEART_GREETING':
      requireScreen(s,SCREENS.P7_BIRTHDAY_GREETING); return s;
    case 'GREETING_TIMEOUT':
      requireScreen(s,SCREENS.P7_BIRTHDAY_GREETING); s.screen=SCREENS.P8_COMPACT_CLOSE; return s;
    case 'OPEN_COMPACT':
      requireScreen(s,SCREENS.P8_COMPACT_CLOSE); s.screen=SCREENS.P9_COMPACT_OPEN; return s;
    case 'FLIP_COMPACT':
      requireScreen(s,SCREENS.P8_COMPACT_CLOSE); s.screen=SCREENS.P27_COMPACT_UNDERSIDE; return s;
    case 'CLOSE_COMPACT':
      requireScreen(s,SCREENS.P9_COMPACT_OPEN); s.screen=SCREENS.P8_COMPACT_CLOSE; return s;
    case 'MIRROR_ON_THE_WALL':
      requireScreen(s,SCREENS.P9_COMPACT_OPEN); s.mirrorOpen=true; return s;
    case 'CLOSE_MIRROR':
      requireScreen(s,SCREENS.P9_COMPACT_OPEN); s.mirrorOpen=false; return s;
    case 'EXPLORE':
      requireScreen(s,SCREENS.P9_COMPACT_OPEN); s.identityDraft=null; s.screen=SCREENS.P10_CREATE_FACE; return s;
    case 'OPEN_TREND':
      requireScreen(s,SCREENS.P9_COMPACT_OPEN); s.screen=SCREENS.P25_TREND_ALERT; return s;
    case 'OPEN_FAVORITES':
      requireScreen(s,SCREENS.P9_COMPACT_OPEN); s.screen=SCREENS.P26_FAVORITES; return s;

    // P10-P15 canon creation
    case 'SET_FACE':
      requireScreen(s,SCREENS.P10_CREATE_FACE);
      if(!payload.pointer)throw new Error('face_required');
      mergeIdentityDraft(s,{facePointer:payload.pointer}); return s;
    case 'USE_THIS_PIC':
      requireScreen(s,SCREENS.P10_CREATE_FACE);
      if(!s.identityDraft?.facePointer)throw new Error('face_required');
      // CSV correction: commit identity input to onboarding state and continue.
      s.screen=SCREENS.P11_VITAL_STATISTICS; return s;
    case 'SET_VITALS':
      requireScreen(s,SCREENS.P11_VITAL_STATISTICS); mergeIdentityDraft(s,{vitals:{...payload}}); return s;
    case 'THIS_LOOKS_RIGHT':
      requireScreen(s,SCREENS.P11_VITAL_STATISTICS);
      if(!s.identityDraft?.vitals)throw new Error('vitals_required');
      // CSV correction: commit identity input to onboarding state and continue.
      s.screen=SCREENS.P12_IDENTITY_GENERATING; return s;
    case 'IDENTITY_READY':
      requireScreen(s,SCREENS.P12_IDENTITY_GENERATING);
      if(payload.profile) s.profile=payload.profile;
      s.screen=SCREENS.P13_CANON_CONFIRMATION; return s;
    case 'SPOT_ON':
      requireScreen(s,SCREENS.P13_CANON_CONFIRMATION);
      if(payload.profile){await storage.saveProfile(payload.profile);s.profile=await storage.loadProfile();}
      s.screen=SCREENS.P16_WORKSHOP; return s;
    case 'NOT_QUITE_CANON':
      requireScreen(s,SCREENS.P13_CANON_CONFIRMATION); s.screen=SCREENS.P14_DOUBLE_CONFIRM; return s;
    case 'NA_AH':
      requireScreen(s,SCREENS.P14_DOUBLE_CONFIRM); s.identityDraft=null; s.selectedBodyType=null; s.screen=SCREENS.P10_CREATE_FACE; return s;
    case 'FINE':
      requireScreen(s,SCREENS.P14_DOUBLE_CONFIRM);
      if(payload.profile){await storage.saveProfile(payload.profile);s.profile=await storage.loadProfile();}
      s.screen=SCREENS.P16_WORKSHOP; return s;
    case 'THE_BODY_THO':
      requireScreen(s,SCREENS.P14_DOUBLE_CONFIRM); s.screen=SCREENS.P15_BODY_SELF_SELECTION; return s;
    case 'SELECT_BODY':
      requireScreen(s,SCREENS.P15_BODY_SELF_SELECTION);
      if(!['BODY_1','BODY_2','BODY_3','BODY_4','BODY_5','BODY_6','BODY_7'].includes(payload.bodyId))throw new Error('invalid_body');
      s.selectedBodyType=payload.bodyId; return s;
    case 'BODY_YES_PLS':
      requireScreen(s,SCREENS.P15_BODY_SELF_SELECTION);
      if(!s.selectedBodyType)throw new Error('body_required');
      s.screen=SCREENS.P16_WORKSHOP; return s;
    case 'BODY_PICK_AGAIN':
      requireScreen(s,SCREENS.P15_BODY_SELF_SELECTION); s.selectedBodyType=null; return s;

    // P16-P18 workshop configuration
    case 'SELECT_FOCUS':
      requireScreen(s,SCREENS.P16_WORKSHOP);
      if(!DOMAINS.includes(payload.domain))throw new Error('invalid_domain');
      if(!s.activeBuild)s.activeBuild=newBuild(s.profile);
      s.activeBuild.selectedFocus=payload.domain; return persistBuild(s);
    case 'WORKSHOP_YES_PLS':
      requireScreen(s,SCREENS.P16_WORKSHOP); requireBuild(s);
      if(!s.activeBuild.selectedFocus)throw new Error('focus_required');
      s.screen=SCREENS.P17_POSE_SELECTION; return persistBuild(s);
    case 'WORKSHOP_PICK_AGAIN':
      requireScreen(s,SCREENS.P16_WORKSHOP);
      if(s.activeBuild)s.activeBuild.selectedFocus=null; return persistBuild(s);
    case 'SELECT_POSE':
      requireScreen(s,SCREENS.P17_POSE_SELECTION);
      if(!POSES.includes(payload.poseId))throw new Error('invalid_pose');
      requireBuild(s); s.activeBuild.selectedPoseId=payload.poseId; return persistBuild(s);
    case 'POSE_YES_PLS':
      requireScreen(s,SCREENS.P17_POSE_SELECTION); requireBuild(s);
      if(!s.activeBuild.selectedPoseId)throw new Error('pose_required');
      s.screen=SCREENS.P18_STUDIO_SELECTION; return persistBuild(s);
    case 'POSE_PICK_AGAIN':
      requireScreen(s,SCREENS.P17_POSE_SELECTION); requireBuild(s); s.activeBuild.selectedPoseId=null; return persistBuild(s);
    case 'SELECT_STUDIO':
      requireScreen(s,SCREENS.P18_STUDIO_SELECTION);
      if(!STUDIOS.includes(payload.studioId))throw new Error('invalid_studio');
      requireBuild(s); s.activeBuild.selectedStudioId=payload.studioId; return persistBuild(s);
    case 'STUDIO_YES_PLS':
      requireScreen(s,SCREENS.P18_STUDIO_SELECTION); requireBuild(s);
      if(!s.activeBuild.selectedStudioId)throw new Error('studio_required');
      s.activeBuild.currentStage='CLOTHES'; s.screen=SCREENS.P19_CLOTHES; return persistBuild(s);
    case 'STUDIO_PICK_AGAIN':
      requireScreen(s,SCREENS.P18_STUDIO_SELECTION); requireBuild(s); s.activeBuild.selectedStudioId=null; return persistBuild(s);

    // P19-P22 sequential compositing
    case 'SET_STAGE_SOURCE': {
      requireScreen(s,SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES);
      const k=requireStage(s);
      if(!payload.pointer)throw new Error('reference_required');
      s.activeBuild.stages[k].sourcePointer=payload.pointer;
      s.activeBuild.stages[k].skipped=false;
      return persistBuild(s);
    }
    case 'SLAP_IT': {
      requireScreen(s,SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES);
      const k=requireStage(s); const st=s.activeBuild.stages[k];
      if(!st.sourcePointer)throw new Error('reference_required');
      st.appliedPointer=payload.pointer||st.sourcePointer; st.skipped=false; return persistBuild(s);
    }
    case 'SWAP_STAGE': {
      requireScreen(s,SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES);
      const k=requireStage(s); s.activeBuild.stages[k]=newStage(); return persistBuild(s);
    }
    case 'SKIP_STAGE':
      requireScreen(s,SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES);
      return advanceStage(s,true);
    case 'DONE_HERE':
      requireScreen(s,SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES);
      s.confirmDialog=true; return s;
    case 'STAGE_NOT_QUITE':
      requireScreen(s,SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES);
      s.confirmDialog=false; return s;
    case 'STAGE_YES_PLS':
      requireScreen(s,SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES);
      s.confirmDialog=false; return advanceStage(s,false);
    case 'TOGGLE_REFERENCE':
      requireScreen(s,SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES,SCREENS.P24_REVEAL);
      requireBuild(s); s.activeBuild.comparisonEnabled=!s.activeBuild.comparisonEnabled; return persistBuild(s);

    // P23-P24 generation/reveal
    case 'CANDIDATE_READY':
      requireScreen(s,SCREENS.P23_ALBUS_GENERATING); requireBuild(s);
      if(!payload.pointer)throw new Error('candidate_required');
      s.activeBuild.candidateMediaPointer=payload.pointer;
      s.activeBuild.currentRootMediaPointer=payload.pointer;
      s.activeBuild.pendingReveal=true;
      s.screen=SCREENS.P24_REVEAL; return persistBuild(s);
    case 'FAVORITE':
      requireScreen(s,SCREENS.P24_REVEAL); return {...s,favorites:await storage.addFavorite(payload.favorite)};
    case 'REFRESH':
      requireScreen(s,SCREENS.P24_REVEAL); s.activeBuild=newBuild(s.profile); s.screen=SCREENS.P16_WORKSHOP; return persistBuild(s);

    // P25-P27
    case 'ROLL_AGAIN':
      requireScreen(s,SCREENS.P25_TREND_ALERT); s.trendRevealed=false; return s;
    case 'REVEAL_TREND':
      requireScreen(s,SCREENS.P25_TREND_ALERT); s.trendRevealed=true; return s;
    case 'THATS_INTERESTING':
      requireScreen(s,SCREENS.P25_TREND_ALERT); return s; // external-intent layer launches new tab.
    case 'TOGGLE_FAVORITES_VIEW':
      requireScreen(s,SCREENS.P26_FAVORITES); s.favoritesViewHidden=!s.favoritesViewHidden; return s;
    case 'NO_NO':
      requireScreen(s,SCREENS.P27_COMPACT_UNDERSIDE); s.resetWarning=true; return s;
    case 'RESET_GO_BACK':
      requireScreen(s,SCREENS.P27_COMPACT_UNDERSIDE); s.resetWarning=false; return s;
    case 'I_UNDERSTAND':
      requireScreen(s,SCREENS.P27_COMPACT_UNDERSIDE); await storage.nuclearReset(); return initialState();

    // Compact is a persistent router from P16 onward and on P25-P27.
    case 'COMPACT':
      requireScreen(s,
        SCREENS.P16_WORKSHOP,SCREENS.P17_POSE_SELECTION,SCREENS.P18_STUDIO_SELECTION,
        SCREENS.P19_CLOTHES,SCREENS.P20_BAGS,SCREENS.P21_SHOES,SCREENS.P22_ACCESSORIES,
        SCREENS.P24_REVEAL,SCREENS.P25_TREND_ALERT,SCREENS.P26_FAVORITES,SCREENS.P27_COMPACT_UNDERSIDE
      );
      s.screen=SCREENS.P9_COMPACT_OPEN; return s;

    default: throw new Error('unknown_event');
  }
}

async function advanceStage(s,skip){
  const k=requireStage(s);
  const st=s.activeBuild.stages[k];
  if(skip){st.skipped=true;st.sourcePointer=null;st.appliedPointer=null;}
  else if(!st.appliedPointer) throw new Error('stage_not_applied');
  const n=nextStage[k];
  if(n){
    s.activeBuild.currentStage=n;
    s.screen=stageScreen[n];
  } else {
    s.activeBuild.currentStage=null;
    s.screen=SCREENS.P23_ALBUS_GENERATING;
  }
  return persistBuild(s);
}
