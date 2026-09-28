// Couche de stockage locale IndexedDB pour l'application DISAC.
// Remplace le backend Base44 : toutes les données restent sur l'appareil.

const DB_NAME = 'disac-db';
const DB_VERSION = 1;
const STORES = ['messages', 'vessels', 'settings', 'kv'];

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      for (const s of STORES) {
        if (!db.objectStoreNames.contains(s)) db.createObjectStore(s, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function uid() {
  return crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function reqProm(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function store(name, mode) {
  const db = await openDB();
  return db.transaction(name, mode).objectStore(name);
}

// Filtre type MongoDB : { champ: valeur, date: { $gte, $lte }, $or: [...] }
function matches(record, query) {
  if (!query || typeof query !== 'object') return true;
  for (const [key, cond] of Object.entries(query)) {
    if (key === '$or') {
      if (!cond.some((sub) => matches(record, sub))) return false;
      continue;
    }
    const val = record[key];
    if (cond && typeof cond === 'object' && !Array.isArray(cond)) {
      if ('$gte' in cond && !(val >= cond.$gte)) return false;
      if ('$lte' in cond && !(val <= cond.$lte)) return false;
      if ('$gt' in cond && !(val > cond.$gt)) return false;
      if ('$lt' in cond && !(val < cond.$lt)) return false;
      if ('$ne' in cond && !(val !== cond.$ne)) return false;
      if ('$in' in cond && !cond.$in.includes(val)) return false;
      if ('$exists' in cond && (cond.$exists ? val == null : val != null)) return false;
    } else if (val !== cond) {
      return false;
    }
  }
  return true;
}

function cmp(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (a < b) return -1;
  if (a > b) return 1;
  return String(a).localeCompare(String(b));
}

function applySort(records, sort) {
  if (!sort) return records;
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  const sorted = [...records].sort((x, y) => cmp(x[field], y[field]));
  return desc ? sorted.reverse() : sorted;
}

function makeCollection(name) {
  return {
    async filter(query = {}, { sort, limit = 100, cursor } = {}) {
      const s = await store(name, 'readonly');
      const all = await reqProm(s.getAll());
      let items = applySort(all.filter((r) => matches(r, query)), sort);
      const start = cursor ? Number(cursor) : 0;
      const slice = items.slice(start, start + limit);
      const next = start + limit;
      const has_more = next < items.length;
      return { items: slice, has_more, next_cursor: has_more ? String(next) : null };
    },
    async get(id) {
      const s = await store(name, 'readonly');
      return reqProm(s.get(id));
    },
    async create(data) {
      const s = await store(name, 'readwrite');
      const now = new Date().toISOString();
      const record = { id: uid(), created_date: now, updated_date: now, ...data };
      await reqProm(s.add(record));
      return record;
    },
    async bulkCreate(records) {
      const s = await store(name, 'readwrite');
      const now = new Date().toISOString();
      const out = [];
      for (const data of records) {
        const record = { id: uid(), created_date: now, updated_date: now, ...data };
        await reqProm(s.add(record));
        out.push(record);
      }
      return out;
    },
    async update(id, data) {
      const s = await store(name, 'readwrite');
      const existing = await reqProm(s.get(id));
      if (!existing) throw new Error('Enregistrement introuvable');
      const record = { ...existing, ...data, id, updated_date: new Date().toISOString() };
      await reqProm(s.put(record));
      return record;
    },
    async delete(id) {
      const s = await store(name, 'readwrite');
      await reqProm(s.delete(id));
    },
    async count(query = {}) {
      const s = await store(name, 'readonly');
      const all = await reqProm(s.getAll());
      return all.filter((r) => matches(r, query)).length;
    },
  };
}

export const db = {
  messages: makeCollection('messages'),
  vessels: makeCollection('vessels'),
  settings: makeCollection('settings'),
};

// Paramètres de l'unité : enregistrement unique.
export async function getSettings() {
  const s = await store('settings', 'readonly');
  const all = await reqProm(s.getAll());
  return all[0] || null;
}

export async function saveSettings(data) {
  const s = await store('settings', 'readwrite');
  const all = await reqProm(s.getAll());
  const existing = all[0];
  const now = new Date().toISOString();
  const record = existing
    ? { ...existing, ...data, id: existing.id, updated_date: now }
    : { id: uid(), created_date: now, updated_date: now, ...data };
  await reqProm(s.put(record));
  return record;
}

// Cachet officiel : stocké comme Blob local, exposé via une URL d'objet.
export async function setStampBlob(blob) {
  const s = await store('kv', 'readwrite');
  await reqProm(s.put({ id: 'stamp', blob }));
  return URL.createObjectURL(blob);
}

export async function getStampUrl() {
  const s = await store('kv', 'readonly');
  const rec = await reqProm(s.get('stamp'));
  return rec?.blob ? URL.createObjectURL(rec.blob) : null;
}

export async function clearStamp() {
  const s = await store('kv', 'readwrite');
  await reqProm(s.delete('stamp'));
}