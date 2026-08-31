// SHALA 1D — interface-ready catalogs; foundation enums remain authority.
import {DOMAINS,POSES,STUDIOS} from '../foundation/schema.js';
export const WORKSHOP_DOMAINS=Object.freeze([...DOMAINS]);
export const CORE_POSES=Object.freeze([...POSES]);
export const STUDIO_CATALOG=Object.freeze([
{id:'STUDIO_01',name:'Indoor Office',master:{width:1170,height:844}},
{id:'STUDIO_02',name:'Indoor Living Room',master:{width:1170,height:844}},
{id:'STUDIO_03',name:'Indoor Disco',master:{width:1170,height:844}},
{id:'STUDIO_04',name:'Outdoor Sunny Patio',master:{width:1170,height:844}},
{id:'STUDIO_05',name:'Outdoor Golden Hour',master:{width:1170,height:844}}
]);
if(STUDIO_CATALOG.some((x,i)=>x.id!==STUDIOS[i]))throw new Error('studio_catalog_authority_mismatch');
export const ACCESSORIES=Object.freeze(['HAT','GLASSES','NECKLACE']);
export function validateAccessorySelection(items){if(!Array.isArray(items)||items.length===0)return {ok:false,error:'unsupported_accessory'};if(items.length!==1)return {ok:false,error:'multiple_accessories'};return ACCESSORIES.includes(items[0])?{ok:true,value:items[0]}:{ok:false,error:'unsupported_accessory'};}
