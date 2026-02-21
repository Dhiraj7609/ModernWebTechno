import express from "express";
import {
  renderHome,
  renderClientsList,
  renderClientDetails,
  renderCreateClient,
  createClient,
  renderEditClient,
  updateClient,
  renderDeleteClient,
  deleteClient,
  apiGetClients,
  apiGetClientById
} from "../controllers/clientController.js";

const router = express.Router();

// ================= SSR ROUTES =================

// Home
router.get("/", renderHome);

// Clients list
router.get("/clients", renderClientsList);

// ✅ Create (MUST be before /clients/:id)
router.get("/clients/new", renderCreateClient);
router.post("/clients", createClient);

// Edit
router.get("/clients/:id/edit", renderEditClient);
router.post("/clients/:id/update", updateClient);

// Delete
router.get("/clients/:id/delete", renderDeleteClient);
router.post("/clients/:id/delete", deleteClient);

// ✅ Client details (MUST be last)
router.get("/clients/:id", renderClientDetails);

// ================= API ROUTES =================
router.get("/api/clients", apiGetClients);
router.get("/api/clients/:id", apiGetClientById);

export default router;