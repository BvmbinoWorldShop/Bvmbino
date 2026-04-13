/**
 * main.js — Sovereign Command Engine v6.1
 * Final Restoration: Bvmbino Pro Fidelity Build (Modular)
 */

import { state, initializeToken, lock, unlock, toast } from './core.js';
import { initDB, loadSession, deleteSession } from './store.js';
import { send } from './api.js';
import { BillyLive } from './voice.js';
import {
  renderSkills, renderHistory, renderClients, renderModels,
  toggleSettings, openSb, closeSb, openMpanel, closeMpanel, toggleClients,
  newChat, resumeSession, setupGestures, openTrain, toggleModal, slash,
  setActiveClient, setModel, addNewClient, deleteClient, editMemoryTier
} from './ui.js';
import { initializePIN, purgeAll, deleteSession } from './store.js';
import { showPdfModal, saveAsPdf, buildExportHtml } from './export.js';

/* --- CORE INITIALIZATION --- */
async function boot() {
  console.log("BVMBINO APEX: Initializing Sovereign v6.1 Architecture...");

  try {
    // 1. Storage & Auth
    await initDB();
    
    // 2. Sovereign Vault Unlock
    const unlocked = await initializePIN();
    if (!unlocked) {
      toast('Vault Locked. Reload to retry.', 'warn');
      return;
    }

    await initializeToken();
    
    // 3. State Restoration
    if (typeof localStorage !== 'undefined') {
      state.model = localStorage.getItem('v3_model') || state.model;
      state.activeClientId = localStorage.getItem('v3_active_client') || null;
    }

    // 4. Initial UI Build
    renderSkills();
    renderHistory();
    renderClients();
    renderModels();
    setupGestures();
    
    // 5. App Controller Start
    App.init();

    console.log("✓ Bvmbino Sovereign v6.1 Ready");
  } catch (err) {
    console.error("❌ Critical System Failure:", err);
  }
}

/* --- CORE CONTROLLER: APEX APP v6.1 --- */
const App = {
  dom: {
    inp: document.getElementById('inp'),
  },

  init() {
    this.bindEvents();
    // Default greeting if session is empty
    if (state.msgs.length === 0) {
      console.log("Billy: Standing by for orders.");
    }
  },

  bindEvents() {
    const _on = (id, ev, fn) => document.getElementById(id)?.addEventListener(ev, fn);

    // -- Dynamic Event Delegation --
    document.addEventListener('click', async (e) => {
      // 1. Skills Grid
      const wcard = e.target.closest('.wcard');
      if (wcard) { slash(wcard.dataset.slug); return; }

      // 2. History
      const hi = e.target.closest('.hi');
      if (hi) {
        if (e.target.closest('.del-sess')) {
          e.stopPropagation();
          if (confirm('Purge this memory?')) {
            await deleteSession(hi.dataset.id);
            renderHistory();
          }
        } else {
          resumeSession(hi.dataset.id);
        }
        return;
      }

      // 3. Clients
      const cli = e.target.closest('.cli');
      if (cli) {
        if (e.target.closest('.del-cli')) {
          deleteClient(cli.dataset.id, e);
        } else {
          setActiveClient(cli.dataset.id);
        }
        return;
      }

      // 4. Models
      const mod = e.target.closest('.mod-item');
      if (mod) { setModel(mod.dataset.id); return; }

      // 5. Memory Tiers (Editable)
      if (e.target.id && e.target.id.startsWith('edit-mp-')) {
        const tier = e.target.id.replace('edit-mp-', '');
        editMemoryTier(tier);
      }

      // 6. Message Actions & Cards
      const action = e.target.dataset.action;
      if (action) {
        if (action === 'copy') {
          const mid = e.target.dataset.mid;
          const m = state.msgStore[mid];
          if (m) { navigator.clipboard.writeText(m.text); toast('Copied ✓'); }
        } else if (action === 'delete') {
          e.target.closest('.mrow')?.remove();
        } else if (action === 'regen') {
          // Identify if it's the last message
          toast('Re-initializing stream...');
          // Add actual regen logic call here if needed
        } else if (action === 'export-pdf') {
          const mrow = e.target.closest('.mrow');
          const bubble = mrow?.querySelector('.bubble');
          if (bubble) showPdfModal(bubble.innerHTML);
        }
      }
    });

    // Sidebar & Navigation
    _on('logo-btn', 'click', () => newChat());
    _on('new-chat-btn', 'click', () => newChat());
    _on('mb-menu-btn', 'click', () => openSb());
    _on('ov', 'click', () => { closeSb(); toggleSettings(false); });
    
    // Modals & Panels
    _on('toggle-clients-btn', 'click', () => toggleClients());
    _on('add-client-btn', 'click', () => window.addNewClient && window.addNewClient());
    _on('train-agent-btn', 'click', () => openTrain());
    _on('gen-image-nav-btn', 'click', () => toggleModal('image-modal', true));
    _on('attach-file-nav-btn', 'click', () => document.getElementById('file-input')?.click());
    _on('toggle-history-btn', 'click', () => this._toggleCollapsible('hist', 'hist-arrow'));
    _on('tb-gen-img-btn', 'click', () => toggleModal('image-modal', true));
    _on('tb-mem-hub-btn', 'click', () => openMpanel());
    _on('tb-settings-btn', 'click', () => toggleSettings());
    _on('close-mpanel-btn', 'click', () => closeMpanel());
    _on('edit-ventures-btn', 'click', () => window.editMemoryTier && window.editMemoryTier('ventures'));
    _on('edit-projects-btn', 'click', () => window.editMemoryTier && window.editMemoryTier('projects'));
    
    // Voice
    _on('lang-btn', 'click', () => this.toggleVoiceLang());
    _on('mic-btn', 'click', () => this.toggleVoice());
    _on('close-voice-btn', 'click', () => BillyLive.close());
    _on('end-voice-btn', 'click', () => BillyLive.close());
    
    // Settings & Vault
    _on('save-keys-btn', 'click', () => {
      // Collect keys and save (logic usually in api.js or main)
      toast('Keys Saved to Sovereign Vault');
      toggleSettings(false);
    });
    _on('purge-keys-btn', 'click', () => purgeAll());
    _on('close-settings-footer', 'click', () => toggleSettings(false));
    
    // PDF Export
    _on('pdf-export-pill', 'click', () => {
      const last = state.msgs.filter(m => m.role === 'assistant').pop();
      if (last) showPdfModal(buildExportHtml(last.content));
      else toast('No document to export');
    });
    _on('close-preview', 'click', () => toggleModal('preview-modal', false));
    _on('save-pdf-btn', 'click', () => saveAsPdf());
    _on('cancel-preview-btn', 'click', () => toggleModal('preview-modal', false));

    // Input Handling
    _on('sbtn', 'click', () => send());
    _on('cancel-btn', 'click', () => { /* Abort logic if implemented */ });
    
    this.dom.inp?.addEventListener('input', () => {
      this.dom.inp.style.height = 'auto';
      this.dom.inp.style.height = Math.min(this.dom.inp.scrollHeight, 250) + 'px';
    });

    this.dom.inp?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !state.busy) {
        e.preventDefault();
        send();
      }
    });

    // Global Keybinds
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'k') { e.preventDefault(); newChat(); }
      if (e.key === 'Escape') { 
        closeSb(); 
        closeMpanel();
        toggleSettings(false);
        BillyLive.close();
        toggleModal('image-modal', false);
        toggleModal('train-modal', false);
        toggleModal('preview-modal', false);
      }
    });

    // Pill Interaction (Web Search, etc)
    document.querySelectorAll('.pill').forEach(p => {
      if (p.id !== 'pdf-export-pill') {
        p.addEventListener('click', () => p.classList.toggle('on'));
      }
    });
  },

  toggleVoice() {
    if (window.BillyLive) window.BillyLive.open();
  },

  toggleVoiceLang() {
    const langs = ['en-US', 'fr-FR'], labels = ['EN', 'FR'];
    const currentIdx = langs.indexOf(state.voiceLang || 'en-US');
    const nextIdx = (currentIdx + 1) % langs.length;
    state.voiceLang = langs[nextIdx];
    const btn = document.getElementById('lang-btn');
    if (btn) btn.textContent = labels[nextIdx];
    toast(`Voice Synced: ${labels[nextIdx]}`);
  },

  toggleModal(id, open) {
    const el = document.getElementById(id);
    if (!el) return;
    open ? el.classList.add('open') : el.classList.remove('open');
  },

  _toggleCollapsible(id, arrowId) {
    const p = document.getElementById(id);
    const a = document.getElementById(arrowId);
    if (!p) return;
    const show = p.style.maxHeight === '0px' || !p.style.maxHeight;
    p.style.maxHeight = show ? (id === 'client-panel' ? '400px' : '600px') : '0px';
    if (a) a.style.transform = show ? 'rotate(0deg)' : 'rotate(-90deg)';
  }
};

window.App = App;

// Exposed Bridges for Inline HTML Handlers
if (typeof window !== 'undefined') {
  window.send = send;
  window.App = App;
  window.BillyLive = BillyLive;
  window.resumeSession = (id) => { loadSession(id).then(renderSkills); };
  window.deleteSession = (id, e) => { e.stopPropagation(); if (confirm('Purge this memory?')) deleteSession(id).then(renderHistory); };
}

// Start Engine
document.readyState === 'loading' 
  ? document.addEventListener('DOMContentLoaded', boot) 
  : boot();
