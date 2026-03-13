// api/notes.js — Vercel Serverless Function
// Handles: GET /api/notes  POST /api/notes
//          PATCH /api/notes/:id  DELETE /api/notes/:id

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY;
const TABLE         = 'notes';

function supabaseHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = req.url.split('?')[0].split('/').filter(Boolean);
  const id = parts[2] ?? null;

  try {
    // ── GET /api/notes ───────────────────────────────────────────────
    if (req.method === 'GET' && !id) {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}?archived=eq.false&order=pinned.desc,updated_at.desc`,
        { headers: supabaseHeaders() }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data);
    }

    // ── POST /api/notes ──────────────────────────────────────────────
    if (req.method === 'POST' && !id) {
      const body = req.body;
      // Auto-set updated_at on create
      body.updated_at = new Date().toISOString();
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}`,
        {
          method: 'POST',
          headers: { ...supabaseHeaders(), 'Prefer': 'return=representation' },
          body: JSON.stringify(body),
        }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(201).json(Array.isArray(data) ? data[0] : data);
    }

    // ── PATCH /api/notes/:id ─────────────────────────────────────────
    if (req.method === 'PATCH' && id) {
      const body = req.body;
      // Always bump updated_at on edit
      body.updated_at = new Date().toISOString();
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${id}`,
        {
          method: 'PATCH',
          headers: { ...supabaseHeaders(), 'Prefer': 'return=representation' },
          body: JSON.stringify(body),
        }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(Array.isArray(data) ? data[0] : data);
    }

    // ── DELETE /api/notes/:id ────────────────────────────────────────
    if (req.method === 'DELETE' && id) {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${id}`,
        {
          method: 'DELETE',
          headers: supabaseHeaders(),
        }
      );
      if (!r.ok) {
        const data = await r.json();
        return res.status(r.status).json(data);
      }
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/notes]', err);
    return res.status(500).json({ error: err.message });
  }
}
