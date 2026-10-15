import { useEffect, useState } from "react";
import Card from "../../components/Card";
import StatCard from "../../components/StatCard";
import Table from "../../components/Table";
import { getMyDoctorDashboard } from "../../api/doctorApi";

const STATUS_COLOR = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
  RESCHEDULED: "bg-purple-100 text-purple-800",
};

function DoctorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyDoctorDashboard();
        setData(res.data.data);   // { summary, todayAppointments }
      } catch (err) {
        setError(err.message || "Dashboard load failed");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6 text-gray-500">Loading dashboard...</div>;

  const summary = data?.summary || { total: 0, today: 0, upcoming: 0, past: 0, statusBreakdown: {} };
  const todayAppointments = data?.todayAppointments || [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Doctor Dashboard</h1>

      {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Appointments" value={summary.total} icon="📅" />
        <StatCard label="Today" value={summary.today} icon="⏰" color="green" />
        <StatCard label="Upcoming" value={summary.upcoming} icon="🔜" color="orange" />
        <StatCard label="Past" value={summary.past} icon="✅" color="red" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.keys(summary.statusBreakdown).length === 0 ? (
          <p className="text-sm text-gray-400 col-span-full">Abhi tak koi appointment nahi</p>
        ) : (
          Object.entries(summary.statusBreakdown).map(([status, count]) => (
            <Card key={status} className="!p-4 text-center">
              <p className="text-2xl font-bold text-gray-800">{count}</p>
              <p className="text-xs text-gray-500 mt-1">{status}</p>
            </Card>
          ))
        )}
      </div>

      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Today's Schedule</h2>
        {todayAppointments.length === 0 ? (
          <p className="text-sm text-gray-400">Aaj koi appointment nahi 🎉</p>
        ) : (
          <Table
            columns={[
              { key: "startTime", label: "Time" },
              { key: "patient", label: "Patient" },
              { key: "type", label: "Type" },
              { key: "status", label: "Status" },
            ]}
            data={todayAppointments.map(a => ({
              id: a._id,
              startTime: `${a.startTime} - ${a.endTime}`,
              patient: a.patient?.name || "—",
              type: a.appointmentType || "IN_PERSON",
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
export default DoctorDashboard;