import { useEffect, useState, useCallback } from "react";
import Card from "../../components/Card";
import Table from "../../components/Table";
import Button from "../../components/Button";
import AppointmentBookingForm from "../../components/AppointmentBookingForm";
import { getAllAppointments, updateAppointmentStatus } from "../../api/appointmentApi";

const PAYMENT_COLORS = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
};
const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

function ReceptionistAppointments() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getAllAppointments();
      setList(res.data.appointments || []);
    } catch (err) {
      setError(err.message || "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // ---------- CONFIRM / MARK PAID ----------
  const handleStatus = async (id, payload) => {
    setBusyId(id);
    try {
      await updateAppointmentStatus(id, payload);
      fetchList();
    } catch (err) {
      setError(err.message || "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800">Appointments</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? "Close" : "+ New Booking"}
        </Button>
      </div>

      {/* NEW BOOKING FORM */}
      {showForm && (
        <Card>
          <h2 className="font-semibold mb-4">New Appointment</h2>
          <AppointmentBookingForm onBooked={() => { setShowForm(false); fetchList(); }} />
        </Card>
      )}

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <Card>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading appointments...</p>
        ) : list.length === 0 ? (
          <p className="text-gray-500 text-sm">Koi appointment nahi — "+ New Booking" se banao</p>
        ) : (
          <Table
            columns={[
              { key: "date", label: "Date & Time" },
              { key: "patient", label: "Patient" },
              { key: "doctor", label: "Doctor" },
              { key: "status", label: "Status" },
              { key: "payment", label: "Payment" },
              { key: "actions", label: "Actions" },
            ]}
            data={list.map(a => ({
              id: a._id,
              date: (
                <div>
                  <p className="text-sm">{new Date(a.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  <p className="text-xs text-gray-400">{a.startTime} - {a.endTime}</p>
                </div>
              ),
              patient: a.patientId?.name || "—",
              doctor: a.doctorId?.name || "—",
              status: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[a.status] || "bg-gray-100"}`}>
                  {a.status}
                </span>
              ),
              payment: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_COLORS[a.paymentStatus] || "bg-gray-100"}`}>
                  {a.paymentStatus}
                </span>
              ),
              actions: (
                <div className="flex gap-2 text-xs">
                  {a.status === "PENDING" && (
                    <button disabled={busyId === a._id}
                      onClick={() => handleStatus(a._id, { appointmentStatus: "CONFIRMED" })}
                      className="text-blue-600 hover:underline disabled:opacity-50">✓ Confirm</button>
                  )}
                  {a.paymentStatus === "PENDING" && a.status !== "CANCELLED" && (
                    <button disabled={busyId === a._id}
                      onClick={() => handleStatus(a._id, { paymentStatus: "PAID" })}
                      className="text-green-600 hover:underline disabled:opacity-50">₹ Mark Paid</button>
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
export default ReceptionistAppointments;