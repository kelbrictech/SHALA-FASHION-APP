// client/src/foundation/storage.js
// High-level storage API implementing the 1B Foundation contracts
import { SCHEMA_VERSION } from './schema.js';
import * as idb from './idb.js';

const KEYS = {
  META: 'meta',
  PROFILE: 'profile',
  ACTIVE_BUILD: 'activeBuild',
  FAVORITES: 'favorites'
};

async function ensureMeta() {
  const meta = await idb.idbGet(KEYS.META);
  if (!meta) {
    await idb.idbSet(KEYS.META, { schemaVersion: SCHEMA_VERSION, lastKnownValidState: null });
  }
}

export async function initStorage() {
  await ensureMeta();
}

// Profile
export async function saveProfile(profile) {
  // minimal validation placeholder (validation module handles deeper checks)
  await idb.idbSet(KEYS.PROFILE, profile);
  const meta = await idb.idbGet(KEYS.META) || {};
  meta.lastKnownValidState = Date.now();
  await idb.idbSet(KEYS.META, meta);
}

export async function loadProfile() {
  return await idb.idbGet(KEYS.PROFILE);
}

export async function deleteProfile() {
  return await idb.idbDelete(KEYS.PROFILE);
}

// Favorites — capped at 3
export async function getFavorites() {
  const arr = await idb.idbGet(KEYS.FAVORITES);
  return Array.isArray(arr) ? arr : [];
}

export async function addFavorite(fav) {
  const list = await getFavorites();
  if (list.length >= 3) throw new Error('favorites_limit_exceeded');
  list.push(fav);
  await idb.idbSet(KEYS.FAVORITES, list);
  return list;
}

export async function removeFavorite(favIndex) {
  const list = await getFavorites();
  if (favIndex < 0 || favIndex >= list.length) throw new Error('invalid_favorite_index');
  list.splice(favIndex, 1);
  await idb.idbSet(KEYS.FAVORITES, list);
  return list;
}

// Active build
export async function saveActiveBuild(build) {
  await idb.idbSet(KEYS.ACTIVE_BUILD, build);
}

export async function loadActiveBuild() {
  return await idb.idbGet(KEYS.ACTIVE_BUILD);
}

export async function clearActiveBuild() {
  await idb.idbDelete(KEYS.ACTIVE_BUILD);
}

// Reset semantics
// START AGAIN: clear active build but preserve profile, favorites, birthday flag
export async function startAgain() {
  await clearActiveBuild();
}

// NUCLEAR RESET: destroy profile/identity/active-build but preserve Favorites and birthday flag
export async function nuclearReset() {
  const favorites = await getFavorites();
  // preserve birthday flag if present in profile
  const profile = await loadProfile();
  const birthdayGiftOpened = profile && profile.birthdayGiftOpened ? true : false;
  // wipe profile and active build
  await idb.idbDelete(KEYS.PROFILE);
  await idb.idbDelete(KEYS.ACTIVE_BUILD);
  // restore favorites and birthday flag in meta if needed
  await idb.idbSet(KEYS.FAVORITES, favorites);
  const meta = await idb.idbGet(KEYS.META) || {};
  meta.birthdayGiftOpened = birthdayGiftOpened;
  await idb.idbSet(KEYS.META, meta);
}

export async function getMeta() {
  return await idb.idbGet(KEYS.META);
}

export async function clearAll() {
  await idb.idbClear();
}
