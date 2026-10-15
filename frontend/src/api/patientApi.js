import api from "./axiosInstance";

export const getAllPatients = (search) =>
  api.get("/patients/get/patients", search ? { params: { search } } : {});

export const togglePatient = (id) => 
    api.put(`/patients/toggle/patient/${id}`, {});

export const getPatientDetail = (id) => 
    api.get(`/patients/get/patient/${id}`);
export const updatePatient = (id, payload) => 
    api.put(`/patients/update/patient/${id}`, payload);
export const deletePatient = (id) => 
    api.put(`/patients/delete/patient/${id}`, {});

// patient dashboard
export const getPatientDashboard = () =>
    api.get("/appointments/get/appointment/patient/dashboard");

export const getMyPatientProfile = () => 
    api.get("/patients/get/me");
export const updateMyPatientProfile = (payload) => 
    api.put("/patients/update/me", payload);
export const changeMyPatientPassword = (payload) =>
  api.post("/patients/change-password/me", payload);   