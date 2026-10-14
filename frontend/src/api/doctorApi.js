// src/api/doctorApi.js
// Paths tumhare route file se EXACT — /get/doctors, /update/doctor/:id pattern
import api from "./axiosInstance";

// ---------- ADMIN: create (avatar FormData optional) ----------
export const createDoctor = (formData) =>
  api.post("/doctors/register", formData);

// ---------- READ (admin + receptionist dono ke paas read:doctor permission) ----------
export const getAllDoctors = () =>
  api.get("/doctors/get/doctors");

export const getDoctorById = (id) =>
  api.get(`/doctors/get/doctor/${id}`);

// ---------- UPDATE (admin + receptionist) ----------
export const updateDoctor = (id, payload) =>
  api.put(`/doctors/update/doctor/${id}`, payload);

// ---------- DELETE (sirf admin — delete:doctor permission) ----------
export const deleteDoctor = (id) =>
  api.put(`/doctors/delete/doctor/${id}`, {});

export const getMyDoctorProfile = () =>
    api.get("/doctors/get/me");
  
  export const updateMyDoctorProfile = (payload) =>
    api.put("/doctors/update/me", payload);
  
  export const changeDoctorPassword = (payload) =>
    api.post("/doctors/change-password/doctor", payload);
  // ✅ yeh route HAI — body: { email, oldPassword, newPassword }
  // email Redux ke user.email se frontend bhejega
  
  /* ============ DOCTOR Dashboard + Appointments ============ */
  
  // ✅ yeh backend me HAI (appointment.routes.js me — /get/appointment/me)
  export const getMyDoctorDashboard = () =>
    api.get("/appointments/get/appointment/me");
  
  // ⚠️ yeh route MISSING hai — backend me add karna hai
  export const getMyAllAppointments = (status) =>
    api.get("/appointments/get/appointments/my",
      status ? { params: { status } } : {});