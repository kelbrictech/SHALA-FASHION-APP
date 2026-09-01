export const PRESENTATION_TYPES=Object.freeze(['PAGE','STATE','OVERLAY-PROMPT','EXTERNAL','SYSTEM']);
export function presentation(type,id){if(!PRESENTATION_TYPES.includes(type))throw new Error('invalid_presentation_type');return {type,id,pageCount:type==='PAGE'?1:0};}
