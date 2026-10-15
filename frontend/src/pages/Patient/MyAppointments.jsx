import { useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import { getMyPatientAppointments, updateAppointmentStatus } from "../../api/appointmentApi";

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];
const STATUS_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};
const PAYMENT_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
};

function MyAppointments() {
  const location = useLocation();
  const navigate = useNavigate();

  // booking wizard se aaya state — success banner
  const booked = location.state?.booked;
  const bookedRef = location.state?.reference;

  const [filter, setFilter] = useState("ALL");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);   // confirm modal
  const [busyId, setBusyId] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyPatientAppointments(filter === "ALL" ? null : filter);
      setList(res.data.appointments || []);
    } catch (err) {
      setError(err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ---------- CANCEL ----------
  const handleCancel = async () => {
    setBusyId(cancelling._id);
    try {
      await updateAppointmentStatus(cancelling._id, { appointmentStatus: "CANCELLED" });
      setCancelling(null);
      fetchList();
    } catch (err) {
      setError(err.message || "Cancel failed");
      setCancelling(null);
    } finally {
      setBusyId(null);
    }
  };

  // kya cancel ho sakta hai — sirf future + PENDING/CONFIRMED
  const canCancel = (a) => {
    const apptDate = new Date(a.appointmentDate);
    apptDate.setHours(23, 59, 59);
    return ["PENDING", "CONFIRMED"].includes(a.status) && apptDate >= new Date();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Appointments</h1>
        <Button onClick={() => navigate("/patient/book")}>+ Book New</Button>
      </div>

      {/* ---------- SUCCESS BANNER (booking wizard se) ---------- */}
      {booked && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="font-medium text-green-800">🎉 Appointment booked successfully!</p>
            <p className="text-sm text-green-600">
              Reference: <span className="font-mono font-semibold">{bookedRef}</span>
              {location.state?.doctor && ` — Dr. ${location.state.doctor}, ${location.state.date} ${location.state.slot}`}
            </p>
          </div>
          <button onClick={() => navigate(location.pathname, { replace: true, state: {} })}
            className="text-green-600 hover:text-green-800">✕</button>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border"
            }`}>{s}</button>
        ))}
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-sm">Is filter me koi appointment nahi</p>
        ) : (
          <Table
            columns={[
              { key: "doctor", label: "Doctor" },
              { key: "clinic", label: "Clinic" },
              { key: "date", label: "Date & Time" },
              { key: "type", label: "Type" },
              { key: "payment", label: "Payment" },
              { key: "reference", label: "Reference" },
              { key: "status", label: "Status" },
              { key: "actions", label: "Actions" },
            ]}
            data={list.map(a => ({
              id: a._id,
              doctor: (
                <div>
                  <p className="font-medium text-gray-800">{a.doctorId?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{a.doctorId?.specialization || ""}</p>
                </div>
              ),
              clinic: a.clinicId?.name || "—",
              date: (
                <div>
                  <p className="text-sm">{new Date(a.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  <p className="text-xs text-gray-400">{a.startTime} - {a.endTime}</p>
                </div>
              ),
              type: a.appointmentType === "ONLINE" ? "🌐 Online" : "🏥 In-Person",
              payment: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[a.paymentStatus] || "bg-gray-100"}`}>
                  {a.paymentStatus}
                </span>
              ),
              reference: (
                <span className="text-xs font-mono text-gray-500">{a.bookingReference}</span>
              ),
              status: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[a.status] || "bg-gray-100"}`}>
                  {a.status}
                </span>
              ),
              actions: canCancel(a) ? (
                <button disabled={busyId === a._id}
                  onClick={() => setCancelling(a)}
                  className="text-xs text-red-600 hover:underline disabled:opacity-50">
                  ✕ Cancel
                </button>
              ) : null,
            }))}
          />
        )}
      </Card>

      {/* ---------- CANCEL CONFIRM ---------- */}
      {cancelling && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-2">Cancel appointment?</h3>
            <p className="text-sm text-gray-500 mb-5">
              {cancelling.doctorId?.name} · {new Date(cancelling.appointmentDate).toLocaleDateString("en-IN")} at {cancelling.startTime}
            </p>
            <div className="flex gap-2">
              <Button onClick={handleCancel} disabled={busyId}>
                {busyId ? "Cancelling..." : "Yes, Cancel"}
              </Button>
              <Button variant="secondary" onClick={() => setCancelling(null)}>Keep it</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default MyAppointments;