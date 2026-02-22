import {
  listClients,
  getClientById,
  createClientUnified,
  updateClientUnified,
  deleteClientUnified,
} from "../services/clientStore.js";

// ================= HOME =================
export const renderHome = (req, res) => {
  res.render("pages/home", {
    pageTitle: "Home",
    now: new Date().toLocaleString()
  });
};

// ================= LIST =================
export const renderClientsList = (req, res) => {
  (async () => {
    const clients = await listClients({ mongoConnected: req.app.locals.mongoConnected });
    res.render("pages/clients", {
      pageTitle: "Clients",
      clients,
      totalClients: clients.length,
      now: new Date().toLocaleString(),
    });
  })().catch((err) => {
    console.error(err);
    res.status(500).render("pages/notFound", { pageTitle: "Server Error" });
  });
};

// ================= DETAILS =================
export const renderClientDetails = (req, res) => {
  (async () => {
    const clientt = await getClientById({
      mongoConnected: req.app.locals.mongoConnected,
      id: req.params.id,
    });

    if (!clientt) {
      return res.status(404).render("pages/notFound", { pageTitle: "Not Found" });
    }

    res.render("pages/clientDetails", {
      pageTitle: "Client Profile",
      clientt,
      now: new Date().toLocaleString(),
    });
  })().catch((err) => {
    console.error(err);
    res.status(500).render("pages/notFound", { pageTitle: "Server Error" });
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
  const { fullName, email, riskCategory } = req.body;

  if (!fullName || !email || !riskCategory) {
    return res.render("pages/clientCreate", {
      pageTitle: "Create Client",
      error: "All fields are required",
      formData: req.body
    });
  }

  (async () => {
    await createClientUnified({
      mongoConnected: req.app.locals.mongoConnected,
      payload: { fullName, email, riskCategory },
    });
    res.redirect("/clients");
  })().catch((err) => {
    console.error(err);
    res.status(500).render("pages/clientCreate", {
      pageTitle: "Create Client",
      error: "Server error while creating client",
      formData: req.body,
    });
  });
};

// ================= EDIT FORM =================
export const renderEditClient = (req, res) => {
  (async () => {
    const clientt = await getClientById({
      mongoConnected: req.app.locals.mongoConnected,
      id: req.params.id,
    });

    if (!clientt) {
      return res.status(404).render("pages/notFound", { pageTitle: "Not Found" });
    }

    res.render("pages/clientEdit", {
      pageTitle: "Edit Client",
      clientt,
      error: null,
    });
  })().catch((err) => {
    console.error(err);
    res.status(500).render("pages/notFound", { pageTitle: "Server Error" });
  });
};

// ================= UPDATE =================
export const updateClient = (req, res) => {
  const { fullName, email, riskCategory } = req.body;

  if (!fullName || !email || !riskCategory) {
    return res.render("pages/clientEdit", {
      pageTitle: "Edit Client",
      clientt: { id: req.params.id, fullName, email, riskCategory },
      error: "All fields are required"
    });
  }

  (async () => {
    const updated = await updateClientUnified({
      mongoConnected: req.app.locals.mongoConnected,
      id: req.params.id,
      payload: { fullName, email, riskCategory },
    });

    if (!updated) {
      return res.status(404).render("pages/notFound", { pageTitle: "Not Found" });
    }

    res.redirect(`/clients/${updated.id}`);
  })().catch((err) => {
    console.error(err);
    res.status(500).render("pages/clientEdit", {
      pageTitle: "Edit Client",
      clientt: { id: req.params.id, fullName, email, riskCategory },
      error: "Server error while updating client",
    });
  });
};

// ================= DELETE CONFIRM =================
export const renderDeleteClient = (req, res) => {
  (async () => {
    const clientt = await getClientById({
      mongoConnected: req.app.locals.mongoConnected,
      id: req.params.id,
    });

    if (!clientt) {
      return res.status(404).render("pages/notFound", { pageTitle: "Not Found" });
    }

    res.render("pages/clientDelete", { pageTitle: "Delete Client", clientt });
  })().catch((err) => {
    console.error(err);
    res.status(500).render("pages/notFound", { pageTitle: "Server Error" });
  });
};

// ================= DELETE =================
export const deleteClient = (req, res) => {
  (async () => {
    await deleteClientUnified({
      mongoConnected: req.app.locals.mongoConnected,
      id: req.params.id,
    });
    res.redirect("/clients");
  })().catch((err) => {
    console.error(err);
    res.status(500).render("pages/notFound", { pageTitle: "Server Error" });
  });
};

// ================= API =================
export const apiGetClients = (req, res) => {
  (async () => {
    const clients = await listClients({ mongoConnected: req.app.locals.mongoConnected });
    res.json({
      total: clients.length,
      storage: req.app.locals.mongoConnected ? "mongo+file" : "file-only",
      clients,
    });
  })().catch((err) => {
    res.status(500).json({ error: "Failed to fetch clients", details: err?.message });
  });
};

export const apiGetClientById = (req, res) => {
  (async () => {
    const clientt = await getClientById({
      mongoConnected: req.app.locals.mongoConnected,
      id: req.params.id,
    });

    if (!clientt) {
      return res.status(404).json({ error: "Client Not Found" });
    }

    res.json({ clientt });
  })().catch((err) => {
    res.status(500).json({ error: "Failed to fetch client", details: err?.message });
  });
};

// ================= API CRUD (AngularJS) =================
export const apiCreateClient = (req, res) => {
  const { fullName, email, riskCategory } = req.body;
  if (!fullName || !email || !riskCategory) {
    return res.status(400).json({ error: "All fields are required" });
  }

  (async () => {
    const created = await createClientUnified({
      mongoConnected: req.app.locals.mongoConnected,
      payload: { fullName, email, riskCategory },
    });
    res.status(201).json({ client: created });
  })().catch((err) => {
    res.status(500).json({ error: "Failed to create client", details: err?.message });
  });
};

export const apiUpdateClient = (req, res) => {
  const { fullName, email, riskCategory } = req.body;
  if (!fullName || !email || !riskCategory) {
    return res.status(400).json({ error: "All fields are required" });
  }

  (async () => {
    const updated = await updateClientUnified({
      mongoConnected: req.app.locals.mongoConnected,
      id: req.params.id,
      payload: { fullName, email, riskCategory },
    });

    if (!updated) return res.status(404).json({ error: "Client Not Found" });
    res.json({ client: updated });
  })().catch((err) => {
    res.status(500).json({ error: "Failed to update client", details: err?.message });
  });
};

export const apiDeleteClient = (req, res) => {
  (async () => {
    const ok = await deleteClientUnified({
      mongoConnected: req.app.locals.mongoConnected,
      id: req.params.id,
    });
    if (!ok) return res.status(404).json({ error: "Client Not Found" });
    res.status(204).send();
  })().catch((err) => {
    res.status(500).json({ error: "Failed to delete client", details: err?.message });
  });
};