import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  getAllReceptionists, createReceptionist,
  updateReceptionist, toggleReceptionist,
} from "../../api/receptionistApi";

function AdminReceptionists() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // create ke baad password dikhane ke liye
  const [credentials, setCredentials] = useState(null);

  // toggle confirm
  const [toggling, setToggling] = useState(null);   // receptionist object

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllReceptionists();
      setList(res.data.receptionists || []);
    } catch (err) {
      setError(err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  // ---------- CREATE (password admin nahi banata — backend generate karega!) ----------
  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!/^[6-9][0-9]{9}$/.test(form.phone.trim()))
      return setFormError("10 digit phone, 6-9 se start");
    setSaving(true);
    try {
      const res = await createReceptionist({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });
      setCredentials(res.data.credentials);   // ⬅️ password modal kholega
      setShowForm(false);
      setForm({ name: "", email: "", phone: "" });
      fetchList();
    } catch (err) {
      setFormError(err.message || "Create failed");
    } finally {
      setSaving(false);
    }
  };

  // ---------- TOGGLE ACTIVE (delete = deactivate) ----------
  const handleToggle = async () => {
    setSaving(true);
    try {
      await toggleReceptionist(toggling._id);
      setToggling(null);
      fetchList();
    } catch (err) {
      setError(err.message || "Toggle failed");
      setToggling(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Receptionists</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ Add Receptionist"}
        </Button>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      {showForm && (
        <Card>
          <h2 className="font-semibold mb-4">New Receptionist</h2>
          <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg mb-4">
            ℹ️ Password will generate by backend  — create ke baad ek baar dikhega, copy and send to receptionist.
          </p>
          <form onSubmit={handleCreate}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Name *" name="name" value={form.name} onChange={handleChange} required />
              <Input label="Email *" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input label="Phone *" name="phone" placeholder="9876543210" value={form.phone} onChange={handleChange} required />
            </div>
            {formError && <p className="text-red-500 text-xs mt-2">{formError}</p>}
            <Button className="mt-4" disabled={saving}>
              {saving ? "Creating..." : "Create Receptionist"}
            </Button>
          </form>
        </Card>
      )}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : (
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "active", label: "Status" },
              { key: "actions", label: "Actions" },
            ]}
            data={list.map(r => ({
              ...r,
              active: (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  r.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {r.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              ),
              actions: (
                <button onClick={() => setToggling(r)} className="text-xs text-red-600 hover:underline">
                  {r.isActive ? "Deactivate" : "Activate"}
                </button>
              ),
            }))}
          />
        )}
      </Card>

      {/* ---------- CREDENTIALS MODAL (create ke baad) ---------- */}
      {credentials && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-800 mb-1">🎉 Receptionist Created</h3>
            <p className="text-xs text-gray-500 mb-4">
              Yeh password ek hi baar dikhega — copy karke receptionist ko de do. Login ke baad wo khud change kar sakta hai.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Email</span>
                <span className="font-medium">{credentials.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Temporary Password</span>
                <span className="font-mono font-semibold text-blue-700">{credentials.temporaryPassword}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => {
                navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.temporaryPassword}`);
                alert("Copied!");
              }}>📋 Copy</Button>
              <Button variant="secondary" onClick={() => setCredentials(null)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- TOGGLE CONFIRM ---------- */}
      {toggling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">
              {toggling.isActive ? "Deactivate" : "Activate"} {toggling.name}?
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {toggling.isActive
                ? "Deactivate hone par receptionist login nahi kar payega."
                : "Activate karne par wapas login kar sakta hai."}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleToggle} disabled={saving}>
                {saving ? "..." : "Yes, Confirm"}
              </Button>
              <Button variant="secondary" onClick={() => setToggling(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminReceptionists;