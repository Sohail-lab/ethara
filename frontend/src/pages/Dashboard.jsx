import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectApi } from "../api";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [projRes, overdueRes] = await Promise.all([
        projectApi.get("/projects"),
        projectApi.get("/tasks/overdue"),
      ]);
      setProjects(projRes.data);
      setOverdue(overdueRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const createProject = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await projectApi.post("/projects", form);
      setShowModal(false);
      setForm({ name: "", description: "" });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to create project");
    }
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="container">
          <div className="dashboard-header">
            <div>
              <h2 className="dashboard-title">Dashboard</h2>
              <p className="text-muted text-sm">Welcome back, {user?.name}</p>
            </div>
            {user?.role === "admin" && (
              <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                + New Project
              </button>
            )}
          </div>

          {overdue.length > 0 && (
            <div className="overdue-banner">
              <span className="badge badge-overdue">⚠ {overdue.length} overdue task{overdue.length > 1 ? "s" : ""}</span>
              <span className="text-muted text-sm" style={{ marginLeft: 10 }}>
                {overdue.map((t) => t.title).join(", ")}
              </span>
            </div>
          )}

          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-number">{projects.length}</div>
              <div className="stat-label">Projects</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: "var(--danger)" }}>{overdue.length}</div>
              <div className="stat-label">Overdue Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number" style={{ color: "var(--accent)" }}>
                {projects.reduce((a, p) => a + (p.members?.length || 0), 0)}
              </div>
              <div className="stat-label">Total Members</div>
            </div>
          </div>

          <h3 className="section-title">Your Projects</h3>

          {loading ? (
            <div className="empty-state">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40 }}>📂</div>
              <p>No projects yet. {user?.role === "admin" ? "Create your first one!" : "Ask an admin to add you."}</p>
            </div>
          ) : (
            <div className="projects-grid">
              {projects.map((p) => (
                <Link to={`/projects/${p.id}`} key={p.id} className="project-card">
                  <div className="project-card-icon">{p.name[0].toUpperCase()}</div>
                  <div className="project-info">
                    <div className="project-name">{p.name}</div>
                    {p.description && <div className="project-desc">{p.description}</div>}
                    <div className="project-meta">{p.members?.length || 0} members</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Project</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={createProject}>
              <div className="form-group">
                <label>Project Name</label>
                <input className="form-control" placeholder="e.g. Website Redesign" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} placeholder="Optional description..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {error && <p className="error-text">{error}</p>}
              <div className="flex gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
