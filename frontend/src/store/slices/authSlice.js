import { createSlice } from "@reduxjs/toolkit";

// Helper: localStorage se purana session wapas lao
// (page refresh pe Redux state reset hota hai — localStorage se restore)
const loadAuth = () => {
  try {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    if (token && user) return { token, user };
  } catch (e) {}
  return { token: null, user: null };
};

const initialState = {
  ...loadAuth(),
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // LOGIN_SUCCESS — login API ke baad call hoga
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },

    // LOGOUT — sab clear
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;