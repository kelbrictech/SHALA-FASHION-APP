// SHALA 1D — human-dimensional workspace rough-ins. No UI.
export const RED=Object.freeze({width:390,height:844,scrollY:true});
export const BLUE=Object.freeze({width:1170,height:844,centerX:585,panX:true,panY:true,zoom:true});
export const WORKSPACE=Object.freeze({red:RED,blue:BLUE,commonCenterline:true,runtimeWidthResponsive:true,runtimeStudioRepair:false});
export function viewportIntent({panX=0,panY=0,zoom=1}={}){if(!Number.isFinite(panX)||!Number.isFinite(panY)||!Number.isFinite(zoom)||zoom<=0)throw new Error('invalid_viewport');return {panX,panY,zoom};}
