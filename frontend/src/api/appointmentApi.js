// src/api/appointmentApi.js
import api from "./axiosInstance";

export const getAllAppointments = (status) =>
  api.get("/appointments/get/appointments", status && status !== "ALL"
    ? { params: { status } }
    : {});                                    // ?status=CONFIRMED

export const getAppointmentById = (id) =>
  api.get(`/appointments/get/appointment/${id}`);

// doctor dashboard (token-based)
export const getMyAppointments = () =>
  api.get("/appointments/get/appointment/me");

// admin: doctor-wise stats
export const getDoctorWiseStats = () =>
  api.get("/appointments/get/appointment/admin");

export const createAppointment = (payload) =>
  api.post("/appointments/create/appointment", payload);


export const updateAppointment = (id, payload) =>
  api.put(`/appointments/update/appointment/${id}`, payload);

// status change — admin ka main kaam
export const updateAppointmentStatus = (id, payload) =>
  api.put(`/appointments/update/appointment/status/${id}`, payload);
// payload: { appointmentStatus: "CONFIRMED" } / { paymentStatus: "PAID" }

export const deleteAppointment = (id) =>
  api.put(`/appointments/delete/appointment/${id}`, {});

// receptionist dashboard
export const getReceptionistDashboard = () =>
  api.get("/appointments/get/appointment/receptionist/dashboard");

export const getMyPatientAppointments = (status) =>
  api.get("/appointments/get/appointments/patient/my",
    status ? { params: { status } } : {});