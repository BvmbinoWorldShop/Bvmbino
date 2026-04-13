/**
 * render.js - High-fidelity Markdown and UI rendering for Bvmbino AI.
 */

import { state, scrollBot, toast, MODELS } from './core.js';

// Markdown Utilities
export function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function escA(s) {
  return String(s).replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/</g, '').replace(/>/g, '');
}

export function safeUrl(url) {
  try {
    const u = new URL(url);
    return ['http:', 'https:'].includes(u.protocol) ? url : '#';
  } catch { return '#'; }
}

export function inl(t) {
  return t
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, txt, url) => 
      `<a href="${safeUrl(url)}" target="_blank" rel="noopener noreferrer" style="color:var(--pu2)">${txt}</a>`);
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
      else { inCode = false; html += `<pre><code class="lang-${esc(lang)}">${esc(codeBuf.trim())}</code></pre>`; codeBuf = ''; lang = ''; continue; }
    }
    if (inCode) { codeBuf += ln + '\n'; continue; }
    if (ln.includes('|') && ln.trim().startsWith('|')) { if (!inTable) inTable = true; tableBuf.push(ln); continue; }
    else if (inTable) { html += mkTable(tableBuf); tableBuf = []; inTable = false; }
    if (/^#{1,3} /.test(ln)) { html += `<span class="bh">${inl(ln.replace(/^#{1,3} /, ''))}</span>`; continue; }
    const nm = ln.match(/^(\d+)\. (.+)/); if (nm) { html += `<div class="bn"><span class="bnn">${nm[1]}.</span><span>${inl(nm[2])}</span></div>`; continue; }
    const bm = ln.match(/^[-*•] (.+)/); if (bm) { html += `<div class="bl"><span class="bld">›</span><span>${inl(bm[1])}</span></div>`; continue; }
    if (/^---+$/.test(ln.trim())) { html += `<hr style="border:none;border-top:1px solid var(--bd);margin:10px 0">`; continue; }
    if (ln.trim() === '') { html += '<br>'; continue; }
    html += `<span>${inl(ln)}</span><br>`;
  }
  if (inTable) html += mkTable(tableBuf);
  return html;
}

// UI Rendering
export function addUserMsg(text) {
  const ci = document.getElementById('ci');
  const row = document.createElement('div');
  row.className = 'mrow user';
  row.innerHTML = `<div class="av av-us">N</div><div class="mwrap"><div class="bubble b-us">${esc(text).replace(/\n/g, '<br>')}</div><div class="macts"><div class="mact" onclick="copyT(this,'${escA(text)}')">⎘ copy</div><div class="mact" onclick="deleteMsg(this)">✕ delete</div></div></div>`;
  ci.appendChild(row);
  scrollBot();
}

export function msgActions(mid) {
  const acts = document.createElement('div');
  acts.className = 'macts';
  acts.innerHTML = `
    <div class="mact" onclick="likeMsg(this)">♡ like</div>
    <div class="mact" onclick="copyMsg('${mid}')">⎘ copy</div>
    <div class="mact" onclick="regenLast()">↻ regen</div>
    <div class="mact" onclick="deleteMsg(this)">✕ delete</div>
    <div class="mact" onclick="expMsgPdf('${mid}')">📋 PDF</div>
    <div class="mact" onclick="expMsgMd('${mid}')">📝 MD</div>
    <div class="mact" onclick="expMsgHtml('${mid}')">🌐 HTML</div>`;
  return acts;
}

export function xcard(type) {
  return `<div class="xcard"><div class="xhead"><span class="xtype">${type}</span><span class="xlabel">ready to export</span></div><div class="xbtns"><div class="xbtn" onclick="expDoc('txt','${type}')">↓ TXT</div><div class="xbtn" onclick="expDoc('md','${type}')">↓ MD</div><div class="xbtn" onclick="doPdf()">↓ PDF</div><div class="xbtn" onclick="copyLast()">⎘ Copy</div></div></div>`;
}

export function appendAiText(text, xtype) {
  const ci = document.getElementById('ci');
  const mid = 'm' + Date.now();
  state.msgStore[mid] = { text, xtype };
  const row = document.createElement('div');
  row.className = 'mrow ai';
  const wrap = document.createElement('div');
  wrap.className = 'mwrap';

  let suggestion = '';
  const l = text.toLowerCase();
  if (l.includes('sell') || l.includes('product')) suggestion = 'sales';
  else if (l.includes('post') || l.includes('content')) suggestion = 'content';
  else if (l.includes('legal')) suggestion = 'lex';
  else if (l.includes('money')) suggestion = 'budget';
  else if (l.includes('strategy')) suggestion = 'strategy';

  const suggHtml = suggestion ? `<div class="sugg-chip" onclick="slash('${suggestion}')">✨ Suggestion: /${suggestion}</div>` : '';

  wrap.innerHTML = `<div class="mmeta">Bvmbino Agent <span class="mmtag">${MODELS[state.model]}</span></div><div class="bubble b-ai">${mdHtml(text)}${xtype ? xcard(xtype) : ''} ${suggHtml}</div>`;
  wrap.appendChild(msgActions(mid));
  row.innerHTML = '<div class="av av-ai">B</div>';
  row.appendChild(wrap);
  ci.appendChild(row);
  scrollBot();
}

export function appendToolRow(id, icon, type, msg) {
  const ci = document.getElementById('ci');
  const d = document.createElement('div');
  d.id = id + '-banner';
  d.className = `tool-banner tb-${type}`;
  d.innerHTML = `<span>${icon}</span><span id="${id}-msg">${msg}</span>`;
  ci.appendChild(d);
  scrollBot();
}

export function updateToolRow(id, icon, type, msg, isErr) {
  const el = document.getElementById(id + '-msg');
  if (el) el.innerHTML = (isErr ? '⚠ ' : '') + msg;
  const banner = document.getElementById(id + '-banner');
  if (banner && isErr) banner.style.background = 'rgba(239,68,68,.06)';
}
