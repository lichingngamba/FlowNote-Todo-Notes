# FlowNote — Todo & Notes

FlowNote is a sleek, keyboard-first productivity app that combines tasks and markdown notes in one minimalist workspace.

## 🚀 What You Get

- Fast task views for Today, Upcoming, Inbox, Someday, and Logbook
- Kanban board by priority
- Markdown notes with edit/preview, auto-save, word count, and pinning
- Full task details (due date, project, tags, notes, completion)
- Quick add actions in every view
- Command palette (`⌘K`) with inline create and navigation
- Smart keyboard shortcuts: `T`, `U`, `N`, `I`
- Responsive dark/light theme with system preference

## ✨ Features

### Task Management
- Today: due today sorted by priority
- Upcoming: next 7 days
- Inbox: uncategorized tasks
- Someday: no due date
- Logbook: completed tasks
- Priority color coding: red urgent, orange high, yellow medium

### Notes
- Markdown editor with live preview toggle
- Auto-save and word count
- Pin/unpin note sections

### Productivity
- Command palette (`⌘K`) to navigate, create tasks/notes, and run actions
- Keyboard shortcuts for rapid workflow

## 🧭 Getting Started
1. Run `npm run build` (or `node build.js`) to generate `assets/auth-secret.js`.
2. Open `index.html` in your browser (or use VS Code Live Server).
3. At login, enter password `notepad` (or set `FLOWNOTE_LOGIN_PASSWORD` in Vercel environment).
4. Start adding tasks and notes.
5. Use keyboard shortcuts and command palette for speed.

## 🧩 Vercel deploy notes
- Set Build Command: `npm run build`
- Output Directory: `.`
- Add Environment Variable `FLOWNOTE_LOGIN_PASSWORD=notepad` (or your chosen secret)

## 💡 Why FlowNote
FlowNote is built for developers and knowledge workers who need a clean, fast, and focused app for quick planning, tracking, and writing.

---

### 🔧 Project Files
- `index.html` — app UI + logic
- `assets/index-AIi2cw5b.css` — styling
- `assets/index-CV2p19bQ.js` — behavior

If you want, I can now implement a complete working FlowNote app inside `index.html` in this repo and verify it in your browser.