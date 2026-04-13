/**
 * router.js — Smart Intent Routing and Skill detection.
 * Sovereign v6.1 Restoration
 */

import { PROMPTS, state } from './core.js';

export const SKILL_ROUTER = [
  { skill: 'leads', kw: ['prospects', 'find leads', 'lead generation', 'scraping', 'find customers', 'targeting', 'potential clients', 'prospecting', 'lead intelligence', 'qualify leads', 'extraction'] },
  { skill: 'email', kw: ['write an email', 'draft an email', 'email sequence', 'cold email', 'follow-up email', 'newsletter', 'email automation', 'mail professionnel', 'outreach email', 'cold mail'] },
  { skill: 'content', kw: ['instagram', 'linkedin', 'twitter', 'tiktok', 'social media', 'reel', 'story', 'caption', 'hooks', 'viral', 'blog post', 'content creation', 'social strategy', 'viral loops'] },
  { skill: 'sales', kw: ['closing', 'sales script', 'objection', 'dm script', 'selling', 'pitch', 'conversion', 'negotiation', 'closing deals', 'sales process', 'closing arguments'] },
  { skill: 'strategy', kw: ['growth strategy', 'business plan', '90 day plan', 'market fit', 'scale', 'gtm', 'go to market', 'competitive analysis', 'strategy planning', 'dominance plan'] },
  { skill: 'qualify', kw: ['scoring', 'prioritize', 'ranking', 'qualification', 'b2b criteria', 'score leads', 'intent analysis', 'lead scoring'] },
  { skill: 'website', kw: ['landing page', 'funnel', 'web design', 'ui ux', 'website structure', 'conversion rate', 'optimizing site', 'funnel build'] },
  { skill: 'analytics', kw: ['track metrics', 'spot patterns', 'optimize campaigns', 'performance analytics', 'kpi audit', 'metrics analysis', 'roas', 'ctr', 'ltv'] },
  { skill: 'aimas', kw: ['swarm', 'multi-agent', 'orchestration', 'deploy agency', 'full council', 'aimas protocol', '11-agent'] },
  { skill: 'aros', kw: ['autonomous revenue', 'revenue os', 'automated growth', 'scaling engine', 'aros protocol', '12-agent'] },
  { skill: 'writer', kw: ['copywriter', 'ghostwriting', 'article', 'essay', 'newsletter', 'creative writing', 'human voice', 'blog topic', 'elite copy'] },
  { skill: 'budget', kw: ['roi', 'cash flow', 'finance', 'projections', 'cost analysis', 'budgeting', 'spend', 'profitability', 'financial analyst'] },
  { skill: 'outreach', kw: ['cold dm', 'outreach sequence', 'channel strategy', 'prospection', 'multi-channel', 'personalized sequence'] },
  { skill: 'proposal', kw: ['client proposal', 'sow', 'offer matrix', 'investment', 'proposal deck', 'deal structure', 'agreements'] },
  { skill: 'ads', kw: ['ads', 'meta ads', 'google ads', 'media buying', 'ad copy', 'creative matrix', 'roas', 'ad spend', 'tiktok ads'] },
  { skill: 'course', kw: ['learning', 'e-learning', 'curriculum', 'lesson', 'education', 'online course', 'modules', 'transformation arc', 'course builder'] },
  { skill: 'performance', kw: ['productivity', 'daily routine', 'time block', 'weekly plan', 'performance schedule', 'energy zones', 'deep work'] },
  { skill: 'present', kw: ['pitch deck', 'slides', 'keynote', 'powerpoint', 'visual narrative', 'storyboarding', 'presentations'] },
  { skill: 'automate', kw: ['zapier', 'make.com', 'n8n', 'workflow', 'automation', 'integration', 'process optimization', 'no-code'] },
  { skill: 'psych', kw: ['behavioral', 'nlp', 'influence', 'psychology', 'biases', 'framing', 'persuasion', 'psychological triggers'] },
  { skill: 'art', kw: ['dall-e', 'midjourney', 'stable diffusion', 'image generation', 'visual concept', 'art direction', 'image prompt'] },
  { skill: 'ops', kw: ['cv', 'resume builder', 'ats', 'career architect', 'job search', 'cover letter', 'curriculum vitae'] },
  { skill: 'security', kw: ['audit', 'hack', 'vulnerability', 'protect', 'scanner', 'cybersecurity', 'security check', 'remediation', 'vulnerabilities'] },
  { skill: 'lex', kw: ['legal', 'lawyer', 'contracts', 'compliance', 'regulatory', 'risk management', 'agreements', 'legal aid'] }
];

/**
 * Phrase-length weighted scoring: longer matched phrases beat single words.
 * Returns null if message is too short, is a slash command, or matches no skill.
 */
export function smartRouteMsg(text) {
  if (!text || text.trim().split(/\s+/).filter(Boolean).length < 2) return null;
  if (/^\s*\/\w+/.test(text)) return null; // slash commands handled by intent

  const lower = text.toLowerCase();
  let best = null, bestScore = 0;

  for (const { skill, kw } of SKILL_ROUTER) {
    let score = 0;
    for (const k of kw) {
      if (lower.includes(k)) score += k.split(' ').length;
    }
    if (score > bestScore) { bestScore = score; best = skill; }
  }

  if (!best || bestScore < 1) return null;

  const prompt = PROMPTS[best] || '';
  const enhanced = prompt
    ? `${prompt}\n\n---\nUser's request: "${text}"\nApply the skill framework above directly to this specific request. Be immediate and concrete.`
    : text;

  return { skill: best, enhanced };
}

/**
 * Slash-command intent parser. Handles explicit /commands and natural-language URLs.
 */
export function detectIntent(text) {
  const t = text.toLowerCase().trim();

  if (t === '/builder') {
    state.isBuilderMode = !state.isBuilderMode;
    document.body.classList.toggle('builder-mode', state.isBuilderMode);
    toast(state.isBuilderMode ? '🛠️ Builder Mode: Architect Protocol Active' : '🏆 Masterpiece Mode: Strategic Protocol Active');
    return { type: 'builder', active: state.isBuilderMode };
  }
  
  if (t.startsWith('/scrape ')) {
    const url = text.slice(8).trim();
    return url ? { type: 'scrape', url } : null;
  }
  if (t.startsWith('/search ')) return { type: 'search', query: text.slice(8).trim() };
  if (t.startsWith('/ads')) return { type: 'ads' };
  if (t.startsWith('/performance')) return { type: 'performance' };
  if (t.startsWith('/art')) return { type: 'art' };
  if (t.startsWith('/ops')) return { type: 'ops' };
  if (t.startsWith('/pdf')) return { type: 'pdf' };

  // Natural language URL detection
  const urlMatch = text.match(/https?:\/\/[^\s]+/);
  if (urlMatch && (t.includes('scrape') || t.includes('analyze') || t.includes('summarize') || t.includes('extract'))) {
    return { type: 'scrape', url: urlMatch[0] };
  }

  return null;
}
