import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";
import {
  getAllClinics, createClinic, updateClinic, deleteClinic,
} from "../../api/clinicApi";

function AdminClinics() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);   // null | { mode: "create" } | { mode: "edit", clinic }
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllClinics();
      setList(res.data.clinics || []);
    } catch (err) {
      setError(err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  // ---------- CREATE / UPDATE ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");

    const fd = new FormData(e.target);
    // services/hours comma-separated string → array (backend bhi normalize karta hai — double safety)
    const services = fd.get("services").split(",").map(s => s.trim()).filter(Boolean);
    const openingHours = fd.get("openingHours").split(",").map(s => s.trim()).filter(Boolean);

    if (!services.length) return setModalError("Kam se kam 1 service daalo");
    if (!openingHours.length) return setModalError("Opening hours daalo");

    const payload = {
      name: fd.get("name").trim(),
      address: fd.get("address").trim(),
      phone: fd.get("phone").trim(),
      email: fd.get("email").trim().toLowerCase(),
      services,
      openingHours,
    };

    setSaving(true);
    try {
      if (modal.mode === "create") await createClinic(payload);
      else await updateClinic(modal.clinic._id, payload);
      setModal(null);
      fetchList();
    } catch (err) {
      setModalError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  // ---------- DELETE (soft) ----------
  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteClinic(deleting._id);
      setDeleting(null);
      fetchList();
    } catch (err) {
      setError(err.message || "Delete failed");
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  };

  const c = modal?.mode === "edit" ? modal.clinic : {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Clinics</h1>
        <Button onClick={() => setModal({ mode: "create" })}>+ Add Clinic</Button>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading clinics...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-sm">Koi clinic nahi — "+ Add Clinic" se banao</p>
        ) : (
          <Table
            columns={[
              { key: "name", label: "Clinic" },
              { key: "phone", label: "Phone" },
              { key: "services", label: "Services" },
              { key: "active", label: "Status" },
              { key: "actions", label: "Actions" },
            ]}
            data={list.map(cl => ({
              id: cl._id,
              name: (
                <div>
                  <p className="font-medium text-gray-800">{cl.name}</p>
                  <p className="text-xs text-gray-400">{cl.address}</p>
                </div>
              ),
              phone: cl.phone,
              services: cl.services?.length
                ? cl.services.slice(0, 2).join(", ") + (cl.services.length > 2 ? ` +${cl.services.length - 2}` : "")
                : "—",
              active: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  cl.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}>
                  {cl.isActive ? "ACTIVE" : "INACTIVE"}
                </span>
              ),
              actions: (
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setModal({ mode: "edit", clinic: cl })}
                    className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => setDeleting(cl)}
                    className="text-red-600 hover:underline">Delete</button>
                </div>
              ),
            }))}
          />
        )}
      </Card>

      {/* ---------- CREATE / EDIT MODAL ---------- */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                {modal.mode === "create" ? "Add New Clinic" : "Edit Clinic"}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <Input label="Name *" name="name" defaultValue={c.name} required />
                <Input label="Email *" type="email" name="email" defaultValue={c.email} required />
                <Input label="Phone *" name="phone" defaultValue={c.phone} required />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                  <textarea name="address" rows="2" defaultValue={c.address} required
                    className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <Input label="Services (comma-separated) *" name="services"
                  defaultValue={c.services?.join(", ")}
                  placeholder="Consultation, X-Ray, Lab Test" required />
                <Input label="Opening Hours (comma-separated) *" name="openingHours"
                  defaultValue={c.openingHours?.join(", ")}
                  placeholder="Mon-Fri 9:00-18:00, Sat 10:00-14:00" required />
              </div>

              {modalError && <p className="text-red-600 text-sm mt-3 bg-red-50 p-3 rounded-lg">{modalError}</p>}

              <div className="flex gap-2 mt-5">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : modal.mode === "create" ? "Create Clinic" : "Save Changes"}
                </Button>
                <Button variant="secondary" type="button" onClick={() => setModal(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- DELETE CONFIRM ---------- */}
      {deleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Delete {deleting.name}?</h3>
            <p className="text-sm text-gray-500 mb-5">Soft-delete — recoverable rahega.</p>
            <div className="flex gap-2">
              <Button onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting..." : "Yes, Delete"}
              </Button>
              <Button variant="secondary" onClick={() => setDeleting(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminClinics;