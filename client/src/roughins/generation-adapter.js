// SHALA 1D — deterministic local generation seam. Real AI is prohibited here.
export const GENERATION_MODE='LOCAL_STUB';
export async function generate({root,reference,domain,pose,studio}={}){if(!root)throw new Error('root_required');if(!reference)throw new Error('reference_required');return {pointer:`stub://${encodeURIComponent([root,reference,domain,pose,studio].join('|'))}`,mode:GENERATION_MODE};}
