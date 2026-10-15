// src/api/departmentApi.js
import api from "./axiosInstance";

export const createDepartment = (payload) => api.post("/departments/register/department", payload);
export const getAllDepartments = () => api.get("/departments/get/department");
export const getDepartmentById = (id) => api.get(`/departments/get/department/${id}`);
export const updateDepartment = (id, payload) => api.put(`/departments/update/department/${id}`, payload);
export const deleteDepartment = (id) => api.put(`/departments/delete/department/${id}`, {});