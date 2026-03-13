# FlowNote — Supabase Storage Setup Guide

This guide wires up persistent storage for your FlowNote app deployed on Vercel.
Everything is **100% free** — Supabase free tier + Vercel free tier.

---

## What changes were made

Your Vercel deployment is a static site (`index.html` + pre-built React bundle).
The React bundle already calls `/api/tasks`, `/api/notes`, `/api/areas`, `/api/projects` —
but there was no backend to handle those calls.

The fix: **Vercel Serverless Functions** in the `api/` folder.
Vercel automatically serves any file inside `api/` as a serverless function.
Since the functions live at exactly the paths the React bundle calls, zero changes
are needed to the front-end code.

### Files added to your repo

```
api/
  tasks.js       ← GET/POST/PATCH/DELETE /api/tasks and /api/tasks/:id
  notes.js       ← GET/POST/PATCH/DELETE /api/notes and /api/notes/:id
  areas.js       ← GET/POST              /api/areas
  projects.js    ← GET/POST              /api/projects
build.js         ← updated: warns if SUPABASE_URL / SUPABASE_ANON_KEY are missing
vercel.json      ← updated: declares serverless functions + URL rewrites for :id routes
index.html       ← already fixed CSS filename (from previous fix)
supabase_schema.sql  ← run once in Supabase to create the tables
```

---

## Step 1 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in with GitHub.
2. Click **New project**.
   - Name: `flownote` (or anything)
   - Database password: set a strong one (you won't need it later)
   - Region: pick the one closest to you (e.g. Singapore for India)
3. Wait ~2 minutes for the project to spin up.

---

## Step 2 — Create the database tables

1. In your Supabase project, click **SQL Editor** (left sidebar) → **New query**.
2. Copy the entire contents of `supabase_schema.sql` and paste it in.
3. Click **Run** (or Ctrl+Enter).
4. You should see: *"Success. No rows returned."*

This creates:
- `tasks` — your to-do items
- `notes` — your notes
- `areas` — organisational areas (Work, Personal, Health seeded by default)
- `projects` — projects within areas

---

## Step 3 — Get your Supabase credentials

1. In your Supabase project, go to **Settings** → **API** (left sidebar).
2. Copy two values:
   - **Project URL** → looks like `https://xxxxxxxxxxxx.supabase.co`
   - **anon public key** → a long JWT string under "Project API keys"

Keep these handy for the next step.

---

## Step 4 — Add env vars in Vercel

1. Open your Vercel project → **Settings** → **Environment Variables**.
2. Add these three variables:

| Name | Value | Note |
|------|-------|------|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | Your project URL from Step 3 |
| `SUPABASE_ANON_KEY` | `eyJhb...` | Your anon key from Step 3 |
| `FLOWNOTE_LOGIN_PASSWORD` | `your-secret-password` | The password to log into FlowNote |

3. For each variable, select **All Environments** (Production + Preview + Development).
4. Click **Save**.

---

## Step 5 — Push the new files to GitHub

Copy the following files from this folder into your GitHub repo root:

```
api/tasks.js
api/notes.js
api/areas.js
api/projects.js
build.js          ← replace the existing one
vercel.json       ← replace the existing one
index.html        ← replace the existing one (already has CSS fix)
```

Then commit and push:

```bash
git add api/ build.js vercel.json index.html
git commit -m "feat: add Supabase serverless API routes for persistent storage"
git push
```

Vercel will automatically redeploy when it detects the push.

---

## Step 6 — Verify it works

1. Open your Vercel deployment URL.
2. Enter your `FLOWNOTE_LOGIN_PASSWORD` → you should see the FlowNote UI.
3. Create a task → refresh the page → the task should still be there.
4. Create a note → refresh → still there.

To confirm data is flowing to Supabase:
- Go to Supabase → **Table Editor** → select `tasks` or `notes`.
- You should see your created items.

---

## How it works (architecture)

```
Browser
  │  GET /api/tasks
  ▼
Vercel Edge
  ├── Static files (index.html, assets/*.js, assets/*.css)  ← served directly
  └── api/tasks.js  ← Vercel Serverless Function
        │  fetch(`${SUPABASE_URL}/rest/v1/tasks`, { apikey: SUPABASE_ANON_KEY })
        ▼
      Supabase REST API  →  PostgreSQL database
```

- No Node.js server to maintain
- Vercel functions scale to zero when not in use (free tier: 100 GB-hours/month)
- Supabase free tier: 500 MB database, unlimited API calls

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Login screen shows but tasks don't load | Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set in Vercel env vars |
| 401 errors in browser console | Your anon key is wrong — re-copy it from Supabase Settings → API |
| 404 on `/api/tasks` | Make sure `api/tasks.js` is committed and pushed to GitHub |
| Data saves but disappears on refresh | Row Level Security might be blocking — run the SQL schema again, it disables RLS |
| Password doesn't work | Check `FLOWNOTE_LOGIN_PASSWORD` in Vercel env vars; redeploy after changing it |

---

## Cost

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Hobby (free) | $0 |
| Supabase | Free tier | $0 |
| **Total** | | **$0/month** |

Supabase free tier includes 2 projects, 500 MB database, 5 GB bandwidth.
Vercel free tier includes unlimited deployments, 100 GB bandwidth.
Both are more than enough for a personal productivity app.
