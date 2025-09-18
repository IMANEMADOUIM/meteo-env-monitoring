import axios from "axios";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

/** Admin (protegé) */
export const listStaff = (params?: Record<string, any>) =>
  axios.get(`${API_BASE}/admin/users`, { params }).then(r => r.data);

export const createStaff = (payload: any) =>
  axios.post(`${API_BASE}/admin/users`, payload).then(r => r.data);

export const updateStaff = (id: string, payload: any) =>
  axios.put(`${API_BASE}/admin/users/${id}`, payload).then(r => r.data);

export const deleteStaff = (id: string) =>
  axios.delete(`${API_BASE}/admin/users/${id}`).then(r => r.data);

/** Profile */
export const getMyProfile = () =>
  axios.get(`${API_BASE.replace("/api", "/api/auth")}/me`).then(r => r.data);

export const updateMyProfile = (payload: any) =>
  axios.put(`${API_BASE.replace("/api", "/api/auth")}/me`, payload).then(r => r.data);