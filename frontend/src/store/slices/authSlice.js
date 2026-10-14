import { createSlice } from "@reduxjs/toolkit";

const loadAuth = () => {
  try {
    const saved = JSON.parse(localStorage.getItem("auth"));
    if (saved?.accessToken && saved?.user) {
      return {
        accessToken: saved.accessToken,
        refreshToken: saved.refreshToken,
        user: saved.user,
      };
    }
  } catch (e) {}
  return { accessToken: null, refreshToken:null, user: null };
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
    setCredentials(state, { payload }) {
      state.accessToken = payload.accessToken;
      state.refreshToken = payload.refreshToken;
      state.user = payload.user;
      // localStorage persistence 
      localStorage.setItem("auth", JSON.stringify({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        user: payload.user,
      }));
    },

    // LOGOUT
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken == null;
      state.user = null;
      localStorage.removeItem("auth");
      // localStorage.removeItem("user");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;