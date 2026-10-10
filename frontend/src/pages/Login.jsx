// src/pages/Login.jsx — Redux connect karke test
import { useDispatch } from "react-redux";
import { useState } from "react";
import { setCredentials } from "../store/slices/authSlice";
import { useNavigate, Link} from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

const DUMMY_USERS = {
  admin: { name: "Admin User", email: "admin@test.com", role: "admin" },
  doctor: { name: "Dr. Sonam", email: "doctor@test.com", role: "doctor" },
  receptionist: {
    name: "Receptionist",
    email: "recept@test.com",
    role: "receptionist",
  },
  patient: { name: "Patient", email: "patient@test.com", role: "patient" },
};
const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "doctor", label: "Doctor" },
  { value: "receptionist", label: "Receptionist" },
  { value: "patient", label: "Patient" },
];

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // const handleDummyLogin = (role) => {
  //   // Phase 6 me yahan real API call aayega — abhi dummy test
  //   dispatch(
  //     setCredentials({
  //       token: `dummy-token-${role}`,
  //       user: DUMMY_USERS[role],
  //     })
  //   );
  //   navigate(`/${role}`);
  // };
  const [role, setRole] = useState("patient"); // default tab
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
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
    try {
      // ⏳ Phase 6 me yahan ROLE ke hisaab se endpoint:
      // POST /api/${role}/login  →  { email, password }
      // Abhi dummy — email prefix ka temp hack hata diya, ab role tab se aata hai
      dispatch(
        setCredentials({
          token: `dummy-${role}-${Date.now()}`,
          user: { name: form.email, email: form.email, role }, // ⬅️ role tab se!
        })
      );
      navigate(`/${role}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    //   <div className="min-h-screen flex items-center justify-center bg-gray-100">
    //   <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
    //     <h1 className="text-2xl font-bold text-gray-800">Login</h1>
    //     <p className="text-gray-500 mt-2 mb-6">Phase 4 — role-based protection test</p>
    //     <div className="space-y-2">
    //       {["admin", "doctor", "receptionist", "patient"].map((role) => (
    //         <button
    //           key={role}
    //           onClick={() => handleDummyLogin(role)}
    //           className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 capitalize"
    //         >
    //           Login as {role}
    //         </button>
    //       ))}
    //     </div>
    //   </div>
    // </div>
    // <div className="min-h-screen flex items-center justify-center bg-gray-100">
    //   <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
    //     <h1 className="text-2xl font-bold text-gray-800">MediCare Login</h1>
    //     <p className="text-gray-500 text-sm mt-1 mb-6">
    //       Select your role and login
    //     </p>

    //     {/* ---------- ROLE TABS ---------- */}
    //     <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg mb-6">
    //       {ROLES.map((r) => (
    //         <button
    //           key={r.value}
    //           type="button" // ⬅️ form submit na ho isse
    //           onClick={() => setRole(r.value)}
    //           className={`py-2 text-xs sm:text-sm font-medium rounded-md capitalize
    //         transition ${
    //           role === r.value
    //             ? "bg-white text-blue-600 shadow"
    //             : "text-gray-500 hover:text-gray-700"
    //         }`}
    //         >
    //           {r.label}
    //         </button>
    //       ))}
    //     </div>

    //     <form onSubmit={handleSubmit}>
    //       <Input
    //         label="Email"
    //         type="email"
    //         name="email"
    //         placeholder="you@clinic.com"
    //         value={form.email}
    //         onChange={handleChange}
    //         error={errors.email}
    //       />
    //       <Input
    //         label="Password"
    //         type="password"
    //         name="password"
    //         placeholder="••••••"
    //         value={form.password}
    //         onChange={handleChange}
    //         error={errors.password}
    //       />
    //       <Button className="w-full mt-2" disabled={loading}>
    //         {loading ? `Logging in as ${role}...` : `Login as ${role}`}
    //       </Button>
    //     </form>

    //     <p className="text-xs text-gray-400 mt-4 text-center">
    //       Phase 6: POST /api/{role}/login se real auth hoga
    //     </p>
    //   </div>
    // </div>
    <div className="min-h-screen flex">
      {/* ---------------- LEFT: BRANDING PANEL ---------------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative">
          <Link to="/" className="text-2xl font-bold text-white">🩺 MediCare</Link>
          <h2 className="text-3xl font-bold text-white mt-20 leading-snug">
            Welcome Back!
            <span className="block text-blue-200">Your health journey continues</span>
          </h2>
          <p className="text-blue-100 mt-4 max-w-md text-sm leading-relaxed">
            Login karo aur apne appointments manage karo, doctors dekho,
            aur slots book karo — sab kuch ek jagah.
          </p>
        </div>

        <div className="relative space-y-3">
          {["Real-time slot booking", "Verified doctors only", "Instant confirmations"].map(f => (
            <div key={f} className="flex items-center gap-3 text-blue-100 text-sm">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- RIGHT: FORM PANEL ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          {/* Mobile logo (desktop pe left me hai) */}
          <Link to="/" className="lg:hidden text-xl font-bold text-blue-600">🩺 MediCare</Link>

          <h1 className="text-2xl font-bold text-gray-800 mt-4 lg:mt-0">Login to your account</h1>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Select your role to continue
          </p>

          {/* ---------- ROLE SELECTOR (grid cards) ---------- */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {ROLES.map(r => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={`flex items-center gap-2 px-3 py-3 rounded-xl border text-sm font-medium transition
                  ${role === r.value
                    ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"}`}
              >
                <span className="text-lg">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

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
              <button type="button" className="text-sm text-blue-600 hover:underline">
                Forgot password?
              </button>
            </div>

            <Button className="w-full" disabled={loading}>
              {loading ? "Logging in..." : `Login as ${role}`}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            New patient?{" "}
            <Link to="/register" className="text-blue-600 font-medium hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login;
