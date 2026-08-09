// Centralized API configuration
export const VITE_API_ORIGIN = (
  import.meta.env.VITE_API_ORIGIN ||
  import.meta.env.VITE_FASTAPI_BACKEND_URL ||
  "http://localhost:8000"
).replace(/\/+$/, "").replace(/\/api\/v1$/, "");

export const API_PREFIX = "/api/v1";
export const API_BASE_URL = `${VITE_API_ORIGIN}${API_PREFIX}`;

export const ENDPOINTS = {
  DOCUMENTS: `${API_BASE_URL}/documents`,
  CHAT: `${API_BASE_URL}/chat`,
};

