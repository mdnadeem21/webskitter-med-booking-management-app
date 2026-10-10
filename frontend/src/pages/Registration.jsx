import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "Male",
    bloodGroup: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length < 3) errs.name = "Min 3 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = "Invalid email format";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!/^\d{10}$/.test(form.phone.trim())) errs.phone = "10 digit number chahiye";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // ⏳ Phase 6: POST /api/patient/register
      // body: { name, email, phone, password, gender, bloodGroup }
      console.log("Register:", form);
      alert("Account created! (dummy) — Phase 6 me API lagegi");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ---------------- LEFT: BRANDING (login jaisa hi) ---------------- */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
        <div className="absolute bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative">
          <Link to="/" className="text-2xl font-bold text-white">🩺 MediCare</Link>
          <h2 className="text-3xl font-bold text-white mt-20 leading-snug">
            Create your account
            <span className="block text-blue-200">Booking starts in 2 minutes</span>
          </h2>
          <p className="text-blue-100 mt-4 max-w-md text-sm leading-relaxed">
            Ek baar register karo — phir kabhi bhi doctor, slot aur
            appointment apne haath me.
          </p>
        </div>

        <div className="relative space-y-3">
          {["Free & instant registration", "No hidden charges", "Your data stays private"].map(f => (
            <div key={f} className="flex items-center gap-3 text-blue-100 text-sm">
              <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs">✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ---------------- RIGHT: FORM ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden text-xl font-bold text-blue-600">🩺 MediCare</Link>

          <h1 className="text-2xl font-bold text-gray-800 mt-4 lg:mt-0">
            Patient Registration
          </h1>
          <p className="text-gray-500 text-sm mt-1 mb-6">
            Sirf patients ke liye — staff accounts admin banata hai
          </p>

          <form onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              name="name"
              placeholder="Rahul Kumar"
              value={form.name}
              onChange={handleChange}
              error={errors.name}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <Input
              label="Phone"
              name="phone"
              placeholder="9876543210"
              value={form.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            <div className="grid grid-cols-2 gap-3">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <Input
                label="Blood Group (optional)"
                name="bloodGroup"
                placeholder="O+"
                value={form.bloodGroup}
                onChange={handleChange}
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Min 6 characters"
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
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />

            <Button className="w-full mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Register;