// SHALA V1 — application boundary over CSV-authoritative framing.
import {hydrate,transition,SCREENS} from '../framing/state.js';
import {project} from './view-model.js';
import {generate} from './generation-adapter.js';

export const REVEAL_ACTIONS=Object.freeze(['SAVE_TO_DEVICE','FAVORITE','REFRESH']);

export async function bootstrap(){
  const state=await hydrate();
  return {state,view:project(state)};
}
export async function dispatch(state,event,payload={}){
  try{
    const next=await transition(state,event,payload);
    return {ok:true,state:next,view:project(next)};
  }catch(error){
    return {ok:false,state,view:project(state),error:error?.message||'unknown_error'};
  }
}
export async function generateCandidate(state){
  if(state.screen!==SCREENS.P23_ALBUS_GENERATING) return {ok:false,error:'generation_not_ready',state,view:project(state)};
  const b=state.activeBuild;
  if(!b) return {ok:false,error:'active_build_required',state,view:project(state)};
  try{
    const references=Object.fromEntries(Object.entries(b.stages||{}).map(([k,v])=>[k,v.appliedPointer||null]));
    const result=await generate({
      root:b.currentRootMediaPointer,
      reference:JSON.stringify(references),
      domain:b.selectedFocus,
      pose:b.selectedPoseId,
      studio:b.selectedStudioId
    });
    return dispatch(state,'CANDIDATE_READY',{pointer:result.pointer});
  }catch(error){
    return {ok:false,state,view:project(state),error:error?.message||'generation_stub_error'};
  }
}
