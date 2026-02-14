import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import ErrorBanner from "../../components/ErrorBanner";
import { changeIncidentStatus, getIncident } from "../../services/api";

// ✅ Updated flow to include ARCHIVED rules
const STATUS_FLOW = {
  OPEN: ["INVESTIGATING", "ARCHIVED"],
  INVESTIGATING: ["RESOLVED"],
  RESOLVED: ["ARCHIVED"],
  ARCHIVED: ["OPEN"]
};

export default function IncidentDetails() {
  const router = useRouter();
  const { id } = router.query;

  const [item, setItem] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [nextStatus, setNextStatus] = useState("");
  const [updating, setUpdating] = useState(false);

  async function load() {
    if (!id) return;
    try {
      setLoading(true);
      setErr("");
      const data = await getIncident(id);
      setItem(data);

      const allowed = STATUS_FLOW[data.status] || [];
      setNextStatus(allowed[0] || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const allowedNext = useMemo(() => {
    if (!item) return [];
    return STATUS_FLOW[item.status] || [];
  }, [item]);

  async function onUpdateStatus() {
    if (!item || !nextStatus) return;
    try {
      setUpdating(true);
      setErr("");
      const updated = await changeIncidentStatus(item.id, nextStatus);
      setItem(updated);

      const newAllowed = STATUS_FLOW[updated.status] || [];
      setNextStatus(newAllowed[0] || "");
    } catch (e) {
      setErr(e.message);
    } finally {
      setUpdating(false);
    }
  }

  return (
    <Layout title="Incident Details">
      <ErrorBanner message={err} />

      {loading && <div className="muted">Loading...</div>}

      {!loading && item && (
        <div className="panel">
          <div className="panel-title">{item.title}</div>
          <div className="panel-body">
            <div className="meta">
              <div><strong>ID:</strong> <span className="mono">{item.id}</span></div>
              <div><strong>Category:</strong> <span className="tag">{item.category}</span></div>
              <div>
                <strong>Severity:</strong>{" "}
                <span className={`tag ${item.severity === "HIGH" ? "tag-danger" : item.severity === "MEDIUM" ? "tag-warn" : ""}`}>
                  {item.severity}
                </span>
              </div>
              <div><strong>Status:</strong> <span className="tag">{item.status}</span></div>
              <div><strong>Reported:</strong> <span className="mono">{(item.reportedAt || "").slice(0, 19).replace("T", " ")}</span></div>
            </div>

            <div className="section">
              <div className="section-title">Description</div>
              <div className="box">{item.description}</div>
            </div>

            <div className="section">
              <div className="section-title">Update Status</div>

              {allowedNext.length === 0 ? (
                <div className="muted">No further transitions available.</div>
              ) : (
                <div className="row">
                  <select className="select" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                    {allowedNext.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button className="btn" onClick={onUpdateStatus} disabled={!nextStatus || updating}>
                    {updating ? "Updating..." : "Update"}
                  </button>
                </div>
              )}

              {/* ✅ Optional helper text (safe & useful for marking) */}
              <div className="muted" style={{ marginTop: 8 }}>
                Archive is allowed only from OPEN or RESOLVED. Restore is allowed only from ARCHIVED to OPEN.
              </div>
            </div>

            <div className="row">
              <button className="btn btn-secondary" onClick={() => router.push("/incidents")}>Back to list</button>
            </div>
          </div>
        </div>
      )}

      {!loading && !item && !err && (
        <div className="muted">No incident selected.</div>
      )}
    </Layout>
  );
}
