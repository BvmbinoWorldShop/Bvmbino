/**
 * render.js — Sovereign High-Fidelity Rendering Engine v6.1
 * Obsidian Gold Aesthetic | Auteur Framework
 */

import { state, scrollBot, LEVELS, DEFAULT_MODEL } from './core.js';

export function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

const BLOCKED_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'form', 'base', 'link', 'meta', 'style']);

export function safeRender(html) {
  if (!html) return '';
  const el = document.createElement('div');
  el.innerHTML = html;
  el.querySelectorAll('*').forEach(node => {
    if (BLOCKED_TAGS.has(node.tagName.toLowerCase())) { node.remove(); return; }
    [...node.attributes].forEach(attr => {
      const name = attr.name.toLowerCase();
      const val = attr.value.toLowerCase().replace(/\s/g, '');
      if (/^on/.test(name) || val.startsWith('javascript:') || name === 'formaction' || name === 'srcdoc') {
        node.removeAttribute(attr.name);
      }
    });
  });
  return el.innerHTML;
}

export function inl(t) {
  return String(t ?? '')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer">${txt}</a>`);
}

export function mkTable(lines) {
  const rows = lines.filter(l => !/^[\s|:-]+$/.test(l));
  if (!rows.length) return '';
  let html = '<table>';
  rows.forEach((row, i) => {
    const cells = row.split('|').filter(c => c.trim() !== '');
    const t = i === 0 ? 'th' : 'td';
    html += '<tr>' + cells.map(c => `<${t}>${inl(c.trim())}</${t}>`).join('') + '</tr>';
  });
  return html + '</table>';
}

export function mdHtml(text) {
  if (!text) return '';
  const lines = text.split('\n');
  let html = '', inCode = false, codeBuf = '', lang = '', inTable = false, tableBuf = [];
  
  for (let i = 0; i < lines.length; i++) {
    const ln = lines[i];
    if (ln.startsWith('```')) {
      if (!inCode) { inCode = true; lang = ln.slice(3).trim(); codeBuf = ''; continue; }
      else { inCode = false; html += `<pre><code>${esc(codeBuf.trim())}</code></pre>`; continue; }
    }
    if (inCode) { codeBuf += ln + '\n'; continue; }
    
    if (ln.includes('|') && ln.trim().startsWith('|')) { if (!inTable) inTable = true; tableBuf.push(ln); continue; }
    else if (inTable) { html += mkTable(tableBuf); tableBuf = []; inTable = false; }
    
    if (/^#{1,3} /.test(ln)) { html += `<div class="bh">${inl(ln.replace(/^#{1,3} /, ''))}</div>`; continue; }
    const nm = ln.match(/^(\d+)\. (.+)/);
    if (nm) { html += `<div class="bn"><span class="bnn">${nm[1]}.</span><span>${inl(nm[2])}</span></div>`; continue; }
    const bm = ln.match(/^[-*•] (.+)/);
    if (bm) { html += `<div class="bl"><span class="bld">›</span><span>${inl(bm[1])}</span></div>`; continue; }
    if (/^---+$/.test(ln.trim())) { html += `<hr style="opacity:.1;margin:15px 0">`; continue; }
    if (ln.trim() === '') { html += '<br>'; continue; }
    html += `<span>${inl(ln)}</span><br>`;
  }
  if (inTable) html += mkTable(tableBuf);
  return html;
}

export function addUserMsg(text) {
  const ci = document.getElementById('ci');
  if (!ci) return;
  const d = document.createElement('div');
  d.className = 'mrow user';
  d.innerHTML = `
    <div class="av av-us">U</div>
    <div class="mwrap">
      <div class="mmeta">TIEGBE BAMBA <span class="mmtag">· Sovereign Authority</span></div>
      <div class="bubble b-us">${safeRender(esc(text).replace(/\n/g, '<br>'))}</div>
    </div>`;
  ci.appendChild(d);
  scrollBot();
}

export function msgActions(mid) {
  const acts = document.createElement('div');
  acts.className = 'macts';
  acts.innerHTML = `
    <span class="mact" data-action="copy" data-mid="${mid}">⎘ Copy</span>
    <span class="mact" data-action="regen">↻ Regen</span>
    <span class="mact" data-action="delete">✕ Delete</span>`;
  return acts;
}

export function xcard(type) {
  return `<div class="xcard"><div class="xhead"><span class="xtype">${type}</span><span class="xlabel">Vault Asset Synthesized</span></div><button class="nbtn" data-action="export-pdf">↓ EXPORT PDF</button></div>`;
}

export function appendAiText(text, xtype) {
  const ci = document.getElementById('ci');
  if (!ci) return;
  const mid = 'm' + Date.now();
  state.msgStore[mid] = { text, xtype };
  const d = document.createElement('div');
  d.className = 'mrow';
  d.innerHTML = `
    <div class="av av-ai">B</div>
    <div class="mwrap">
      <div class="mmeta">BILLY <span class="mmtag">· Sovereign Apex</span></div>
      <div class="bubble b-ai">${safeRender(mdHtml(text))}${xtype ? xcard(xtype) : ''}</div>
    </div>`;
  d.querySelector('.mwrap').appendChild(msgActions(mid));
  ci.appendChild(d);
  scrollBot();
}

export function appendToolRow(id, icon, type, msg) {
  const ci = document.getElementById('ci');
  if (!ci) return;
  const d = document.createElement('div');
  d.id = id + '-banner';
  d.className = `tool-banner tb-${type}`;
  d.innerHTML = `<span>${icon}</span><span id="${id}-msg">${msg}</span>`;
  ci.appendChild(d);
  scrollBot();
}

export function updateToolRow(id, icon, type, msg, isErr) {
  const msgEl = document.getElementById(id + '-msg');
  if (msgEl) msgEl.textContent = (isErr ? '⚠ ' : '') + msg;
  const banner = document.getElementById(id + '-banner');
  if (banner) banner.className = `tool-banner tb-${isErr ? 'error' : type}`;
}

let typeInterval = null;
const SPECIALISTS = ['Papou', 'Malik', 'Lukas', 'Lilly', 'Sarah', 'Billy'];
const ACTIONS = ['mapping strategy', 'calculating ROI', 'blueprinting', 'auditing DNA', 'optimizing ops'];

export function showTyping() {
  const ci = document.getElementById('ci');
  if (!ci || document.getElementById('type-row')) return;
  const d = document.createElement('div');
  d.id = 'type-row';
  d.className = 'mrow';
  d.innerHTML = `
    <div class="av av-ai">B</div>
    <div class="mwrap">
      <div class="mmeta" id="type-name">Bvmbino AI Council</div>
      <div class="bubble b-ai" style="padding:10px 15px; font-style:italic; font-size:12px; opacity:0.7">
        <span id="type-text">Council is deliberating...</span>
        <div class="tots" style="margin-top:5px"><div class="tot"></div><div class="tot"></div><div class="tot"></div></div>
      </div>
    </div>`;
  ci.appendChild(d);
  scrollBot();
  let i = 0;
  typeInterval = setInterval(() => {
    const elName = document.getElementById('type-name');
    if (elName) elName.textContent = `[COUNCIL] ${SPECIALISTS[i % 6]} (${ACTIONS[i % 5]})`;
    i++;
  }, 1200);
}

export function hideTyping() {
  if (typeInterval) clearInterval(typeInterval);
  document.getElementById('type-row')?.remove();
}

if (typeof window !== 'undefined') {
  window.copyMsg = (mid) => { 
    const m = state.msgStore[mid];
    if (m) { navigator.clipboard.writeText(m.text); toast('Copied to clipboard'); }
  };
}
