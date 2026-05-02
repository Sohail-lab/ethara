import { createContext, useContext, useState, useEffect } from "react";
import { userApi } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await userApi.post("/auth/login", { email, password });
    const { access_token, user } = res.data;
    localStorage.setItem("token", access_token);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(access_token);
    setUser(user);
    return user;
  };

  const signup = async (name, email, password, role) => {
    await userApi.post("/auth/signup", { name, email, password, role });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
