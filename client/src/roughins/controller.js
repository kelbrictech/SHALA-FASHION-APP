// SHALA 1D — single application boundary. Persistence remains 1B/1C authority.
import {hydrate,transition} from '../framing/state.js';
import {project} from './view-model.js';
import {generate} from './generation-adapter.js';
export const REVEAL_ACTIONS=Object.freeze(['SAVE_TO_DEVICE','FAVORITE','TRY_ANOTHER']);
export async function bootstrap(){const state=await hydrate();return {state,view:project(state)};}
export async function dispatch(state,event,payload={}){try{const next=await transition(state,event,payload);return {ok:true,state:next,view:project(next)};}catch(error){return {ok:false,state,view:project(state),error:error?.message||'unknown_error'};}}
export async function generateCandidate(state){const b=state.activeBuild;if(!b) return {ok:false,error:'active_build_required',state,view:project(state)};try{let r=await dispatch(state,'BEGIN_GENERATION');if(!r.ok)return r;const result=await generate({root:b.currentRootMediaPointer,reference:b.currentReferenceMediaPointer,domain:b.selectedDomain,pose:b.selectedPoseId,studio:b.selectedStudioId});return dispatch(r.state,'CANDIDATE_READY',{pointer:result.pointer});}catch(error){return {ok:false,state,view:project(state),error:error?.message||'generation_stub_error'};}}
