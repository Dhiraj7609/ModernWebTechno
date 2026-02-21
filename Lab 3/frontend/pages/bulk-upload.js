import { useState } from "react";
import Layout from "../components/Layout";
import ErrorBanner from "../components/ErrorBanner";
import { bulkUploadCsv } from "../services/api";

export default function BulkUpload() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0); // ✅ helps reset file input

  async function onUpload() {
    if (!file) {
      setErr("Please select a CSV file.");
      return;
    }

    try {
      setUploading(true);
      setErr("");
      setResult(null);

      const data = await bulkUploadCsv(file);
      setResult(data);

      // ✅ reset file selection after upload
      setFile(null);
      setInputKey(k => k + 1);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <Layout title="Bulk Upload">
      <ErrorBanner message={err} />

      <div className="panel">
        <div className="panel-title">Upload CSV</div>
        <div className="panel-body">
          <div className="muted">
            Required headers: <span className="mono">title,description,category,severity</span>
          </div>

          <div className="row">
            <input
              key={inputKey}
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <button className="btn" onClick={onUpload} disabled={!file || uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {result && (
            <div className="section">
              <div className="section-title">Result</div>
              <div className="box">
                <div><strong>Total Rows:</strong> {result.totalRows}</div>
                <div><strong>Created:</strong> {result.created}</div>
                <div><strong>Skipped:</strong> {result.skipped}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
