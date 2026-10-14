import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Input from "../../components/Input";
import Button from "../../components/Button";
import {
  getAllDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../../api/doctorApi";
import { getAllDepartments} from "../../api/departmentApi"


function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState(null);
  const [departments, setDepartments] = useState([]);

  // modal state —
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // delete confirm
  const [deletingId, setDeletingId] = useState(null);

  // ---------------- FETCH LIST ----------------
  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllDoctors();
      setDoctors(res.data.doctors || []);
    } catch (err) {
      setError(err.message || "Doctors load nahi hue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    getAllDepartments()
    .then(res => setDepartments(res.data.departments || []))
    .catch(() => setDepartments([]));
  }, []);

  // ---------------- CREATE / UPDATE ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);

    // checkboxes → array (consultationMode)
    const modes = fd.getAll("consultationMode");
    fd.delete("consultationMode");
    modes.forEach((m) => fd.append("consultationMode", m));

    setSaving(true);
    setModalError("");
    try {
      if (modal.mode === "create") {
        // await createDoctor(fd);
        const res = await createDoctor(fd);
        setCredentials(res.data.credentials); // ⬅️ modal kholega
        setModal(null);
      } else {
        const payload = {
          name: fd.get("name"),
          departmentId: fd.get("departmentId"),
          qualification: fd.get("qualification"),
          specialization: fd.get("specialization"),
          experience: Number(fd.get("experience")),
          consultationFee: Number(fd.get("consultationFee")),
          consultationMode: modes.length ? modes : ["IN_PERSON"],
          about: fd.get("about"),
        };
        
        const profileImage = fd.get("profileImage");
        const body = profileImage && profileImage.size > 0 ? fd : payload;
        await updateDoctor(modal.doctor._id, body);
      }
      setModal(null);
      fetchDoctors(); // list refresh
    } catch (err) {
      setModalError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- DELETE (soft — isDeleted: true) ----------------
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteDoctor(deletingId);
      setDeletingId(null);
      fetchDoctors();
    } catch (err) {
      setError(err.message || "Delete failed");
      setDeletingId(null);
    } finally {
      setSaving(false);
    }
  };

  // ---------------- EDIT FORM KE DEFAULTS ----------------
  const d = modal?.mode === "edit" ? modal.doctor : {};

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doctors</h1>
          <p className="text-sm text-gray-500">
            Create & manage doctor accounts
          </p>
        </div>
        <Button onClick={() => setModal({ mode: "create" })}>
          + Add Doctor
        </Button>
      </div>

      {/* ERROR */}
      {error && (
        <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-lg">
          {error}
        </p>
      )}

      {/* LIST */}
      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading doctors...</p>
        ) : doctors.length === 0 ? (
          <p className="text-gray-500 text-sm">
             No Doctors "+ Add Doctor"
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="pb-2">Doctor</th>
                  <th className="pb-2">Specialization</th>
                  <th className="pb-2">Fee</th>
                  <th className="pb-2">Verified</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc._id} className="border-b last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        {doc.profileImage ? (
                          <img
                            src={doc.profileImage}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                            {doc.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-800">
                            {doc.name}
                          </p>
                          <p className="text-xs text-gray-400">{doc.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-gray-600">{doc.specialization}</td>
                    <td className="py-3 text-gray-600">
                      ₹{doc.consultationFee}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs ${
                          doc.isVerified
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {doc.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setModal({ mode: "edit", doctor: doc })
                          }
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingId(doc._id)}
                          className="text-red-600 hover:underline text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ---------------- CREATE / EDIT MODAL ---------------- */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                {modal.mode === "create" ? "Add New Doctor" : "Edit Doctor"}
              </h3>
              <button
                onClick={() => setModal(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {modal.mode === "create" && (
              <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg mb-4">
                ℹ️ Password will generated by backend generate for registered doctor and send  email. 
                  OTP will also send for verification.
              </p>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name *"
                  name="name"
                  defaultValue={d.name}
                  required
                />
                {modal.mode === "create" ? (
                  <Input
                    label="Email *"
                    type="email"
                    name="email"
                    defaultValue={d.email}
                    required
                  />
                ) : (
                  <Input label="Email" value={d.email} disabled /> // edit me locked
                )}

                {/* DEPARTMENT dropdown — required (model me required hai) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="departmentId"
                    defaultValue={d.departmentId?._id || d.departmentId || ""}
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Select department</option>
                    {departments.map((dep) => (
                      <option key={dep._id} value={dep._id}>
                        {dep.name}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Specialization *"
                  name="specialization"
                  defaultValue={d.specialization}
                  required
                />
                <Input
                  label="Qualification *"
                  name="qualification"
                  defaultValue={d.qualification}
                  required
                />
                <Input
                  label="Experience (years) *"
                  name="experience"
                  type="number"
                  defaultValue={d.experience}
                  required
                />
                <Input
                  label="Consultation Fee (₹) *"
                  name="consultationFee"
                  type="number"
                  defaultValue={d.consultationFee}
                  required
                />

                {/* CONSULTATION MODE — checkboxes (enum array) */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Consultation Mode
                  </label>
                  <div className="flex gap-4">
                    {["IN_PERSON", "ONLINE"].map((mode) => (
                      <label
                        key={mode}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="consultationMode"
                          value={mode}
                          defaultChecked={(
                            d.consultationMode || ["IN_PERSON"]
                          ).includes(mode)}
                        />
                        {mode === "IN_PERSON" ? "In-Person" : "Online"}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    About
                  </label>
                  <textarea
                    name="about"
                    rows="3"
                    defaultValue={d.about}
                    className="w-full px-3 py-2 border rounded-lg"
                    maxLength={2000}
                  />
                </div>

                {/* AVATAR — optional (multer field name: "avatar") */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Photo (optional)
                  </label>
                  <input
                    type="file"
                    name="profileImage"
                    accept="image/*"
                    className="text-sm text-gray-500"
                  />
                </div>
              </div>

              {modalError && (
                <p className="text-red-600 text-sm mt-3 bg-red-50 p-3 rounded-lg">
                  {modalError}
                </p>
              )}

              <div className="flex gap-2 mt-5">
                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : modal.mode === "create"
                    ? "Create Doctor"
                    : "Save Changes"}
                </Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setModal(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- DELETE CONFIRM ---------------- */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">
              Delete this doctor?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              Soft-delete 
            </p>
            <div className="flex gap-2">
              <Button onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting..." : "Yes, Delete"}
              </Button>
              <Button variant="secondary" onClick={() => setDeletingId(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CREATE SUCCESS CREDENTIALS MODAL ---------------- */}
      {credentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-800 mb-1">
              🎉 Doctor Created
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Copy this password and instantly share this with doctor - save/copy to 
              so thorugh (phone/WhatsApp). Doctors have to change their password on login.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="font-medium">{credentials.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Temporary Password</span>
                <span className="font-mono font-semibold text-blue-700">
                  {credentials.temporaryPassword}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Email: ${credentials.email}\nPassword: ${credentials.temporaryPassword}`
                  );
                  alert("Copied!");
                }}
              >
                📋 Copy
              </Button>
              <Button variant="secondary" onClick={() => setCredentials(null)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Doctors;
