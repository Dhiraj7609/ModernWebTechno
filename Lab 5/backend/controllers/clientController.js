import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "..", "data", "clients.json");

// ================= LOAD =================
const loadClients = () => {
  if (!fs.existsSync(dataPath)) return [];
  const raw = fs.readFileSync(dataPath, "utf-8");
  return raw ? JSON.parse(raw) : [];
};

// ================= SAVE =================
const saveClients = (clients) => {
  fs.writeFileSync(dataPath, JSON.stringify(clients, null, 2));
};

// ================= FIND =================
const findClientById = (clients, id) =>
  clients.find(c => String(c.id) === String(id));

// ================= NEXT ID =================
const getNextId = (clients) => {
  let max = 0;
  clients.forEach(c => {
    const n = Number(c.id);
    if (n > max) max = n;
  });
  return max + 1;
};

// ================= HOME =================
export const renderHome = (req, res) => {
  res.render("pages/home", {
    pageTitle: "Home",
    now: new Date().toLocaleString()
  });
};

// ================= LIST =================
export const renderClientsList = (req, res) => {
  const clients = loadClients();
  res.render("pages/clients", {
    pageTitle: "Clients",
    clients,
    totalClients: clients.length,
    now: new Date().toLocaleString()
  });
};

// ================= DETAILS =================
export const renderClientDetails = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).render("pages/notFound", {
      pageTitle: "Not Found"
    });
  }

  res.render("pages/clientDetails", {
    pageTitle: "Client Profile",
    clientt,
    now: new Date().toLocaleString()
  });
};

// ================= CREATE FORM =================
export const renderCreateClient = (req, res) => {
  res.render("pages/clientCreate", {
    pageTitle: "Create Client",
    error: null,
    formData: {}
  });
};

// ================= CREATE =================
export const createClient = (req, res) => {
  const clients = loadClients();
  const { fullName, email, riskCategory } = req.body;

  if (!fullName || !email || !riskCategory) {
    return res.render("pages/clientCreate", {
      pageTitle: "Create Client",
      error: "All fields are required",
      formData: req.body
    });
  }

  const newClient = {
    id: getNextId(clients),
    fullName,
    email,
    riskCategory,
    createdDate: new Date().toISOString().split("T")[0]
  };

  clients.push(newClient);
  saveClients(clients);

  res.redirect("/clients");
};

// ================= EDIT FORM =================
export const renderEditClient = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).render("pages/notFound", {
      pageTitle: "Not Found"
    });
  }

  res.render("pages/clientEdit", {
    pageTitle: "Edit Client",
    clientt,
    error: null
  });
};

// ================= UPDATE =================
export const updateClient = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).render("pages/notFound", {
      pageTitle: "Not Found"
    });
  }

  const { fullName, email, riskCategory } = req.body;

  if (!fullName || !email || !riskCategory) {
    return res.render("pages/clientEdit", {
      pageTitle: "Edit Client",
      clientt,
      error: "All fields are required"
    });
  }

  clientt.fullName = fullName;
  clientt.email = email;
  clientt.riskCategory = riskCategory;

  saveClients(clients);

  res.redirect(`/clients/${clientt.id}`);
};

// ================= DELETE CONFIRM =================
export const renderDeleteClient = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).render("pages/notFound", {
      pageTitle: "Not Found"
    });
  }

  res.render("pages/clientDelete", {
    pageTitle: "Delete Client",
    clientt
  });
};

// ================= DELETE =================
export const deleteClient = (req, res) => {
  const clients = loadClients();
  const updated = clients.filter(
    c => String(c.id) !== String(req.params.id)
  );

  saveClients(updated);

  res.redirect("/clients");
};

// ================= API =================
export const apiGetClients = (req, res) => {
  const clients = loadClients();
  res.json({ total: clients.length, clients });
};

export const apiGetClientById = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).json({ error: "Client Not Found" });
  }

  res.json({ clientt });
};