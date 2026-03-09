import axios from "axios";
import { getToken } from "../lib/tokenStorage";
import { backendConfig } from "../lib/backendConfig";

const API_BASE_URL = backendConfig.apiBaseUrl;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
