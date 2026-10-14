// src/api/receptionistApi.js
import api from "./axiosInstance";

export const createReceptionist = (payload) =>
  api.post("/receptionists/register", payload);          // JSON — avatar/file nahi hai

export const getAllReceptionists = () =>
  api.get("/receptionists/get/receptionists");

export const getReceptionistById = (id) =>
  api.get(`/receptionists/get/receptionist/${id}`);

export const updateReceptionist = (id, payload) =>
  api.put(`/receptionists/update/receptionist/${id}`, payload);

export const toggleReceptionist = (id) =>
  api.put(`/receptionists/toggle/${id}`, {});

export const changeReceptionistPassword = (payload) =>
  api.post("/receptionists/change-password/receptionist", payload);

export const getMyReceptionistProfile = () => 
  api.get("/receptionists/get/me");
export const updateMyReceptionistProfile = (payload) => 
  api.put("/receptionists/update/me", payload);