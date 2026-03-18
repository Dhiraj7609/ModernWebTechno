
const fs = require("fs");
const path = "./data/documents.json";

function getDocuments() {
  const data = fs.readFileSync(path);
  return JSON.parse(data);
}

function saveDocuments(docs) {
  fs.writeFileSync(path, JSON.stringify(docs, null, 2));
}

module.exports = { getDocuments, saveDocuments };
