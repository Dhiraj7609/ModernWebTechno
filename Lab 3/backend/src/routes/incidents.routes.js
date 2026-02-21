import express from "express";
import multer from "multer";

import { listAll, findById, createIncident, updateStatus } from "../store/incidents.store.js";
import { parseCsvBuffer } from "../utils/csv.js";
import { validateCreateIncident, validateStatusChange, statuses } from "../utils/validate.js";

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// GET /api/incidents?includeArchived=true|false
router.get("/", (req, res) => {
  const includeArchived = String(req.query.includeArchived).toLowerCase() === "true";
  res.json(listAll({ includeArchived }));
});

router.get("/:id", (req, res) => {
  const incident = findById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });
  res.json(incident);
});

router.post("/", (req, res) => {
  const result = validateCreateIncident(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.errors });
  }

  const incident = createIncident(result.value);
  res.status(201).json(incident);
});

// PATCH /api/incidents/:id/status
// Supports: normal transitions + ARCHIVED rules + restore rule
router.patch("/:id/status", (req, res) => {
  const incident = findById(req.params.id);
  if (!incident) return res.status(404).json({ error: "Incident not found" });

  const nextStatus = req.body?.status;
  if (!nextStatus || !statuses.includes(nextStatus)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const check = validateStatusChange(incident.status, nextStatus);
  if (!check.ok) return res.status(400).json({ error: check.error });

  const updated = updateStatus(incident.id, check.next);
  res.json(updated);
});

router.post("/bulk-upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "CSV file is required (field name: file)" });
  }

  // Lightweight CSV check (mimetype varies by OS/browser)
  const nameOk = req.file.originalname?.toLowerCase().endsWith(".csv");
  if (!nameOk) {
    return res.status(400).json({ error: "Only CSV files are allowed" });
  }

  const records = await parseCsvBuffer(req.file.buffer);

  let created = 0;
  let skipped = 0;

  records.forEach(row => {
    const result = validateCreateIncident(row);
    if (!result.ok) {
      skipped++;
      return;
    }
    createIncident(result.value);
    created++;
  });

  res.json({
    totalRows: records.length,
    created,
    skipped
  });
});

export default router;
