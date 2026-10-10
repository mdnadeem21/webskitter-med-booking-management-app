import { useState } from "react";
import { useSelector } from "react-redux";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";

function DoctorProfile() {
  const { user } = useSelector(s => s.auth);

  const [data, setData] = useState({
    name: user?.name || "Doctor",
    email: user?.email || "",
    phone: "9876543210",
    specialization: "Cardiology",
    qualification: "MBBS, MD",
    experience: 8,
    consultationFee: 500,
    address: "MG Road, Bangalore, 560001",
  });
  const [photo, setPhoto] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [pwd, setPwd] = useState({ current: "", newPassword: "", confirm: "" });
  const [pwdError, setPwdError] = useState("");

  // ---------- PHOTO ----------
  const handlePhotoChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo 2MB se chhoti honi chahiye");
      return;
    }
    setPhoto(URL.createObjectURL(file));
    // ⏳ Phase 6: FormData → upload API → URL save
  };

  // ---------- PROFILE ----------
  const handleChange = e => setData({ ...data, [e.target.name]: e.target.value });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      // ⏳ Phase 6: PATCH /api/doctor/me — body: data
      console.log("Doctor profile update:", data);
      alert("Profile updated (dummy)");
      setShowEditForm(false);
    } finally {
      setSaving(false);
    }
  };

  // ---------- PASSWORD ----------
  const handleChangePassword = async e => {
    e.preventDefault();
    if (pwd.newPassword.length < 6) {
      setPwdError("New password min 6 characters");
      return;
    }
    if (pwd.newPassword !== pwd.confirm) {
      setPwdError("New passwords do not match");
      return;
    }
    setPwdError("");
    try {
      // ⏳ Phase 6: PATCH /api/doctor/change-password
      console.log("Change password:", pwd);
      alert("Password changed (dummy)");
      setShowPasswordModal(false);
      setPwd({ current: "", newPassword: "", confirm: "" });
    } catch (err) {
      setPwdError(err?.response?.data?.message || "Failed");
    }
  };

  const photoUrl = photo || user?.photoUrl || null;

  const detailRows = [
    { label: "Specialization", value: data.specialization },
    { label: "Qualification", value: data.qualification },
    { label: "Experience", value: data.experience ? `${data.experience} years` : "" },
    { label: "Consultation Fee", value: data.consultationFee ? `₹${data.consultationFee}` : "" },
    { label: "Phone", value: data.phone },
    { label: "Address", value: data.address },
  ].filter(r => r.value);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      {/* ============ PHOTO + NAME ============ */}
      <Card className="mb-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            {photoUrl ? (
              <img src={photoUrl} alt="profile" className="w-24 h-24 rounded-full object-cover border-2 border-gray-200" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-3xl font-bold text-blue-600">
                {data.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
            <label className="absolute -bottom-1 -right-1 bg-white border border-gray-200 rounded-full p-1.5 cursor-pointer shadow hover:bg-gray-50" title="Change photo">
              📷
              <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">{data.name}</h2>
            <p className="text-sm text-blue-600">{data.specialization}</p>
            <p className="text-sm text-gray-400">{data.email}</p>
          </div>
        </div>
      </Card>

      {/* ============ DETAILS (read-only) ============ */}
      {!showEditForm && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Professional Details</h3>
            <button onClick={() => setShowEditForm(true)} className="text-blue-600 text-sm font-medium hover:underline">
              ✏️ Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8">
            {detailRows.map(r => (
              <div key={r.label}>
                <p className="text-xs text-gray-400">{r.label}</p>
                <p className="text-sm text-gray-800">{r.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <button onClick={() => setShowPasswordModal(true)} className="text-sm text-gray-600 hover:text-blue-600 font-medium">
              🔒 Change Password
            </button>
          </div>
        </Card>
      )}

      {/* ============ EDIT FORM ============ */}
      {showEditForm && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-gray-800">Edit Details</h3>
            <button onClick={() => setShowEditForm(false)} className="text-gray-400 text-sm hover:text-gray-600">
              ✕ Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Name" name="name" value={data.name} onChange={handleChange} />
            <Input label="Email" name="email" value={data.email} disabled />
            <Input label="Phone" name="phone" value={data.phone} onChange={handleChange} />
            <Input label="Specialization" name="specialization" value={data.specialization} onChange={handleChange} />
            <Input label="Qualification" name="qualification" value={data.qualification} onChange={handleChange} />
            <Input label="Experience (years)" name="experience" type="number" value={data.experience} onChange={handleChange} />
            <Input label="Consultation Fee (₹)" name="consultationFee" type="number" value={data.consultationFee} onChange={handleChange} />
            <div className="md:col-span-2">
              <Input label="Address" name="address" value={data.address} onChange={handleChange} />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveProfile} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="secondary" onClick={() => setShowEditForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {/* ============ CHANGE PASSWORD MODAL ============ */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Change Password</h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleChangePassword}>
              <Input label="Current Password" type="password" value={pwd.current}
                onChange={e => setPwd({ ...pwd, current: e.target.value })} required />
              <Input label="New Password" type="password" value={pwd.newPassword}
                onChange={e => setPwd({ ...pwd, newPassword: e.target.value })} required />
              <Input label="Confirm New Password" type="password" value={pwd.confirm}
                onChange={e => setPwd({ ...pwd, confirm: e.target.value })} required />
              {pwdError && <p className="text-red-500 text-xs mb-2">{pwdError}</p>}
              <div className="flex gap-2 mt-2">
                <Button type="submit">Update Password</Button>
                <Button variant="secondary" type="button" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default DoctorProfile;