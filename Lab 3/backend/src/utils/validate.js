export const categories = ["IT", "SAFETY", "FACILITIES", "OTHER"];
export const severities = ["LOW", "MEDIUM", "HIGH"];

// New: statuses include ARCHIVED
export const statuses = ["OPEN", "INVESTIGATING", "RESOLVED", "ARCHIVED"];

export function validateCreateIncident(body) {
  const errors = [];

  if (!body.title || body.title.length < 5) errors.push("Invalid title");
  if (!body.description || body.description.length < 10) errors.push("Invalid description");
  if (!categories.includes(body.category)) errors.push("Invalid category");
  if (!severities.includes(body.severity)) errors.push("Invalid severity");

  return {
    ok: errors.length === 0,
    errors,
    value: {
      title: body.title,
      description: body.description,
      category: body.category,
      severity: body.severity
    }
  };
}

/**
 * Validates if an incident can move from current status to next status.
 *
 * Rules:
 * - OPEN -> INVESTIGATING OR ARCHIVED
 * - INVESTIGATING -> RESOLVED
 * - RESOLVED -> ARCHIVED
 * - ARCHIVED -> OPEN
 */
export function validateStatusChange(current, next) {
  if (!statuses.includes(current) || !statuses.includes(next)) {
    return { ok: false, error: "Invalid status value" };
  }

  const transitions = {
    OPEN: ["INVESTIGATING", "ARCHIVED"],
    INVESTIGATING: ["RESOLVED"],
    RESOLVED: ["ARCHIVED"],
    ARCHIVED: ["OPEN"]
  };

  if (!transitions[current].includes(next)) {
    return { ok: false, error: "Invalid status transition" };
  }

  return { ok: true, next };
}
