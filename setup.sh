#!/usr/bin/env bash
# ============================================================
#  Mentor Connect — macOS / Linux setup script
#  Run from the project root:  ./setup.sh
# ============================================================
set -e

echo ""
echo "========================================"
echo "  Mentor Connect Setup (macOS / Linux)"
echo "========================================"
echo ""

# 1) Node.js check
if ! command -v node >/dev/null 2>&1; then
    echo "[ERROR] Node.js is not installed or not in PATH."
    echo "        Install it from https://nodejs.org (LTS) then re-run."
    exit 1
fi
echo "[OK] Node $(node --version) / npm $(npm --version)"

# 2) PostgreSQL check
if command -v psql >/dev/null 2>&1; then
    echo "[OK] psql found."
else
    echo "[WARN] psql not found. Make sure PostgreSQL is installed and running."
    echo "       brew install postgresql   (macOS)  — then:  brew services start postgresql"
fi

BACKEND_DIR="mconnect/backend"

# 3) Backend .env
if [ ! -f "$BACKEND_DIR/.env" ]; then
    if [ -f "$BACKEND_DIR/.env.example" ]; then
        cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
        echo "[OK] Created .env from .env.example"
        echo "     IMPORTANT: Edit it and set the correct DATABASE_URL password!"
    else
        echo "[WARN] No .env file found and no .env.example to copy."
    fi
else
    echo "[OK] .env already exists."
fi

# 4) Install dependencies
echo ""
echo "[1/3] Installing backend dependencies..."
(cd "$BACKEND_DIR" && npm install)

echo "[2/3] Installing frontend dependencies..."
(cd "mconnect/frontend" && npm install)

# 5) Sync database
echo "[3/3] Syncing the database schema (Prisma)..."
(cd "$BACKEND_DIR" && npx prisma generate && npx prisma db push)

echo ""
echo "========================================"
echo "  Setup complete!"
echo "========================================"
echo ""
echo "To run the app, open TWO terminals:"
echo "  1) Backend :  cd mconnect/backend ; npm run dev"
echo "  2) Frontend:  cd mconnect/frontend; npm run dev"
echo ""
echo "Then open http://localhost:5173 in your browser."
echo "To test on your PHONE, open http://<this machine's IP>:5173 (same Wi-Fi)."
echo ""
echo "Demo login:  admin@mconnect.com  /  password123"
echo ""
