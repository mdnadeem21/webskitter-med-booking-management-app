import { useEffect, useState, useCallback } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import { getAllAppointments, updateAppointmentStatus } from "../../api/appointmentApi";

const ALL_STATUSES = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW"];

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

const PAYMENT_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

function AdminAppointments() {
  const [status, setStatus] = useState("ALL");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);   

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllAppointments(status);
      setList(res.data.appointments || []);
    } catch (err) {
      setError(err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ---------- STATUS CHANGE (admin) ----------
  const handleStatusChange = async (id, newStatus) => {
    setBusyId(id);
    setError("");
    try {
      await updateAppointmentStatus(id, { appointmentStatus: newStatus });
      fetchList();   
    } catch (err) {
      setError(err.message || "Status update failed");
    } finally {
      setBusyId(null);
    }
  };

  // ---------- PAYMENT MARK PAID (receptionist ka kaam bhi, admin bhi kar sakta hai) ----------
  const handleMarkPaid = async (id) => {
    setBusyId(id);
    try {
      await updateAppointmentStatus(id, { paymentStatus: "PAID" });
      fetchList();
    } catch (err) {
      setError(err.message || "Payment update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">All Appointments</h1>

      {/* STATUS FILTERS */}
      <div className="flex flex-wrap gap-2">
        {ALL_STATUSES.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              status === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading appointments...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-sm">Is filter me koi appointment nahi</p>
        ) : (
          <Table
            columns={[
              { key: "date", label: "Date & Time" },
              { key: "patient", label: "Patient" },
              { key: "doctor", label: "Doctor" },
              { key: "fee", label: "Fee" },
              { key: "status", label: "Status" },
              { key: "payment", label: "Payment" },
              { key: "actions", label: "Actions" },
            ]}
            data={list.map(a => ({
              id: a._id,
              date: (
                <div>
                  <p className="text-sm text-gray-800">
                    {new Date(a.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  <p className="text-xs text-gray-400">{a.startTime} - {a.endTime}</p>
                </div>
              ),
              patient: (
                <div>
                  <p className="text-sm text-gray-800">{a.patientId?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{a.patientId?.phone}</p>
                </div>
              ),
              doctor: a.doctorId?.name || "—",
              fee: `₹${a.consultationFee}`,
              status: (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[a.status] || "bg-gray-100"}`}>
                  {a.status}
                </span>
              ),
              payment: (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_COLOR[a.paymentStatus] || "bg-gray-100"}`}>
                  {a.paymentStatus}
                </span>
              ),
              actions: (
                <div className="flex items-center gap-2">
                  {/* PENDING → CONFIRMED (one-click, sabse common action) */}
                  {a.status === "PENDING" && (
                    <button disabled={busyId === a._id}
                      onClick={() => handleStatusChange(a._id, "CONFIRMED")}
                      className="text-xs text-blue-600 hover:underline disabled:opacity-50">
                      ✓ Confirm
                    </button>
                  )}
                  {/* Status dropdown — baaki transitions */}
                  <select
                    value=""
                    disabled={busyId === a._id}
                    onChange={e => handleStatusChange(a._id, e.target.value)}
                    className="px-2 py-1 border rounded text-xs"
                  >
                    <option value="" disabled>Change</option>
                    {["CONFIRMED", "COMPLETED", "CANCELLED", "REJECTED", "NO_SHOW"]
                      .filter(s => s !== a.status)
                      .map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {/* Payment — sirf PENDING pe */}
                  {a.paymentStatus === "PENDING" && a.status !== "CANCELLED" && (
                    <button disabled={busyId === a._id}
                      onClick={() => handleMarkPaid(a._id)}
                      className="text-xs text-green-600 hover:underline disabled:opacity-50">
                      ₹ Mark Paid
                    </button>
                  )}
                </div>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
export default AdminAppointments;