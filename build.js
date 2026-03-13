const fs = require('fs');
const path = require('path');

// ── 1. assets/ directory ───────────────────────────────────────────────
if (!fs.existsSync('assets')) {
  fs.mkdirSync('assets');
}

// ── 2. Generate auth-secret.js from env var ────────────────────────────
const secret = process.env.FLOWNOTE_LOGIN_PASSWORD || 'notepad';
const authContent = `window.FLOWNOTE_LOGIN_SECRET = ${JSON.stringify(secret)};`;
fs.writeFileSync(path.join('assets', 'auth-secret.js'), authContent);
console.log('✓ Generated assets/auth-secret.js');

// ── 3. Warn if Supabase env vars are missing ───────────────────────────
const missing = [];
if (!process.env.SUPABASE_URL)      missing.push('SUPABASE_URL');
if (!process.env.SUPABASE_ANON_KEY) missing.push('SUPABASE_ANON_KEY');

if (missing.length) {
  console.warn(`⚠  Missing env vars: ${missing.join(', ')}`);
  console.warn('   Add them in Vercel → Settings → Environment Variables');
  console.warn('   The app will load but API calls will fail without them.');
} else {
  console.log('✓ Supabase env vars found — API routes are ready');
}