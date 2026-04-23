/**
 * api.js — Sovereign AI Orchestrator v6.1
 * Restoration: Modular Build with Multi-Provider Failover
 */

import {
  state, scrollBot, LEVELS, DEFAULT_MODEL,
  resolveModelId, lock, unlock, updTok, buildSys, toast, PROMPTS
} from './core.js';
import { saveSession } from './store.js';
import {
  appendAiText, addUserMsg, appendToolRow, updateToolRow, 
  showTyping, hideTyping, msgActions, mdHtml, xcard
} from './render.js';
import { detectIntent, smartRouteMsg } from './router.js';

const PROVIDER_FALLBACK = [
  'llama-3.3-70b-versatile',
  'google/gemini-2.0-flash-exp:free',
  'deepseek/deepseek-chat-v3-0324:free'
];

export async function send() {
  const inp = document.getElementById('inp');
  if (!inp || !inp.value.trim() || state.busy) return;

  const raw = inp.value.trim();
  inp.value = '';
  if (inp.style) inp.style.height = '48px';

  lock();
  try {
    addUserMsg(raw);
    state.msgs.push({ role: 'user', content: raw });

    const intent = detectIntent(raw);
    if (intent) {
      if (intent.type === 'scrape') return await handleScrape(intent.url);
      if (intent.type === 'search') return await handleSearch(intent.query);
      if (intent.type === 'builder') return; // toggle already applied in detectIntent
      // Skill-type intents (/ads, /performance, /art, /ops, /pdf)
      const skillPrompt = PROMPTS[intent.type];
      if (skillPrompt) {
        state.msgs[state.msgs.length - 1].content = `${skillPrompt}\n\nUser request: "${raw}"`;
        state.msgs[state.msgs.length - 1].skill = intent.type;
      }
    }

    const routing = smartRouteMsg(raw);
    if (routing) {
      state.msgs[state.msgs.length - 1].content = routing.enhanced;
      state.msgs[state.msgs.length - 1].skill = routing.skill;
    }

    await callAI();
  } catch (err) {
    appendAiText(`**System Disturbance:** ${err.message}`, null);
  } finally {
    unlock();
  }
}

export async function callAI(skipLock = false) {
  if (!skipLock) showTyping();

  const sys = await buildSys();
  const startModel = resolveModelId(state.model || DEFAULT_MODEL);
  const tryOrder = [startModel, ...PROVIDER_FALLBACK.filter(m => m !== startModel)];

  for (const modelId of tryOrder) {
    try {
      const ctrl = new AbortController();
      state.abortCtrl = ctrl;

      const headers = { 'Content-Type': 'application/json' };
      const keys = ['groq', 'openai', 'anthropic', 'openrouter', 'mistral', 'cerebras', 'gemini'];
      keys.forEach(k => {
        const val = localStorage.getItem('bv_key_' + k) || localStorage.getItem('bvmbino_key_' + k);
        if (val) headers['x-key-' + k] = val;
      });

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers,
        signal: ctrl.signal,
        body: JSON.stringify({
          system: sys,
          messages: state.msgs.slice(-20),
          model: modelId,
          temperature: state.config.temp || 0.7,
          stream: state.config.stream
        })
      });

      if (!res.ok) continue;

      if (res.headers.get('content-type')?.includes('text/event-stream')) {
        const ok = await streamResponse(res, modelId);
        if (ok) return;
        continue;
      }

      const data = await res.json();
      hideTyping();
      const reply = data.content?.[0]?.text || data.reply || data.text || '';
      if (!reply.trim()) continue;

      processAiResponse(reply, data.model || modelId);
      return;
    } catch (err) {
      if (err.name === 'AbortError') { hideTyping(); return; }
      continue;
    }
  }

  hideTyping();
  appendAiText(`**Critical Failure:** All AI nodes reached high-stasis.`, null);
}

async function streamResponse(res, modelId) {
  const streamModel = res.headers.get('x-specialist') || LEVELS[modelId] || 'Specialist';
  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let full = '', buf = '';

  hideTyping();
  const ci = document.getElementById('ci');
  if (!ci) return false;

  const stId = 'st-' + Date.now();
  const row = document.createElement('div');
  row.className = 'mrow ai';
  row.innerHTML = `
    <div class="av av-ai">🤖</div>
    <div class="mwrap">
      <div class="mmeta ai-meta">Billy <span class="mmtag">${streamModel}</span></div>
      <div class="bubble b-ai" id="${stId}"></div>
    </div>`;
  ci.appendChild(row);
  const streamEl = document.getElementById(stId);
  scrollBot();
  
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split('\n');
      buf = lines.pop() || '';
      for (const line of lines) {
        const payload = line.trim().startsWith('data: ') ? line.trim().slice(6).trim() : line.trim();
        if (!payload || payload === '[DONE]') continue;
        try {
          const p = JSON.parse(payload);
          const chunk = p.choices?.[0]?.delta?.content || (p.type === 'content_block_delta' ? p.delta?.text : '') || '';
          if (chunk) {
            full += chunk;
            streamEl.textContent += chunk;
            if (full.length % 30 === 0) scrollBot();
          }
        } catch {}
      }
    }
  } catch (err) {
    if (err.name === 'AbortError' && full.trim()) {
      // Stream was cancelled mid-way — finalize what we have
    } else if (err.name === 'AbortError') {
      row.remove();
      return false;
    }
  }

  if (!full.trim()) { row.remove(); return false; }

  const processed = finalizeResponse(full);
  streamEl.innerHTML = processed.html;
  const mid = 'm' + Date.now();
  state.msgStore[mid] = { text: processed.clean, xtype: processed.xtype };
  streamEl.closest('.mwrap').appendChild(msgActions(mid));
  
  state.msgs.push({ role: 'assistant', content: processed.clean });
  saveSession(document.getElementById('tbtitle')?.textContent || 'Sovereign Chat');
  updTok(processed.clean.length / 3.5);
  
  if (state.isRecording && window.BillyLive) window.BillyLive.speak(processed.clean);
  return true;
}

function finalizeResponse(text) {
  let xtype = null;
  const m = text.match(/\[EXPORT:(\w+)\]/);
  let clean = text;
  if (m) { clean = text.replace(/\[EXPORT:\w+\]/, '').trim(); xtype = m[1]; }
  
  const lastUserMsg = state.msgs.filter(m => m.role === 'user').pop();
  const activeSkill = lastUserMsg?.skill || 'billy';
  
  const signatures = {
    'leads': 'Lilly (Lead Intelligence)', 'email': 'Sofia (Email Architect)', 'content': 'Malik (Content King)',
    'sales': 'Papou (Sales Closer)', 'strategy': 'Lukas (Empire Strategist)', 'qualify': 'Marcus (Lead Qualifier)',
    'website': 'Yuki (Web Architect)', 'analytics': 'Bjorn (Data Auditor)', 'aimas': 'AIMAS (Swarm)',
    'aros': 'AROS (Revenue OS)', 'writer': 'Sarah (Elite Copywriter)', 'budget': 'Kenzo (Financial Analyst)',
    'outreach': 'Tariq (Outreach Master)', 'proposal': 'Elena (Deal Architect)', 'ads': 'Chloe (Media Buyer)',
    'course': 'Sasha (Curriculum Pro)', 'performance': 'COACH (Performance)', 'present': 'Kael (Pitch Director)',
    'automate': 'Poupex (Automation Engine)', 'psych': 'Daphne (Psychologist)', 'art': 'Dante (Art Director)',
    'ops': 'Xandria (Career Architect)', 'security': 'Zeur (Security Auditor)', 'lex': 'Mami (Legal Advisor)'
  };
  const sigName = signatures[activeSkill] || 'Billy (Chief of Staff)';
  
  const finalHtml = mdHtml(clean) + `<div style="margin-top:12px; font-size:10px; color:var(--pu2); font-family:var(--mono); border-top:1px solid var(--bd); padding-top:8px; opacity:0.8;">⚡ Specialist Deployment: <strong>${sigName}</strong></div>`;

  return { clean, xtype, html: finalHtml + (xtype ? xcard(xtype) : '') };
}

function processAiResponse(text, modelName) {
  const processed = finalizeResponse(text);
  state.msgs.push({ role: 'assistant', content: processed.clean });
  appendAiText(processed.clean, processed.xtype);
  saveSession(document.getElementById('tbtitle')?.textContent || 'Sovereign Chat');
  updTok(processed.clean.length / 3.5);
  if (state.isRecording && window.BillyLive) window.BillyLive.speak(processed.clean);
}

async function handleScrape(url) {
  const id = 'scrape-' + Date.now();
  appendToolRow(id, '🔍', 'info', `Scraping intelligence from ${url}...`);
  try {
    const res = await fetch('/api/scrape', { method: 'POST', body: JSON.stringify({ url }) });
    const data = await res.json();
    updateToolRow(id, '✅', 'success', `Extraction Complete.`);
    state.msgs.push({ role: 'user', content: `[DATA: ${url}]\n\n${data.content}` });
    await callAI(true);
  } catch (err) { updateToolRow(id, '❌', 'error', `Failed.`); }
}

async function handleSearch(query) {
  const id = 'search-' + Date.now();
  appendToolRow(id, '🌐', 'info', `Searching Global Archive...`);
  try {
    const res = await fetch('/api/chat', { method: 'POST', body: JSON.stringify({
      messages: [{ role: 'user', content: `/search ${query}` }],
      model: 'google/gemini-2.0-flash-exp:free',
      temperature: 0.1
    })});
    const data = await res.json();
    updateToolRow(id, '✅', 'success', `Search Complete.`);
    state.msgs.push({ role: 'user', content: `[SEARCH: ${query}]\n\n${data.reply || ''}` });
    await callAI(true);
  } catch (err) { updateToolRow(id, '❌', 'error', `Aborted.`); }
}

if (typeof window !== 'undefined') {
  window.send = send;
  window.callAI = callAI;
}
