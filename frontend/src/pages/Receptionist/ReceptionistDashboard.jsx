import { useEffect, useState } from "react";
import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";
import { getReceptionistDashboard } from "../../api/appointmentApi";
import { updateAppointmentStatus } from "../../api/appointmentApi";

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const PAYMENT_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

function ReceptionistDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getReceptionistDashboard();
      setData(res.data.data);   // { summary, todayAppointments }
    } catch (err) {
      setError(err.message || "Dashboard load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  // ---------- CONFIRM / MARK PAID (receptionist ka daily kaam) ----------
  const handleStatus = async (id, payload) => {
    setBusyId(id);
    try {
      await updateAppointmentStatus(id, payload);
      fetchDashboard();   // refresh
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  const summary = data?.summary || { today: 0, pending: 0, confirmed: 0, completed: 0, totalPatients: 0 };
  const todayAppointments = data?.todayAppointments || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Receptionist Dashboard</h1>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Today's Appointments" value={summary.today} icon="📅" />
        <StatCard label="Pending" value={summary.pending} icon="⏳" color="orange" />
        <StatCard label="Confirmed" value={summary.confirmed} icon="✅" color="green" />
        <StatCard label="Total Patients" value={summary.totalPatients} icon="👥" color="red" />
      </div>

      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Today's Appointments</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-gray-400">Aaj koi appointment nahi</p>
        ) : (
          <Table
            columns={[
              { key: "time", label: "Time" },
              { key: "patient", label: "Patient" },
              { key: "doctor", label: "Doctor" },
              { key: "status", label: "Status" },
              { key: "payment", label: "Payment" },
              { key: "actions", label: "Actions" },
            ]}
            data={todayAppointments.map(a => ({
              id: a._id,
              time: `${a.startTime} - ${a.endTime}`,
              patient: (
                <div>
                  <p>{a.patientId?.name || "—"}</p>
                  <p className="text-xs text-gray-400">{a.patientId?.phone || ""}</p>
                </div>
              ),
              doctor: a.doctorId?.name || "—",
              status: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[a.status] || "bg-gray-100"}`}>
                  {a.status}
                </span>
              ),
              payment: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLOR[a.paymentStatus] || "bg-gray-100"}`}>
                  {a.paymentStatus}
                </span>
              ),
              actions: (
                <div className="flex gap-2 text-xs">
                  {a.status === "PENDING" && (
                    <button disabled={busyId === a._id}
                      onClick={() => handleStatus(a._id, { appointmentStatus: "CONFIRMED" })}
                      className="text-blue-600 hover:underline disabled:opacity-50">
                      ✓ Confirm
                    </button>
                  )}
                  {a.paymentStatus === "PENDING" && a.status !== "CANCELLED" && (
                    <button disabled={busyId === a._id}
                      onClick={() => handleStatus(a._id, { paymentStatus: "PAID" })}
                      className="text-green-600 hover:underline disabled:opacity-50">
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
export default ReceptionistDashboard;