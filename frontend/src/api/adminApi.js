import api from "./axiosInstance";

export const getAdminStats = () => api.get("/admin/get/admin/stats");
export const getMyAdminProfile = () => api.get("/admin/get/me");
export const updateMyAdminProfile = (payload) => api.put("/admin/update/me", payload);
export const changeAdminPassword = (payload) =>
  api.post("/admin/change-password", payload);