import axios from 'axios';

const API_URL = 'http://localhost:8000/api/auth'; // adapte selon ton port

export const register = (data: {
  username: string;
  email: string;
  password: string;
  role?: string;
}) => axios.post(`${API_URL}/register`, data);

export const login = (data: {
  email: string;
  password: string;
}) => axios.post(`${API_URL}/login`, data, { withCredentials: true });
