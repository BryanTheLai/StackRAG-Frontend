// Centralized API configuration
export const API_BASE_URL = import.meta.env.VITE_FASTAPI_BACKEND_URL;

export const ENDPOINTS = {
  DOCUMENTS: `${API_BASE_URL}/documents`,
  CHAT: `${API_BASE_URL}/chat`,
};


