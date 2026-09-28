import axios from "axios";
import { getItem, removeItem } from "@/utils/storage";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function clearAuthSession(): void {
  removeItem("auth_token");
  removeItem("auth_user");

  if (typeof document !== "undefined") {
    document.cookie = "auth_token=; path=/; max-age=0; SameSite=Lax";
  }
}

function getAuthToken(): string | null {
  return getItem<string | null>("auth_token", null) ?? getCookie("auth_token");
}

/** Single Axios instance used by all services. */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/** Attach the JWT token to every outgoing request if one is stored. */
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** On 401 responses, clear the stored token so the user is considered logged-out. */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
    }
    return Promise.reject(error);
  },
);
