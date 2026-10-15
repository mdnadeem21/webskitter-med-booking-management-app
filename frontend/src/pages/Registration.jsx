import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";
import { registerPatient } from "../api/authApi";

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    gender: "MALE",
    dateOfBirth: "",
    address: "",
    bloodGroup: "",
    emergencyContact: { name: "", phone: "", relation: "" },
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [patientImage, setPatientImage] = useState(null); // File object
  const [avatarPreview, setAvatarPreview] = useState(null);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  const handleEmergencyChange = (e) =>
    setForm((f) => ({
      ...f,
      emergencyContact: {
        ...f.emergencyContact,
        [e.target.name]: e.target.value,
      },
    }));

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // sirf image
    if (!file.type.startsWith("image/")) {
      alert("Sirf image file allowed (JPG/PNG)");
      return;
    }
    // 2MB limit — cloudinary pe bhi load kam
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo 2MB se chhoti honi chahiye");
      return;
    }
    setPatientImage(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = "Name is required";
    else if (form.name.trim().length < 3) errs.name = "Min 3 characters";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      errs.email = "Invalid email format";
    if (!form.phone.trim()) errs.phone = "Phone is required";
    else if (!/^[6-9]\d{9}$/.test(form.phone.trim()))
      errs.phone = "10 digit, 6-9 se start hone wala number chahiye"; // ⬅️ backend regex match
    if (!form.dateOfBirth) errs.dateOfBirth = "Date of birth is required"; // ⬅� NEW
    if (!form.address.trim()) errs.address = "Address is required"; // ⬅️ NEW
    if (!form.bloodGroup) errs.bloodGroup = "Blood group is required"; // ⬅️ NEW
    if (!form.emergencyContact.name.trim())
      errs.emgName = "Emergency contact name is required"; // ⬅️ NEW
    if (!/^[6-9]\d{9}$/.test(form.emergencyContact.phone.trim()))
      errs.emgPhone = "Valid emergency phone required"; // ⬅️ NEW
    if (!form.emergencyContact.relation.trim())
      errs.emgRelation = "Relation is required"; // ⬅️ NEW
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");
    try {
      // ⏳ Phase 6: POST /api/patient/register
      // body: { name, email, phone, password, gender, bloodGroup }
      console.log("Register:", form);
      const fd = new FormData();
    fd.append("name", form.name.trim());
    fd.append("email", form.email.trim().toLowerCase());
    fd.append("phone", form.phone.trim());
    fd.append("password", form.password);
    fd.append("gender", form.gender);                    // MALE/FEMALE/OTHER
    fd.append("dateOfBirth", form.dateOfBirth);
    fd.append("address", form.address.trim());
    fd.append("bloodGroup", form.bloodGroup);

    // nested object → JSON string me append (backend ko JSON.parse nahi karna padta,
    // Express req.body me JSON string aa jayegi — backend me JSON.parse karna hoga! niche note)
    fd.append("emergencyContact", JSON.stringify({
      name: form.emergencyContact.name.trim(),
      phone: form.emergencyContact.phone.trim(),
      relation: form.emergencyContact.relation.trim(),
    }));

    // PHOTO — multer ka field name check karo (niche note)
    if (patientImage) fd.append("patientImage", patientImage);

    const res = await registerPatient(fd);
    navigate("/login", { state: { message: res.data.message } });
    } catch (err) {
      setApiError(err.message || "Registration failed");
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
          <Link to="/" className="text-2xl font-bold text-white">
            🩺 MediCare
          </Link>
          <h2 className="text-3xl font-bold text-white mt-20 leading-snug">
            Create your account
            <span className="block text-blue-200">
              Booking starts in 2 minutes
            </span>
          </h2>
          <p className="text-blue-100 mt-4 max-w-md text-sm leading-relaxed">
            Ek baar register karo — phir kabhi bhi doctor, slot aur appointment
            apne haath me.
          </p>
        </div>

        <div className="relative space-y-3">
          {[
            "Free & instant registration",
            "No hidden charges",
            "Your data stays private",
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

      {/* ---------------- RIGHT: FORM ---------------- */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden text-xl font-bold text-blue-600">
            🩺 MediCare
          </Link>

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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group *
                </label>
                <select
                  name="bloodGroup"
                  value={form.bloodGroup}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.bloodGroup ? "border-red-500" : ""
                  }`}
                >
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(
                    (bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    )
                  )}
                </select>
                {errors.bloodGroup && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bloodGroup}
                  </p>
                )}
              </div>

              <Input
                label="Date of Birth *"
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                error={errors.dateOfBirth}
              />

              <Input
                label="Address *"
                name="address"
                placeholder="House no, city, pincode"
                value={form.address}
                onChange={handleChange}
                error={errors.address}
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
            {/* Emergency contact */}
            <div className="border border-gray-200 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">
                Emergency Contact *
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Input
                  label="Name"
                  name="name"
                  placeholder="Contact name"
                  value={form.emergencyContact.name}
                  onChange={handleEmergencyChange}
                  error={errors.emgName}
                />
                <Input
                  label="Phone"
                  name="phone"
                  placeholder="9876543210"
                  value={form.emergencyContact.phone}
                  onChange={handleEmergencyChange}
                  error={errors.emgPhone}
                />
                <Input
                  label="Relation"
                  name="relation"
                  placeholder="Father, spouse..."
                  value={form.emergencyContact.relation}
                  onChange={handleEmergencyChange}
                  error={errors.emgRelation}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                    🧑
                  </div>
                )}
                <label
                  className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1.5 cursor-pointer shadow hover:bg-gray-50"
                  title="Upload photo"
                >
                  📷
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Profile Photo
                </p>
                <p className="text-xs text-gray-400">
                  Optional — JPG/PNG, max 2MB
                </p>
              </div>
            </div>
            {apiError && (
              <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
                {apiError}
              </p>
            )}
            <Button className="w-full mt-2" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Register;
