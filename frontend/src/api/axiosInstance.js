import axios from "axios";
import { store } from "../store/index"   // ⚠️ store ka export check karo (see Step 4)
import { logout } from "../store/slices/authSlice";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,                          // 15s — hang hone se bacho
  headers: { "Content-Type": "application/json" },
});

// ---------------- REQUEST INTERCEPTOR ----------------
api.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.accessToken;   // Redux se seedha (useSelector yahan nahi)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;   // backend ke hisaab se adjust
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- RESPONSE INTERCEPTOR ----------------
api.interceptors.response.use(
  (response) => response,                    // success → seedha pass
  (error) => {
    // Network/server down
    if (!error.response) {
      return Promise.reject({
        status: 0,
        message: "Network error — server unreachable. Kya backend chal raha hai?",
      });
    }

    const { status, data } = error.response;

    // 401 → token invalid/expired → auto logout + login pe bhejo
    if (status === 401) {
      store.dispatch(logout());
      window.location.href = "/login";       // full reload se state saaf — simplest & safest
    }

    // Backend ka message pass karo — tumhara backend { status: false, message: "..." } bhejta hai
    return Promise.reject({
      status,
      message:
        data?.message ||
        data?.error ||
        (status === 403 ? "You don't have permission for this action"
        : status === 404 ? "API not found (route check karo)"
        : status === 409 ? "Conflict — already exists/booked"
        : status >= 500 ? "Server error — try again later"
        : "Something went wrong"),
    });
  }
);

export default api;