import { parseJsonBody } from "../utils/bodyParser.js";
import { sendError, sendJson } from "../utils/response.js";
import { documentService } from "../services/documentService.js";
import { exportService } from "../services/exportService.js";
import { validateCreate, validateDelete, validatePut } from "../utils/validators.js";

function getPath(req) {
  return new URL(req.url, "http://localhost").pathname;
}

function getQuery(req) {
  return Object.fromEntries(new URL(req.url, "http://localhost").searchParams.entries());
}

function matchId(pathname) {
  const m = pathname.match(/^\/api\/documents\/([^\/]+)$/);
  return m ? m[1] : null;
}

function matchIdContent(pathname) {
  const m = pathname.match(/^\/api\/documents\/([^\/]+)\/content$/);
  return m ? m[1] : null;
}

function matchIdStatus(pathname) {
  const m = pathname.match(/^\/api\/documents\/([^\/]+)\/status$/);
  return m ? m[1] : null;
}

export async function handleApi(req, res) {
  const pathname = getPath(req);

  if (req.method === "GET" && pathname === "/api/documents") {
    const q = getQuery(req);
    const docs = await documentService.list({
      status: q.status || null,
      docType: q.docType || null,
      clientRef: q.clientRef || null
    });
    return sendJson(res, 200, docs);
  }

  if (req.method === "POST" && pathname === "/api/documents") {
    const body = await parseJsonBody(req);
    const v = validateCreate(body);
    if (!v.ok) return sendError(res, 400, "Validation failed", v.errors);

    const doc = await documentService.create({
      clientRef: body.clientRef,
      docType: body.docType,
      filename: body.filename,
      contentType: body.contentType,
      decoded: v.decoded
    });

    return sendJson(res, 201, doc);
  }

  const idForPut = matchId(pathname);
  if (req.method === "PUT" && idForPut) {
    const body = await parseJsonBody(req);
    const v = validatePut(body);
    if (!v.ok) return sendError(res, 400, "Validation failed", v.errors);

    const result = await documentService.updatePut(idForPut, body, v.decoded);
    if (!result.ok) return sendError(res, result.status, result.message, result.details ?? null);
    return sendJson(res, 200, result.doc);
  }

  const idForGet = matchId(pathname);
  if (req.method === "GET" && idForGet) {
    const doc = await documentService.get(idForGet);
    if (!doc) return sendError(res, 404, "Document not found");
    return sendJson(res, 200, doc);
  }

  const idForContent = matchIdContent(pathname);
  if (req.method === "GET" && idForContent) {
    const result = await documentService.getContent(idForContent);
    if (!result.ok) return sendError(res, result.status, result.message);
    return sendJson(res, 200, {
      id: result.doc.id,
      contentType: result.doc.contentType,
      content: result.text
    });
  }

  const idForStatus = matchIdStatus(pathname);
  if (req.method === "PATCH" && idForStatus) {
    const body = await parseJsonBody(req);
    const status = body.status;
    const reason = body.reason ?? null;

    const result = await documentService.patchStatus(idForStatus, status, reason);
    if (!result.ok) return sendError(res, result.status, result.message, result.details ?? null);
    return sendJson(res, 200, result.doc);
  }

  // ✅ UPDATED DELETE HANDLER
  const idForDelete = matchId(pathname);
  if (req.method === "DELETE" && idForDelete) {
    // parseJsonBody might throw if body is empty in some implementations,
    // so we safely catch it and treat as {}
    let body = {};
    try {
      body = await parseJsonBody(req);
    } catch {
      body = {};
    }

    // Check current doc status first to decide validation rules
    const existing = await documentService.get(idForDelete);
    if (!existing) return sendError(res, 404, "Document not found");

    // If NOT rejected -> logical delete requires reason
    if (existing.status !== "REJECTED") {
      const v = validateDelete(body.reason);
      if (!v.ok) return sendError(res, 400, "Validation failed", v.errors);
    }

    const result = await documentService.deleteLogical(idForDelete, body.reason);

    if (!result.ok) return sendError(res, result.status, result.message, result.details ?? null);

    // Physical delete returns no doc object
    if (result.mode === "physical") {
      return sendJson(res, 200, {
        ok: true,
        mode: "physical",
        id: idForDelete,
        message: "Rejected document permanently deleted"
      });
    }

    // Logical delete returns updated doc
    return sendJson(res, 200, result.doc);
  }

  if (req.method === "GET" && pathname === "/api/exports/daily") {
    const result = await exportService.generateDailyExport();
    return sendJson(res, 200, result);
  }

  if (req.method === "GET" && pathname === "/demo/nonblocking") {
    await new Promise((r) => setTimeout(r, 2000));
    return sendJson(res, 200, { message: "Non-blocking demo completed after 2 seconds" });
  }

  if (req.method === "GET" && pathname === "/demo/quick") {
    return sendJson(res, 200, { message: "Quick response" });
  }

  return sendError(res, 404, "Endpoint not found");
}
