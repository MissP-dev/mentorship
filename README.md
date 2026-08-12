# Mentor Connect

> **Where growth meets guidance.**

A mentorship platform built with:

| Layer     | Technology                        |
| --------- | --------------------------------- |
| Frontend  | React + Vite + Tailwind CSS       |
| Backend   | Node.js + Express + Prisma        |
| Database  | PostgreSQL                        |

This guide works on **Windows**, **macOS**, and **Linux**, and tells you how to open the app on a **phone**.

---

## 1. Prerequisites

- **Node.js** (v18 or newer — LTS recommended) → https://nodejs.org
- **PostgreSQL** (v14+)
  - Windows: https://www.postgresql.org/download/windows/
  - macOS: `brew install postgresql` then `brew services start postgresql`
- **Git** (optional) → https://git-scm.com

> **Tip for Windows transfers:** if the project was zipped on a Mac and some files/folders
> seem "missing" on Windows, files may have the *Hidden* or *Read-Only* attribute.
> Run this once in the project folder:
> `attrib -r -h -s /s /d` (from inside the project root).

---

## 2. One-time setup

Open a terminal in the project root and run the setup script for your OS:

| OS       | Command        |
| -------- | -------------- |
| Windows  | `.\setup.ps1`  |
| Windows  | `setup.bat`    |
| macOS/Linux | `./setup.sh` (run `chmod +x setup.sh` first) |

The script will:

1. Install backend + frontend dependencies.
2. Create `mconnect/backend/.env` from `.env.example` if missing.
3. Create the `mconnect` database (if PostgreSQL is reachable).
4. Generate the Prisma client and sync the database schema.

### Manual setup (if you prefer)

```bash
# Backend
cd mconnect/backend
cp .env.example .env        # then edit .env with your PostgreSQL password
npm install
npx prisma generate
npx prisma db push          # creates tables without losing data
npm run seed                # optional: demo users (password: password123)

# Frontend (in a second terminal)
cd mconnect/frontend
npm install
npm run dev
```

### Database connection

`mconnect/backend/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/mconnect?schema=public"
JWT_SECRET="change-me-to-a-long-random-string"
PORT=3002
FRONTEND_URL="http://localhost:5173"
```

- Create the database if needed: `psql -U postgres -c "CREATE DATABASE mconnect;"`
- If login fails with "database does not want to connect", make sure the PostgreSQL
  **service is running** and the **password in `.env` matches** your PostgreSQL password.

---

## 3. Running the app

Open **two terminals**:

```
Terminal 1 — Backend   : cd mconnect/backend  && npm run dev
Terminal 2 — Frontend  : cd mconnect/frontend && npm run dev
```

Then open **http://localhost:5173** in your browser.

The Vite dev server proxies `/api` and `/uploads` to the backend at port **3002**,
so you only need to talk to the frontend URL.

### Demo accounts (after `npm run seed`)

| Role  | Email               | Password    |
| ----- | ------------------- | ----------- |
| Admin | `admin@mconnect.com`| `password123` |
| Mentor| `sarah@mconnect.com`| `password123` |

---

## 4. Opening on a phone

1. Connect the phone to the **same Wi-Fi** as the computer.
2. Start both servers (above).
3. Find your computer's local IP:
   - Windows: `ipconfig` → look for **IPv4 Address** (e.g. `192.168.1.20`)
   - macOS/Linux: `ipconfig getifaddr en0`
4. On the phone browser, open `http://<that-IP>:5173`.

Both servers already listen on all network interfaces, so no config changes are needed.

---

## 5. Features

- Landing page with mentor discovery
- Account signup / login / password reset
- Mentor profiles & **mentorship requests** (choose **Video Call**, **Chat**, or **In Person**)
- Video meeting rooms (accepted video mentorships create a joinable call automatically)
- Social feed, posts, reels, stories
- Direct & group messaging
- Meetings & events
- Notifications, settings, admin dashboard
- Dark / light theme

---

## 6. Common problems

| Problem | Fix |
| ------- | --- |
| `psql: could not connect to server` | Start the PostgreSQL service (Windows Services or `brew services start postgresql`). |
| `database "mconnect" does not exist` | `psql -U postgres -c "CREATE DATABASE mconnect;"` |
| Login fails (backend error) | Check `DATABASE_URL` password in `mconnect/backend/.env`. |
| `meetings` / `events` table missing | Re-run `npx prisma db push` in `mconnect/backend`. |
| Files "missing" after Mac→Windows transfer | Run `attrib -r -h -s /s /d` in the project root to clear Hidden/Read-Only attributes. |
| Port 5173 / 3002 already in use | Change `PORT` in backend `.env` or the frontend port via `npm run dev -- --port 5174` (also update `mconnect/frontend/vite.config.js` proxy). |

---

## 7. Project structure

```
Mentor Connect/
├── setup.ps1 / setup.bat   # Windows setup
├── setup.sh                # macOS/Linux setup
└── mconnect/
    ├── backend/            # Express + Prisma API (port 3002)
    │   ├── prisma/         # schema + migrations
    │   ├── routes/         # API routes
    │   └── .env            # DB connection (edit this!)
    └── frontend/           # React + Vite app (port 5173)
        └── src/
            ├── components/
            ├── context/
            ├── services/   # API client
            └── App.jsx
```
