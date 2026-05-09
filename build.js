/**
 * Bvmbino Pro — Obfuscated Build
 * Extracts all <script> blocks from index.html, obfuscates them,
 * and writes dist/index.html with the protected code.
 *
 * Run:  npm run build
 * Output: dist/index.html  (deploy this to production)
 */

const fs   = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const SRC  = path.join(__dirname, 'index.html');
const DIST = path.join(__dirname, 'dist');
const OUT  = path.join(DIST, 'index.html');

if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

// Copy all assets (images, manifest, sw, css, js folder)
const ASSETS = ['assets', 'manifest.json', 'sw.js', 'index.css', 'js'];
ASSETS.forEach(item => {
  const src = path.join(__dirname, item);
  if (!fs.existsSync(src)) return;
  const dst = path.join(DIST, item);
  copyRecursive(src, dst);
});

let html = fs.readFileSync(SRC, 'utf8');

// Extract and obfuscate all inline <script> blocks (not src=... tags)
let scriptIndex = 0;
html = html.replace(/<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi, (match, code) => {
  if (code.trim().length < 50) return match; // skip tiny stubs
  scriptIndex++;
  console.log(`  Obfuscating inline script #${scriptIndex} (${code.length} chars)…`);
  try {
    const result = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: false,       // keep it fast on mobile
      deadCodeInjection: false,
      debugProtection: true,              // breaks devtools pause
      debugProtectionInterval: 2000,      // re-triggers every 2s
      disableConsoleOutput: true,         // silences console.log in prod
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      renameGlobals: false,               // don't rename window/document refs
      selfDefending: true,                // code resists reformatting
      stringArray: true,
      stringArrayCallsTransform: true,
      stringArrayEncoding: ['base64'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 2,
      stringArrayWrappersChainedCalls: true,
      unicodeEscapeSequence: false,       // avoid bloat on mobile
    });
    return `<script>${result.getObfuscatedCode()}</script>`;
  } catch (err) {
    console.warn(`  ⚠ Script #${scriptIndex} failed to obfuscate, keeping original:`, err.message);
    return match;
  }
});

fs.writeFileSync(OUT, html, 'utf8');

const srcSize  = fs.statSync(SRC).size;
const distSize = fs.statSync(OUT).size;
console.log(`\n✅ Build complete → dist/index.html`);
console.log(`   Source : ${(srcSize  / 1024).toFixed(1)} KB`);
console.log(`   Output : ${(distSize / 1024).toFixed(1)} KB`);
console.log(`   Deploy the dist/ folder to Vercel/GitHub Pages.\n`);

// ── helpers ──────────────────────────────────────────────────────────────────
function copyRecursive(src, dst) {
  if (fs.statSync(src).isDirectory()) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    fs.readdirSync(src).forEach(f => copyRecursive(path.join(src, f), path.join(dst, f)));
  } else {
    fs.copyFileSync(src, dst);
  }
}
