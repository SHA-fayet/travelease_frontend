import axios from 'axios';

const api = axios.create({
  // In development, this points to Vite's proxy (localhost). 
  // In production, Vite injects your Render URL from Vercel's Environment Variables.
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: true,
});

export default api;