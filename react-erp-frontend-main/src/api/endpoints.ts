export const endpoints = {
  auth: {
    login: "/api/auth/login",
  },
  notifications: {
    base: "/api/notification",
    byId: (id: number) => `/api/notification/${id}`,
    markRead: (id: number) => `/api/notification/${id}/read`,
  },
  hubs: {
    notifications: "/hubs/notifications",
  },
};
