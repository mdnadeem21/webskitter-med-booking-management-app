import { useEffect, useState } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Input from "../../components/Input";
import Button from "../../components/Button";
import {
  getAllPatients,
  getPatientDetail,
  updatePatient,
  togglePatient,
  deletePatient,
} from "../../api/patientApi";

function AdminPatients() {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState(null); // { patient, appointments } — modal
  const [detailLoading, setDetailLoading] = useState(false);
  const [editData, setEditData] = useState(null); // edit mode
  const [confirming, setConfirming] = useState(null);

  const handleView = async (p) => {
    setDetailLoading(true);
    try {
      const res = await getPatientDetail(p._id);
      setDetail(res.data);
      console.log("Patient detail:", res.data);
    } catch (err) {
      setError(err.message || "Detail load failed");
    } finally {
      setDetailLoading(false);
    }
  };

  // ---------- BLOCK/UNBLOCK ----------
  const handleToggle = async () => {
    const p = confirming.patient;
    try {
      await togglePatient(p._id);
      setConfirming(null);
      fetchPatients(search); // list refresh
    } catch (err) {
      setError(err.message || "Action failed");
      setConfirming(null);
    }
  };

  // ---------- DELETE (soft) ----------
  const handleDelete = async () => {
    const p = confirming.patient;
    try {
      await deletePatient(p._id);
      setConfirming(null);
      fetchPatients(search);
    } catch (err) {
      setError(err.message || "Delete failed");
      setConfirming(null);
    }
  };

  // ---------- EDIT SAVE ----------
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await updatePatient(editData._id, {
        name: editData.name,
        phone: editData.phone,
        bloodGroup: editData.bloodGroup,
        gender: editData.gender,
      });
      setEditData(null);
      fetchPatients(search);
    } catch (err) {
      setError(err.message || "Update failed");
    }
  };
  const fetchPatients = async (q = "") => {
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
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  // debounce search — har keystroke pe API nahi
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== "") fetchPatients(search);
      else if (search === "") fetchPatients();
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Patients</h1>

      <input
        type="text"
        placeholder="Search by name, email or phone..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-sm px-3 py-2 border rounded-lg text-sm"
      />

      {error && (
        <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>
      )}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading patients...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-sm">
            {search
              ? `"${search}" se koi patient nahi mila`
              : "Koi patient nahi hai"}
          </p>
        ) : (
          <Table
            columns={[
              { key: "name", label: "Name" },
              { key: "email", label: "Email" },
              { key: "phone", label: "Phone" },
              { key: "bloodGroup", label: "Blood" },
              { key: "verified", label: "Verified" },
              { key: "appointments", label: "Total Appointments" },
              { key: "actions", label: "Actions" },
            ]}
            data={list.map((p) => ({
              name: p.name,
              email: p.email,
              phone: p.phone || "—",
              bloodGroup: p.bloodGroup || "—",
              verified: (
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    p.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {p.isVerified ? "Verified" : "Pending"}
                </span>
              ),
              appointments: p.totalAppointments,
              actions: (
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() => handleView(p)}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </button>
                  <button
                    onClick={() => setEditData({ ...p })}
                    className="text-gray-600 hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirming({ type: "block", patient: p })}
                    className="text-orange-600 hover:underline"
                  >
                    {p.isActive ? "Block" : "Unblock"}
                  </button>
                  <button
                    onClick={() =>
                      setConfirming({ type: "delete", patient: p })
                    }
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              ),
            }))}
          />
        )}
      </Card>

      {detail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">
                {detail.patient.name}
              </h3>
              <button
                onClick={() => setDetail(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* patient info */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-6">
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p>{detail.patient.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Phone</p>
                <p>{detail.patient.phone}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Blood</p>
                <p>{detail.patient.bloodGroup || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Verified</p>
                <p>{detail.patient.isVerified ? "✅" : "❌"}</p>
              </div>
            </div>

            {/* appointment history */}
            {/* <h4 className="font-medium text-gray-700 mb-2">
              Appointment History
            </h4>
            {detailLoading ? (
              <p className="text-sm text-gray-400">Loading...</p>
            ) : detail.appointments.length === 0 ? (
              <p className="text-sm text-gray-400">Koi appointment nahi</p>
            ) : (
              <div className="space-y-2">
                {detail.appointments.map((a) => (
                  <div
                    key={a._id}
                    className="flex justify-between items-center bg-gray-50 rounded-lg p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{a.doctorId?.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(a.appointmentDate).toLocaleDateString(
                          "en-IN"
                        )}{" "}
                        · {a.startTime}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs">{a.status}</p>
                      <p className="text-xs text-gray-400">
                        ₹{a.consultationFee} · {a.paymentStatus}
                      </p>
                    </div>
                  </div>
                ))}
              </div> 
            )}*/}
          </div>
        </div>
      )}

      {editData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="font-semibold text-gray-800 mb-4">Edit Patient</h3>
            <form onSubmit={handleEditSave}>
              <Input
                label="Name"
                value={editData.name}
                onChange={(e) =>
                  setEditData({ ...editData, name: e.target.value })
                }
              />
              <Input
                label="Phone"
                value={editData.phone}
                onChange={(e) =>
                  setEditData({ ...editData_safe, phone: e.target.value })
                }
              />
              {/* email disabled — locked */}
              <Input label="Email" value={editData.email} disabled />
              <div className="flex gap-2 mt-4">
                <Button type="submit">Save</Button>
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setEditData(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">
              {confirming.type === "block"
                ? `${confirming.patient.isActive ? "Block" : "Unblock"} ${
                    confirming.patient.name
                  }?`
                : `Delete ${confirming.patient.name}?`}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {confirming.type === "block"
                ? "Block hone par patient login nahi kar payega."
                : "Soft-delete — data recoverable, login blocked."}
            </p>
            <div className="flex gap-2">
              <Button
                onClick={
                  confirming.type === "block" ? handleToggle : handleDelete
                }
              >
                Confirm
              </Button>
              <Button variant="secondary" onClick={() => setConfirming(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminPatients;
