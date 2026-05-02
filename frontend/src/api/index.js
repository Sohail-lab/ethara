import axios from "axios";

const userApi = axios.create({
  baseURL: import.meta.env.VITE_USER_API || "http://localhost:8001",
});

const projectApi = axios.create({
  baseURL: import.meta.env.VITE_PROJECT_API || "http://localhost:8002",
});

const injectToken = (config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

userApi.interceptors.request.use(injectToken);
projectApi.interceptors.request.use(injectToken);

export { userApi, projectApi };
