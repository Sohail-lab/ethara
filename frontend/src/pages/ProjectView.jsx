import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { projectApi, userApi } from "../api";
import Navbar from "../components/Navbar";
import TaskCard from "../components/TaskCard";
import "./ProjectView.css";

export default function ProjectView() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", assigned_to: "", due_date: "" });
  const [memberForm, setMemberForm] = useState({ user_id: "", role: "member" });
  const [formError, setFormError] = useState("");

  const fetchProject = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([
        projectApi.get(`/projects/${id}`),
        projectApi.get(`/projects/${id}/tasks`),
      ]);
      setProject(projRes.data);
      setTasks(taskRes.data);
    } catch {
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    userApi.get("/users").then((r) => setAllUsers(r.data)).catch(() => {});
  }, [id]);

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await projectApi.patch(`/tasks/${taskId}/status`, { status });
      setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to update status");
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description || null,
        assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
        due_date: taskForm.due_date || null,
      };
      await projectApi.post(`/projects/${id}/tasks`, payload);
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", assigned_to: "", due_date: "" });
      fetchProject();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to create task");
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setFormError("");
    try {
      await projectApi.post(`/projects/${id}/members`, {
        user_id: parseInt(memberForm.user_id),
        role: memberForm.role,
      });
      setShowMemberModal(false);
      setMemberForm({ user_id: "", role: "member" });
      fetchProject();
    } catch (err) {
      setFormError(err.response?.data?.detail || "Failed to add member");
    }
  };

  const removeMember = async (userId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await projectApi.delete(`/projects/${id}/members/${userId}`);
      fetchProject();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to remove member");
    }
  };

  const isAdmin = user?.role === "admin" && project?.owner_id === user?.id;

  const statusGroups = {
    todo: tasks.filter((t) => t.status === "todo"),
    "in-progress": tasks.filter((t) => t.status === "in-progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  if (loading) return <div className="page"><Navbar /><div className="empty-state" style={{ marginTop: 80 }}>Loading...</div></div>;

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div className="container">
          <div className="pv-header">
            <div>
              <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
              <h2 className="pv-title">{project?.name}</h2>
              {project?.description && <p className="text-muted text-sm">{project.description}</p>}
            </div>
            <div className="flex gap-2">
              {isAdmin && (
                <>
                  <button className="btn btn-ghost btn-sm" onClick={() => { setShowMemberModal(true); setFormError(""); }}>
                    + Member
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => { setShowTaskModal(true); setFormError(""); }}>
                    + Task
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="pv-layout">
            <div className="pv-board">
              {Object.entries(statusGroups).map(([status, items]) => (
                <div key={status} className="board-column">
                  <div className="board-col-header">
                    <span className={`badge badge-${status}`}>{status}</span>
                    <span className="col-count">{items.length}</span>
                  </div>
                  <div className="board-tasks">
                    {items.length === 0 ? (
                      <div className="col-empty">No tasks</div>
                    ) : (
                      items.map((t) => (
                        <TaskCard key={t.id} task={t} onStatusChange={handleStatusChange} currentUser={user} />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>

            <aside className="pv-sidebar">
              <div className="card">
                <div className="sidebar-header">
                  <h4>Members</h4>
                </div>
                <div className="member-list">
                  {project?.members?.map((m) => {
                    const u = allUsers.find((u) => u.id === m.user_id);
                    return (
                      <div key={m.user_id} className="member-row">
                        <div className="member-avatar">{u?.name?.[0]?.toUpperCase() || "?"}</div>
                        <div className="member-info">
                          <div className="member-name">{u?.name || `User #${m.user_id}`}</div>
                          <div className="member-role">{m.role}</div>
                        </div>
                        {isAdmin && m.user_id !== user.id && (
                          <button className="btn btn-danger btn-sm" onClick={() => removeMember(m.user_id)}>✕</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Task</h3>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>×</button>
            </div>
            <form onSubmit={createTask}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" placeholder="Task title" value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows={3} placeholder="Optional..."
                  value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select className="form-control" value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                  <option value="">Unassigned</option>
                  {project?.members?.map((m) => {
                    const u = allUsers.find((u) => u.id === m.user_id);
                    return <option key={m.user_id} value={m.user_id}>{u?.name || `User #${m.user_id}`}</option>;
                  })}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input className="form-control" type="date" value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
              </div>
              {formError && <p className="error-text">{formError}</p>}
              <div className="flex gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Member</h3>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>×</button>
            </div>
            <form onSubmit={addMember}>
              <div className="form-group">
                <label>User</label>
                <select className="form-control" value={memberForm.user_id}
                  onChange={(e) => setMemberForm({ ...memberForm, user_id: e.target.value })} required>
                  <option value="">Select a user</option>
                  {allUsers.filter((u) => !project?.members?.find((m) => m.user_id === u.id)).map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="form-control" value={memberForm.role}
                  onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formError && <p className="error-text">{formError}</p>}
              <div className="flex gap-2 mt-4" style={{ justifyContent: "flex-end" }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
