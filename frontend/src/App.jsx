import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProjectView from "./pages/ProjectView";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Protected>
                <Dashboard />
              </Protected>
            }
          />
          <Route
            path="/projects/:id"
            element={
              <Protected>
                <ProjectView />
              </Protected>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
