/* ui.js — User Interface interactions and DOM management.
 * BVMBINO SOVEREIGN v6.1 (Sovereign Restoration)
 */

import { state, toast, scrollBot, LEVELS, DEFAULT_MODEL, CORE_VENTURES } from './core.js';
import {
  loadSessions, loadClients, saveClient, removeClient,
  saveToKnowledge, saveMemoryTier, loadMemoryTier, purgeAll
} from './store.js';
import { esc, addUserMsg, appendAiText } from './render.js';
import { callAI } from './api.js';

/* --- PORTRAIT REGISTRY --- */
const PORTRAITS = {
  'leads': 'lilly.png',
  'email': 'sofia.png',
  'content': 'malik.png',
  'sales': 'papou.png',
  'strategy': 'lukas.png',
  'qualify': 'marcus.png',
  'website': 'yuki.png',
  'analytics': 'bjorn.png',
  'aimas': 'aimas.png',
  'aros': 'aros.png',
  'writer': 'sarah.png',
  'budget': 'kenzo.png',
  'outreach': 'tariq.png',
  'proposal': 'elena.png',
  'ads': 'chloe.png',
  'course': 'sasha.png',
  'performance': 'coach.png',
  'present': 'kael.png',
  'automate': 'poupex.jpg',
  'psych': 'daphne.png',
  'art': 'dante.png',
  'ops': 'xandria.png',
  'security': 'zeur.png',
  'lex': 'mami.png'
};

/* --- SIDEBAR CONTROLS --- */
export function openSb() {
  document.getElementById('sb')?.classList.add('open');
  document.getElementById('ov')?.classList.add('open');
}

export function closeSb() {
  document.getElementById('sb')?.classList.remove('open');
  document.getElementById('ov')?.classList.remove('open');
}

export function toggleClients() {
  const p = document.getElementById('client-panel');
  const a = document.getElementById('client-arrow');
  if (!p) return;
  const isOpen = p.style.maxHeight !== '0px';
  p.style.maxHeight = isOpen ? '0px' : '400px';
  if (a) a.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
}

export function openMpanel() {
  document.getElementById('mpanel')?.classList.remove('closed');
}

export function closeMpanel() {
  document.getElementById('mpanel')?.classList.add('closed');
}

export function toggleSettings(open) {
  const s = document.getElementById('settings-modal');
  if (!s) return;
  if (open === undefined) {
    s.classList.toggle('open');
  } else {
    open ? s.classList.add('open') : s.classList.remove('open');
  }
  if (s.classList.contains('open')) renderModels();
}

export function toggleModal(id, open) {
  const m = document.getElementById(id);
  if (!m) return;
  open ? m.classList.add('open') : m.classList.remove('open');
}

/* --- RENDERERS --- */
export async function renderSkills() {
  const grid = document.getElementById('welcome-grid');
  if (!grid) return;

  const { CMDS } = await import('./core.js');

  grid.innerHTML = CMDS.map((s, i) => {
    const slug = s.cmd.slice(1);
    const portraitFile = PORTRAITS[slug];
    const confirmedAssets = ['lilly.png', 'malik.png', 'papou.png', 'lukas.png', 'yuki.png', 'sarah.png', 'chloe.png', 'coach.png', 'poupex.jpg', 'daphne.png', 'dante.png', 'zeur.png', 'mami.png'];
    const hasAsset = portraitFile && confirmedAssets.includes(portraitFile);
    const imgSrc = hasAsset ? `assets/specialists/${portraitFile}` : `https://api.dicebear.com/7.x/notionists/svg?seed=${slug}&backgroundColor=0a0800`;
    
    // Aesthetic categorization
    const catClass = i < 6 ? 'revenue' : i < 12 ? 'strategy' : i < 18 ? 'tech' : 'creative';

    return `
      <div class="wcard card-${catClass}" data-slug="${slug}">
        <div class="w-persona">
            <img src="${imgSrc}" alt="${s.name}">
        </div>
        <div class="w-info">
            <div class="wct">${s.name} <span class="wcmd">${s.cmd}</span></div>
            <div class="wcf">${s.fkt}</div>
            <div class="wcd">${s.desc}</div>
        </div>
      </div>
    `;
  }).join('');
}

export async function renderHistory() {
  const c = document.getElementById('hist');
  if (!c) return;
  const sessions = await loadSessions();
  if (!sessions.length) {
    c.innerHTML = '<div style="padding:10px; font-size:10px; font-family:var(--mono); color:var(--t4); opacity:0.5;">No history yet.</div>';
    return;
  }
  c.innerHTML = sessions.slice(0, 15).map(s => `
    <div class="hi ${state.curSessId === s.id ? 'active' : ''}" data-id="${esc(s.id)}">
      <span class="hdot"></span>
      <span class="hi-title">${esc(s.title)}</span>
      <button class="del-sess" style="background:none; border:none; color:var(--t4); cursor:pointer; padding: 2px 5px; font-size: 10px; opacity:0.5;">✕</button>
    </div>
  `).join('');
}

export async function renderClients() {
  const ctn = document.getElementById('client-list');
  if (!ctn) return;
  const clients = await loadClients();
  const allClients = [...CORE_VENTURES, ...clients];
  ctn.innerHTML = allClients.map((c) => `
    <div class="qbtn cli ${state.activeClientId === c.id ? 'active' : ''}" data-id="${esc(c.id)}">
      <span class="qi">${c.id.startsWith('c') ? '💼' : '🏢'}</span>
      <div style="display:flex; flex-direction:column; flex:1; overflow:hidden">
        <span style="font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis">${esc(c.name)}</span>
        <span class="qsub">${esc((c.desc || '').slice(0, 25))}...</span>
      </div>
      ${c.id.startsWith('c') ? `<button class="del-cli">✕</button>` : ''}
    </div>`).join('');
}

export function setActiveClient(id) {
  state.activeClientId = id === state.activeClientId ? null : id;
  renderClients();
  const client = CORE_VENTURES.concat(loadClientsCached || []).find(v => v.id === id);
  toast(state.activeClientId ? `🎯 Strategy Focus: ${client.name}` : 'Main Engine Restored');
}

let loadClientsCached = [];
async function syncClients() {
  loadClientsCached = await loadClients();
}

export async function addNewClient() {
  const name = prompt('Business/Client Name:'); if (!name) return;
  const desc = prompt('Brief Context/Description:'); if (!desc) return;
  const c = { id: 'c' + Date.now(), name, desc };
  await saveClient(c);
  await syncClients();
  renderClients();
  toast('Client Added ✓');
}

export async function deleteClient(id, e) {
  if (e) e.stopPropagation();
  if (!confirm('Remove this client context?')) return;
  await removeClient(id);
  if (state.activeClientId === id) state.activeClientId = null;
  await syncClients();
  renderClients();
  toast('Removed ✓');
}

export async function renderModels() {
  const c = document.getElementById('model-list');
  const cs = document.getElementById('model-list-settings');
  if (!c && !cs) return;

  const { MODELS } = await import('./core.js');
  const items = Object.entries(MODELS).map(([id, name]) => `
    <div class="mod-item ${state.model === id ? 'on' : ''}" data-id="${id}">
      <span style="font-weight:600">${name.split('·')[1] || name}</span>
      <span style="opacity:.5; font-size:9px">${name.split('·')[0]}</span>
      ${state.model === id ? '<div class="live-sig"></div>' : ''}
    </div>
  `).join('');

  if (c) c.innerHTML = items;
  if (cs) cs.innerHTML = items;
}

export function setModel(id) {
  state.model = id;
  const label = document.getElementById('engine-label');
  if (label) {
    const name = LEVELS[id] || id;
    label.textContent = name.includes('·') ? name.split('·')[1].trim() : name;
  }
  renderModels();
  toast(`📡 Engine: ${id.split('/')[1] || id}`);
}

export function slash(key) {
  const el = document.getElementById('inp');
  if (!el) return;
  el.value = '/' + key + ' ';
  el.focus();
  closeSb();
}

export function openTrain() {
  toggleModal('train-modal', true);
}

export function newChat() {
  state.msgs = [];
  state.curSessId = null;
  const ci = document.getElementById('ci');
  if (ci) ci.innerHTML = '';
  renderSkills();
  closeSb();
  const title = document.getElementById('tbtitle');
  if (title) title.textContent = 'Bvmbino Pro · Command Hub';
  
  // Show welcome screen if it was hidden
  const welcome = document.getElementById('welcome');
  if (welcome) welcome.style.display = 'block';
  
  toast('Workspace Reset');
}

export async function resumeSession(id) {
  const sessions = await loadSessions();
  const entry = sessions.find(s => String(s.id) === String(id));
  if (!entry) return;
  state.msgs = [...(entry.msgs || [])];
  state.curSessId = entry.id;
  const ci = document.getElementById('ci');
  if (ci) ci.innerHTML = '';
  const tb = document.getElementById('tbtitle');
  if (tb) tb.textContent = entry.title || 'Conversation';
  state.msgs.forEach(m => {
    if (m.role === 'user') addUserMsg(m.content);
    else appendAiText(m.content);
  });
  closeSb();
  toast(`📂 "${entry.title}" resumed`);
}

export function editMemoryTier(id) {
  const el = document.getElementById(`mp-${id}`);
  if (!el) return;
  if (el.contentEditable === 'true') {
    el.contentEditable = 'false';
    saveMemoryTier(id, el.innerText);
    toast(`💾 Memory Updated`);
  } else {
    el.contentEditable = 'true';
    el.focus();
  }
}

export function setupGestures() {
  let tx = 0, ty = 0;
  document.addEventListener('touchstart', e => { 
    tx = e.touches[0].clientX; 
    ty = e.touches[0].clientY; 
  }, { passive: true });
  
  document.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    const dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) < Math.abs(dy) * 1.5 || Math.abs(dx) < 44) return;
    const W = window.innerWidth;
    if (dx > 0) {
      if (tx < 60) openSb(); else closeMpanel();
    } else {
      if (tx > W - 60) openMpanel(); else closeSb();
    }
  }, { passive: true });
}

// Global UI Bridges
// Internal Global state check
if (typeof window !== 'undefined') {
  window.setActiveClient = setActiveClient;
  window.setModel = setModel;
  window.slash = slash;
}
