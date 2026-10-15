import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { getAllDepartments, createDepartment, updateDepartment, deleteDepartment } from "../../api/departmentApi";

function AdminDepartments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);   // null | { mode: "create" } | { mode: "edit", dept }
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");
  const [deleting, setDeleting] = useState(null);

  const fetchList = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllDepartments();
      setList(res.data.departments || []);
    } catch (err) {
      setError(err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setModalError("");
    const fd = new FormData(e.target);
    const payload = {
      name: fd.get("name").trim(),
      description: fd.get("description").trim(),
    };
    if (!payload.name) return setModalError("Name required");

    setSaving(true);
    try {
      if (modal.mode === "create") await createDepartment(payload);
      else await updateDepartment(modal.dept._id, payload);
      setModal(null);
      fetchList();
    } catch (err) {
      setModalError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await deleteDepartment(deleting._id);
      setDeleting(null);
      fetchList();
    } catch (err) {
      setError(err.message || "Delete failed");
      setDeleting(null);
    } finally {
      setSaving(false);
    }
  };

  const d = modal?.mode === "edit" ? modal.dept : {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
        <Button onClick={() => setModal({ mode: "create" })}>+ Add Department</Button>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading departments...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-sm">Koi department nahi — "+ Add Department" se banao</p>
        ) : (
          <Table
            columns={[
              { key: "name", label: "Department" },
              { key: "description", label: "Description" },
              { key: "doctors", label: "Actions" },
            ]}
            data={list.map(dep => ({
              id: dep._id,
              name: (
                <div>
                  <p className="font-medium text-gray-800">{dep.name}</p>
                </div>
              ),
              description: dep.description || "—",
              doctors: (
                <div className="flex gap-2 text-xs">
                  <button onClick={() => setModal({ mode: "edit", dept: dep })}
                    className="text-blue-600 hover:underline">Edit</button>
                  <button onClick={() => setDeleting(dep)}
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                {modal.mode === "create" ? "Add New Department" : "Edit Department"}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <Input label="Name *" name="name" defaultValue={d.name}
                placeholder="Cardiology" required />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" rows="3" defaultValue={d.description}
                  placeholder="Heart-related consultations and procedures"
                  className="w-full px-3 py-2 border rounded-lg" />
              </div>

              {modalError && <p className="text-red-600 text-sm mt-3 bg-red-50 p-3 rounded-lg">{modalError}</p>}

              <div className="flex gap-2 mt-5">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : modal.mode === "create" ? "Create Department" : "Save Changes"}
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
            <p className="text-sm text-gray-500 mb-5">
              Agar is department me doctors hain toh unka departmentId toot jayega. Pehle doctors check karo!
            </p>
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
export default AdminDepartments;