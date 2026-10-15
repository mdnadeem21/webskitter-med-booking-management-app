import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";
import Button from "../../components/Button";
import { getPatientDashboard } from "../../api/patientApi";

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  RESCHEDULED: "bg-purple-100 text-purple-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

function PatientDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getPatientDashboard();
        setData(res.data.data);   // { summary, upcomingAppointments }
      } catch (err) {
        setError(err.message || "Dashboard load failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  const summary = data?.summary || { total: 0, upcoming: 0, completed: 0 };
  const upcomingAppointments = data?.upcomingAppointments || [];

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
        <Button onClick={() => navigate("/patient/book")}>+ Book Appointment</Button>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Appointments" value={summary.total} icon="📅" />
        <StatCard label="Upcoming" value={summary.upcoming} icon="⏰" color="green" />
        <StatCard label="Completed" value={summary.completed} icon="✅" color="orange" />
      </div>

      {/* UPCOMING LIST */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400 mb-3">Koi upcoming appointment nahi</p>
            <Button variant="secondary" onClick={() => navigate("/patient/book")}>
              Pehla appointment book karo →
            </Button>
          </div>
        ) : (
          <Table
            columns={[
              { key: "doctor", label: "Doctor" },
              { key: "clinic", label: "Clinic" },
              { key: "date", label: "Date & Time" },
              { key: "type", label: "Type" },
              { key: "status", label: "Status" },
            ]}
            data={upcomingAppointments.map(a => ({
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
                  <p className="text-sm">{new Date(a.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
                  <p className="text-xs text-gray-400">{a.startTime} - {a.endTime}</p>
                </div>
              ),
              type: a.appointmentType === "ONLINE" ? "🌐 Online" : "🏥 In-Person",
              status: (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[a.status] || "bg-gray-100"}`}>
                  {a.status}
                </span>
              ),
            }))}
          />
        )}
      </Card>
    </div>
  );
}
export default PatientDashboard;