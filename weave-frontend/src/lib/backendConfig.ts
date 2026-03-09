// BACKEND-TRACK: Central backend toggle used by all data modules.
// Keep this in one place so frontend/backend mode is easy to track.
const disableBackend = (import.meta.env.VITE_DISABLE_BACKEND ?? "false") === "true";

export const backendConfig = {
  disableBackend,
  isBackendEnabled: !disableBackend,
  apiBaseUrl:
    import.meta.env.VITE_API_BASE_URL ??
    import.meta.env.REACT_APP_API_URL ??
    "http://localhost:5000",
};

