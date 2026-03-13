// api/tasks.js — Vercel Serverless Function
// Handles: GET /api/tasks  POST /api/tasks
//          PATCH /api/tasks/:id  DELETE /api/tasks/:id
// Proxies to Supabase REST API using env vars injected by Vercel

const SUPABASE_URL  = process.env.SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY;
const TABLE         = 'tasks';

function supabaseHeaders() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };
}

export default async function handler(req, res) {
  // CORS — allow the Vercel front-end origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Extract optional :id from the URL  (/api/tasks/42)
  const parts = req.url.split('?')[0].split('/').filter(Boolean);
  // parts = ['api', 'tasks'] or ['api', 'tasks', '42']
  const id = parts[2] ?? null;

  try {
    // ── GET /api/tasks ───────────────────────────────────────────────
    if (req.method === 'GET' && !id) {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/${TABLE}?order=position.asc,created_at.desc`,
        { headers: supabaseHeaders() }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data);
    }

    // ── POST /api/tasks ──────────────────────────────────────────────
    if (req.method === 'POST' && !id) {
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
      // Supabase returns an array; return the first item
      return res.status(201).json(Array.isArray(data) ? data[0] : data);
    }

    // ── PATCH /api/tasks/:id ─────────────────────────────────────────
    if (req.method === 'PATCH' && id) {
      const body = req.body;
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

    // ── DELETE /api/tasks/:id ────────────────────────────────────────
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
    console.error('[api/tasks]', err);
    return res.status(500).json({ error: err.message });
  }
}
