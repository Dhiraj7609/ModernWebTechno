
const { v4: uuidv4 } = require("uuid");
const { getDocuments, saveDocuments } = require("../models/documentModel");

exports.createDocument = (req, res) => {
  const { title, description } = req.body;

  const documents = getDocuments();

  const newDoc = {
    documentId: uuidv4(),
    title,
    description,
    ownerId: req.session.userId,
    creationDate: new Date(),
    lastUpdatedDate: new Date()
  };

  documents.push(newDoc);
  saveDocuments(documents);

  res.json(newDoc);
};

exports.getDocuments = (req, res) => {
  const documents = getDocuments();
  const userDocs = documents.filter(
    d => d.ownerId === req.session.userId
  );
  res.json(userDocs);
};

exports.getDocumentById = (req, res) => {
  const documents = getDocuments();

  const doc = documents.find(
    d => d.documentId === req.params.id
  );

  if (!doc) {
    return res.json({ message: "Document not found" });
  }

  if (doc.ownerId !== req.session.userId) {
    return res.status(401).json({ message: "Access denied" });
  }

  const visitData = {
    title: doc.title,
    time: new Date()
  };

  res.cookie("lastVisitedDoc", JSON.stringify(visitData), {
    httpOnly: true
  });

  res.json(doc);
};

exports.updateDocument = (req, res) => {
  const documents = getDocuments();

  const doc = documents.find(
    d => d.documentId === req.params.id
  );

  if (!doc) return res.json({ message: "Document not found" });

  if (doc.ownerId !== req.session.userId)
    return res.status(401).json({ message: "Access denied" });

  doc.title = req.body.title || doc.title;
  doc.description = req.body.description || doc.description;
  doc.lastUpdatedDate = new Date();

  saveDocuments(documents);

  res.json(doc);
};

exports.deleteDocument = (req, res) => {
  let documents = getDocuments();

  const doc = documents.find(
    d => d.documentId === req.params.id
  );

  if (!doc) return res.json({ message: "Document not found" });

  if (doc.ownerId !== req.session.userId)
    return res.status(401).json({ message: "Access denied" });

  documents = documents.filter(
    d => d.documentId !== req.params.id
  );

  saveDocuments(documents);

  res.json({ message: "Document deleted" });
};
