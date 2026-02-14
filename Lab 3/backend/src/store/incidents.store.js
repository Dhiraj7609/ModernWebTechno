import { randomUUID } from "crypto";
import fs from "fs";
import config from "../config.js";

const DATA_DIR = config.DATA_DIR;
const INCIDENTS_FILE = config.INCIDENTS_FILE;

// ---- Helpers ----
function ensureStoreFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(INCIDENTS_FILE)) {
    fs.writeFileSync(INCIDENTS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

function readAllIncidents() {
  ensureStoreFile();
  const raw = fs.readFileSync(INCIDENTS_FILE, "utf-8");
  try {
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    // If JSON corrupted, return empty to avoid crash
    return [];
  }
}

function writeAllIncidents(incidents) {
  ensureStoreFile();
  fs.writeFileSync(INCIDENTS_FILE, JSON.stringify(incidents, null, 2), "utf-8");
}

// ---- Public store API ----

// includeArchived default: false (hide archived by default)
export function listAll(options = {}) {
  const { includeArchived = config.DEFAULT_INCLUDE_ARCHIVED } = options;
  const incidents = readAllIncidents();

  if (includeArchived) return incidents;
  return incidents.filter(i => i.status !== "ARCHIVED");
}

export function findById(id) {
  const incidents = readAllIncidents();
  return incidents.find(i => i.id === id);
}

export function createIncident(data) {
  const incidents = readAllIncidents();

  const incident = {
    id: randomUUID(),
    ...data,
    status: "OPEN",
    reportedAt: new Date().toISOString()
  };

  incidents.push(incident);
  writeAllIncidents(incidents);
  return incident;
}

// General status update (transition rules validated in validate.js / routes)
export function updateStatus(id, status) {
  const incidents = readAllIncidents();
  const idx = incidents.findIndex(i => i.id === id);
  if (idx === -1) return null;

  incidents[idx].status = status;
  writeAllIncidents(incidents);
  return incidents[idx];
}
