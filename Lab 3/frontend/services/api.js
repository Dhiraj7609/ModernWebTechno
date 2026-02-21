const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

async function handleJson(res) {
  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const body = isJson ? await res.json() : null;

  if (!res.ok) {
    const message =
      (body && (body.error || body.message)) ||
      `Request failed with status ${res.status}`;
    const details = body && body.details ? body.details : null;
    const err = new Error(message);
    err.status = res.status;
    err.details = details;
    throw err;
  }

  return body;
}

export async function health() {
  const res = await fetch(`${BASE}/health`);
  return handleJson(res);
}

// ✅ Updated: supports includeArchived checkbox
export async function listIncidents(includeArchived = false) {
  const q = includeArchived ? "?includeArchived=true" : "";
  const res = await fetch(`${BASE}/api/incidents${q}`);
  return handleJson(res);
}

export async function getIncident(id) {
  const res = await fetch(`${BASE}/api/incidents/${encodeURIComponent(id)}`);
  return handleJson(res);
}

export async function createIncident(payload) {
  const res = await fetch(`${BASE}/api/incidents`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleJson(res);
}

export async function changeIncidentStatus(id, status) {
  const res = await fetch(`${BASE}/api/incidents/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });
  return handleJson(res);
}

// ✅ New helpers (same backend endpoint, just clearer in UI code)
export async function archiveIncident(id) {
  return changeIncidentStatus(id, "ARCHIVED");
}

export async function restoreIncident(id) {
  return changeIncidentStatus(id, "OPEN");
}

export async function bulkUploadCsv(file) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch(`${BASE}/api/incidents/bulk-upload`, {
    method: "POST",
    body: fd
  });

  return handleJson(res);
}
