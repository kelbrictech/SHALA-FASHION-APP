// Pure projection: never mutates framing authority.
import {RED,BLUE} from './geometry.js';
import {PAGE_NUMBER} from '../framing/state.js';

export function project(state){
  const b=state.activeBuild||null;
  const stage=b?.currentStage||null;
  const stageState=stage&&b?.stages?.[stage]?b.stages[stage]:null;
  return Object.freeze({
    screen:state.screen,
    page:PAGE_NUMBER[state.screen]||null,
    red:RED,
    blue:BLUE,
    focus:b?.selectedFocus||b?.selectedDomain||null,
    poseId:b?.selectedPoseId||null,
    studioId:b?.selectedStudioId||null,
    currentStage:stage,
    root:b?.currentRootMediaPointer||null,
    stageSource:stageState?.sourcePointer||null,
    stageApplied:stageState?.appliedPointer||null,
    candidate:b?.candidateMediaPointer||null,
    pendingReveal:Boolean(b?.pendingReveal),
    comparisonEnabled:Boolean(b?.comparisonEnabled),
    mirrorOpen:Boolean(state.mirrorOpen),
    trendRevealed:Boolean(state.trendRevealed),
    favoritesViewHidden:Boolean(state.favoritesViewHidden),
    resetWarning:Boolean(state.resetWarning),
    navigationLocked:state.screen==='P23_ALBUS_GENERATING',
    error:state.error||null
  });
}
