// api/areas.js — Vercel Serverless Function
// Handles: GET /api/areas  POST /api/areas

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY;
const TABLE         = 'areas';

function supabaseHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // ── GET /api/areas ───────────────────────────────────────────────
    if (req.method === 'GET') {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}?order=id.asc`,
        { headers: supabaseHeaders() }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data);
    }

    // ── POST /api/areas ──────────────────────────────────────────────
    if (req.method === 'POST') {
      const body = req.body;
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

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/areas]', err);
    return res.status(500).json({ error: err.message });
  }
}
