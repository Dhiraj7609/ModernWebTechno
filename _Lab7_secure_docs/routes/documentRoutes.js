
const express = require("express");
const router = express.Router();

const doc = require("../controllers/documentController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/documents", authMiddleware, doc.createDocument);
router.get("/documents", authMiddleware, doc.getDocuments);
router.get("/documents/:id", authMiddleware, doc.getDocumentById);
router.put("/documents/:id", authMiddleware, doc.updateDocument);
router.delete("/documents/:id", authMiddleware, doc.deleteDocument);

module.exports = router;
