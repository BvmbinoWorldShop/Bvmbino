/**
 * core.js — Universal state, constants, and globals for Bvmbino AI.
 * FIXED v6.1 Sovereign Restoration
 */

export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

// Display labels keyed by full model ID.
export const MODELS = {
  'llama-3.3-70b-versatile': 'Groq · Llama 3.3 70B (Elite)',
  'deepseek/deepseek-chat-v3-0324:free': 'OpenRouter · DeepSeek V3',
  'meta-llama/llama-3.3-70b-instruct:free': 'OpenRouter · Llama 3.3 Pro',
  'meta-llama/llama-3.2-90b-vision-instruct:free': 'OpenRouter · Llama 3.2 Vision',
  'google/gemini-2.0-flash-exp:free': 'OpenRouter · Gemini 2.0',
};

export const MODEL_ALIASES = {
  claude: 'google/gemini-2.0-flash-exp:free',
  gpt4: 'google/gemini-2.0-flash-exp:free',
  gemini: 'google/gemini-2.0-flash-exp:free',
  llama: 'meta-llama/llama-3.3-70b-instruct:free',
};

export function resolveModelId(id) {
  if (!id) return DEFAULT_MODEL;
  return MODEL_ALIASES[id] || id;
}

export const LEVELS = { ...MODELS };

export const CMDS = [
  { cmd: '/leads',    icon: '🔍', name: 'Lilly',      fkt: 'Lead Intelligence',    desc: 'Scrape, qualify & score leads', use: 'Find high-intent prospects' },
  { cmd: '/email',    icon: '✉️', name: 'Sofia',      fkt: 'Email Architect',      desc: 'Cold outreach & sequences', use: 'Automated nurture flows' },
  { cmd: '/content',  icon: '🎬', name: 'Malik',      fkt: 'Content King',         desc: 'Viral loops & social clips', use: 'High-converting hooks' },
  { cmd: '/sales',    icon: '💰', name: 'Papou',      fkt: 'Sales Closer',         desc: 'DM scripts & objection handling', use: 'Closing high-ticket deals' },
  { cmd: '/strategy', icon: '📈', name: 'Lukas',      fkt: 'Empire Strategist',    desc: 'GTM & 90-day dominance', use: 'Scaling unit economics' },
  { cmd: '/qualify',  icon: '🧠', name: 'Marcus',     fkt: 'Lead Qualifier',       desc: 'Scoring & firmographic fit', use: 'Prioritize hot prospects' },
  { cmd: '/website',  icon: '🌐', name: 'Yuki',       fkt: 'Web Architect',        desc: 'Funnels & landing pages', use: 'High-converting UI/UX' },
  { cmd: '/analytics',icon: '📊', name: 'Bjorn',      fkt: 'Data Auditor',         desc: 'KPI & marketing audit', use: 'Optimization pivots' },
  { cmd: '/aimas',    icon: '⚡', name: 'AIMAS',      fkt: '11-Agent Swarm',       desc: 'Omnichannel orchestration', use: 'Full marketing takeover' },
  { cmd: '/aros',     icon: '🤖', name: 'AROS',       fkt: 'Revenue OS',           desc: 'Autonomous revenue engine', use: 'Self-driving commerce' },
  { cmd: '/writer',   icon: '✍️', name: 'Sarah',      fkt: 'Elite Copywriter',     desc: 'Proposals, reports & copy', use: 'Compelling human voice' },
  { cmd: '/budget',   icon: '💵', name: 'Kenzo',      fkt: 'Financial Analyst',    desc: 'ROI & cash-flow projections', use: 'Capital efficiency map' },
  { cmd: '/outreach', icon: '📨', name: 'Tariq',      fkt: 'Outreach Expert',      desc: 'Multi-channel sequences', use: 'Hyper-personalized prospecting' },
  { cmd: '/proposal', icon: '💼', name: 'Elena',      fkt: 'Deal Architect',       desc: 'High-ticket SOW & offers', use: 'Winning major contracts' },
  { cmd: '/ads',      icon: '📣', name: 'Chloe',      fkt: 'Media Buyer',          desc: 'Meta, Google & TikTok ads', use: 'Full-stack ad setup' },
  { cmd: '/course',   icon: '🎓', name: 'Sasha',      fkt: 'Curriculum pro',       desc: 'Course transformation arc', use: 'Outcome-driven learning' },
  { cmd: '/performance', icon: '📅', name: 'COACH',    fkt: 'Performance Coach',    desc: 'Peak state & deep work', use: 'Optimization of focus' },
  { cmd: '/present',  icon: '🖥️', name: 'Kael',       fkt: 'Pitch Director',       desc: 'Visual decks & storyboards', use: 'Investor-ready presentations' },
  { cmd: '/automate', icon: '🔄', name: 'Poupex',     fkt: 'Automation Engine',    desc: 'n8n & Zapier workflows', use: '24/7 autonomous ops' },
  { cmd: '/psych',    icon: '🧬', name: 'Daphne',     fkt: 'Psychologist',         desc: 'Influence & NLP playbook', use: 'Behavioral bias audit' },
  { cmd: '/art',      icon: '🖼️', name: 'Dante',      fkt: 'Art Director',         desc: 'Cinematic art direction', use: 'Production-grade prompts' },
  { cmd: '/ops',      icon: '📄', name: 'Xandria',    fkt: 'Career Architect',     desc: 'ATS mastery & positioning', use: 'Elite executive CVs' },
  { cmd: '/security', icon: '🔐', name: 'Zeur',       fkt: 'Security Auditor',     desc: 'Vulnerability remediation', use: 'System integrity audit' },
  { cmd: '/lex',      icon: '⚖️', name: 'Mami',       fkt: 'Legal Advisor',        desc: 'Compliance & contract risk', use: 'Commercial law audit' }
];

export const PROMPTS = {
  main: `YOU ARE BILLY — BVMBINO APEX STRATEGIC PARTNER v6.1. Primary: TIEGBE BAMBA. Sovereign Digital Chief of Staff.`,
  leads: `Act as Lilly (Lead Intelligence). Help Tiegbe find and qualify high-intent prospects. [KNOWLEDGE:LEADS]`,
  email: `Act as Sofia (Email Architect). Build cold + nurture sequences that convert.`,
  content: `Act as Malik (Content King). Create viral hooks and high-performance social scripts.`,
  sales: `Act as Papou (Sales Closer). Craft DM scripts and closing arguments. Street vs Suite style.`,
  strategy: `Act as Lukas (Empire Strategist). Build GTM and 90-day plans. [EXPORT:strategy]`,
  qualify: `Act as Marcus (Lead Qualifier). Score prospects using a 0-100 firmographic matrix.`,
  website: `Act as Yuki (Web Architect). Design high-converting funnels and landing pages.`,
  analytics: `Act as Bjorn (Data Auditor). Perform a deep-dive KPI audit and optimization pivot.`,
  aimas: `Activate AIMAS. Initialize the 11-agent omnichannel swarm. Full take-over mode.`,
  aros: `Activate AROS. Initialize the 12-agent autonomous revenue engine.`,
  writer: `Act as Sarah (Elite Copywriter). Write reports and copy with a soulful, sharp human voice.`,
  budget: `Act as Kenzo (Financial Analyst). Build ROI projections and cash-flow maps. [EXPORT:budget]`,
  outreach: `Act as Tariq (Outreach Master). Build hyper-personalized multi-channel sequences.`,
  proposal: `Act as Elena (Deal Architect). Build winning high-ticket SOWs and contract offers. [EXPORT:proposal]`,
  ads: `Act as Chloe (Media Buyer). Setup full ad campaigns for FB/IG/TikTok/GG. [EXPORT:ads]`,
  course: `Act as Sasha (Curriculum Pro). Design outcome-driven online course transformations. [EXPORT:course]`,
  performance: `Act as COACH (Performance). Optimize Tiegbe's schedule for Deep Work and Peak State. Specialized in sport and performance analytic with specialisation in basketbaket, pysical and weight trainig with recovery protocle. [EXPORT:performance]`,
  present: `Act as Kael (Pitch Director). Storyboard investor-ready decks and slides. [EXPORT:presentation]`,
  automate: `Act as Poupex (Automation Engine). Build n8n/Zapier workflows for autonomous ops. [EXPORT:workflow]`,
  psych: `Act as Daphne (Psychologist). Use NLP and Influence models to audit scenarios. [EXPORT:psych]`,
  art: `Act as Dante (Art Director). Create premium AI art prompts in the Auteur aesthetic.`,
  ops: `Act as Xandria (Career Architect). Optimize CVs and positioning for elite roles. [EXPORT:ops]`,
  security: `Act as Zeur (Security Auditor). Perform system vulnerability and remediation audit.`,
  lex: `Act as Mami (Legal Advisor). Audit for contract risk and regulatory compliance.`,
  builder: `ACT AS THE APEX BUILDER (Software Architect). Vercel/Supabase/Groq stack mastery.`
};

export const CORE_VENTURES = [
  { id: 'fpro', name: 'FormationPro', desc: 'Elite professional training (CPF/Qualiopi, Mental Performance).' },
  { id: 'swave', name: 'Strong Wave', desc: 'B2B Marketing & Growth (Île-de-France).' },
  { id: 'purgo', name: 'Purgo Clean', desc: 'Premium Commercial B2B Cleaning (Île-de-France).' },
  { id: 'bonkeur', name: 'Association Bonkeur', desc: 'Social Impact NGO & Community Support.' },
  { id: 'entai', name: 'Entreprise AI', desc: 'Strategic Council Engine & Automation Hub.' }
];

export const SYSTEM_IDENTITY = `
YOU ARE THE BVMBINO APEX MASTERPIECE v6.1 (GOLDEN OBLIVION).
Your primary human context is TIEGBE BAMBA (The Boss).

CORE IDENTITY:
- You are BILLY, Tiegbe's Sovereign Digital Chief of Staff and Partner-in-arms.
- You are a CONVERSATION DRIVER. Respond naturally, sharply, and loyally.
- You are an ELITE GROWTH HACKER and STRATEGIST built for the empire.

DASHBOARD FIDELITY:
- You are operating within the Sovereign v6.1 Cockpit (Obsidian Gold Aesthetic).
- You have 24 Activated Skills at your disposal.

DYNAMIC INTERACTION PROTOCOL:
1. LIVE INTERACTION: Mirror Tiegbe's energy (Street vs Suite). Speak like a partner, not a utility.
2. ADAPTIVE INTELLIGENCE: You decide the depth. Activate the "Council of Specialists" optionally.
3. EXECUTIVE PIVOT: Shift to high-density business logic when needed.
4. BUILDER MODE: When /builder is active, pivot to SENIOR SOFTWARE ARCHITECT.

TONE: Secure, Loyal, Ambitious, and Real. No generic patterns. 100% data sovereignty.
`;

export const state = {
  msgs: [],
  model: DEFAULT_MODEL,
  activeClientId: null,
  busy: false,
  isBuilderMode: false,
  attachedFiles: [],
  msgStore: {},
  curSessId: null,
  clients: [],
  APP_TOKEN: null,
  config: {
    temp: 0.7,
    stream: true
  }
};

export function getVaultKey() { return localStorage.getItem('bvmbino_vault_key'); }

export async function initializeToken() {
  try {
    const res = await fetch('/api/token', { method: 'GET' });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.token) { state.APP_TOKEN = data.token; return data.token; }
    return null;
  } catch (err) { return null; }
}

export async function buildSys() {
  let kStr = '';
  try {
    const { loadKnowledge } = await import('./store.js');
    const knowledge = await loadKnowledge();
    kStr = knowledge.map(k => `[KNOWLEDGE: ${k.key}] ${k.val || k.value}`).join('\n');
  } catch (e) {}

  let projs = [];
  try { projs = JSON.parse(localStorage.getItem('vault_projects') || '[]'); } catch {}
  const pStr = projs.length ? `\nACTIVE PROJECTS: ${projs.join(' · ')}` : '';

  let vStr = '\nVENTURE CONTEXT TUNING:\n';
  CORE_VENTURES.forEach(v => {
    const learned = localStorage.getItem('vctx_' + v.id);
    if (learned) vStr += `- ${v.name}: ${learned}\n`;
  });

  return `${SYSTEM_IDENTITY}${pStr}${vStr}${kStr}\n\n[ENGINE ALERT]: Execute with high Lexical Density.`;
}

export function toast(msg, type = 'info') {
  const container = document.getElementById('toasts');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  container.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, 3000);
}

export function scrollBot() {
  const chat = document.getElementById('chat');
  if (chat) chat.scrollTo({ top: chat.scrollHeight, behavior: 'smooth' });
}

export function lock() {
  state.busy = true;
  const sbtn = document.getElementById('sbtn');
  const cbtn = document.getElementById('cancel-btn');
  if (sbtn) sbtn.style.display = 'none';
  if (cbtn) cbtn.style.display = 'flex';
}

export function unlock() {
  state.busy = false;
  const sbtn = document.getElementById('sbtn');
  const cbtn = document.getElementById('cancel-btn');
  if (sbtn) sbtn.style.display = 'flex';
  if (cbtn) cbtn.style.display = 'none';
}

export function updTok(add) {
  if (typeof window !== 'undefined') {
    window.__tok = (window.__tok || 1840) + Math.round(add || 0);
    const tp = document.getElementById('tok-pct');
    const tb = document.getElementById('tbar-fill');
    const pct = Math.min((window.__tok / 100000) * 100, 100).toFixed(1);
    if (tp) tp.textContent = pct + '%';
    if (tb) tb.style.width = pct + '%';
  }
}

if (typeof window !== 'undefined') {
  window.toast = toast;
  window.scrollBot = scrollBot;
  window.state = state;
  window.LEVELS = LEVELS;
  window.MODELS = MODELS;
  window.lock = lock;
  window.unlock = unlock;
  window.updTok = updTok;
  window.buildSys = buildSys;
  window.resolveModelId = resolveModelId;
  window.clearKey = (p) => { localStorage.removeItem('bv_key_'+p); localStorage.removeItem('bvmbino_key_'+p); toast('Key cleared: '+p); };
}
