// client/src/foundation/storage.js
// High-level storage API implementing the 1B Foundation contracts
import { SCHEMA_VERSION } from './schema.js';
import * as idb from './idb.js';
import { validateProfile, validateActiveBuild, validateFavorites } from './validation.js';

const KEYS = {
  META: 'meta',
  PROFILE: 'profile',
  ACTIVE_BUILD: 'activeBuild',
  FAVORITES: 'favorites'
};

function defaultMeta(birthdayGiftOpened = false) {
  return {
    schemaVersion: SCHEMA_VERSION,
    birthdayGiftOpened: Boolean(birthdayGiftOpened),
    lastKnownValidState: null,
    recoveryStatus: 'READY'
  };
}

async function ensureMeta() {
  const meta = await idb.idbGet(KEYS.META);
  if (!meta) {
    const fresh = defaultMeta(false);
    await idb.idbSet(KEYS.META, fresh);
    return fresh;
  }
  if (typeof meta !== 'object' || meta.schemaVersion !== SCHEMA_VERSION) {
    const preservedBirthday = Boolean(meta && typeof meta === 'object' && meta.birthdayGiftOpened);
    const recovery = defaultMeta(preservedBirthday);
    recovery.recoveryStatus = 'SCHEMA_MISMATCH';
    // Fail closed without silently deleting incompatible records.
    await idb.idbSet(KEYS.META, recovery);
    return recovery;
  }
  return meta;
}

export async function initStorage() {
  return await ensureMeta();
}

async function touchMeta(extra = {}) {
  const current = await ensureMeta();
  // Preserve SCHEMA_MISMATCH unless explicitly cleared via a sanctioned operation.
  const nextRecoveryStatus = (current && current.recoveryStatus === 'SCHEMA_MISMATCH' && extra.recoveryStatus !== 'CLEAR_SCHEMA_MISMATCH')
    ? 'SCHEMA_MISMATCH'
    : (extra.recoveryStatus || 'READY');

  const next = {
    ...current,
    ...extra,
    schemaVersion: SCHEMA_VERSION,
    lastKnownValidState: Date.now(),
    recoveryStatus: nextRecoveryStatus
  };
  await idb.idbSet(KEYS.META, next);
  return next;
}

// Write-gate: ensure no SCHEMA_MISMATCH before performing authoritative writes.
async function assertNoSchemaMismatchForWrites() {
  const meta = await ensureMeta();
  if (meta && meta.recoveryStatus === 'SCHEMA_MISMATCH') {
    throw new Error('schema_mismatch_recovery_required');
  }
}

// Profile. Birthday Gift Opened Flag authority is META; profile receives a read mirror only.
export async function saveProfile(profile) {
  // gate writes if schema mismatch present
  await assertNoSchemaMismatchForWrites();

  if (!validateProfile(profile)) throw new Error('invalid_profile');
  const currentMeta = await ensureMeta();
  // double-check after ensureMeta; if mismatch latched by external actor, fail closed
  if (currentMeta && currentMeta.recoveryStatus === 'SCHEMA_MISMATCH') throw new Error('schema_mismatch_recovery_required');

  const birthdayGiftOpened = 'birthdayGiftOpened' in profile
    ? Boolean(profile.birthdayGiftOpened)
    : Boolean(currentMeta.birthdayGiftOpened);
  const storedProfile = { ...profile };
  delete storedProfile.birthdayGiftOpened;
  await idb.idbSetMany([
    [KEYS.PROFILE, storedProfile],
    [KEYS.META, { ...currentMeta, schemaVersion: SCHEMA_VERSION, birthdayGiftOpened, lastKnownValidState: Date.now(), recoveryStatus: 'READY' }]
  ]);
}

export async function loadProfile() {
  const meta = await ensureMeta();
  if (meta.recoveryStatus === 'SCHEMA_MISMATCH') return null;
  const profile = await idb.idbGet(KEYS.PROFILE);
  if (profile === null) return null;
  if (!validateProfile(profile)) {
    await touchMeta({ recoveryStatus: 'INVALID_PROFILE' });
    return null;
  }
  return { ...profile, birthdayGiftOpened: Boolean(meta.birthdayGiftOpened) };
}

export async function deleteProfile() {
  return await idb.idbDelete(KEYS.PROFILE);
}

// Favorites — capped at 3. Malformed persisted favorites recover deterministically to [].
export async function getFavorites() {
  const arr = await idb.idbGet(KEYS.FAVORITES);
  if (arr === null) return [];
  if (!validateFavorites(arr)) {
    await idb.idbSet(KEYS.FAVORITES, []);
    await touchMeta({ recoveryStatus: 'INVALID_FAVORITES' });
    return [];
  }
  return arr;
}

export async function addFavorite(fav) {
  await assertNoSchemaMismatchForWrites();
  const list = await getFavorites();
  if (list.length >= 3) throw new Error('favorites_limit_exceeded');
  list.push(fav);
  await idb.idbSet(KEYS.FAVORITES, list);
  return list;
}

export async function removeFavorite(favIndex) {
  await assertNoSchemaMismatchForWrites();
  const list = await getFavorites();
  if (favIndex < 0 || favIndex >= list.length) throw new Error('invalid_favorite_index');
  list.splice(favIndex, 1);
  await idb.idbSet(KEYS.FAVORITES, list);
  return list;
}

// Active build. Storage protects the three distinct transformation authorities.
export async function saveActiveBuild(build) {
  await assertNoSchemaMismatchForWrites();
  if (!validateActiveBuild(build)) throw new Error('invalid_active_build');
  const currentMeta = await ensureMeta();
  if (currentMeta && currentMeta.recoveryStatus === 'SCHEMA_MISMATCH') throw new Error('schema_mismatch_recovery_required');
  await idb.idbSet(KEYS.ACTIVE_BUILD, build);
}

export async function loadActiveBuild() {
  const meta = await ensureMeta();
  if (meta.recoveryStatus === 'SCHEMA_MISMATCH') return null;
  const build = await idb.idbGet(KEYS.ACTIVE_BUILD);
  if (build === null) return null;
  if (!validateActiveBuild(build)) {
    await idb.idbDelete(KEYS.ACTIVE_BUILD);
    await touchMeta({ recoveryStatus: 'INVALID_ACTIVE_BUILD' });
    return null;
  }
  return build;
}

export async function clearActiveBuild() {
  await idb.idbDelete(KEYS.ACTIVE_BUILD);
}

// START AGAIN: clear active build; preserve profile, Canon/profile identity, Favorites and birthday flag.
export async function startAgain() {
  await clearActiveBuild();
}

// NUCLEAR RESET: atomically destroy profile/identity/active build; preserve Favorites + birthday flag.
export async function nuclearReset() {
  await ensureMeta();
  return await idb.idbNuclearReset({
    metaKey: KEYS.META,
    profileKey: KEYS.PROFILE,
    activeBuildKey: KEYS.ACTIVE_BUILD,
    favoritesKey: KEYS.FAVORITES
  });
}

export async function getMeta() {
  return await ensureMeta();
}

export async function clearAll() {
  await idb.idbClear();
}
