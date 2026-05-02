import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">⬡</span>
          <span>Ethara</span>
        </Link>
        <div className="navbar-right">
          <div className="user-chip">
            <span className="user-avatar">{user?.name?.[0]?.toUpperCase()}</span>
            <div>
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
