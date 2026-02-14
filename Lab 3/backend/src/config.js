import path from "path";

export default {
  PORT: 3001,

  CORS_ORIGIN: "*",

  DATA_DIR: path.join(process.cwd(), "data"),
  INCIDENTS_FILE: path.join(process.cwd(), "data", "incidents.json"),

  DEFAULT_INCLUDE_ARCHIVED: false,

  ALLOWED_CATEGORIES: ["IT", "SAFETY", "FACILITIES", "OTHER"],
  ALLOWED_SEVERITIES: ["LOW", "MEDIUM", "HIGH"],
  ALLOWED_STATUSES: ["OPEN", "INVESTIGATING", "RESOLVED", "ARCHIVED"]
};
