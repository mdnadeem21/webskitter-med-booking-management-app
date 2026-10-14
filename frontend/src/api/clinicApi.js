// src/api/clinicApi.js
import api from "./axiosInstance";

export const createClinic = (payload) => api.post("/clinics/register/clinic", payload);
export const getAllClinics = () => api.get("/clinics/get/clinics");
export const getClinicById = (id) => api.get(`/clinics/get/clinic/${id}`);
export const updateClinic = (id, payload) => api.put(`/clinics/update/clinic/${id}`, payload);
export const deleteClinic = (id) => api.put(`/clinics/delete/clinic/${id}`, {});