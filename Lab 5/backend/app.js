import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import ejs from "ejs";
import expressLayouts from "express-ejs-layouts";

import clientRoutes from "./routes/clientRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ES module __dirname replacement
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= Middleware =================
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // IMPORTANT for forms

// Make these available in ALL EJS pages/layouts
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.now = new Date().toLocaleString(); // ✅ fixes "now is not defined"
  next();
});

// ================= Views Setup =================
const viewsRoot = path.join(__dirname, "views");

app.set("view engine", "ejs");
app.set("views", viewsRoot);

app.engine("ejs", (filePath, options, callback) => {
  const renderOptions = {
    ...options,
    filename: filePath,
    root: [viewsRoot],
  };
  ejs.renderFile(filePath, renderOptions, callback);
});

app.use(expressLayouts);
app.set("layout", "layouts/main");

// ================= Static Files =================
app.use(express.static(path.join(__dirname, "public")));

// Future Angular frontend placeholder
app.use("/app", express.static(path.join(__dirname, "..", "frontend")));

// ================= Routes =================
app.use("/", clientRoutes);

// ================= 404 Handler =================
app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not Found", path: req.path });
  }

  return res.status(404).render("pages/home", {
    pageTitle: "Not Found",
    message: "The page you requested does not exist.",
  });
});

// ================= Start Server =================
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`SSR: /, /clients, /clients/:id`);
  console.log(`API: /api/clients, /api/clients/:id`);
});