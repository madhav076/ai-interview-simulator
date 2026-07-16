import axios from "axios";
import { getItem, removeItem } from "@/utils/storage";

/** Single Axios instance used by all services. */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/** Attach the JWT token to every outgoing request if one is stored. */
api.interceptors.request.use((config) => {
  const token = getItem<string | null>("auth_token", null);
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
      removeItem("auth_token");
      removeItem("auth_user");
    }
    return Promise.reject(error);
  },
);
