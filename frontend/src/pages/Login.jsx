import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(form.email, form.password);
      } else {
        await signup(form.name, form.email, form.password, form.role);
        await login(form.email, form.password);
      }
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>⬡</span>
          <h1>Ethara</h1>
          <p>Project management, simplified</p>
        </div>

        <div className="login-tabs">
          <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>
            Login
          </button>
          <button className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === "signup" && (
            <div className="form-group">
              <label>Name</label>
              <input className="form-control" name="name" placeholder="Your name" value={form.name} onChange={update} required />
            </div>
          )}
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={update} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" name="password" type="password" placeholder="••••••••" value={form.password} onChange={update} required />
          </div>
          {tab === "signup" && (
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" name="role" value={form.role} onChange={update}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} disabled={loading}>
            {loading ? "Please wait..." : tab === "login" ? "Login" : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
