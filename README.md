# Sabi Guide

A digital literacy tracker for older Nigerian users. Learners register, work
through short lessons on things like sending money by transfer, using
WhatsApp safely, and spotting scam messages, and mark their progress. An
admin can add, edit, and remove lessons from a simple management screen.

## Stack

- Node.js + Express (server, routing, auth)
- EJS (server-rendered views)
- express-session (login sessions)
- bcryptjs (password hashing)
- A small JSON file (`data/db.json`) as the data store — swap this for a real
  database like PostgreSQL or MySQL later without changing much beyond `db.js`

## Running it locally

```bash
npm install
npm start
```

Then open **http://localhost:3000** in your browser.

## How accounts work

- The **first person to register becomes the admin** automatically. Register
  yourself first so you have access to "Manage Lessons".
- Everyone who registers after that is a regular learner.
- There's no password reset flow yet — this is a portfolio-stage project.

## Project structure

```
server.js        — routes, auth, admin CRUD
db.js            — reads/writes data/db.json (users, modules, progress)
views/           — EJS templates (login, dashboard, module, admin, etc.)
public/style.css — styling (large text, high contrast, built for older users)
data/            — db.json is created automatically on first run
```

## Notes for extending it yourself

- `data/db.json` is created fresh with 5 seeded lessons the first time you
  run the app. Delete it to reset all data.
- Passwords are hashed with bcryptjs — never stored in plain text.
- The session secret in `server.js` is a placeholder — replace it with an
  environment variable before deploying anywhere public.
