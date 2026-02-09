import { readIndex, writeIndex } from "../utils/fileStore.js";

export const documentRepository = {
  async list() {
    return await readIndex();
  },

  async getById(id) {
    const docs = await readIndex();
    return docs.find((d) => d.id === id) ?? null;
  },

  async saveNew(doc) {
    const docs = await readIndex();
    docs.push(doc);
    await writeIndex(docs);
    return doc;
  },

  async replaceById(id, replacerFn) {
    const docs = await readIndex();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx < 0) return null;
    const updated = replacerFn(docs[idx]);
    docs[idx] = updated;
    await writeIndex(docs);
    return updated;
  },

  /**
   * Permanently removes a document metadata record from documents.json.
   * This should ONLY be called when the document is already in REJECTED status.
   */
  async deleteById(id) {
    const docs = await readIndex();
    const idx = docs.findIndex((d) => d.id === id);
    if (idx < 0) return null;

    const [deleted] = docs.splice(idx, 1);
    await writeIndex(docs);

    return deleted;
  }
};
