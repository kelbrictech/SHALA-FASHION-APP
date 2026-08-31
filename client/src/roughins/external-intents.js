// SHALA 1D — intents/data seams only; consumers perform browser/device actions later.
export function trendAlertData({label='',query=''}={}){return Object.freeze({label:String(label),query:String(query)});}
export function googleImagesIntent(query){return {type:'EXTERNAL',target:'NEW_TAB',provider:'GOOGLE_IMAGES',query:String(query||'')};}
export function saveToDeviceIntent(pointer){if(!pointer)throw new Error('media_pointer_required');return {type:'SAVE_TO_DEVICE',pointer};}
