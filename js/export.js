/**
 * export.js — Auteur High-Fidelity Document Engine v6.1
 * Sovereign Restoration: Obsidian Gold Aesthetic
 */

import { state, toast } from './core.js';

let currentPdfFilename = 'BVMBINO_PRO_DOCUMENT.pdf';
let currentPdfOrientation = 'portrait';

/**
 * 📅 Schedule Logic (High-Performance Time Blocking)
 */
export function parseScheduleBlocks(text) {
  const result = {};
  let cur = null;
  const clean = s => s.replace(/\*\*/g, '').replace(/\*/g, '').replace(/__/g, '').trim();

  for (const rawLine of text.split('\n')) {
    const line = clean(rawLine);
    const dm = line.match(/(?:===\s*)?(MONDAY|TUESDAY|WEDNESDAY|THURSDAY|FRIDAY|SATURDAY|SUNDAY)(?:\s*===|:|\s*$)/i);
    if (dm) { cur = dm[1].toUpperCase(); if (!result[cur]) result[cur] = []; continue; }
    if (!cur) continue;

    // Primary format: HH:MM - HH:MM | Activity | ZONE
    const bm = line.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*[|–-]\s*(.+?)\s*[|–-]\s*(DEEP|ADMIN|RECOVERY)/i);
    if (bm) {
      result[cur].push({ start: bm[1], end: bm[2], activity: bm[3].trim(), zone: bm[4].toUpperCase() });
      continue;
    }

    // Fallback: HH:MM - HH:MM Activity (Auto-assign zone by hour)
    const bm2 = line.match(/(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s+(.+)/);
    if (bm2) {
      const h = parseInt(bm2[1], 10);
      const zone = h < 12 ? 'DEEP' : h < 17 ? 'ADMIN' : 'RECOVERY';
      result[cur].push({ start: bm2[1], end: bm2[2], activity: bm2[3].trim(), zone });
    }
  }
  return result;
}

export function buildScheduleHTML(blocks, view, rawText) {
  const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  const SHORT = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const ZC = { DEEP: '#d4940a', ADMIN: '#f59e0b', RECOVERY: '#22c55e' };
  const ZB = { DEEP: 'rgba(212, 148, 10, 0.05)', ADMIN: 'rgba(245, 158, 11, 0.05)', RECOVERY: 'rgba(34, 197, 94, 0.05)' };
  const ZL = { DEEP: '🔴 Deep Work', ADMIN: '🟡 Admin', RECOVERY: '🟢 Recovery' };
  
  const viewLabel = { weekly: 'Weekly', daily: 'Daily', biweekly: 'Bi-Weekly', monthly: 'Monthly' };
  let showDays = view === 'daily' ? [DAYS.find(d => blocks[d]?.length) || 'MONDAY'] : DAYS;

  let cols = '';
  showDays.forEach(day => {
    const si = DAYS.indexOf(day);
    const dayBlocks = blocks[day] || [];
    cols += `
      <div class="day-col ${si >= 5 ? 'weekend' : ''}">
        <div class="day-head">${view === 'daily' ? day : SHORT[si]}</div>
        ${dayBlocks.length ? dayBlocks.map(b => `
          <div class="block" style="background:${ZB[b.zone]}; border-left:3px solid ${ZC[b.zone]}">
            <div class="bact">${b.activity}</div>
            <div class="btime">${b.start} – ${b.end}</div>
            <div class="bzone" style="color:${ZC[b.zone]}">${ZL[b.zone]}</div>
          </div>
        `).join('') : '<div class="rest-block">Rest / Optimization</div>'}
      </div>`;
  });

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700&family=Inter:wght@400;600&display=swap" rel="stylesheet">
    <style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Inter', sans-serif; background:#0a0a0c; color:#e0e0e0; padding:40px}
      .wrap{max-width:1100px; margin:0 auto; border: 1px solid #1a1a1e; border-radius:12px; overflow:hidden}
      .hdr{background:linear-gradient(135deg,#d4940a,#9a6e08); color:black; padding:30px; text-align:center}
      .hdr h1{font-family:'Syne', sans-serif; font-size:24px; text-transform:uppercase; letter-spacing:2px}
      .grid{display:grid; grid-template-columns:repeat(${showDays.length},1fr); background:#111}
      .day-col{background:#0e0e11; border-right:1px solid #1a1a1e}
      .day-head{padding:15px; text-align:center; font-weight:700; color:#d4940a; background:#16161a; border-bottom:1px solid #1a1a1e}
      .block{margin:8px; padding:10px; border-radius:4px}
      .bact{font-size:11px; font-weight:600; line-height:1.4}
      .btime{font-size:10px; color:#999; margin-top:4px}
      .bzone{font-size:9px; font-weight:700; text-transform:uppercase; margin-top:4px}
      .rest-block{padding:30px 10px; text-align:center; color:#444; font-size:11px; font-style:italic}
    </style></head><body><div class="wrap">
      <div class="hdr"><h1>BVMBINO ${viewLabel[view] || 'Strategy'} SCHEDULE</h1></div>
      <div class="grid">${cols}</div>
    </div></body></html>`;
}

/**
 * 📋 PRO EXPORT SYSTEM
 */
export function mdToHtmlBody(text) {
  const safeText = String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return safeText
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>').replace(/$/, '</p>');
}

export function buildExportHtml(text, xtype) {
  const content = mdToHtmlBody(text);
  const title = xtype ? xtype.toUpperCase() : 'STRATEGIC REPORT';
  
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@800&family=Outfit:wght@400;600&display=swap" rel="stylesheet">
    <style>
      body { font-family: 'Outfit', sans-serif; padding: 60px; line-height: 1.7; color: #111; background: white; max-width: 800px; margin: 0 auto; }
      .header { border-bottom: 2px solid #e8a912; padding-bottom: 20px; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: flex-end; }
      .title { font-family: 'Syne', sans-serif; font-size: 24px; color: #000; letter-spacing: -0.5px; }
      .brand { color: #e8a912; font-weight: 800; font-size: 14px; letter-spacing: 2px; }
      h1, h2, h3 { font-family: 'Syne', sans-serif; color: #000; margin-top: 30px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
      h1 { font-size: 22px; color: #d4940a; }
      p { margin: 15px 0; font-size: 14px; }
      strong { color: #000; font-weight: 700; }
      code { background: #f4f4f7; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 12px; color: #d4940a; }
      .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #eee; font-size: 9px; color: #aaa; text-align: center; }
    </style></head><body>
      <div class="header">
        <div class="title">${title}</div>
        <div class="brand">BVMBINO SOVEREIGN</div>
      </div>
      <div class="content">${content}</div>
      <div class="footer">Generated by Bvmbino v6.1 Sovereign Apex · Confidential</div>
    </body></html>`;
}

export function showPdfModal(html) {
  const m = document.getElementById('preview-modal');
  const c = document.getElementById('preview-content');
  if (!m || !c) return;
  c.innerHTML = html;
  m.classList.add('show');
  m.style.display = 'flex';
}

export function closePreview() {
  const m = document.getElementById('preview-modal');
  if (m) {
    m.classList.remove('show');
    m.style.display = 'none';
  }
}

export async function saveAsPdf() {
  const el = document.getElementById('preview-content');
  if (!el) return;
  toast("Initializing Auteur PDF Engine...");
  
  const opt = {
    margin: 15,
    filename: `BVMBINO_DOC_${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, backgroundColor: '#ffffff', useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().from(el).set(opt).save();
    toast("Document Finalized ✓");
    closePreview();
  } catch (err) {
    console.error('PDF Engine Error:', err);
    toast('Export Failure');
  }
}

if (typeof window !== 'undefined') {
  window.saveAsPdf = saveAsPdf;
  window.closePreview = closePreview;
  window.showPdfModal = showPdfModal;
}
