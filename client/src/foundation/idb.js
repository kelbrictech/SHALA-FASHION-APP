// client/src/foundation/idb.js
// Minimal promise-based IndexedDB helper for 1B (no external deps)
const DB_NAME = 'shala_v1';
const DB_VERSION = 1;
const STORE_NAME = 'kv';

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function requestToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result === undefined ? null : req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbGet(key) {
  const db = await openDb();
  try {
    const tx = db.transaction(STORE_NAME, 'readonly');
    return await requestToPromise(tx.objectStore(STORE_NAME).get(key));
  } finally {
    db.close();
  }
}

export async function idbSet(key, value) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => { db.close(); resolve(true); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('idb_transaction_failed')); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('idb_transaction_aborted')); };
  });
}

export async function idbSetMany(entries) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    for (const [key, value] of entries) store.put(value, key);
    tx.oncomplete = () => { db.close(); resolve(true); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('idb_transaction_failed')); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('idb_transaction_aborted')); };
  });
}

export async function idbDelete(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(key);
    tx.oncomplete = () => { db.close(); resolve(true); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('idb_transaction_failed')); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('idb_transaction_aborted')); };
  });
}

export async function idbClear() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).clear();
    tx.oncomplete = () => { db.close(); resolve(true); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('idb_transaction_failed')); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('idb_transaction_aborted')); };
  });
}

// Atomic authoritative reset: read + preserve + delete/write occur inside one transaction.
export async function idbNuclearReset({ metaKey, profileKey, activeBuildKey, favoritesKey }) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const metaReq = store.get(metaKey);
    const favReq = store.get(favoritesKey);

    let meta = null;
    let favorites = [];
    let metaReady = false;
    let favReady = false;

    function applyResetWhenReady() {
      if (!metaReady || !favReady) return;
      const nextMeta = {
        ...(meta && typeof meta === 'object' ? meta : {}),
        birthdayGiftOpened: Boolean(meta && meta.birthdayGiftOpened),
        lastKnownValidState: Date.now(),
        recoveryStatus: 'READY'
      };
      store.delete(profileKey);
      store.delete(activeBuildKey);
      store.put(Array.isArray(favorites) ? favorites.slice(0, 3) : [], favoritesKey);
      store.put(nextMeta, metaKey);
    }

    metaReq.onsuccess = () => {
      meta = metaReq.result || null;
      metaReady = true;
      applyResetWhenReady();
    };
    favReq.onsuccess = () => {
      favorites = favReq.result || [];
      favReady = true;
      applyResetWhenReady();
    };

    tx.oncomplete = () => { db.close(); resolve(true); };
    tx.onerror = () => { db.close(); reject(tx.error || new Error('idb_transaction_failed')); };
    tx.onabort = () => { db.close(); reject(tx.error || new Error('idb_transaction_aborted')); };
  });
}
