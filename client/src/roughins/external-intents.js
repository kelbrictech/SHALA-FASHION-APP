// SHALA 1D — intents only; consumers perform browser/device actions later.
export function googleImagesIntent(query){return {type:'EXTERNAL',target:'NEW_TAB',provider:'GOOGLE_IMAGES',query:String(query||'')};}
export function saveToDeviceIntent(pointer){if(!pointer)throw new Error('media_pointer_required');return {type:'SAVE_TO_DEVICE',pointer};}
