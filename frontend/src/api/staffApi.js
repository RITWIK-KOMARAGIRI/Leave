import axios from "axios";

const API = axios.create({
  baseURL: "https://api.kodebloom.com/api/staff",
});

// Add request interceptor to include auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchTeachers = () => API.get("/teachers");
