import axios from "axios";

const API = axios.create({
  baseURL: "https://api.kodebloom.com/api/timetable",
});

// Add request interceptor to include auth token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchTimetable = (className, section) =>
  API.get(`/${className}/${section}`);

export const addClassApi = (data) =>
  API.post("/add", data);

export const updateClassApi = (id, data) =>
  API.put(`/update/${id}`, data);

export const deleteClassApi = (id) =>
  API.delete(`/delete/${id}`);
