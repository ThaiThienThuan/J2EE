import axios from "axios";
import { clearToken, getToken } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || ""
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      clearToken();
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }

    if (status === 403) {
      window.dispatchEvent(
        new CustomEvent("app:forbidden", {
          detail: {
            message:
              error?.response?.data?.message || "Ban khong co quyen thuc hien thao tac nay."
          }
        })
      );
    }

    return Promise.reject(error);
  }
);

export function unwrapData(response) {
  return response?.data?.data ?? null;
}

export function extractErrorMessage(error) {
  const payload = error?.response?.data;
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    return payload.errors.join(" ");
  }
  return payload?.message || error?.message || "Da co loi xay ra.";
}
