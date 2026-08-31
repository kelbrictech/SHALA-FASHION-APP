// client/src/foundation/storage.js
// High-level storage API implementing the 1B Foundation contracts
import { SCHEMA_VERSION } from './schema.js';
import * as idb from './idb.js';
import { validateProfile, validateActiveBuild, validateFavorites } from './validation.js';

const KEYS = { META:'meta', PROFILE:'profile', ACTIVE_BUILD:'activeBuild', FAVORITES:'favorites' };

function defaultMeta(birthdayGiftOpened=false) {
  return { schemaVersion:SCHEMA_VERSION, birthdayGiftOpened:Boolean(birthdayGiftOpened), lastKnownValidState:null, recoveryStatus:'READY' };
}

async function ensureMeta() {
  const meta=await idb.idbGet(KEYS.META);
  if (!meta) { const fresh=defaultMeta(false); await idb.idbSet(KEYS.META,fresh); return fresh; }
  if (typeof meta!=='object' || meta.schemaVersion!==SCHEMA_VERSION) {
    const recovery=defaultMeta(Boolean(meta && typeof meta==='object' && meta.birthdayGiftOpened));
    recovery.recoveryStatus='SCHEMA_MISMATCH';
    await idb.idbSet(KEYS.META,recovery);
    return recovery;
  }
  return meta;
}

export async function initStorage(){ return await ensureMeta(); }

async function assertNoSchemaMismatchForWrites(){
  const meta=await ensureMeta();
  if (meta?.recoveryStatus==='SCHEMA_MISMATCH') throw new Error('schema_mismatch_recovery_required');
  return meta;
}

async function touchMeta(extra={}){
  const current=await ensureMeta();
  const nextRecoveryStatus=current?.recoveryStatus==='SCHEMA_MISMATCH' ? 'SCHEMA_MISMATCH' : (extra.recoveryStatus || current?.recoveryStatus || 'READY');
  const next={...current,...extra,schemaVersion:SCHEMA_VERSION,lastKnownValidState:Date.now(),recoveryStatus:nextRecoveryStatus};
  await idb.idbSet(KEYS.META,next);
  return next;
}

export async function saveProfile(profile){
  const currentMeta=await assertNoSchemaMismatchForWrites();
  if(!validateProfile(profile)) throw new Error('invalid_profile');
  const birthdayGiftOpened='birthdayGiftOpened' in profile ? Boolean(profile.birthdayGiftOpened) : Boolean(currentMeta.birthdayGiftOpened);
  const storedProfile={...profile}; delete storedProfile.birthdayGiftOpened;
  await idb.idbSetMany([
    [KEYS.PROFILE,storedProfile],
    [KEYS.META,{...currentMeta,schemaVersion:SCHEMA_VERSION,birthdayGiftOpened,lastKnownValidState:Date.now(),recoveryStatus:'READY'}]
  ]);
}

export async function loadProfile(){
  const meta=await ensureMeta();
  if(meta.recoveryStatus==='SCHEMA_MISMATCH') return null;
  const profile=await idb.idbGet(KEYS.PROFILE);
  if(profile===null) return null;
  if(!validateProfile(profile)){ await touchMeta({recoveryStatus:'INVALID_PROFILE'}); return null; }
  return {...profile,birthdayGiftOpened:Boolean(meta.birthdayGiftOpened)};
}

export async function deleteProfile(){
  await assertNoSchemaMismatchForWrites();
  return await idb.idbDelete(KEYS.PROFILE);
}

export async function getFavorites(){
  const meta=await ensureMeta();
  const arr=await idb.idbGet(KEYS.FAVORITES);
  if(arr===null) return [];
  if(!validateFavorites(arr)){
    // During schema mismatch reads must be safe but persisted incompatible data must remain untouched.
    if(meta.recoveryStatus==='SCHEMA_MISMATCH') return [];
    await idb.idbSet(KEYS.FAVORITES,[]);
    await touchMeta({recoveryStatus:'INVALID_FAVORITES'});
    return [];
  }
  return arr;
}

export async function addFavorite(fav){
  await assertNoSchemaMismatchForWrites();
  const list=await getFavorites();
  if(list.length>=3) throw new Error('favorites_limit_exceeded');
  list.push(fav); await idb.idbSet(KEYS.FAVORITES,list); return list;
}

export async function removeFavorite(favIndex){
  await assertNoSchemaMismatchForWrites();
  const list=await getFavorites();
  if(favIndex<0 || favIndex>=list.length) throw new Error('invalid_favorite_index');
  list.splice(favIndex,1); await idb.idbSet(KEYS.FAVORITES,list); return list;
}

export async function saveActiveBuild(build){
  await assertNoSchemaMismatchForWrites();
  if(!validateActiveBuild(build)) throw new Error('invalid_active_build');
  await idb.idbSet(KEYS.ACTIVE_BUILD,build);
}

export async function loadActiveBuild(){
  const meta=await ensureMeta();
  if(meta.recoveryStatus==='SCHEMA_MISMATCH') return null;
  const build=await idb.idbGet(KEYS.ACTIVE_BUILD);
  if(build===null) return null;
  if(!validateActiveBuild(build)){ await idb.idbDelete(KEYS.ACTIVE_BUILD); await touchMeta({recoveryStatus:'INVALID_ACTIVE_BUILD'}); return null; }
  return build;
}

export async function clearActiveBuild(){
  await assertNoSchemaMismatchForWrites();
  await idb.idbDelete(KEYS.ACTIVE_BUILD);
}

export async function startAgain(){ await clearActiveBuild(); }

// Explicit sanctioned destructive recovery path. This alone may clear a schema mismatch latch.
export async function nuclearReset(){
  await ensureMeta();
  return await idb.idbNuclearReset({metaKey:KEYS.META,profileKey:KEYS.PROFILE,activeBuildKey:KEYS.ACTIVE_BUILD,favoritesKey:KEYS.FAVORITES});
}

export async function getMeta(){ return await ensureMeta(); }

// QA/test-only database reset; not an application recovery path.
export async function clearAll(){ await idb.idbClear(); }
