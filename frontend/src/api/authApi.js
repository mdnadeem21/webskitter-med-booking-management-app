import api from "./axiosInstance";


// POST /api/patient/login
export const loginPatient = (credentials) =>
  api.post("/patients/login", credentials);

// POST /api/doctor/login
export const loginDoctor = (credentials) =>
  api.post("/doctors/login", credentials);

// POST /api/receptionist/login
export const loginReceptionist = (credentials) =>
  api.post("/receptionists/login", credentials);

// POST /api/admin/login
export const loginAdmin = (credentials) =>
  api.post("/admin/login", credentials);

// Registration
// POST /api/patient/register — patient khud register karta hai (public)
export const registerPatient = (userData) =>
  api.post("/patients/register", userData);

// POST /api/doctor/register — doctor khud register karta hai (public,
// admin verification PENDING status ke saath — landing page se ya admin se)
export const registerDoctor = (userData) =>
  api.post("/doctors/register", userData);

// POST /api/receptionist/register — admin create karta hai (protected route)
export const registerReceptionist = (userData) =>
  api.post("/receptionist/register", userData);

export const verifyOtp = (payload) =>
    api.post("/auth/verify-otp", payload);     // { email, otp } — shape TBD
  
  export const resendOtp = (email) =>
    api.post("/auth/resend-otp", { email });

// ============================================================
// BONUS (6.6 me kaam aayenge — abhi likh dete hain)
// ============================================================

// GET /api/{role}/me — profile page ka data
export const getMyProfile = (role) =>
  api.get(`/${role}/me`);

// PATCH /api/{role}/change-password — password modal
export const changePassword = (role, payload) =>
  api.patch(`/${role}/change-password`, payload);