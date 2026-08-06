import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { seedData } from './seed.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, 'data.json');

function load() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch {
      fs.rmSync(DB_FILE, { force: true });
    }
  }
  return structuredClone(seedData());
}

const db = load();

export function getDb() {
  return db;
}

export function save() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

export function resetDb() {
  Object.keys(db).forEach((k) => delete db[k]);
  Object.assign(db, structuredClone(seedData()));
  save();
}

export function nextId(list) {
  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

export function findUser(id) {
  const n = Number(id);
  return db.users.find((u) => u.id === n);
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}
