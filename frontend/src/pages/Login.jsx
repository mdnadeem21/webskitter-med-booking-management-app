import { useDispatch } from "react-redux";
import { useState } from "react";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

import {
  loginPatient,
  loginDoctor,
  loginAdmin,
  loginReceptionist,
} from "../api/authApi";

// const DUMMY_USERS = {
//   admin: { name: "Admin User", email: "admin@test.com", role: "admin" },
//   doctor: { name: "Dr. Sonam", email: "doctor@test.com", role: "doctor" },
//   receptionist: {
//     name: "Receptionist",
//     email: "recept@test.com",
//     role: "receptionist",
//   },
//   patient: { name: "Patient", email: "patient@test.com", role: "patient" },
// };
const ROLES = [
  { value: "admin", label: "Admin", login: loginAdmin },
  { value: "doctor", label: "Doctor", login: loginDoctor },
  { value: "receptionist", label: "Receptionist", login: loginReceptionist },
  { value: "patient", label: "Patient", login: loginPatient },
];

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [role, setRole] = useState("patient"); // default tab
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Invalid email format";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setLoginError("");
    try {
      const loginFn = ROLES.find((r) => r.value === role).login;
      const res = await loginFn({ email: form.email, password: form.password });

      const { data, token } = res.data; 
      const { userId, email } = data;
      dispatch(
        setCredentials({
          accessToken: token.accessToken, 
          refreshToken: token.refreshToken, 
          user: {
            id: userId, 
            name: form.email.split("@")[0], 
            email,
            role, 
          },
        })
      );
      console.log(`✅ Logged in as ${role}:`, data);
      navigate(`/${role}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ---------------- LEFT: BRANDING PANEL ---------------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative">
          <Link to="/" className="text-2xl font-bold text-white">
            🩺 MediCare
          </Link>
          <h2 className="text-3xl font-bold text-white mt-20 leading-snug">
            Welcome Back!
            <span className="block text-blue-200">
              Your health journey continues
            </span>
          </h2>
          <p className="text-blue-100 mt-4 max-w-md text-sm leading-relaxed">
            Get loggedIn and Manager your appoinemts with best doctors.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            "Real-time slot booking",
            "Verified doctors only",
            "Instant confirmations",
          ].map((f) => (
            <div
              key={f}
              className="flex items-center gap-3 text-blue-100 text-sm"
            >
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">
                ✓
              </span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- RIGHT: FORM PANEL ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo (desktop pe left me hai) */}
          <Link to="/" className="lg:hidden text-xl font-bold text-blue-600">
            🩺 MediCare
          </Link>

          <h1 className="text-2xl font-bold text-gray-800 mt-4 lg:mt-0">
            Login to your account
          </h1>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Select your role to continue
          </p>

          {/* ---------- ROLE SELECTOR (grid cards) ---------- */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition
                  ${
                    role === r.value
                      ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                  }`}
              >
                <span className="text-lg">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>
          {loginError && (
            <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
              {loginError}
            </p>
          )}
          <form onSubmit={handleSubmit}>
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />

            {/* Password + eye toggle */}
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••"
                value={form.password}
                onChange={handleChange}
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            <div className="flex justify-end mb-4">
              <button
                type="button"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? "Logging in..." : `Login as ${role}`}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            New patient?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login;
