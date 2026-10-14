import { useEffect, useState, useCallback } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { getAllPatients, updatePatient } from "../../api/patientApi";

function ReceptionistPatients() {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editData, setEditData] = useState(null);   // edit modal
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // debounced server-side search (admin page jaisa)
  const fetchPatients = useCallback(async (q = "") => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllPatients(q);
      setList(res.data.patients || []);
    } catch (err) {
      setError(err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  useEffect(() => {
    const t = setTimeout(() => fetchPatients(search.trim()), 400);
    return () => clearTimeout(t);
  }, [search, fetchPatients]);

  // ---------- EDIT SAVE (read + update only — no create/delete/block) ----------
  const handleEditSave = async (e) => {
    e.preventDefault();
    setModalError("");
    if (!/^[6-9][0-9]{9}$/.test(editData.phone.trim()))
      return setModalError("10 digit phone, 6-9 se start");
    setSaving(true);
    try {
      await updatePatient(editData._id, {
        name: editData.name.trim(),
        phone: editData.phone.trim(),
        bloodGroup: editData.bloodGroup || "",
        gender: editData.gender,
      });
      setEditData(null);
      fetchPatients(search.trim());
    } catch (err) {
      setModalError(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Patients</h1>

      <input
        type="text"
        placeholder="Search by name, email or phone..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 border rounded-lg text-sm"
      />

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading patients...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {search ? `"${search}" se koi patient nahi mila` : "Koi patient nahi"}
          </p>
        ) : (
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "bloodGroup", label: "Blood" },
              { key: "gender", label: "Gender" },
              { key: "appointments", label: "Visits" },
              { key: "actions", label: "Actions" },
            ]}
            data={list.map(p => ({
              id: p._id,
              name: (
                <div>
                  <p className="font-medium text-gray-800">{p.name}</p>
                  {!p.isVerified && (
                    <span className="text-xs text-yellow-600">⚠ Pending verification</span>
                  )}
                </div>
              ),
              email: p.email,
              phone: p.phone || "—",
              bloodGroup: p.bloodGroup || "—",
              gender: p.gender || "—",
              appointments: p.totalAppointments ?? 0,
              actions: (
                <button onClick={() => setEditData({ ...p })}
                  className="text-xs text-blue-600 hover:underline">✏️ Edit</button>
              ),
            }))}
          />
        )}
      </Card>

      {/* ---------- EDIT MODAL ---------- */}
      {editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Edit Patient</h3>
              <button onClick={() => setEditData(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleEditSave}>
              <Input label="Name" value={editData.name}
                onChange={e => setEditData({ ...editData, name: e.target.value })} required />
              <Input label="Email" value={editData.email} disabled />
              <Input label="Phone" value={editData.phone}
                onChange={e => setEditData({ ...editData, phone: e.target.value })} required />
              <Input label="Blood Group" value={editData.bloodGroup || ""}
                onChange={e => setEditData({ ...editData, bloodGroup: e.target.value })}
                placeholder="O+" />
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select value={editData.gender || "Male"}
                  onChange={e => setEditData({ ...editData, gender: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg">
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              {modalError && <p className="text-red-600 text-xs mt-3 bg-red-50 p-3 rounded-lg">{modalError}</p>}

              <div className="flex gap-2 mt-5">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="secondary" type="button" onClick={() => setEditData(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default ReceptionistPatients;