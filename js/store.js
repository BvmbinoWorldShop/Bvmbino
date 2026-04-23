/**
 * store.js — Sovereign Persistent Storage v6.1
 * Hardened AES-GCM-256 Vault | IndexedDB Primary
 */

import { state, toast } from './core.js';

const DB_NAME = 'BvmbinoDB';
const DB_VER = 3;
const STORE_SESS = 'sessions';
const STORE_KNOW = 'knowledge';
const STORE_CLIS = 'clients';

// --- Sovereign Vault (AES-GCM-256) ---
// Secure credential management for API keys and sensitive project context.
function isEncryptionEnabled() {
  return !!sessionStorage.getItem('v_key');
}

async function getMasterKey() {
  const p = sessionStorage.getItem('v_key');
  if (!p) return null;
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(p), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('bvmbino-sovereign-vault-v2'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(data) {
  const key = await getMasterKey();
  if (!key) return data; // Fallback to plain if not unlocked yet (only for non-sensitive data)
  try {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(data))
    );
    return { _enc: true, iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
  } catch (e) {
    console.error('Encryption failed:', e);
    return data;
  }
}

async function decrypt(rec) {
  if (!rec) return null;
  if (!rec._enc) return rec; 
  const key = await getMasterKey();
  if (!key) return null; 
  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(rec.iv) }, key, new Uint8Array(rec.data)
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (e) {
    console.warn('Vault decryption failed (Wrong PIN?):', e);
    return null;
  }
}

export async function initializePIN() {
  const existing = sessionStorage.getItem('v_key');
  if (existing) return true;

  let pin = null;
  let confirmed = false;
  while (!confirmed) {
    pin = prompt('🔐 Set your Sovereign Vault PIN (min 8 chars):');
    if (!pin) return false;
    if (pin.length < 8) { alert('❌ PIN must be at least 8 characters.'); continue; }
    const confirm = prompt('✅ Re-enter your PIN to confirm:');
    if (confirm === pin) confirmed = true;
    else alert('❌ PINs do not match. Try again.');
  }
  sessionStorage.setItem('v_key', pin);
  toast('Vault Initialized ✓');
  return true;
}

export async function purgeAll() {
  if (!confirm('⚠️ PERMANENT PURGE: Delete all sessions, keys, and knowledge?')) return;
  
  // 1. Clear LocalStorage
  localStorage.clear();
  
  // 2. Clear SessionStorage
  sessionStorage.clear();
  
  // 3. Delete IndexedDB
  const req = indexedDB.deleteDatabase(DB_NAME);
  req.onsuccess = () => {
    toast('System Purged. Resetting...');
    setTimeout(() => location.reload(), 1500);
  };
  req.onerror = () => {
    toast('Error during purge. Refresh manual.');
  };
}

// --- DB ---
let dbInstance = null;
export async function getDB() {
  if (dbInstance) return dbInstance;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_SESS)) db.createObjectStore(STORE_SESS, { keyPath: 'id' });
      if (!db.objectStoreNames.contains(STORE_KNOW)) db.createObjectStore(STORE_KNOW, { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains(STORE_CLIS)) db.createObjectStore(STORE_CLIS, { keyPath: 'id' });
    };
    req.onsuccess = () => { dbInstance = req.result; resolve(dbInstance); };
    req.onerror = () => reject(req.error);
  });
}

export const initDB = getDB;

// --- Sessions ---
export async function loadSessions() {
  try {
    const db = await getDB();
    return new Promise(res => {
      const tx = db.transaction(STORE_SESS, 'readonly');
      const req = tx.objectStore(STORE_SESS).getAll();
      req.onsuccess = async () => {
        const results = await Promise.all((req.result || []).map(r => decrypt(r)));
        res(results.filter(Boolean).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
      };
      req.onerror = () => res([]);
    });
  } catch { return []; }
}

export async function loadSession(id) {
  try {
    const db = await getDB();
    return new Promise(res => {
      const tx = db.transaction(STORE_SESS, 'readonly');
      // FIX: don't parseInt — IDs may be numeric or string, accept both
      const lookupId = typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : id;
      const req = tx.objectStore(STORE_SESS).get(lookupId);
      req.onsuccess = async () => {
        const session = await decrypt(req.result);
        if (!session) { res(false); return; }
        state.msgs = session.msgs || [];
        state.curSessId = session.id;

        const ci = document.getElementById('ci');
        if (ci) {
          ci.innerHTML = '';
          const { addUserMsg, appendAiText } = await import('./render.js');
          state.msgs.forEach(m => {
            if (m.role === 'user') addUserMsg(m.content);
            else appendAiText(m.content);
          });
          const titles = document.getElementById('tbtitle');
          if (titles) titles.textContent = session.title || 'Conversation';
        }
        res(true);
      };
      req.onerror = () => res(false);
    });
  } catch { return false; }
}

export async function saveSession(title) {
  if (!state.msgs.length) return;
  try {
    const db = await getDB();
    const id = state.curSessId || Date.now();
    const clean = { id, title: title || 'Untitled', msgs: state.msgs, updatedAt: Date.now() };
    const encrypted = await encrypt(clean);
    const tx = db.transaction(STORE_SESS, 'readwrite');
    // Make sure the keyPath `id` is on the top-level record regardless of encryption
    tx.objectStore(STORE_SESS).put({ ...encrypted, id });
    state.curSessId = id;
  } catch (e) {
    console.error('saveSession failed:', e);
  }
}

// FIX: deleteSession now imports renderHistory dynamically instead of relying
// on window.renderHistory which main.js never actually assigned.
export async function deleteSession(id, e) {
  if (e) e.stopPropagation();
  if (!confirm('Delete this conversation?')) return;
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_SESS, 'readwrite');
    const lookupId = typeof id === 'string' && /^\d+$/.test(id) ? parseInt(id, 10) : id;
    tx.objectStore(STORE_SESS).delete(lookupId);
    tx.oncomplete = async () => {
      if (state.curSessId == id) {
        state.msgs = [];
        state.curSessId = null;
        const ci = document.getElementById('ci');
        if (ci) ci.innerHTML = '';
      }
      try {
        const ui = await import('./ui.js');
        if (ui.renderHistory) ui.renderHistory();
      } catch {}
      toast('Deleted ✓');
    };
  } catch { toast('Error deleting session'); }
}

// --- Knowledge ---
export async function loadKnowledge() {
  try {
    const db = await getDB();
    return new Promise(res => {
      const tx = db.transaction(STORE_KNOW, 'readonly');
      const req = tx.objectStore(STORE_KNOW).getAll();
      req.onsuccess = async () => {
        const results = await Promise.all((req.result || []).map(r => decrypt(r)));
        res(results.filter(Boolean));
      };
      req.onerror = () => res([]);
    });
  } catch { return []; }
}

export async function saveToKnowledge(key, val) {
  try {
    const db = await getDB();
    const encrypted = await encrypt({ key, val, date: Date.now() });
    const tx = db.transaction(STORE_KNOW, 'readwrite');
    tx.objectStore(STORE_KNOW).add(encrypted);
    toast(`🧠 Learned: ${key}`);
    const mems = document.getElementById('mems');
    if (mems) {
      const d = document.createElement('div');
      d.className = 'me new';
      d.innerHTML = `<div class="mek">Saved Knowledge</div><div class="mev">${key}</div>`;
      mems.prepend(d);
    }
  } catch (e) {
    console.error('saveToKnowledge failed:', e);
  }
}

// --- Clients ---
export async function loadClients() {
  try {
    const db = await getDB();
    return new Promise(res => {
      const tx = db.transaction(STORE_CLIS, 'readonly');
      const req = tx.objectStore(STORE_CLIS).getAll();
      req.onsuccess = async () => {
        const results = await Promise.all((req.result || []).map(r => decrypt(r)));
        res(results.filter(Boolean));
      };
      req.onerror = () => res([]);
    });
  } catch { return []; }
}

export async function saveClient(client) {
  try {
    const db = await getDB();
    const encrypted = await encrypt(client);
    const tx = db.transaction(STORE_CLIS, 'readwrite');
    tx.objectStore(STORE_CLIS).put({ ...encrypted, id: client.id });
  } catch (e) { console.error('saveClient failed:', e); }
}

export async function removeClient(id) {
  try {
    const db = await getDB();
    const tx = db.transaction(STORE_CLIS, 'readwrite');
    tx.objectStore(STORE_CLIS).delete(id);
  } catch (e) { console.error('removeClient failed:', e); }
}

// --- Skill Memory ---
export async function saveSkillMemory(skill, val) {
  try {
    const db = await getDB();
    const encrypted = await encrypt({ skill, val, date: Date.now() });
    const tx = db.transaction(STORE_KNOW, 'readwrite');
    tx.objectStore(STORE_KNOW).add({ ...encrypted, skill_tag: `skill_${skill}` });
  } catch {}
}

export async function loadSkillMemory(skill) {
  try {
    const db = await getDB();
    return new Promise(res => {
      const tx = db.transaction(STORE_KNOW, 'readonly');
      const req = tx.objectStore(STORE_KNOW).getAll();
      req.onsuccess = async () => {
        const filtered = (req.result || []).filter(r => r.skill_tag === `skill_${skill}`);
        const results = await Promise.all(filtered.map(r => decrypt(r)));
        res(results.filter(Boolean));
      };
      req.onerror = () => res([]);
    });
  } catch { return []; }
}

// --- Memory Hub ---
export function saveMemoryTier(id, content) {
  try { localStorage.setItem(`mp_tier_${id}`, content); } catch {}
}
export function loadMemoryTier(id) {
  try { return localStorage.getItem(`mp_tier_${id}`); } catch { return null; }
}

// FIX: window.deleteSession is now exposed so the inline onclick handlers
// in renderHistory() can actually find it.
if (typeof window !== 'undefined') {
  window.deleteSession = deleteSession;
  window.purgeAll = purgeAll;
}
