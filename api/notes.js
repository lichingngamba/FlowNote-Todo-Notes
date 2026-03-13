// api/notes.js — Vercel Serverless Function
// Translates camelCase (React bundle) ↔ snake_case (Supabase)

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

function headers() {
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
  };
}

// camelCase → snake_case for writing TO Supabase
function toSnake(obj) {
  const map = {
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    projectId: 'project_id',
    areaId:    'area_id',
  };
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[map[k] || k] = v;
  }
  return out;
}

// snake_case → camelCase for returning TO the React bundle
function toCamel(obj) {
  const map = {
    created_at: 'createdAt',
    updated_at: 'updatedAt',
    project_id: 'projectId',
    area_id:    'areaId',
  };
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    out[map[k] || k] = v;
  }
  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const parts = req.url.split('?')[0].split('/').filter(Boolean);
  const id = parts[2] ?? null;

  try {
    // ── GET /api/notes ──────────────────────────────────────────────
    if (req.method === 'GET' && !id) {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/notes?archived=eq.false&order=pinned.desc,updated_at.desc`,
        { headers: headers() }
      );
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      return res.status(200).json(data.map(toCamel));
    }

    // ── POST /api/notes ─────────────────────────────────────────────
    if (req.method === 'POST' && !id) {
      const body = toSnake(req.body);
      // Always set updated_at on create
      body.updated_at = new Date().toISOString();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
        method: 'POST',
        headers: { ...headers(), 'Prefer': 'return=representation' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      const row = Array.isArray(data) ? data[0] : data;
      return res.status(201).json(toCamel(row));
    }

    // ── PATCH /api/notes/:id ────────────────────────────────────────
    if (req.method === 'PATCH' && id) {
      const body = toSnake(req.body);
      // Always bump updated_at on edit
      body.updated_at = new Date().toISOString();
      const r = await fetch(`${SUPABASE_URL}/rest/v1/notes?id=eq.${id}`, {
        method: 'PATCH',
        headers: { ...headers(), 'Prefer': 'return=representation' },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) return res.status(r.status).json(data);
      const row = Array.isArray(data) ? data[0] : data;
      return res.status(200).json(toCamel(row));
    }

    // ── DELETE /api/notes/:id ───────────────────────────────────────
    if (req.method === 'DELETE' && id) {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/notes?id=eq.${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      if (!r.ok) return res.status(r.status).json(await r.json());
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err) {
    console.error('[api/notes]', err);
    return res.status(500).json({ error: err.message });
  }
}