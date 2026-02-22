import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Client from "../models/Client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "..", "data", "clients.json");

// ================= FILE STORAGE =================
export function loadClientsFromFile() {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf-8");
  return raw ? JSON.parse(raw) : [];
}

export function saveClientsToFile(clients) {
  fs.writeFileSync(dataPath, JSON.stringify(clients, null, 2));
}

function findClientByIdFile(clients, id) {
  return clients.find((c) => String(c.id) === String(id));
}

function getNextIdFile(clients) {
  let max = 0;
  clients.forEach((c) => {
    const n = Number(c.id);
    if (n > max) max = n;
  });
  return max + 1;
}

// ================= MONGO HELPERS =================
export async function seedMongoFromFileIfEmpty({ connected }) {
  if (!connected) return { seeded: false, reason: "mongo-not-connected" };

  const count = await Client.countDocuments();
  if (count > 0) return { seeded: false, reason: "mongo-not-empty" };

  const clients = loadClientsFromFile();
  if (clients.length === 0) return { seeded: false, reason: "file-empty" };

  await Client.insertMany(clients);
  return { seeded: true, inserted: clients.length };
}

// ================= UNIFIED CRUD =================
/**
 * Read preference:
 * - If Mongo is connected, read from Mongo (source of truth)
 * - Else read from the JSON file
 *
 * Write behavior ("in addition"):
 * - Always write to JSON file
 * - Also write to Mongo if connected
 */

export async function listClients({ mongoConnected }) {
  if (mongoConnected) {
    const docs = await Client.find().sort({ id: 1 }).lean();
    return docs;
  }
  return loadClientsFromFile();
}

export async function getClientById({ mongoConnected, id }) {
  if (mongoConnected) {
    const doc = await Client.findOne({ id: Number(id) }).lean();
    return doc || null;
  }
  const clients = loadClientsFromFile();
  return findClientByIdFile(clients, id) || null;
}

export async function createClientUnified({ mongoConnected, payload }) {
  const clients = loadClientsFromFile();

  const newClient = {
    id: getNextIdFile(clients),
    fullName: payload.fullName,
    email: payload.email,
    riskCategory: payload.riskCategory,
    createdDate: new Date().toISOString().split("T")[0],
  };

  clients.push(newClient);
  saveClientsToFile(clients);

  if (mongoConnected) {
    // keep same numeric id
    await Client.create(newClient);
  }

  return newClient;
}

export async function updateClientUnified({ mongoConnected, id, payload }) {
  const clients = loadClientsFromFile();
  const existing = findClientByIdFile(clients, id);
  if (!existing) return null;

  existing.fullName = payload.fullName;
  existing.email = payload.email;
  existing.riskCategory = payload.riskCategory;

  saveClientsToFile(clients);

  if (mongoConnected) {
    await Client.updateOne(
      { id: Number(id) },
      {
        $set: {
          fullName: existing.fullName,
          email: existing.email,
          riskCategory: existing.riskCategory,
        },
      }
    );
  }

  return existing;
}

export async function deleteClientUnified({ mongoConnected, id }) {
  const clients = loadClientsFromFile();
  const before = clients.length;
  const updated = clients.filter((c) => String(c.id) !== String(id));
  if (updated.length === before) return false;

  saveClientsToFile(updated);

  if (mongoConnected) {
    await Client.deleteOne({ id: Number(id) });
  }

  return true;
}
